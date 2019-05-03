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
    imports: {
        src: {
            util: {
                log: mock("Log", ["d", "i", "w", "e"]),
                convenience: mockConvenience()
            },

            data: {
                datasource: {
                    commandLine: mock("commandLine", [
                        "find",
                        "execute",
                        "executeAsync",
                        "executeAsyncWithResult"
                    ])
                },
                settings: mock("Settings", [
                    "getMaxItemsPerSection",
                    "isSystemdSectionEnabled",
                    "getSystemdSectionItemsPriorityList",
                    "isCronSectionEnabled",
                    "isDockerSectionEnabled"
                ])
            }
        }
    }
};
