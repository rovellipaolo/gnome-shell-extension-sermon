/**
 * Fake implementation of misc.
 */

"use strict";

const GjsMockito = imports.test.util.gjsMockito;
const mock = GjsMockito.mock;
const when = GjsMockito.when;

/* exported GSettings */
var GSettings = mock("GSettings", ["get_boolean", "get_int", "get_string"]);

const mockConvenience = () => {
    const convenienceMock = mock("Convenience", ["getSettings", "initTranslations"]);
    when(convenienceMock, "getSettings").thenReturn(GSettings);
    return convenienceMock;
};

/* exported extensionUtils */
var extensionUtils = {
    getCurrentExtension: () => {
        return Me;
    }
};

/* exported Me */
var Me = {
    path: "",

    imports: {
        src: {
            util: {
                log: mock("Log", ["d", "i", "w", "e"]),
                convenience: mockConvenience()
            },

            data: {
                commandLine: mock("CommandLine", [
                    "find",
                    "execute",
                    "executeAsync",
                    "executeAsyncWithResult"
                ]),
                cronRepository: mock("CronRepository", [
                    "isInstalled",
                    "getJobs",
                    "parseJobs"
                ]),
                dockerRepository: mock("DockerRepository", [
                    "isInstalled",
                    "getVersion",
                    "getContainers",
                    "startContainer",
                    "stopContainer",
                    "parseContainers"
                ]),
                systemdRepository: mock("SystemdRepository", [
                    "isInstalled",
                    "isRunning",
                    "getVersion",
                    "getServices",
                    "isServiceRunning",
                    "startService",
                    "stopService",
                    "parseServices"
                ]),
                settings: mock("Settings", [
                    "getMaxItemsPerSection",
                    "isSystemdSectionEnabled",
                    "shouldFilterSystemdUserServices",
                    "getSystemdSectionItemsPriorityList",
                    "isCronSectionEnabled",
                    "isDockerSectionEnabled"
                ])
            },

            presentation: {
                iconFactory: mock("IconFactory", ["build"])
            }
        }
    }
};
