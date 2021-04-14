"use strict";

const Me = imports.misc.extensionUtils.getCurrentExtension();

const Convenience = Me.imports.src.util.convenience;

const ITEMS_PRIORITY_LIST_SEPARATOR = ",";

/* exported getMaxItemsPerSection */
var getMaxItemsPerSection = () =>
    Convenience.getSettings().get_int("max-items-per-section");

/* exported isSystemdSectionEnabled */
var isSystemdSectionEnabled = () =>
    Convenience.getSettings().get_boolean("systemd-section-enabled");

/* exported shouldFilterSystemdLoadedServices */
var shouldFilterSystemdLoadedServices = () =>
    Convenience.getSettings().get_boolean(
        "systemd-section-filter-loaded-services"
    );

/* exported shouldFilterSystemdUserServices */
var shouldFilterSystemdUserServices = () =>
    Convenience.getSettings().get_boolean(
        "systemd-section-filter-user-services"
    );

/* exported shouldFilterSystemdServicesByPriorityList */
var shouldFilterSystemdServicesByPriorityList = () =>
    Convenience.getSettings().get_boolean(
        "systemd-section-filter-priority-list"
    );

/* exported getSystemdSectionItemsPriorityList */
var getSystemdSectionItemsPriorityList = () =>
    mapCommaSeparatedListIntoArray(
        Convenience.getSettings().get_string(
            "systemd-section-items-priority-list"
        )
    );

/* exported isCronSectionEnabled */
var isCronSectionEnabled = () =>
    Convenience.getSettings().get_boolean("cron-section-enabled");

/* exported isDockerSectionEnabled */
var isDockerSectionEnabled = () =>
    Convenience.getSettings().get_boolean("docker-section-enabled");

/* exported isPodmanSectionEnabled */
var isPodmanSectionEnabled = () =>
    Convenience.getSettings().get_boolean("podman-section-enabled");

var mapCommaSeparatedListIntoArray = (str) =>
    str
        .replace(/\s+/g, "")
        .split(ITEMS_PRIORITY_LIST_SEPARATOR)
        .filter((item) => item !== "");
