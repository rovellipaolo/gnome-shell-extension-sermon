"use strict";

const Me = imports.misc.extensionUtils.getCurrentExtension();

const Settings = Me.imports.src.data.settings;
const CronRepository = Me.imports.src.data.cronRepository;
const DockerRepository = Me.imports.src.data.dockerRepository;
const PodmanRepository = Me.imports.src.data.podmanRepository;
const SystemdRepository = Me.imports.src.data.systemdRepository;
const IconFactory = Me.imports.src.presentation.iconFactory;
const Log = Me.imports.src.util.log;

const LOGTAG = "Factory";

const SIZE_TINY = "12";
const SIZE_SMALL = "16";
const SIZE_BIG = "24";

/* exported SectionType */
var SectionType = {
    SYSTEMD: "Systemd",
    CRON: "Cron",
    DOCKER: "Docker",
    PODMAN: "Podman",
};

/* exported IconType */
var IconType = {
    STATUS_AREA: "status_area",
    SECTION_TITLE: "section_title",
};

/* exported ActionType */
var ActionType = {
    ADD: "add",
    START: "start",
    STOP: "stop",
    RESTART: "restart",
    REMOVE: "remove",
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
    if (Settings.isPodmanSectionEnabled()) {
        sections.push(SectionType.PODMAN);
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
    switch (type) {
        case IconType.STATUS_AREA:
            size = SIZE_SMALL;
            if (isFirst && !isLast) {
                style = "sermon-status-area-icon-first";
            } else if (!isFirst && isLast) {
                style = "sermon-status-area-icon-last";
            } else if (!isFirst && !isLast) {
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
    switch (section) {
        case SectionType.SYSTEMD:
            path = `${Me.path}/images/systemd_icon.svg`;
            break;
        case SectionType.CRON:
            path = `${Me.path}/images/cron_icon.svg`;
            break;
        case SectionType.DOCKER:
            path = `${Me.path}/images/docker_icon.svg`;
            break;
        case SectionType.PODMAN:
            path = `${Me.path}/images/podman_icon.svg`;
            break;
        default:
            Log.e(LOGTAG, `Unknown section: ${section}`);
            break;
    }

    return IconFactory.buildFromPath(path, size, style);
};

/**
 * @param {string} section - one of the available SectionType
 * @return {Function} the items retrieval action
 */
/* exported buildGetItemsAction */
var buildGetItemsAction = (section) => {
    switch (section) {
        case SectionType.SYSTEMD:
            return () => SystemdRepository.getServices();
        case SectionType.CRON:
            return () => CronRepository.getJobs();
        case SectionType.DOCKER:
            return () => DockerRepository.getContainers();
        case SectionType.PODMAN:
            return () => PodmanRepository.getContainers();
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
    switch (section) {
        case SectionType.SYSTEMD:
            return item.name;
        case SectionType.CRON:
            return item.id;
        case SectionType.DOCKER:
        case SectionType.PODMAN:
            return item.names.length > 0
                ? `${item.names[0]} (${item.id})`
                : `- (${item.id})`;
        default:
            Log.e(LOGTAG, `Unknown section: ${section}`);
            return "";
    }
};

/**
 * @param {boolean} isEnabled - whether the item is enabled or not
 * @param {boolean} isRunning - whether the item is running or not
 * @param {boolean} canBeEnabled - whether the item can be enabled or not
 * @return {string[]} the list of item action types
 */
/* exported buildItemActionTypes */
var buildItemActionTypes = (isEnabled, isRunning, canBeEnabled = false) => {
    if (isEnabled && isRunning) {
        return [ActionType.STOP, ActionType.RESTART];
    } else if (isEnabled && canBeEnabled) {
        return [ActionType.START, ActionType.REMOVE];
    } else if (isEnabled) {
        return [ActionType.START];
    } else if (canBeEnabled) {
        return [ActionType.ADD];
    }
    return [];
};

/**
 * @param {string} action - one of the available ActionType
 * @return {Function} the item action icon
 */
/* exported buildItemActionIcon */
var buildItemActionIcon = (action) => {
    let iconName = "";
    switch (action) {
        case ActionType.ADD:
            iconName = "list-add-symbolic";
            break;
        case ActionType.START:
            iconName = "media-playback-start-symbolic";
            break;
        case ActionType.STOP:
            iconName = "media-playback-pause-symbolic";
            break;
        case ActionType.RESTART:
            iconName = "view-refresh-symbolic";
            break;
        case ActionType.REMOVE:
            iconName = "edit-delete-symbolic";
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
    switch (section) {
        case SectionType.SYSTEMD:
            return _buildSystemdItemAction(action);
        case SectionType.CRON:
            return null;
        case SectionType.DOCKER:
            return _buildDockerItemAction(action);
        case SectionType.PODMAN:
            return _buildPodmanItemAction(action);
        default:
            Log.e(LOGTAG, `Unknown section: ${section}`);
            return null;
    }
};

var _buildSystemdItemAction = (action) => {
    switch (action) {
        case ActionType.ADD:
            return (actor, _) => SystemdRepository.enableService(actor);
        case ActionType.START:
            return (actor, _) => SystemdRepository.startService(actor);
        case ActionType.STOP:
            return (actor, _) => SystemdRepository.stopService(actor);
        case ActionType.RESTART:
            return (actor, _) => SystemdRepository.restartService(actor);
        case ActionType.REMOVE:
            return (actor, _) => SystemdRepository.disableService(actor);
        default:
            Log.e(LOGTAG, `Unknown action: ${action}`);
            return null;
    }
};

var _buildDockerItemAction = (action) => {
    switch (action) {
        case ActionType.ADD:
            return null;
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

var _buildPodmanItemAction = (action) => {
    switch (action) {
        case ActionType.ADD:
            return null;
        case ActionType.START:
            return (actor, _) => PodmanRepository.startContainer(actor);
        case ActionType.STOP:
            return (actor, _) => PodmanRepository.stopContainer(actor);
        case ActionType.RESTART:
            return (actor, _) => PodmanRepository.restartContainer(actor);
        case ActionType.REMOVE:
            return (actor, _) => PodmanRepository.removeContainer(actor);
        default:
            Log.e(LOGTAG, `Unknown action: ${action}`);
            return null;
    }
};
