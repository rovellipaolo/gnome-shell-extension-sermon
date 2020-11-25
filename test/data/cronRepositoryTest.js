"use strict";

// Import dummy/fake Gjs implementations:
imports.searchPath.push("./test/util/fake");
const CommandLineMock = imports.misc.Me.imports.src.data.commandLine;

const GjsMockito = imports.test.util.gjsMockito;
const when = GjsMockito.when;
const expectMock = GjsMockito.verify;

const sut = imports.src.data.cronRepository;

/* exported testSuite */
function testSuite() {
    const ANY_PATH = "~/any/path/to/cron";
    const NO_PATH = null;
    const ANY_JOBS =
        "0 * * * * /usr/local/bin/my_cron_script\n" +
        '0 12 * * * (cd "/opt/my_cron_repo"; HOME= git pull)';
    const NO_JOB = "";

    describe("CronRepository.isInstalled()", () => {
        it("when Cron program is found, returns true", () => {
            when(CommandLineMock, "find").thenReturn(ANY_PATH);

            const result = sut.isInstalled();

            expect(result).toBe(true);
        });

        it("when Cron program is not found, returns false", () => {
            when(CommandLineMock, "find").thenReturn(NO_PATH);

            const result = sut.isInstalled();

            expect(result).toBe(false);
        });
    });

    describe("CronRepository.getJobs()", () => {
        it("when retrieving the Cron jobs, crontab list command is executed", () => {
            const anyResolvedPromise = new Promise((resolve) =>
                resolve(ANY_JOBS)
            );
            when(CommandLineMock, "execute").thenReturn(anyResolvedPromise);

            sut.getJobs();

            expectMock(CommandLineMock, "execute").toHaveBeenCalledWith(
                "crontab -l"
            );
        });

        // it("when no Cron job is found, returns an error", () => {});

        // it("when Cron jobs are found but cannot parse them, returns an error", () => {});

        // it("when Cron jobs are found, returns them", () => {});
    });

    describe("CronRepository.parseJobs()", () => {
        it("when pasing command execution result with Cron jobs, returns a list of jobs", () => {
            const result = sut.parseJobs(ANY_JOBS);

            expect(result.length).toBe(2);
            expect(result[0].id).toBe(
                "0 * * * * /usr/local/bin/my_cron_script"
            );
            expect(result[0].isRunning).toBe(true);
            expect(result[1].id).toBe(
                '0 12 * * * (cd "/opt/my_cron_repo"; HOME= git pull)'
            );
            expect(result[1].isRunning).toBe(true);
        });

        it("when pasing command execution result without cron jobs, returns an empty list", () => {
            const result = sut.parseJobs(NO_JOB);

            expect(result.length).toBe(0);
        });
    });
}
