"use strict";

const GSettings = imports.misc.extensionUtils.getSettings();

const ITEMS_PRIORITY_LIST_SEPARATOR = ",";

/* exported getMaxItemsPerSection */
var getMaxItemsPerSection = () => GSettings.get_int("max-items-per-section");

/* exported bindMaxItemsPerSection */
var bindMaxItemsPerSection = (field, flags) =>
    GSettings.bind("max-items-per-section", field, "value", flags);

/* exported isSystemdSectionEnabled */
var isSystemdSectionEnabled = () =>
    GSettings.get_boolean("systemd-section-enabled");

/* exported bindSystemdSectionEnabled */
var bindSystemdSectionEnabled = (field, flags) =>
    GSettings.bind("systemd-section-enabled", field, "active", flags);

/* exported shouldFilterSystemdLoadedServices */
var shouldFilterSystemdLoadedServices = () =>
    GSettings.get_boolean("systemd-section-filter-loaded-services");

/* exported bindFilterSystemdLoadedServices */
var bindFilterSystemdLoadedServices = (field, flags) =>
    GSettings.bind(
        "systemd-section-filter-loaded-services",
        field,
        "active",
        flags
    );

/* exported shouldFilterSystemdUserServices */
var shouldFilterSystemdUserServices = () =>
    GSettings.get_boolean("systemd-section-filter-user-services");

/* exported bindFilterSystemdUserServices */
var bindFilterSystemdUserServices = (field, flags) =>
    GSettings.bind(
        "systemd-section-filter-user-services",
        field,
        "active",
        flags
    );

/* exported shouldFilterSystemdServicesByPriorityList */
var shouldFilterSystemdServicesByPriorityList = () =>
    GSettings.get_boolean("systemd-section-filter-priority-list");

/* exported bindFilterSystemdServicesByPriorityList */
var bindFilterSystemdServicesByPriorityList = (field, flags) =>
    GSettings.bind(
        "systemd-section-filter-priority-list",
        field,
        "active",
        flags
    );

/* exported getSystemdSectionItemsPriorityList */
var getSystemdSectionItemsPriorityList = () =>
    mapCommaSeparatedListIntoArray(
        GSettings.get_string("systemd-section-items-priority-list")
    );

/* exported bindSystemdSectionItemsPriorityList */
var bindSystemdSectionItemsPriorityList = (field, flags) =>
    GSettings.bind("systemd-section-items-priority-list", field, "text", flags);

/* exported isCronSectionEnabled */
var isCronSectionEnabled = () => GSettings.get_boolean("cron-section-enabled");

/* exported bindCronSectionEnabled */
var bindCronSectionEnabled = (field, flags) =>
    GSettings.bind("cron-section-enabled", field, "active", flags);

/* exported isDockerSectionEnabled */
var isDockerSectionEnabled = () =>
    GSettings.get_boolean("docker-section-enabled");

/* exported bindDockerSectionEnabled */
var bindDockerSectionEnabled = (field, flags) =>
    GSettings.bind("docker-section-enabled", field, "active", flags);

/* exported isPodmanSectionEnabled */
var isPodmanSectionEnabled = () =>
    GSettings.get_boolean("podman-section-enabled");

/* exported bindPodmanSectionEnabled */
var bindPodmanSectionEnabled = (field, flags) =>
    GSettings.bind("podman-section-enabled", field, "active", flags);

var mapCommaSeparatedListIntoArray = (str) =>
    str
        .replace(/\s+/g, "")
        .split(ITEMS_PRIORITY_LIST_SEPARATOR)
        .filter((item) => item !== "");
