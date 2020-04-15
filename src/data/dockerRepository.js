"use strict";

const Me = imports.misc.extensionUtils.getCurrentExtension();

const CommandLine = Me.imports.src.data.commandLine;
const Log = Me.imports.src.util.log;

const LOGTAG = "DockerRepository";

const PROGRAM = "docker";
const COMMAND_PS = "docker ps -a --format '{{.ID}} | {{.Status}} | {{.Names}}'";
const COMMAND_VERSION = "docker --version";
const COMMAND_TEMPLATE_ID_PARAM = "%id%";
const COMMAND_TEMPLATE_START = `docker start ${COMMAND_TEMPLATE_ID_PARAM}`;
const COMMAND_TEMPLATE_RESTART = `docker restart ${COMMAND_TEMPLATE_ID_PARAM}`;
const COMMAND_TEMPLATE_STOP = `docker stop ${COMMAND_TEMPLATE_ID_PARAM}`;
const COMMAND_TEMPLATE_REMOVE = `docker rm ${COMMAND_TEMPLATE_ID_PARAM}`;
const PS_ROWS_SEPARATOR = "\n";
const PS_COLUMNS_SEPARATOR = " | ";
const PS_COLUMN_NAMES_SEPARATOR = ",";
const PS_INDEX_ID = 0;
const PS_INDEX_STATUS = 1;
const PS_INDEX_NAMES = 2;
const PS_STATUS_UP = "Up";

/**
 * Check whether Docker is installed.
 * 
 * @return {boolean} true if Docker is installed, false otherwise
 */
/* exported isInstalled */
var isInstalled = () => CommandLine.find(PROGRAM) !== null;

/**
 * Retrieve the Docker version.
 * 
 * @return {Promise} the version as a string, or fails if an error occur
 */
/* exported getVersion */
var getVersion = () => CommandLine.execute(COMMAND_VERSION);

/**
 * Retrieve all Docker containers.
 * 
 * @return {Promise} the Docker containers as a list of { id, isRunning, names }, or fails if an error occur
 */
/* exported getContainers */
var getContainers = () => new Promise((resolve, reject) => {
    CommandLine.execute(COMMAND_PS)
        .then(result => {
            const containers = parseContainers(result)
                .sort((item1, item2) => _sortByRunningStatus(item1, item2));
            if (containers.length === 0) {
                reject("No container detected!");
            }
            resolve(containers);
        })
        .catch(_ => {
            reject("Cannot retrieve containers!");
        });
});

/**
 * Start a Docker container.
 * 
 * @param {string} id - the Docker container ID
 * @return {Promise} resolves if Docker container is started, or fails if an error occur
 */
/* exported startContainer */
var startContainer = (id) => _runCommandFromTemplate(COMMAND_TEMPLATE_START, id);

/**
 * Restart a Docker container.
 * 
 * @param {string} id - the Docker container ID
 * @return {Promise} resolves if Docker container is restarted, or fails if an error occur
 */
/* exported restartContainer */
var restartContainer = (id) => _runCommandFromTemplate(COMMAND_TEMPLATE_RESTART, id);

/**
 * Stop a Docker container.
 * 
 * @param {string} id - the Docker container ID
 * @return {Promise} resolves if Docker container is started, or fails if an error occur
 */
/* exported stopContainer */
var stopContainer = (id) => _runCommandFromTemplate(COMMAND_TEMPLATE_STOP, id);

/**
 * Remove a Docker container.
 * 
 * @param {string} id - the Docker container ID
 * @return {Promise} resolves if Docker container is removed, or fails if an error occur
 */
/* exported removeContainer */
var removeContainer = (id) => _runCommandFromTemplate(COMMAND_TEMPLATE_REMOVE, id);

var _runCommandFromTemplate = (commandTemplate, id) => new Promise((resolve, reject) => {
    const command = commandTemplate.replace(COMMAND_TEMPLATE_ID_PARAM, id);
    const message = _buildCommandMessageFromTemplate(commandTemplate);

    CommandLine.executeAsync(command)
        .then(_ => {
            Log.i(LOGTAG, `Docker container "${id}" ${message} correctly!`);
            resolve();
        })
        .catch(_ => {
            Log.e(LOGTAG, `Docker container "${id}" could not be ${message}!`);
            reject();
        });
});

var _buildCommandMessageFromTemplate = (commandTemplate) => {
    switch (commandTemplate) {
    case COMMAND_TEMPLATE_START:
        return "started";
    case COMMAND_TEMPLATE_STOP:
        return "stopped";
    case COMMAND_TEMPLATE_RESTART:
        return "restarted";
    case COMMAND_TEMPLATE_REMOVE:
        return "removed";
    default:
        return "???";
    }
};

/**
 * Parse Docker ps command result, and return a list of containers.
 * 
 * @return {Array} the containers as a list of { id, isRunning, names }
 */
var parseContainers = (result) => result.split(PS_ROWS_SEPARATOR)
    .filter(item => item.length > 0)
    .map(item => {
        item = item.split(PS_COLUMNS_SEPARATOR, 4);
        return _parseContainer(item);
    });

var _parseContainer = (stdout) => {
    let container = {};
    container.id = stdout[PS_INDEX_ID].trim();
    container.isRunning = stdout[PS_INDEX_STATUS].indexOf(PS_STATUS_UP) > -1;
    container.names = stdout[PS_INDEX_NAMES].split(PS_COLUMN_NAMES_SEPARATOR);
    return container;
};

var _sortByRunningStatus = (item1, item2) =>
    item1.isRunning === item2.isRunning ? 0 : item1.isRunning ? -1 : 1;
