"use strict";

const { Gio, GLib } = imports.gi;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const Log = Me.imports.src.util.log;

const LOGTAG = "CommandLine";

/**
 * @return {string} program - the absolute path of the program, null otherwise
 */
/* exported find */
var find = (program) => GLib.find_program_in_path(program);

/**
 * @param {string} command - the command as String (e.g. "ps aux")
 * @params {string} [input] - optional input for stdin
 * @return {Promise} the command execution result as a String, or fails if an error occur
 */
/* exported execute */
var execute = (command, stdin = null) =>
    new Promise((resolve, reject) => {
        Log.d(LOGTAG, `Executing command: "${command}"`);
        let proc = new Gio.Subprocess({
            argv: GLib.shell_parse_argv(command)[1],
            flags:
                Gio.SubprocessFlags.STDOUT_PIPE |
                Gio.SubprocessFlags.STDERR_PIPE,
        });
        proc.init(null);
        proc.communicate_utf8_async(stdin, null, (proc, result) => {
            try {
                let [_, stdout, stderr] = proc.communicate_utf8_finish(result);
                if (proc.get_exit_status() !== 0) {
                    Log.e(LOGTAG, `Error: ${stderr}`);
                    reject(new Error(stderr));
                }
                //Log.d(LOGTAG, `Output: ${stdout}`);
                resolve(stdout);
            } catch (error) {
                Log.e(LOGTAG, `Error: ${error.message}`);
                reject(error);
            }
        });
    });

/**
 * @param {string} command - the command as String (e.g. "ps aux")
 * @return {Promise} resolves if the command is launched successfully, or fails if an error occur
 */
/* exported executeAsync */
var executeAsync = (command) =>
    new Promise((resolve, reject) => {
        Log.d(LOGTAG, `Executing command: "${command}"`);
        try {
            GLib.spawn_command_line_async(command);
            resolve();
        } catch (error) {
            Log.e(LOGTAG, `Error: ${error.message}`);
            reject(error);
        }
    });
