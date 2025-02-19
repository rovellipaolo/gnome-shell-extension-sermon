import * as CronRepository from "../data/cronRepository.js";
import * as DockerRepository from "../data/dockerRepository.js";
import * as PodmanRepository from "../data/podmanRepository.js";
import * as SystemdRepository from "../data/systemdRepository.js";
import * as IconFactory from "./iconFactory.js";
import * as Log from "../util/log.js";
import Settings from "../data/settings.js";

const LOGTAG = "Factory";

const SIZE_TINY = "12";
const SIZE_SMALL = "16";
const SIZE_BIG = "24";

export const SectionType = {
    SYSTEMD: "Systemd",
    CRON: "Cron",
    DOCKER: "Docker",
    PODMAN: "Podman",
};

export const IconType = {
    STATUS_AREA: "status_area",
    SECTION_TITLE: "section_title",
};

export const ActionType = {
    ADD: "add",
    START: "start",
    STOP: "stop",
    RESTART: "restart",
    REMOVE: "remove",
};

/**
 * @return {string[]} - a list of the active/enabled SectionType
 */
export const buildActiveSections = () => {
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
export const buildIcon = (section, type, isFirst, isLast) => {
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
            path = "images/systemd_icon.svg";
            break;
        case SectionType.CRON:
            path = "images/cron_icon.svg";
            break;
        case SectionType.DOCKER:
            path = "images/docker_icon.svg";
            break;
        case SectionType.PODMAN:
            path = "images/podman_icon.svg";
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
export const buildGetItemsAction = (section) => {
    switch (section) {
        case SectionType.SYSTEMD:
            return async () => {
                const systemServices =
                    Settings.shouldShowSystemdSystemServices()
                        ? await SystemdRepository.getServices(false)
                        : [];
                const userServices = Settings.shouldShowSystemdUserServices()
                    ? await SystemdRepository.getServices(true)
                    : [];
                const services = [...systemServices, ...userServices];
                return systemServices.length > 0 && userServices.length > 0
                    ? SystemdRepository.filterServices(services)
                    : services;
            };
        case SectionType.CRON:
            return () => CronRepository.getJobs();
        case SectionType.DOCKER:
            return async () => {
                const isDockerRunning =
                    await SystemdRepository.isServiceRunning(
                        "docker.service",
                        false,
                    );
                const isDockerRunningAsUser =
                    await SystemdRepository.isServiceRunning(
                        "docker.service",
                        true,
                    );
                const isDockerDesktopRunning =
                    await SystemdRepository.isServiceRunning(
                        "docker-desktop.service",
                        false,
                    );
                const isDockerDesktopRunningAsUser =
                    await SystemdRepository.isServiceRunning(
                        "docker-desktop.service",
                        true,
                    );
                if (
                    isDockerRunning ||
                    isDockerRunningAsUser ||
                    isDockerDesktopRunning ||
                    isDockerDesktopRunningAsUser
                ) {
                    return DockerRepository.getContainers();
                } else {
                    throw new Error("Docker is not running!");
                }
            };
        case SectionType.PODMAN:
            return async () => {
                const isPodmanRunning =
                    await SystemdRepository.isServiceRunning(
                        "podman.service",
                        false,
                    );
                const isPodmanRunningAsUser =
                    await SystemdRepository.isServiceRunning(
                        "podman.service",
                        true,
                    );
                if (isPodmanRunning || isPodmanRunningAsUser) {
                    return PodmanRepository.getContainers();
                } else {
                    throw new Error("Podman is not running!");
                }
            };
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
export const buildItemLabel = (section, item) => {
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
export const buildItemActionTypes = (
    isEnabled,
    isRunning,
    canBeEnabled = false,
) => {
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
export const buildItemActionIcon = (action) => {
    let name = "";
    switch (action) {
        case ActionType.ADD:
            name = "list-add-symbolic";
            break;
        case ActionType.START:
            name = "media-playback-start-symbolic";
            break;
        case ActionType.STOP:
            name = "media-playback-pause-symbolic";
            break;
        case ActionType.RESTART:
            name = "view-refresh-symbolic";
            break;
        case ActionType.REMOVE:
            name = "edit-delete-symbolic";
            break;
        default:
            Log.e(LOGTAG, `Unknown action: ${action}`);
            break;
    }
    return IconFactory.buildFromName(name, SIZE_TINY);
};

/**
 * @param {string} section - one of the available SectionType
 * @param {string} action - one of the available ActionType
 * @param {boolean} isUser - whether the item is user-related or not
 * @return {Function} the item action
 */
export const buildItemAction = (section, action, isUser = false) => {
    switch (section) {
        case SectionType.SYSTEMD:
            return _buildSystemdItemAction(action, isUser);
        case SectionType.CRON:
            Log.e(LOGTAG, `Unknown action: ${action}`);
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

const _buildSystemdItemAction = (action, isUser = false) => {
    switch (action) {
        case ActionType.ADD:
            return (actor, _) => SystemdRepository.enableService(actor, isUser);
        case ActionType.START:
            return (actor, _) => SystemdRepository.startService(actor, isUser);
        case ActionType.STOP:
            return (actor, _) => SystemdRepository.stopService(actor, isUser);
        case ActionType.RESTART:
            return (actor, _) =>
                SystemdRepository.restartService(actor, isUser);
        case ActionType.REMOVE:
            return (actor, _) =>
                SystemdRepository.disableService(actor, isUser);
        default:
            Log.e(LOGTAG, `Unknown action: ${action}`);
            return null;
    }
};

const _buildDockerItemAction = (action) => {
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

const _buildPodmanItemAction = (action) => {
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
