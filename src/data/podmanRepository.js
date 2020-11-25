"use strict";

const Me = imports.misc.extensionUtils.getCurrentExtension();

const Container = Me.imports.src.data.container;

const ENGINE = "podman";

/**
 * Check whether Podman is installed.
 *
 * @return {boolean} true if Podman is installed, false otherwise
 */
/* exported isInstalled */
var isInstalled = () => Container.isInstalled(ENGINE);

/**
 * Retrieve all Podman containers.
 *
 * @return {Promise} the Podman containers as a list of { id, isRunning, names }, or fails if an error occur
 */
/* exported getContainers */
var getContainers = () => Container.getContainers(ENGINE);

/**
 * Start a Podman container.
 *
 * @param {string} id - the Podman container ID
 * @return {Promise} resolves if Podman container is started, or fails if an error occur
 */
/* exported startContainer */
var startContainer = (id) => Container.startContainer(ENGINE, id);

/**
 * Restart a Podman container.
 *
 * @param {string} id - the Podman container ID
 * @return {Promise} resolves if Podman container is restarted, or fails if an error occur
 */
/* exported restartContainer */
var restartContainer = (id) => Container.restartContainer(ENGINE, id);

/**
 * Stop a Podman container.
 *
 * @param {string} id - the Podman container ID
 * @return {Promise} resolves if Podman container is started, or fails if an error occur
 */
/* exported stopContainer */
var stopContainer = (id) => Container.stopContainer(ENGINE, id);

/**
 * Remove a Podman container.
 *
 * @param {string} id - the Podman container ID
 * @return {Promise} resolves if Podman container is removed, or fails if an error occur
 */
/* exported removeContainer */
var removeContainer = (id) => Container.removeContainer(ENGINE, id);
