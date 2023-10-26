import { jest, beforeEach, describe, expect, it } from "@jest/globals";

jest.unstable_mockModule("../../src/data/commandLine.js", () => ({
    find: jest.fn(),
    execute: jest.fn(),
    executeAsync: jest.fn(),
}));
const CommandLineMock = await import("../../src/data/commandLine.js");

jest.unstable_mockModule("../../src/util/log.js", () => ({
    d: () => {},
    e: () => {},
    i: () => {},
    w: () => {},
}));

const Container = await import("../../src/data/container.js");

describe("Container", () => {
    const ANY_ENGINE = "docker";
    const ANY_CONTAINER_ID = "123456789000";

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("isInstalled()", () => {
        it.each`
            path                      | expected
            ${null}                   | ${false}
            ${"~/any/path/to/engine"} | ${true}
        `(
            "returns $expected when CommandLine datasource returns '$path'",
            ({ path, expected }) => {
                CommandLineMock.find.mockReturnValue(path);

                const result = Container.isInstalled(ANY_ENGINE);

                expect(result).toBe(expected);
                expect(CommandLineMock.find).toHaveBeenCalledTimes(1);
                expect(CommandLineMock.find).toHaveBeenCalledWith(ANY_ENGINE);
            },
        );
    });

    describe("getContainers()", () => {
        it.each`
            id                  | status                        | name                         | expected
            ${"123456789000"}   | ${"Exited (0) 5 seconds ago"} | ${"any-container"}           | ${[{ id: "123456789000", names: ["any-container"], isEnabled: true, canBeEnabled: true, isRunning: false }]}
            ${" 123456789000 "} | ${"Exited (1) 2 days ago"}    | ${"any-container,container"} | ${[{ id: "123456789000", names: ["any-container", "container"], isEnabled: true, canBeEnabled: true, isRunning: false }]}
            ${"123456789000"}   | ${"Up 8 seconds"}             | ${"any-container"}           | ${[{ id: "123456789000", names: ["any-container"], isEnabled: true, canBeEnabled: true, isRunning: true }]}
            ${" 123456789000 "} | ${"Up 2 days ago"}            | ${"any-container,container"} | ${[{ id: "123456789000", names: ["any-container", "container"], isEnabled: true, canBeEnabled: true, isRunning: true }]}
        `(
            "returns the parsed container when engine ps command successfully returns container $id, $name and $status",
            async ({ id, name, status, expected }) => {
                CommandLineMock.execute.mockReturnValue(
                    `${id} | ${status} | ${name}`,
                );

                const result = await Container.getContainers(ANY_ENGINE);

                expect(result).toEqual(expected);
                expect(CommandLineMock.execute).toHaveBeenCalledTimes(1);
                expect(CommandLineMock.execute).toHaveBeenCalledWith(
                    `${ANY_ENGINE} ps -a --format '{{.ID}} | {{.Status}} | {{.Names}}'`,
                );
            },
        );

        it("returns the parsed containers sorted by status when engine ps command successfully returns container/s", async () => {
            CommandLineMock.execute.mockReturnValue(
                "a0 | Exited (0) 5 seconds ago | memcached\n" +
                    "b0 | Up 8 seconds | mysql\n" +
                    "b1 | Up 2 days | tools,dev-tools\n" +
                    "a1 | Exited (1) 2 days ago | mongodb",
            );

            const result = await Container.getContainers(ANY_ENGINE);

            const ids = result.map((container) => container.id);
            expect(ids).toEqual(["b0", "b1", "a0", "a1"]);
            expect(CommandLineMock.execute).toHaveBeenCalledTimes(1);
            expect(CommandLineMock.execute).toHaveBeenCalledWith(
                `${ANY_ENGINE} ps -a --format '{{.ID}} | {{.Status}} | {{.Names}}'`,
            );
        });

        it("throws an error when engine ps command returns no container", async () => {
            CommandLineMock.execute.mockResolvedValue("");

            await expect(Container.getContainers(ANY_ENGINE)).rejects.toThrow(
                new Error("No container found!"),
            );
        });

        it("throws an error when engine ps command fails", async () => {
            const anyError = new Error("any-error");

            CommandLineMock.execute.mockRejectedValue(anyError);

            await expect(Container.getContainers(ANY_ENGINE)).rejects.toThrow(
                anyError,
            );
        });
    });

    describe("getImages()", () => {
        it.each`
            id                  | repository                | tag          | expected
            ${"123456789000"}   | ${"any-repository"}       | ${"any-tag"} | ${[{ id: "123456789000", names: ["any-repository:any-tag"], isEnabled: false, canBeEnabled: false, isRunning: false }]}
            ${" 123456789000 "} | ${"any.other.repository"} | ${"any-tag"} | ${[{ id: "123456789000", names: ["any.other.repository:any-tag"], isEnabled: false, canBeEnabled: false, isRunning: false }]}
        `(
            "returns the parsed image when engine images command successfully returns image $id, $repository and $tag",
            async ({ id, repository, tag, expected }) => {
                CommandLineMock.execute.mockReturnValue(
                    `${id} | ${repository} | ${tag}`,
                );

                const result = await Container.getImages(ANY_ENGINE);

                expect(result).toEqual(expected);
                expect(CommandLineMock.execute).toHaveBeenCalledTimes(1);
                expect(CommandLineMock.execute).toHaveBeenCalledWith(
                    `${ANY_ENGINE} images --format '{{.ID}} | {{.Repository}} | {{.Tag}}'`,
                );
            },
        );

        it("throws an error when engine images command returns no container", async () => {
            CommandLineMock.execute.mockResolvedValue("");

            await expect(Container.getImages(ANY_ENGINE)).rejects.toThrow(
                new Error("No image found!"),
            );
        });

        it("throws an error when engine images command fails", async () => {
            const anyError = new Error("any-error");

            CommandLineMock.execute.mockRejectedValue(anyError);

            await expect(Container.getImages(ANY_ENGINE)).rejects.toThrow(
                anyError,
            );
        });
    });

    describe("startContainer()", () => {
        it("calls engine start command", async () => {
            CommandLineMock.executeAsync.mockResolvedValue();

            await Container.startContainer(ANY_ENGINE, ANY_CONTAINER_ID);

            expect(CommandLineMock.executeAsync).toHaveBeenCalledTimes(1);
            expect(CommandLineMock.executeAsync).toHaveBeenCalledWith(
                `${ANY_ENGINE} start ${ANY_CONTAINER_ID}`,
            );
        });

        it("throws an error when engine start command fails", async () => {
            const anyError = new Error("any-error");
            CommandLineMock.executeAsync.mockRejectedValue(anyError);

            await expect(
                Container.startContainer(ANY_ENGINE, ANY_CONTAINER_ID),
            ).rejects.toThrow(anyError);
        });
    });

    describe("restartContainer()", () => {
        it("calls engine restart command", async () => {
            CommandLineMock.executeAsync.mockResolvedValue();

            await Container.restartContainer(ANY_ENGINE, ANY_CONTAINER_ID);

            expect(CommandLineMock.executeAsync).toHaveBeenCalledTimes(1);
            expect(CommandLineMock.executeAsync).toHaveBeenCalledWith(
                `${ANY_ENGINE} restart ${ANY_CONTAINER_ID}`,
            );
        });

        it("throws an error when engine restart command fails", async () => {
            const anyError = new Error("any-error");
            CommandLineMock.executeAsync.mockRejectedValue(anyError);

            await expect(
                Container.restartContainer(ANY_ENGINE, ANY_CONTAINER_ID),
            ).rejects.toThrow(anyError);
        });
    });

    describe("stopContainer()", () => {
        it("calls engine stop command", async () => {
            CommandLineMock.executeAsync.mockResolvedValue();

            await Container.stopContainer(ANY_ENGINE, ANY_CONTAINER_ID);

            expect(CommandLineMock.executeAsync).toHaveBeenCalledTimes(1);
            expect(CommandLineMock.executeAsync).toHaveBeenCalledWith(
                `${ANY_ENGINE} stop ${ANY_CONTAINER_ID}`,
            );
        });

        it("throws an error when engine stop command fails", async () => {
            const anyError = new Error("any-error");
            CommandLineMock.executeAsync.mockRejectedValue(anyError);

            await expect(
                Container.stopContainer(ANY_ENGINE, ANY_CONTAINER_ID),
            ).rejects.toThrow(anyError);
        });
    });

    describe("removeContainer()", () => {
        it("calls engine rm command", async () => {
            CommandLineMock.executeAsync.mockResolvedValue();

            await Container.removeContainer(ANY_ENGINE, ANY_CONTAINER_ID);

            expect(CommandLineMock.executeAsync).toHaveBeenCalledTimes(1);
            expect(CommandLineMock.executeAsync).toHaveBeenCalledWith(
                `${ANY_ENGINE} rm ${ANY_CONTAINER_ID}`,
            );
        });

        it("throws an error when engine rm command fails", async () => {
            const anyError = new Error("any-error");
            CommandLineMock.executeAsync.mockRejectedValue(anyError);

            await expect(
                Container.removeContainer(ANY_ENGINE, ANY_CONTAINER_ID),
            ).rejects.toThrow(anyError);
        });
    });
});
