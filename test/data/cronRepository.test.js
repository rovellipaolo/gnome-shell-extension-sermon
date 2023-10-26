import { jest, beforeEach, describe, expect, it } from "@jest/globals";

jest.unstable_mockModule("../../src/data/commandLine.js", () => ({
    find: jest.fn(),
    execute: jest.fn(),
}));
const CommandLineMock = await import("../../src/data/commandLine.js");

jest.unstable_mockModule("../../src/util/log.js", () => ({
    d: () => {},
    e: () => {},
    i: () => {},
    w: () => {},
}));

const CronRepository = await import("../../src/data/cronRepository.js");

describe("CronRepository", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("isInstalled()", () => {
        it.each`
            path                    | expected
            ${null}                 | ${false}
            ${"~/any/path/to/cron"} | ${true}
        `(
            "returns $expected when CommandLine datasource returns '$path'",
            ({ path, expected }) => {
                CommandLineMock.find.mockReturnValue(path);

                const result = CronRepository.isInstalled();

                expect(result).toBe(expected);
                expect(CommandLineMock.find).toHaveBeenCalledTimes(1);
                expect(CommandLineMock.find).toHaveBeenCalledWith("cron");
            },
        );
    });

    describe("getJobs()", () => {
        it.each`
            stdout                                           | expected
            ${"0 * * * * any-job"}                           | ${[{ id: "0 * * * * any-job", isRunning: true }]}
            ${"0 * * * * any-job\n0 12 * * * any-other-job"} | ${[{ id: "0 * * * * any-job", isRunning: true }, { id: "0 12 * * * any-other-job", isRunning: true }]}
        `(
            "returns the parsed jobs when crontab -l command successfully returns $expected.length job/s",
            async ({ stdout, expected }) => {
                CommandLineMock.execute.mockResolvedValue(stdout);

                const result = await CronRepository.getJobs();

                expect(result).toEqual(expected);
                expect(CommandLineMock.execute).toHaveBeenCalledTimes(1);
                expect(CommandLineMock.execute).toHaveBeenCalledWith(
                    "crontab -l",
                );
            },
        );

        it("throws an error when crontab -l command returns no job", async () => {
            CommandLineMock.execute.mockResolvedValue("");

            await expect(CronRepository.getJobs()).rejects.toThrow(
                new Error("No job found!"),
            );
        });

        it("throws an error when crontab -l command fails", async () => {
            const anyError = new Error("any-error");

            CommandLineMock.execute.mockRejectedValue(anyError);

            await expect(CronRepository.getJobs()).rejects.toThrow(anyError);
        });
    });
});
