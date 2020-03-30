"use strict";

const Me = imports.misc.extensionUtils.getCurrentExtension();

const Settings = Me.imports.src.data.settings;
const CronRepository = Me.imports.src.data.cronRepository;
const DockerRepository = Me.imports.src.data.dockerRepository;
const SystemdRepository = Me.imports.src.data.systemdRepository;
const IconFactory = Me.imports.src.presentation.iconFactory;
const Log = Me.imports.src.util.log;

const LOGTAG = "Factory";

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

    return IconFactory.build(path, size, style);
};

/**
 * @param {string} section - one of the available SectionType
 * @return {Function} the items retrieval action
 */
/* exported buildGetItemsAction */
var buildGetItemsAction = (section) => {
    let action = "";
    switch(section) {
        case SectionType.SYSTEMD:
            action = () => SystemdRepository.getServices();
            break;
        case SectionType.CRON:
            action = () => CronRepository.getJobs();
            break;
        case SectionType.DOCKER:
            action = () => DockerRepository.getContainers();
            break;
        default:
            Log.e(LOGTAG, `Unknown section: ${section}`);
            break;
    }
    return action;
};

/**
 * @param {string} section - one of the available SectionType
 * @param {string} item - one of the items
 * @return {string} the item label
 */
/* exported buildItemLabel */
var buildItemLabel = (section, item) => {
    let label = "";
    switch(section) {
        case SectionType.SYSTEMD:
            label = item.name;
            break;
        case SectionType.CRON:
            label = item.id;
            break;
        case SectionType.DOCKER:
            label = item.names.length > 0 ?
                `${item.names[0]} (${item.id})` :
                `- (${item.id})`;
            break;
        default:
            Log.e(LOGTAG, `Unknown section: ${section}`);
            break;
    }
    return label;
};

/**
 * @param {string} section - one of the available SectionType
 * @param {string} item - one of the items
 * @return {Function} the item action
 */
/* exported buildItemAction */
var buildItemAction = (section, item) => {
    let action = "";
    switch(section) {
        case SectionType.SYSTEMD:
            action = item.isRunning ?
                (actor, _) => SystemdRepository.stopService(actor) :
                (actor, _) => SystemdRepository.startService(actor);
            break;
        case SectionType.CRON:
            action = null;
            break;
        case SectionType.DOCKER:
            action = item.isRunning ?
                (actor, _) => DockerRepository.stopContainer(actor) :
                (actor, _) => DockerRepository.startContainer(actor);
            break;
        default:
            Log.e(LOGTAG, `Unknown section: ${section}`);
            break;
    }
    return action;
};
