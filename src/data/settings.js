"use strict";

const Me = imports.misc.extensionUtils.getCurrentExtension();

const Convenience = Me.imports.src.util.convenience;

const ITEMS_PRIORITY_LIST_SEPARATOR = ",";

/* exported getMaxItemsPerSection */
var getMaxItemsPerSection = () => Convenience.getSettings().get_int("max-items-per-section");

/* exported isSystemdSectionEnabled */
var isSystemdSectionEnabled = () => Convenience.getSettings().get_boolean("systemd-section-enabled");

/* exported getSystemdSectionItemsPriorityList */
var getSystemdSectionItemsPriorityList = () => mapCommaSeparatedListIntoArray(
    Convenience.getSettings().get_string("systemd-section-items-priority-list")
);

/* exported isDockerSectionEnabled */
var isDockerSectionEnabled = () => Convenience.getSettings().get_boolean("docker-section-enabled");

/* exported getDockerSectionItemsPriorityList */
var getDockerSectionItemsPriorityList = () => mapCommaSeparatedListIntoArray(
    Convenience.getSettings().get_string("docker-section-items-priority-list")
);

const mapCommaSeparatedListIntoArray = (str) => str
    .replace(/\s+/g, "")
    .split(ITEMS_PRIORITY_LIST_SEPARATOR)
    .filter(item => item !== "");
