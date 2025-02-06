import * as Log from "../util/log.js";

const LOGTAG = "Settings";

export default class Settings {
    constructor(extension) {
        if (Settings._singleton) {
            Log.w(LOGTAG, "Settings singleton has been already initialized!");
        } else {
            Settings._singleton = extension.getSettings();
        }
    }

    static getInstance() {
        return Settings._singleton;
    }

    static getSchemaOf(key) {
        return Settings.getInstance().settings_schema.get_key(key);
    }

    // Generic:

    static getMaxItemsPerSection() {
        return Settings.getInstance().get_int("max-items-per-section");
    }

    static bindMaxItemsPerSection(field, flags) {
        return Settings.getInstance().bind(
            "max-items-per-section",
            field,
            "value",
            flags,
        );
    }

    static describeMaxItemsPerSection() {
        return Settings.getSchemaOf("max-items-per-section");
    }

    // Systemd:

    static isSystemdSectionEnabled() {
        return Settings.getInstance().get_boolean("systemd-section-enabled");
    }

    static bindSystemdSectionEnabled(field, flags) {
        return Settings.getInstance().bind(
            "systemd-section-enabled",
            field,
            "active",
            flags,
        );
    }

    static describeSystemdSectionEnabled() {
        return Settings.getSchemaOf("systemd-section-enabled");
    }

    static shouldShowOnlySystemdLoadedServices() {
        return Settings.getInstance().get_boolean(
            "systemd-section-filter-loaded-services",
        );
    }

    static bindShowOnlySystemdLoadedServices(field, flags) {
        return Settings.getInstance().bind(
            "systemd-section-filter-loaded-services",
            field,
            "active",
            flags,
        );
    }

    static describeShowOnlySystemdLoadedServices() {
        return Settings.getSchemaOf("systemd-section-filter-loaded-services");
    }

    static shouldShowSystemdSystemServices() {
        return Settings.getInstance().get_boolean(
            "systemd-section-filter-system-services",
        );
    }

    static bindShowSystemdSystemServices(field, flags) {
        return Settings.getInstance().bind(
            "systemd-section-filter-system-services",
            field,
            "active",
            flags,
        );
    }

    static describeShowSystemdSystemServices() {
        return Settings.getSchemaOf("systemd-section-filter-system-services");
    }

    static shouldShowSystemdUserServices() {
        return Settings.getInstance().get_boolean(
            "systemd-section-filter-user-services",
        );
    }

    static bindShowSystemdUserServices(field, flags) {
        return Settings.getInstance().bind(
            "systemd-section-filter-user-services",
            field,
            "active",
            flags,
        );
    }

    static describeShowSystemdUserServices() {
        return Settings.getSchemaOf("systemd-section-filter-user-services");
    }

    static shouldFilterSystemdServicesByPriorityList() {
        return Settings.getInstance().get_boolean(
            "systemd-section-filter-priority-list",
        );
    }

    static bindFilterSystemdServicesByPriorityList(field, flags) {
        return Settings.getInstance().bind(
            "systemd-section-filter-priority-list",
            field,
            "active",
            flags,
        );
    }

    static describeFilterSystemdServicesByPriorityList() {
        return Settings.getSchemaOf("systemd-section-filter-priority-list");
    }

    static getSystemdServicesPriorityList() {
        return Settings.getInstance()
            .get_string("systemd-section-items-priority-list")
            .replace(/\s+/g, "")
            .split(",")
            .filter((item) => item !== "");
    }

    static bindSystemdServicesPriorityList(field, flags) {
        return Settings.getInstance().bind(
            "systemd-section-items-priority-list",
            field,
            "text",
            flags,
        );
    }

    static describeSystemdServicesPriorityList() {
        return Settings.getSchemaOf("systemd-section-items-priority-list");
    }

    // Cron:

    static isCronSectionEnabled() {
        return Settings.getInstance().get_boolean("cron-section-enabled");
    }

    static bindCronSectionEnabled(field, flags) {
        return Settings.getInstance().bind(
            "cron-section-enabled",
            field,
            "active",
            flags,
        );
    }

    static describeCronSectionEnabled() {
        return Settings.getSchemaOf("cron-section-enabled");
    }

    // Docker:

    static isDockerSectionEnabled() {
        return Settings.getInstance().get_boolean("docker-section-enabled");
    }

    static bindDockerSectionEnabled(field, flags) {
        return Settings.getInstance().bind(
            "docker-section-enabled",
            field,
            "active",
            flags,
        );
    }

    static describeDockerSectionEnabled() {
        return Settings.getSchemaOf("docker-section-enabled");
    }

    static shouldShowDockerImages() {
        return Settings.getInstance().get_boolean("docker-section-show-images");
    }

    static bindShowDockerImages(field, flags) {
        return Settings.getInstance().bind(
            "docker-section-show-images",
            field,
            "active",
            flags,
        );
    }

    static describeShowDockerImages() {
        return Settings.getSchemaOf("docker-section-show-images");
    }

    // Podman:

    static isPodmanSectionEnabled() {
        return Settings.getInstance().get_boolean("podman-section-enabled");
    }

    static bindPodmanSectionEnabled(field, flags) {
        return Settings.getInstance().bind(
            "podman-section-enabled",
            field,
            "active",
            flags,
        );
    }

    static describePodmanSectionEnabled() {
        return Settings.getSchemaOf("podman-section-enabled");
    }

    static shouldShowPodmanImages() {
        return Settings.getInstance().get_boolean("podman-section-show-images");
    }

    static bindShowPodmanImages(field, flags) {
        return Settings.getInstance().bind(
            "podman-section-show-images",
            field,
            "active",
            flags,
        );
    }

    static describeShowPodmanImages() {
        return Settings.getSchemaOf("podman-section-show-images");
    }

    destroy() {
        Settings._singleton = null;
    }
}
