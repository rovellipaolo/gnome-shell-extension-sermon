"use strict";

const Me = imports.misc.extensionUtils.getCurrentExtension();

const CommandLine = Me.imports.src.data.datasource.commandLine;
const Log = Me.imports.src.util.log;

const LOGTAG = "SystemdRepository";

const PROGRAM = "systemctl";
const COMMAND_LIST_ALL = "systemctl list-units --type=service --all";
const COMMAND_TEMPLATE_ID_PARAM = "%id%";
const COMMAND_TEMPLATE_START = `systemctl start ${COMMAND_TEMPLATE_ID_PARAM} --type=service`;
const COMMAND_TEMPLATE_STOP = `systemctl stop ${COMMAND_TEMPLATE_ID_PARAM} --type=service`;
const LIST_ROWS_SEPARATOR = "\n";
const LIST_COLUMNS_SEPARATOR = " ";
const LIST_EMPTY_LINE = "";
const LIST_INDEX_ID = 0;
const LIST_INDEX_ACTIVE = 2;
const LIST_INDEX_RUNNING = 3;
const LIST_STATUS_ACTIVE = "active";
const LIST_STATUS_RUNNING = "running";
const LIST_ID_NAME_SEPARATOR = ".";

/**
 * Check whether systemd is installed.
 * 
 * @return {boolean} true if systemd is installed, false otherwise
 */
/* exported isSystemdInstalled */
var isSystemdInstalled = () => CommandLine.find(PROGRAM) !== null;

/**
 * Retrieve all systemd services.
 * 
 * @return {Promise} the systemd services as a list of { id, isRunning, name }, or fails if an error occur
 */
/* exported getServices */
var getServices = () => new Promise((resolve, reject) => {
    CommandLine.execute(COMMAND_LIST_ALL)
        .then(result => {
            const services = parseServices(result);
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
 * Start systemd service.
 * 
 * @param {string} the systemd service ID
 * @return {Promise} resolves if systemd service is started, or fails if an error occur
 */
/* exported startService */
var startService = (id) => _runCommandFromTemplate(COMMAND_TEMPLATE_START, id);

/**
 * Stop systemd service.
 * 
 * @param {string} the systemd service ID
 * @return {Promise} resolves if systemd service is started, or fails if an error occur
 */
/* exported stopService */
var stopService = (id) => _runCommandFromTemplate(COMMAND_TEMPLATE_STOP, id);

const _runCommandFromTemplate = (commandTemplate, id) => new Promise((resolve, reject) => {
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

const _buildCommandMessageFromTemplate = (commandTemplate) => {
    switch (commandTemplate) {
    case COMMAND_TEMPLATE_START:
        return "started";
    case COMMAND_TEMPLATE_STOP:
        return "stopped";
    default:
        return "???";
    }
};

/**
 * Parse systemd list command result, and return a list of services.
 * 
 * @return {Array} the systemd services as a list of { id, isRunning, name }
 */
var parseServices = (result) => {
    const services = result.split(LIST_ROWS_SEPARATOR);
    return services.slice(1, services.indexOf(LIST_EMPTY_LINE))
        .filter(item => item.length > 0)
        .map(item => {
            item = item.trim()
                .replace(/\s+/g, " ")
                .split(LIST_COLUMNS_SEPARATOR, 4);
            return _parseService(item);
        });
};

const _parseService = (stdout) => {
    let service = {};
    service.id = stdout[LIST_INDEX_ID];
    service.isActive = stdout[LIST_INDEX_ACTIVE] === LIST_STATUS_ACTIVE;
    service.isRunning = stdout[LIST_INDEX_RUNNING] === LIST_STATUS_RUNNING;
    service.name = service.id.substring(0, service.id.indexOf(LIST_ID_NAME_SEPARATOR));
    return service;
};
