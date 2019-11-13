"use strict";

const Me = imports.misc.extensionUtils.getCurrentExtension();

const Convenience = Me.imports.src.util.convenience;

const ITEMS_PRIORITY_LIST_SEPARATOR = ",";

/* exported isDarkThemeEnabled */
var isDarkThemeEnabled = () => Convenience.getSettings().get_boolean("dark-theme-enabled");

/* exported getMaxItemsPerSection */
var getMaxItemsPerSection = () => Convenience.getSettings().get_int("max-items-per-section");

/* exported isSystemdSectionEnabled */
var isSystemdSectionEnabled = () => Convenience.getSettings().get_boolean("systemd-section-enabled");

/* exported shouldFilterSystemdUserServices */
var shouldFilterSystemdUserServices = () => Convenience.getSettings().get_boolean("systemd-section-filter-user-services");

/* exported getSystemdSectionItemsPriorityList */
var getSystemdSectionItemsPriorityList = () => mapCommaSeparatedListIntoArray(
    Convenience.getSettings().get_string("systemd-section-items-priority-list")
);

/* exported isCronSectionEnabled */
var isCronSectionEnabled = () => Convenience.getSettings().get_boolean("cron-section-enabled");

/* exported isDockerSectionEnabled */
var isDockerSectionEnabled = () => Convenience.getSettings().get_boolean("docker-section-enabled");

const mapCommaSeparatedListIntoArray = (str) => str
    .replace(/\s+/g, "")
    .split(ITEMS_PRIORITY_LIST_SEPARATOR)
    .filter(item => item !== "");
