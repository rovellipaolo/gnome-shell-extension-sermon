"use strict";

const Me = imports.misc.extensionUtils.getCurrentExtension();

const CommandLine = Me.imports.src.data.datasource.commandLine;
const Log = Me.imports.src.util.log;

const LOGTAG = "DockerRepository";

const DOCKER_PROGRAM = "docker";
const DOCKER_PS_COMMAND = "docker ps -a --format '{{.ID}} | {{.Image}} | {{.Status}} | {{.Names}}'";
const DOCKER_PS_ROWS_SEPARATOR = "\n";
const DOCKER_PS_COLUMNS_SEPARATOR = " | ";
const DOCKER_ID_PARAM = "%id%";
const DOCKER_START_COMMAND_TEMPLATE = `docker start ${DOCKER_ID_PARAM}`;
const DOCKER_STOP_COMMAND_TEMPLATE = `docker stop ${DOCKER_ID_PARAM}`;
const ID_INDEX = 0;
const IMAGE_INDEX = 1;
const STATUS_INDEX = 2;
const NAMES_INDEX = 3;
const STATUS_UP = "Up";
const NAMES_SEPARATOR = ",";

/**
 * Check whether docker is installed.
 * 
 * @return {boolean} true if docker is installed, false otherwise
 */
/* exported isDockerInstalled */
var isDockerInstalled = () => CommandLine.find(DOCKER_PROGRAM) !== null;

/**
 * Retrieve all docker containers.
 * 
 * @return {Promise} the docker containers as a list of { id, image, isRunning, names }, or fails if an error occur
 */
/* exported getContainers */
var getContainers = () => new Promise((resolve, reject) => {
    CommandLine.execute(DOCKER_PS_COMMAND)
        .then(result => {
            const containers = _buildContainers(result);
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
 * Start docker container.
 * 
 * @param {string} the docker ID
 * @return {Promise} resolves if docker container is started, or fails if an error occur
 */
/* exported startContainer */
var startContainer = (id) => _runCommandFromTemplate(DOCKER_START_COMMAND_TEMPLATE, id);

/**
 * Stop docker container.
 * 
 * @param {string} the docker ID
 * @return {Promise} resolves if docker container is started, or fails if an error occur
 */
/* exported stopContainer */
var stopContainer = (id) => _runCommandFromTemplate(DOCKER_STOP_COMMAND_TEMPLATE, id);

const _runCommandFromTemplate = (commandTemplate, id) => new Promise((resolve, reject) => {
    const command = commandTemplate.replace(DOCKER_ID_PARAM, id);
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

const _buildCommandMessageFromTemplate = (commandTemplate) => {
    switch (commandTemplate) {
    case DOCKER_START_COMMAND_TEMPLATE:
        return "started";
    case DOCKER_STOP_COMMAND_TEMPLATE:
        return "stopped";
    default:
        return "???";
    }
};

const _buildContainers = (result) => result.split(DOCKER_PS_ROWS_SEPARATOR)
    .filter(item => item.length > 0)
    .map(item => {
        item = item.split(DOCKER_PS_COLUMNS_SEPARATOR, 4);
        return _buildContainer(item);
    });

const _buildContainer = (stdout) => {
    let container = {};
    container.id = stdout[ID_INDEX];
    container.image = stdout[IMAGE_INDEX];
    container.isRunning = stdout[STATUS_INDEX].indexOf(STATUS_UP) > -1;
    container.names = stdout[NAMES_INDEX].split(NAMES_SEPARATOR);
    return container;
};
