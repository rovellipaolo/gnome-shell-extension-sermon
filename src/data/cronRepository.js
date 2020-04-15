"use strict";

const Me = imports.misc.extensionUtils.getCurrentExtension();

const CommandLine = Me.imports.src.data.commandLine;

const PROGRAM = "cron";
const COMMAND_LIST_ALL = "crontab -l";
const LIST_ROWS_SEPARATOR = "\n";

/**
 * Check whether Cron is installed.
 * 
 * @return {boolean} true if Cron is installed, false otherwise
 */
/* exported isInstalled */
var isInstalled = () => CommandLine.find(PROGRAM) !== null;

/**
 * Retrieve all Cron jobs.
 * 
 * @return {Promise} the Cron jobs as a list of { id, isRunning }, or fails if an error occur
 */
/* exported getJobs */
var getJobs = () => new Promise((resolve, reject) => {
    CommandLine.execute(COMMAND_LIST_ALL)
        .then(result => {
            const jobs = parseJobs(result);
            if (jobs.length === 0) {
                reject("No job detected!");
            }
            resolve(jobs);
        })
        .catch(_ => {
            reject("No job detected!");
        });
});

/**
 * Parse Cron list command result, and return a list of jobs.
 * 
 * @return {Array} the Cron jobs as a list of { id, isRunning }
 */
var parseJobs = (result) => {
    const jobs = result.split(LIST_ROWS_SEPARATOR);
    return jobs
        .filter(item => item.length > 0)
        .map(item => {
            item = item.trim();
            return _parseJob(item);
        });
};

var _parseJob = (stdout) => {
    let job = {};
    job.id = stdout;
    job.isRunning = true;
    return job;
};
