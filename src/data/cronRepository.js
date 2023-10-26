import * as CommandLine from "./commandLine.js";
import * as Log from "../util/log.js";

const LOGTAG = "CronRepository";

const PROGRAM = "cron";
const COMMAND_LIST_ALL = "crontab -l";
const LIST_ROWS_SEPARATOR = "\n";

/**
 * Check whether Cron is installed.
 *
 * @return {boolean} true if Cron is installed, false otherwise
 */
export const isInstalled = () => CommandLine.find(PROGRAM) !== null;

/**
 * Retrieve all Cron jobs.
 *
 * @return {Promise} the Cron jobs as a list of { id, isRunning }, or fails if an error occur
 */
export const getJobs = async () => {
    const stdout = await CommandLine.execute(COMMAND_LIST_ALL);
    const jobs = stdout
        .split(LIST_ROWS_SEPARATOR)
        .filter((item) => item.length > 0)
        .map((item) => ({ id: item.trim(), isRunning: true }));

    if (jobs.length === 0) {
        Log.w(LOGTAG, "No cron job found!");
        throw new Error("No job found!");
    }

    return jobs;
};
