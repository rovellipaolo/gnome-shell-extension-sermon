/**
 * Fake implementation of misc.
 */

"use strict";

const GjsMockito = imports.test.util.gjsMockito;
const mock = GjsMockito.mock;

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
                log: mock("Log", ["d", "i", "w", "e"])
            },

            data: {
                datasource: {
                    commandLine: mock("commandLine", ["find", "execute", "executeAsync", "executeAsyncWithResult"])
                }
            }
        }
    }
};
