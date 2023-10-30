"use strict";

const ExtensionUtils = imports.misc.extensionUtils;

const ITEMS_PRIORITY_LIST_SEPARATOR = ",";

/* exported getMaxItemsPerSection */
var getMaxItemsPerSection = () =>
    ExtensionUtils.getSettings().get_int("max-items-per-section");

/* exported bindMaxItemsPerSection */
var bindMaxItemsPerSection = (field, flags) =>
    ExtensionUtils.getSettings().bind(
        "max-items-per-section",
        field,
        "value",
        flags,
    );

/* exported isSystemdSectionEnabled */
var isSystemdSectionEnabled = () =>
    ExtensionUtils.getSettings().get_boolean("systemd-section-enabled");

/* exported bindSystemdSectionEnabled */
var bindSystemdSectionEnabled = (field, flags) =>
    ExtensionUtils.getSettings().bind(
        "systemd-section-enabled",
        field,
        "active",
        flags,
    );

/* exported shouldShowOnlySystemdLoadedServices */
var shouldShowOnlySystemdLoadedServices = () =>
    ExtensionUtils.getSettings().get_boolean(
        "systemd-section-filter-loaded-services",
    );

/* exported bindShowOnlySystemdLoadedServices */
var bindShowOnlySystemdLoadedServices = (field, flags) =>
    ExtensionUtils.getSettings().bind(
        "systemd-section-filter-loaded-services",
        field,
        "active",
        flags,
    );

/* exported shouldShowSystemdUserServices */
var shouldShowSystemdUserServices = () =>
    ExtensionUtils.getSettings().get_boolean(
        "systemd-section-filter-user-services",
    );

/* exported bindShowSystemdUserServices */
var bindShowSystemdUserServices = (field, flags) =>
    ExtensionUtils.getSettings().bind(
        "systemd-section-filter-user-services",
        field,
        "active",
        flags,
    );

/* exported shouldFilterSystemdServicesByPriorityList */
var shouldFilterSystemdServicesByPriorityList = () =>
    ExtensionUtils.getSettings().get_boolean(
        "systemd-section-filter-priority-list",
    );

/* exported bindFilterSystemdServicesByPriorityList */
var bindFilterSystemdServicesByPriorityList = (field, flags) =>
    ExtensionUtils.getSettings().bind(
        "systemd-section-filter-priority-list",
        field,
        "active",
        flags,
    );

/* exported getSystemdSectionItemsPriorityList */
var getSystemdSectionItemsPriorityList = () =>
    ExtensionUtils.getSettings()
        .get_string("systemd-section-items-priority-list")
        .replace(/\s+/g, "")
        .split(ITEMS_PRIORITY_LIST_SEPARATOR)
        .filter((item) => item !== "");

/* exported bindSystemdSectionItemsPriorityList */
var bindSystemdSectionItemsPriorityList = (field, flags) =>
    ExtensionUtils.getSettings().bind(
        "systemd-section-items-priority-list",
        field,
        "text",
        flags,
    );

/* exported isCronSectionEnabled */
var isCronSectionEnabled = () =>
    ExtensionUtils.getSettings().get_boolean("cron-section-enabled");

/* exported bindCronSectionEnabled */
var bindCronSectionEnabled = (field, flags) =>
    ExtensionUtils.getSettings().bind(
        "cron-section-enabled",
        field,
        "active",
        flags,
    );

/* exported isDockerSectionEnabled */
var isDockerSectionEnabled = () =>
    ExtensionUtils.getSettings().get_boolean("docker-section-enabled");

/* exported bindDockerSectionEnabled */
var bindDockerSectionEnabled = (field, flags) =>
    ExtensionUtils.getSettings().bind(
        "docker-section-enabled",
        field,
        "active",
        flags,
    );

/* exported shouldShowDockerImages */
var shouldShowDockerImages = () =>
    ExtensionUtils.getSettings().get_boolean("docker-section-show-images");

/* exported bindShowDockerImages */
var bindShowDockerImages = (field, flags) =>
    ExtensionUtils.getSettings().bind(
        "docker-section-show-images",
        field,
        "active",
        flags,
    );

/* exported isPodmanSectionEnabled */
var isPodmanSectionEnabled = () =>
    ExtensionUtils.getSettings().get_boolean("podman-section-enabled");

/* exported bindPodmanSectionEnabled */
var bindPodmanSectionEnabled = (field, flags) =>
    ExtensionUtils.getSettings().bind(
        "podman-section-enabled",
        field,
        "active",
        flags,
    );

/* exported shouldShowPodmanImages */
var shouldShowPodmanImages = () =>
    ExtensionUtils.getSettings().get_boolean("podman-section-show-images");

/* exported bindShowPodmanImages */
var bindShowPodmanImages = (field, flags) =>
    ExtensionUtils.getSettings().bind(
        "podman-section-show-images",
        field,
        "active",
        flags,
    );
