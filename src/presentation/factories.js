"use strict";

const Me = imports.misc.extensionUtils.getCurrentExtension();

const Settings = Me.imports.src.data.settings;
const CronRepository = Me.imports.src.data.cronRepository;
const DockerRepository = Me.imports.src.data.dockerRepository;
const SystemdRepository = Me.imports.src.data.systemdRepository;
const IconFactory = Me.imports.src.presentation.iconFactory;
const Log = Me.imports.src.util.log;

const LOGTAG = "Factory";

const SIZE_TINY = "14";
const SIZE_SMALL = "16";
const SIZE_BIG = "24";

/* exported SectionType */
var SectionType = {
    SYSTEMD: "Systemd",
    CRON: "Cron",
    DOCKER: "Docker"
};

/* exported IconType */
var IconType = {
    STATUS_AREA: "status_area",
    SECTION_TITLE: "section_title"
};

/* exported ActionType */
var ActionType = {
    START: "start",
    STOP: "stop",
    RESTART: "restart",
    REMOVE: "remove"
};

/**
 * @return {string[]} - a list of the active/enabled SectionType
 */
/* exported buildActiveSections */
var buildActiveSections = () => {
    let sections = [];
    if (Settings.isSystemdSectionEnabled()) {
        sections.push(SectionType.SYSTEMD);
    }
    if (Settings.isCronSectionEnabled()) {
        sections.push(SectionType.CRON);
    }
    if (Settings.isDockerSectionEnabled()) {
        sections.push(SectionType.DOCKER);
    }
    return sections;
};

/**
 * @param {string} section - one of the available SectionType
 * @param {string} type - one of the available IconType
 * @param {boolean} isFirst
 * @param {boolean} isLast
 * @return {St.Icon} the icon
 */
/* exported buildIcon */
var buildIcon = (section, type, isFirst, isLast) => {
    let size = "";
    let style = "";
    switch(type) {
        case IconType.STATUS_AREA:
            size = SIZE_SMALL;
            if (isFirst && !isLast) {
                style = "sermon-status-area-icon-first";
            } else if (!isFirst && isLast) {
                style = "sermon-status-area-icon-last";
            } else  if (!isFirst && !isLast) {
                style = "sermon-status-area-icon-middle";
            }
            break;
        case IconType.SECTION_TITLE:
            size = SIZE_BIG;
            break;
        default:
            Log.e(LOGTAG, `Unknown icon type: ${type}`);
            break;
    }

    let path = "";
    switch(section) {
        case SectionType.SYSTEMD:
            path = `${Me.path}/images/systemd_icon.svg`;
            break;
        case SectionType.CRON:
            path = `${Me.path}/images/cron_icon.svg`;
            break;
        case SectionType.DOCKER:
            path = `${Me.path}/images/docker_icon.svg`;
            break;
        default:
            Log.e(LOGTAG, `Unknown section: ${section}`);
            break;
    }

    return IconFactory.buildFromPath(path, size, style);
};

/**
 * @param {string} section - one of the available SectionType
 * @return {Promise} the version
 */
/* exported buildVersion */
var buildVersion = (section) => {
    switch(section) {
        case SectionType.SYSTEMD:
            return SystemdRepository.getVersion();
        case SectionType.CRON:
            return new Promise((resolve, _) => { resolve("") });
        case SectionType.DOCKER:
            return DockerRepository.getVersion();
        default:
            return new Promise((_, reject) => { reject(`Unknown section: ${section}`) });
    }
};

/**
 * @param {string} section - one of the available SectionType
 * @return {Function} the items retrieval action
 */
/* exported buildGetItemsAction */
var buildGetItemsAction = (section) => {
    switch(section) {
        case SectionType.SYSTEMD:
            return () => SystemdRepository.getServices();
        case SectionType.CRON:
            return () => CronRepository.getJobs();
        case SectionType.DOCKER:
            return () => DockerRepository.getContainers();
        default:
            Log.e(LOGTAG, `Unknown section: ${section}`);
            return () => {};
    }
};

/**
 * @param {string} section - one of the available SectionType
 * @param {string} item - one of the items
 * @return {string} the item label
 */
/* exported buildItemLabel */
var buildItemLabel = (section, item) => {
    switch(section) {
        case SectionType.SYSTEMD:
            return item.name;
        case SectionType.CRON:
            return item.id;
        case SectionType.DOCKER:
            return item.names.length > 0 ?
                `${item.names[0]} (${item.id})` :
                `- (${item.id})`;
        default:
            Log.e(LOGTAG, `Unknown section: ${section}`);
            return "";
    }
};

/**
 * @param {boolean} isRunning - whether the item is running or not
 * @return {string[]} the list of item action types
 */
/* exported buildItemActionTypes */
var buildItemActionTypes = (isRunning) => {
    if (isRunning) {
        return [ActionType.STOP, ActionType.RESTART];
    } else {
        return [ActionType.START, ActionType.REMOVE];
    }
};

/**
 * @param {string} action - one of the available ActionType
 * @return {Function} the item action icon
 */
/* exported buildItemActionIcon */
var buildItemActionIcon = (action) => {
    let iconName = "";
    switch(action) {
        case ActionType.START:
            iconName =  "media-playback-start-symbolic";
            break;
        case ActionType.STOP:
            iconName =  "media-playback-pause-symbolic";
            break;
        case ActionType.RESTART:
            iconName =  "view-refresh-symbolic";
            break;
        case ActionType.REMOVE:
            iconName =  "edit-delete-symbolic";
            break;
        default:
            Log.e(LOGTAG, `Unknown action: ${action}`);
            break;
    }
    return IconFactory.buildFromName(iconName, SIZE_TINY);
};

/**
 * @param {string} section - one of the available SectionType
 * @param {string} action - one of the available ActionType
 * @return {Function} the item action
 */
/* exported buildItemAction */
var buildItemAction = (section, action) => {
    switch(section) {
        case SectionType.SYSTEMD:
            return _buildSystemdItemAction(action);
        case SectionType.CRON:
            return null;
        case SectionType.DOCKER:
            return _buildDockerItemAction(action);
        default:
            Log.e(LOGTAG, `Unknown section: ${section}`);
            return null;
    }
};

var _buildSystemdItemAction = (action) => {
    switch(action) {
        case ActionType.START:
            return (actor, _) => SystemdRepository.startService(actor);
        case ActionType.STOP:
            return (actor, _) => SystemdRepository.stopService(actor);
        case ActionType.RESTART:
            return (actor, _) => SystemdRepository.restartService(actor);
        case ActionType.REMOVE:
            return null;
        default:
            Log.e(LOGTAG, `Unknown action: ${action}`);
            return null;
    }
};

var _buildDockerItemAction = (action) => {
    switch(action) {
        case ActionType.START:
            return (actor, _) => DockerRepository.startContainer(actor);
        case ActionType.STOP:
            return (actor, _) => DockerRepository.stopContainer(actor);
        case ActionType.RESTART:
            return (actor, _) => DockerRepository.restartContainer(actor);
        case ActionType.REMOVE:
            return (actor, _) => DockerRepository.removeContainer(actor);
        default:
            Log.e(LOGTAG, `Unknown action: ${action}`);
            return null;
    }
};
