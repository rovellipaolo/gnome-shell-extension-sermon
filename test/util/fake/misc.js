/**
 * Fake implementation of misc.
 */

"use strict";

const GjsMockito = imports.test.util.gjsMockito;
const mock = GjsMockito.mock;

/* exported GSettings */
var GSettings = mock("GSettings", [
    "bind",
    "get_boolean",
    "get_int",
    "get_string",
]);

/* exported extensionUtils */
var extensionUtils = {
    getCurrentExtension: () => {
        return Me;
    },
    getSettings: () => {
        return GSettings;
    },
};

/* exported Me */
var Me = {
    path: "",

    imports: {
        src: {
            util: {
                log: mock("Log", ["d", "i", "w", "e"]),
            },

            data: {
                commandLine: mock("CommandLine", [
                    "find",
                    "execute",
                    "executeAsync",
                    "executeAsyncWithResult",
                ]),
                container: mock("Container", [
                    "isInstalled",
                    "getContainers",
                    "startContainer",
                    "stopContainer",
                    "restartContainer",
                    "removeContainer",
                    "parseContainers",
                ]),
                cronRepository: mock("CronRepository", [
                    "isInstalled",
                    "getJobs",
                    "parseJobs",
                ]),
                dockerRepository: mock("DockerRepository", [
                    "isInstalled",
                    "getContainers",
                    "startContainer",
                    "stopContainer",
                    "restartContainer",
                    "removeContainer",
                ]),
                podmanRepository: mock("PodmanRepository", [
                    "isInstalled",
                    "getContainers",
                    "startContainer",
                    "stopContainer",
                    "restartContainer",
                    "removeContainer",
                ]),
                systemdRepository: mock("SystemdRepository", [
                    "isInstalled",
                    "isRunning",
                    "getServices",
                    "isServiceRunning",
                    "enableService",
                    "startService",
                    "stopService",
                    "restartService",
                    "disableService",
                    "parseServices",
                ]),
                settings: mock("Settings", [
                    "getMaxItemsPerSection",
                    "bindMaxItemsPerSection",
                    "isSystemdSectionEnabled",
                    "bindSystemdSectionEnabled",
                    "shouldFilterSystemdLoadedServices",
                    "bindFilterSystemdLoadedServices",
                    "shouldFilterSystemdUserServices",
                    "bindFilterSystemdUserServices",
                    "shouldFilterSystemdServicesByPriorityList",
                    "bindFilterSystemdServicesByPriorityList",
                    "getSystemdSectionItemsPriorityList",
                    "bindSystemdSectionItemsPriorityList",
                    "isCronSectionEnabled",
                    "bindCronSectionEnabled",
                    "isDockerSectionEnabled",
                    "bindDockerSectionEnabled",
                    "isPodmanSectionEnabled",
                    "bindPodmanSectionEnabled",
                ]),
            },

            presentation: {
                iconFactory: mock("IconFactory", [
                    "buildFromName",
                    "buildFromPath",
                ]),
            },
        },
    },
};
