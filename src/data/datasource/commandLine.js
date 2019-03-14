"use strict";

const GLib = imports.gi.GLib;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const Log = Me.imports.src.util.log;

const LOGTAG = "CommandLine";

/**
 * @return {string} the absolute path of the program, null otherwise
 */
/* exported find */
var find = (program) => GLib.find_program_in_path(program);

/**
 * @param {string} the command as String (e.g. "ps aux")
 * @return {Promise} the command execution result as a String, or fails if an error occur
 */
/* exported execute */
var execute = (command) => new Promise((resolve, reject) => {
    Log.d(LOGTAG, `Executing: "${command}"`);
    const [_, stdout, stderr, status] = GLib.spawn_command_line_sync(command);
    if (status !== 0) {
        const error = stderr.toString();
        Log.e(LOGTAG, error);
        reject(error);
    }
    const output = stdout.toString();
    Log.d(LOGTAG, `Output: ${output}`);
    resolve(output);
});

/**
 * @param {string} the command as String (e.g. "ps aux")
 * @return {Promise} resolves if the command is launched successfully, or fails if an error occur
 */
/* exported executeAsync */
var executeAsync = (command) => new Promise((resolve, reject) => {
    Log.d(LOGTAG, `Executing: "${command}"`);
    try {
        GLib.spawn_command_line_async(command);
        resolve();
    } catch (e) {
        Log.e(LOGTAG, e.message);
        reject(e.message);
    }
});
