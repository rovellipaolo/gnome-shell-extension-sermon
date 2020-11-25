"use strict";

const Me = imports.misc.extensionUtils.getCurrentExtension();

const Container = Me.imports.src.data.container;

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
var getContainers = () => Container.getContainers(ENGINE);

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
