"use strict";

const Me = imports.misc.extensionUtils.getCurrentExtension();

const CommandLine = Me.imports.src.data.commandLine;
const Log = Me.imports.src.util.log;

const LOGTAG = "Container";

const PARAM_ENGINE = "%engine%";
const PARAM_ID = "%id%";
const COMMAND_TEMPLATE_PS = `${PARAM_ENGINE} ps -a --format '{{.ID}} | {{.Status}} | {{.Names}}'`;
const COMMAND_TEMPLATE_START = `${PARAM_ENGINE} start ${PARAM_ID}`;
const COMMAND_TEMPLATE_RESTART = `${PARAM_ENGINE} restart ${PARAM_ID}`;
const COMMAND_TEMPLATE_STOP = `${PARAM_ENGINE} stop ${PARAM_ID}`;
const COMMAND_TEMPLATE_REMOVE = `${PARAM_ENGINE} rm ${PARAM_ID}`;
const PS_ROWS_SEPARATOR = "\n";
const PS_COLUMNS_SEPARATOR = " | ";
const PS_COLUMN_NAMES_SEPARATOR = ",";
const PS_INDEX_ID = 0;
const PS_INDEX_STATUS = 1;
const PS_INDEX_NAMES = 2;
const PS_STATUS_UP = "Up";

/**
 * Check whether the given container engine is installed.
 *
 * @param {string} engine - either "docker" or "podman"
 * @return {boolean} true if the container engine is installed, false otherwise
 */
/* exported isInstalled */
var isInstalled = (engine) => CommandLine.find(engine) !== null;

/**
 * Retrieve all containers.
 *
 * @param {string} engine - either "docker" or "podman"
 * @return {Promise} the Docker containers as a list of { id, names, isEnabled, canBeEnabled, isRunning }, or fails if an error occur
 */
/* exported getContainers */
var getContainers = async (engine) => {
    const result = await CommandLine.execute(
        COMMAND_TEMPLATE_PS.replace(PARAM_ENGINE, engine)
    );
    const containers = filterContainers(parseContainers(result));
    if (containers.length === 0) {
        Log.w(LOGTAG, `No ${engine} container detected!`);
        throw new Error("No container detected!");
    }
    return containers;
};

/**
 * Start a container.
 *
 * @param {string} engine - either "docker" or "podman"
 * @param {string} id - the container ID
 * @return {Promise} resolves if the container is started, or fails if an error occur
 */
/* exported startContainer */
var startContainer = (engine, id) =>
    _runCommandFromTemplate(COMMAND_TEMPLATE_START, engine, id);

/**
 * Restart a container.
 *
 * @param {string} engine - either "docker" or "podman"
 * @param {string} id - the container ID
 * @return {Promise} resolves if the container is restarted, or fails if an error occur
 */
/* exported restartContainer */
var restartContainer = (engine, id) =>
    _runCommandFromTemplate(COMMAND_TEMPLATE_RESTART, engine, id);

/**
 * Stop a container.
 *
 * @param {string} engine - either "docker" or "podman"
 * @param {string} id - the container ID
 * @return {Promise} resolves if the container is started, or fails if an error occur
 */
/* exported stopContainer */
var stopContainer = (engine, id) =>
    _runCommandFromTemplate(COMMAND_TEMPLATE_STOP, engine, id);

/**
 * Remove a container.
 *
 * @param {string} engine - either "docker" or "podman"
 * @param {string} id - the container ID
 * @return {Promise} resolves if the container is removed, or fails if an error occur
 */
/* exported removeContainer */
var removeContainer = (engine, id) =>
    _runCommandFromTemplate(COMMAND_TEMPLATE_REMOVE, engine, id);

var _runCommandFromTemplate = async (commandTemplate, engine, id) => {
    const command = commandTemplate
        .replace(PARAM_ENGINE, engine)
        .replace(PARAM_ID, id);

    try {
        await CommandLine.executeAsync(command);
        Log.i(
            LOGTAG,
            `Action correctly executed on ${engine} container "${id}"!`
        );
    } catch (error) {
        Log.e(
            LOGTAG,
            `Cannot execute action on ${engine} container "${id}": ${error.message}`
        );
        throw error;
    }
};

/**
 * Parse container engine "ps" command result, and return a list of containers.
 *
 * @param {string} stdout - the container engine "ps" command result
 * @return {Array} the containers as a list of { id, names, isEnabled, canBeEnabled, isRunning }
 */
var parseContainers = (stdout) =>
    stdout
        .split(PS_ROWS_SEPARATOR)
        .filter((item) => item.length > 0)
        .map((item) => _parseContainer(item));

var _parseContainer = (stdout) => {
    stdout = stdout.split(PS_COLUMNS_SEPARATOR, 4);

    let container = {};
    container.id = stdout[PS_INDEX_ID].trim();
    container.names = stdout[PS_INDEX_NAMES].split(PS_COLUMN_NAMES_SEPARATOR);
    container.isEnabled = true;
    container.canBeEnabled = true;
    container.isRunning = stdout[PS_INDEX_STATUS].indexOf(PS_STATUS_UP) > -1;
    return container;
};

/**
 * Filter containers list.
 *
 * @param {Array} containers - the containers as a list of { id, isEnabled, canBeEnabled, isRunning, names }
 * @return {Array} the given list ordered by status
 */
var filterContainers = (containers) =>
    containers.sort((item1, item2) => _sortByRunningStatus(item1, item2));

var _sortByRunningStatus = (item1, item2) =>
    item1.isRunning === item2.isRunning ? 0 : item1.isRunning ? -1 : 1;
