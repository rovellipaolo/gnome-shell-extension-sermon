"use strict";

const Me = imports.misc.extensionUtils.getCurrentExtension();

const CommandLine = Me.imports.src.data.commandLine;
const Log = Me.imports.src.util.log;
const Settings = Me.imports.src.data.settings;

const LOGTAG = "SystemdRepository";

const PROGRAM = "systemctl";
const COMMAND_IS_RUNNING = "systemctl is-system-running";
const COMMAND_VERSION = `systemctl --version`;
const COMMAND_LIST_ALL = "systemctl list-units --type=service --all --system";
const COMMAND_LIST_USER = "systemctl list-units --type=service --all --user";
const COMMAND_TEMPLATE_ID_PARAM = "%id%";
const COMMAND_TEMPLATE_IS_ACTIVE = "systemctl is-active %id%";
const COMMAND_TEMPLATE_START = `systemctl start ${COMMAND_TEMPLATE_ID_PARAM} --type=service`;
const COMMAND_TEMPLATE_START_USER = `systemctl start ${COMMAND_TEMPLATE_ID_PARAM} --type=service --user`;
const COMMAND_TEMPLATE_STOP = `systemctl stop ${COMMAND_TEMPLATE_ID_PARAM} --type=service`;
const COMMAND_TEMPLATE_STOP_USER = `systemctl stop ${COMMAND_TEMPLATE_ID_PARAM} --type=service --user`;
const ROWS_SEPARATOR = "\n";
const LIST_COLUMNS_SEPARATOR = " ";
const LIST_EMPTY_LINE = "";
const LIST_INDEX_ID = 0;
const LIST_INDEX_ACTIVE = 2;
const LIST_INDEX_RUNNING = 3;
const LIST_ID_NAME_SEPARATOR = ".";
const STATUS_ACTIVE = "active";
const STATUS_RUNNING = "running";

/**
 * Check whether Systemd is installed.
 * 
 * @return {boolean} true if Systemd is installed, false otherwise
 */
/* exported isInstalled */
var isInstalled = () => CommandLine.find(PROGRAM) !== null;

/**
 * Check whether Systemd is running.
 * 
 * @return {Promise} true if Systemd is running, false otherwise
 */
/* exported isRunning */
var isRunning = () => new Promise((resolve, _) => {
    CommandLine.execute(COMMAND_IS_RUNNING)
        .then(result => {
            const status = result.split(ROWS_SEPARATOR)[0].trim();
            if (status === STATUS_RUNNING) {
                resolve(true);
            }
            resolve(false);
        })
        .catch(_ => resolve(false));
    });

/**
 * Retrieve the Systemd version.
 * 
 * @return {Promise} the version as a string, or fails if an error occur
 */
/* exported getVersion */
var getVersion = () => new Promise((resolve, reject) => {
    CommandLine.execute(COMMAND_VERSION)
        .then(result => {
            const version = result.split(ROWS_SEPARATOR)
            resolve(version[0]);
        })
        .catch(error => {
            reject(error);
        });
});

/**
 * Retrieve all Systemd services.
 * 
 * @return {Promise} the Systemd services as a list of { id, isRunning, name }, or fails if an error occur
 */
/* exported getServices */
var getServices = () => new Promise((resolve, reject) => {
    const command = Settings.shouldFilterSystemdUserServices() ? COMMAND_LIST_USER : COMMAND_LIST_ALL;
    CommandLine.execute(command)
        .then(result => {
            const services = parseServices(result)
                .sort((item1, item2) => _sortByRunningStatus(item1, item2))
                .sort((item1, item2) => _sortByIdsPriority(item1, item2));
            if (services.length === 0) {
                reject("No service detected!");
            }
            resolve(services);
        })
        .catch(_ => {
            reject("Cannot retrieve services!");
        });
});

/**
 * Check whether a given Systemd service is running.
 * 
 * @return {Promise} true if the given service is running, false otherwise
 */
/* exported isServiceRunning */
var isServiceRunning = (id) => new Promise((resolve, _) => {
    const command = COMMAND_TEMPLATE_IS_ACTIVE.replace(COMMAND_TEMPLATE_ID_PARAM, id)
    CommandLine.execute(command)
        .then(result => {
            const status = result.split(ROWS_SEPARATOR)[0].trim();
            if (status === STATUS_ACTIVE) {
                resolve(true);
            }
            resolve(false);
        })
        .catch(_ => resolve(false));
});

/**
 * Start Systemd service.
 * 
 * @param {string} id - the Systemd service ID
 * @return {Promise} resolves if Systemd service is started, or fails if an error occur
 */
/* exported startService */
var startService = (id) => _runCommandFromTemplate(
    Settings.shouldFilterSystemdUserServices() ? COMMAND_TEMPLATE_START_USER : COMMAND_TEMPLATE_START,
    id
);

/**
 * Stop Systemd service.
 * 
 * @param {string} id - the Systemd service ID
 * @return {Promise} resolves if Systemd service is started, or fails if an error occur
 */
/* exported stopService */
var stopService = (id) => _runCommandFromTemplate(
    Settings.shouldFilterSystemdUserServices() ? COMMAND_TEMPLATE_STOP_USER : COMMAND_TEMPLATE_STOP,
    id
);

var _runCommandFromTemplate = (commandTemplate, id) => new Promise((resolve, reject) => {
    const command = commandTemplate.replace(COMMAND_TEMPLATE_ID_PARAM, id);
    const message = _buildCommandMessageFromTemplate(commandTemplate);

    CommandLine.executeAsync(command)
        .then(_ => {
            Log.i(LOGTAG, `Systemd service "${id}" ${message} correctly!`);
            resolve();
        })
        .catch(_ => {
            Log.e(LOGTAG, `Systemd service "${id}" could not be ${message}!`);
            reject();
        });
});

var _buildCommandMessageFromTemplate = (commandTemplate) => {
    switch (commandTemplate) {
    case COMMAND_TEMPLATE_START:
    case COMMAND_TEMPLATE_START_USER:
        return "started";
    case COMMAND_TEMPLATE_STOP:
    case COMMAND_TEMPLATE_STOP_USER:
        return "stopped";
    default:
        return "???";
    }
};

/**
 * Parse Systemd list command result, and return a list of services.
 * 
 * @return {Array} the Systemd services as a list of { id, isRunning, name }
 */
var parseServices = (result) => {
    const services = result.split(ROWS_SEPARATOR);
    return services.slice(1, services.indexOf(LIST_EMPTY_LINE))
        .filter(item => item.length > 0)
        .map(item => {
            item = item.trim()
                .replace(/\s+/g, " ")
                .split(LIST_COLUMNS_SEPARATOR, 4);
            return _parseService(item);
        });
};

var _parseService = (stdout) => {
    let service = {};
    service.id = stdout[LIST_INDEX_ID];
    service.isActive = stdout[LIST_INDEX_ACTIVE] === STATUS_ACTIVE;
    service.isRunning = stdout[LIST_INDEX_RUNNING] === STATUS_RUNNING;
    service.name = service.id.substring(0, service.id.indexOf(LIST_ID_NAME_SEPARATOR));
    return service;
};

var _sortByRunningStatus = (item1, item2) =>
    item1.isRunning === item2.isRunning ? 0 : item1.isRunning ? -1 : 1;

var _sortByIdsPriority = (item1, item2) => {
    const priorityList = Settings.getSystemdSectionItemsPriorityList();
    if (priorityList.length === 0) {
        return 0;
    }
    const item1IsPrioritised = priorityList.includes(item1.id);
    return item1IsPrioritised === priorityList.includes(item2.id) ? 0 : item1IsPrioritised ? -1 : 1;
};
