"use strict";

const Me = imports.misc.extensionUtils.getCurrentExtension();

const Container = Me.imports.src.data.container;
const Settings = Me.imports.src.data.settings;
const Log = Me.imports.src.util.log;

const LOGTAG = "DockerRepository";
const ENGINE = "docker";

/**
 * Check whether Docker is installed.
 *
 * @return {boolean} true if Docker is installed, false otherwise
 */
/* exported isInstalled */
var isInstalled = () => Container.isInstalled(ENGINE);

/**
 * Retrieve all Docker containers.
 *
 * @return {Promise} the Docker containers as a list of { id, isRunning, names }, or fails if an error occur
 */
/* exported getContainers */
var getContainers = async () => {
    var containers = [];
    try {
        containers = await Container.getContainers(ENGINE);
    } catch (error) {
        Log.w(LOGTAG, `Cannot retrieve ${ENGINE} containers: ${error.message}`);
    }
    if (Settings.shouldShowDockerImages()) {
        try {
            const images = await Container.getImages(ENGINE);
            containers = containers.concat(images);
        } catch (error) {
            Log.w(LOGTAG, `Cannot retrieve ${ENGINE} images: ${error.message}`);
        }
    }
    if (containers.length === 0) {
        throw new Error("No container detected!");
    }
    return containers;
};

/**
 * Start a Docker container.
 *
 * @param {string} id - the Docker container ID
 * @return {Promise} resolves if Docker container is started, or fails if an error occur
 */
/* exported startContainer */
var startContainer = (id) => Container.startContainer(ENGINE, id);

/**
 * Restart a Docker container.
 *
 * @param {string} id - the Docker container ID
 * @return {Promise} resolves if Docker container is restarted, or fails if an error occur
 */
/* exported restartContainer */
var restartContainer = (id) => Container.restartContainer(ENGINE, id);

/**
 * Stop a Docker container.
 *
 * @param {string} id - the Docker container ID
 * @return {Promise} resolves if Docker container is started, or fails if an error occur
 */
/* exported stopContainer */
var stopContainer = (id) => Container.stopContainer(ENGINE, id);

/**
 * Remove a Docker container.
 *
 * @param {string} id - the Docker container ID
 * @return {Promise} resolves if Docker container is removed, or fails if an error occur
 */
/* exported removeContainer */
var removeContainer = (id) => Container.removeContainer(ENGINE, id);
