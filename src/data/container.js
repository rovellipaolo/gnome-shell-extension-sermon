import * as CommandLine from "./commandLine.js";
import * as Log from "../util/log.js";

const LOGTAG = "Container";

const PARAM_ENGINE = "%engine%";
const PARAM_ID = "%id%";
const COMMAND_TEMPLATE_PS = `${PARAM_ENGINE} ps -a --format '{{.ID}} | {{.Status}} | {{.Names}}'`;
const COMMAND_TEMPLATE_IMAGES = `${PARAM_ENGINE} images --format '{{.ID}} | {{.Repository}} | {{.Tag}}'`;
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
const IMAGES_ROWS_SEPARATOR = "\n";
const IMAGES_COLUMNS_SEPARATOR = " | ";
const IMAGES_INDEX_ID = 0;
const IMAGES_INDEX_REPOSITORY = 1;
const IMAGES_INDEX_TAG = 2;

/**
 * Check whether the given container engine is installed.
 *
 * @param {string} engine - either "docker" or "podman"
 * @return {boolean} true if the container engine is installed, false otherwise
 */
export const isInstalled = (engine) => CommandLine.find(engine) !== null;

/**
 * Retrieve all containers.
 *
 * @param {string} engine - either "docker" or "podman"
 * @return {Promise} the containers as a list of { id, names, isEnabled, canBeEnabled, isRunning }, or fails if an error occur
 */
export const getContainers = async (engine) => {
    const stdout = await CommandLine.execute(
        COMMAND_TEMPLATE_PS.replace(PARAM_ENGINE, engine),
    );
    const containers = stdout
        .split(PS_ROWS_SEPARATOR)
        .filter((item) => item.length > 0)
        .map((item) => _parseContainer(item))
        .sort((item1, item2) => _sortByRunningStatus(item1, item2));

    if (containers.length === 0) {
        Log.w(LOGTAG, `No ${engine} container found!`);
        throw new Error("No container found!");
    }

    return containers;
};

/**
 * Retrieve all images.
 *
 * @param {string} engine - either "docker" or "podman"
 * @return {Promise} the images as a list of { id, names, isEnabled, canBeEnabled, isRunning }, or fails if an error occur
 */
export const getImages = async (engine) => {
    const stdout = await CommandLine.execute(
        COMMAND_TEMPLATE_IMAGES.replace(PARAM_ENGINE, engine),
    );
    const images = stdout
        .split(IMAGES_ROWS_SEPARATOR)
        .filter((item) => item.length > 0)
        .map((item) => _parseImage(item));

    if (images.length === 0) {
        Log.w(LOGTAG, `No ${engine} image found!`);
        throw new Error("No image found!");
    }

    return images;
};

/**
 * Start a container.
 *
 * @param {string} engine - either "docker" or "podman"
 * @param {string} id - the container ID
 * @return {Promise} resolves if the container is started, or fails if an error occur
 */
export const startContainer = (engine, id) =>
    _runCommandFromTemplate(COMMAND_TEMPLATE_START, engine, id);

/**
 * Restart a container.
 *
 * @param {string} engine - either "docker" or "podman"
 * @param {string} id - the container ID
 * @return {Promise} resolves if the container is restarted, or fails if an error occur
 */
export const restartContainer = (engine, id) =>
    _runCommandFromTemplate(COMMAND_TEMPLATE_RESTART, engine, id);

/**
 * Stop a container.
 *
 * @param {string} engine - either "docker" or "podman"
 * @param {string} id - the container ID
 * @return {Promise} resolves if the container is started, or fails if an error occur
 */
export const stopContainer = (engine, id) =>
    _runCommandFromTemplate(COMMAND_TEMPLATE_STOP, engine, id);

/**
 * Remove a container.
 *
 * @param {string} engine - either "docker" or "podman"
 * @param {string} id - the container ID
 * @return {Promise} resolves if the container is removed, or fails if an error occur
 */
export const removeContainer = (engine, id) =>
    _runCommandFromTemplate(COMMAND_TEMPLATE_REMOVE, engine, id);

const _runCommandFromTemplate = async (commandTemplate, engine, id) => {
    const command = commandTemplate
        .replace(PARAM_ENGINE, engine)
        .replace(PARAM_ID, id);

    try {
        await CommandLine.executeAsync(command);
        Log.i(
            LOGTAG,
            `Action correctly executed on ${engine} container "${id}"!`,
        );
    } catch (error) {
        Log.e(
            LOGTAG,
            `Cannot execute action on ${engine} container "${id}": ${error.message}`,
        );
        throw error;
    }
};

const _parseContainer = (stdout) => {
    stdout = stdout.split(PS_COLUMNS_SEPARATOR, 4);
    return {
        id: stdout[PS_INDEX_ID].trim(),
        names: stdout[PS_INDEX_NAMES].split(PS_COLUMN_NAMES_SEPARATOR),
        isEnabled: true,
        canBeEnabled: true,
        isRunning: stdout[PS_INDEX_STATUS].indexOf(PS_STATUS_UP) > -1,
    };
};

const _sortByRunningStatus = (item1, item2) =>
    item1.isRunning === item2.isRunning ? 0 : item1.isRunning ? -1 : 1;

const _parseImage = (stdout) => {
    stdout = stdout.split(IMAGES_COLUMNS_SEPARATOR, 4);
    return {
        id: stdout[IMAGES_INDEX_ID].trim(),
        names: [
            `${stdout[IMAGES_INDEX_REPOSITORY]}:${stdout[IMAGES_INDEX_TAG]}`,
        ],
        isEnabled: false,
        canBeEnabled: false,
        isRunning: false,
    };
};
