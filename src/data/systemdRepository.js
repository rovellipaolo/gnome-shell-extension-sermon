import * as CommandLine from "./commandLine.js";
import * as Log from "../util/log.js";
import Settings from "./settings.js";

const LOGTAG = "SystemdRepository";

const PROGRAM = "systemctl";
const COMMAND_LIST_ALL = "systemctl list-unit-files --type=service --all";
const COMMAND_LIST_LOADED = "systemctl list-units --type=service --all";
const COMMAND_LIST_SYSTEM_FLAG = "--system";
const COMMAND_LIST_USER_FLAG = "--user";
const COMMAND_TEMPLATE_ID_PARAM = "%id%";
const COMMAND_TEMPLATE_IS_ACTIVE = "systemctl is-active %id%";
const COMMAND_TEMPLATE_ENABLE = `systemctl enable ${COMMAND_TEMPLATE_ID_PARAM}`;
const COMMAND_TEMPLATE_START = `systemctl start ${COMMAND_TEMPLATE_ID_PARAM}`;
const COMMAND_TEMPLATE_RESTART = `systemctl restart ${COMMAND_TEMPLATE_ID_PARAM}`;
const COMMAND_TEMPLATE_STOP = `systemctl stop ${COMMAND_TEMPLATE_ID_PARAM}`;
const COMMAND_TEMPLATE_DISABLE = `systemctl disable ${COMMAND_TEMPLATE_ID_PARAM}`;
const ROWS_SEPARATOR = "\n";
const LIST_COLUMNS_SEPARATOR = " ";
const LIST_EMPTY_LINE = "";
const LIST_INDEX_ID = 0;
const LIST_INDEX_STATE = 1;
const LIST_INDEX_ACTIVE = 2;
const LIST_INDEX_RUNNING = 3;
const LIST_ID_NAME_SEPARATOR = ".";
const STATUS_ENABLED = "enabled"; // NOTE: could be either "enabled" or "enabled-runtime"
const STATUS_LOADED = "loaded";
const STATUS_GENERATED = "generated";
const STATUS_DISABLED = "disabled";
const STATUS_ACTIVE = "active";
const STATUS_RUNNING = "running";

/**
 * Check whether Systemd is installed.
 *
 * @return {boolean} true if Systemd is installed, false otherwise
 */
export const isInstalled = () => CommandLine.find(PROGRAM) !== null;

/**
 * Retrieve all Systemd services.
 *
 * @return {Promise} the Systemd services as a list of { id, name, isEnabled, canBeEnabled, isActive, isRunning }, or fails if an error occur
 */
export const getServices = async () => {
    const flag = Settings.shouldShowSystemdUserServices()
        ? COMMAND_LIST_USER_FLAG
        : COMMAND_LIST_SYSTEM_FLAG;
    const stdout = await CommandLine.execute(`${COMMAND_LIST_LOADED} ${flag}`);

    let services = parseServices(stdout, false);
    if (!Settings.shouldShowOnlySystemdLoadedServices()) {
        try {
            services = await getAllServices(services);
        } catch (error) {
            Log.w(
                LOGTAG,
                `Cannot retrieve all systemd services: ${error.message}`,
            );
        }
    }

    if (services.length === 0) {
        Log.w(LOGTAG, "No systemd service found!");
        throw new Error("No service found!");
    }

    return services;
};

const getAllServices = async (loadedServices) => {
    const stdout = await CommandLine.execute(
        `${COMMAND_LIST_ALL} ${
            Settings.shouldShowSystemdUserServices()
                ? COMMAND_LIST_USER_FLAG
                : COMMAND_LIST_SYSTEM_FLAG
        }`,
    );
    const allServices = parseServices(stdout, true);
    const services = mergeAllAndLoadedServices(allServices, loadedServices);
    return filterServices(services);
};

/**
 * Check whether a given Systemd service is running.
 *
 * @return {Promise} true if the given service is running, false otherwise
 */
export const isServiceRunning = async (id, userFlag = false) => {
    let isActive = false;
    let command = COMMAND_TEMPLATE_IS_ACTIVE.replace(
        COMMAND_TEMPLATE_ID_PARAM,
        id,
    );
    if (userFlag) {
        command += ` ${COMMAND_LIST_USER_FLAG}`;
    }

    try {
        const stdout = await CommandLine.execute(command);
        isActive = stdout.split(ROWS_SEPARATOR)[0].trim() === STATUS_ACTIVE;
    } catch (error) {
        Log.e(LOGTAG, `Cannot read systemd service "${id}": ${error.message}`);
    }

    return isActive;
};

/**
 * Enable a Systemd service.
 *
 * @param {string} id - the Systemd service ID
 * @return {Promise} resolves if Systemd service is enabled, or fails if an error occur
 */
export const enableService = (id) =>
    _runCommandFromTemplate(COMMAND_TEMPLATE_ENABLE, id);

/**
 * Start a Systemd service.
 *
 * @param {string} id - the Systemd service ID
 * @return {Promise} resolves if Systemd service is started, or fails if an error occur
 */
export const startService = (id) =>
    _runCommandFromTemplate(COMMAND_TEMPLATE_START, id);

/**
 * Restart a Systemd service.
 *
 * @param {string} id - the Systemd service ID
 * @return {Promise} resolves if Systemd service is restarted, or fails if an error occur
 */
export const restartService = (id) =>
    _runCommandFromTemplate(COMMAND_TEMPLATE_RESTART, id);

/**
 * Stop a Systemd service.
 *
 * @param {string} id - the Systemd service ID
 * @return {Promise} resolves if Systemd service is started, or fails if an error occur
 */
export const stopService = (id) =>
    _runCommandFromTemplate(COMMAND_TEMPLATE_STOP, id);

/**
 * Disable a Systemd service.
 *
 * @param {string} id - the Systemd service ID
 * @return {Promise} resolves if Systemd service is disabled, or fails if an error occur
 */
export const disableService = (id) =>
    _runCommandFromTemplate(COMMAND_TEMPLATE_DISABLE, id);

const _runCommandFromTemplate = async (commandTemplate, id) => {
    let command = commandTemplate.replace(COMMAND_TEMPLATE_ID_PARAM, id);
    if (Settings.shouldShowSystemdUserServices()) {
        command += ` ${COMMAND_LIST_USER_FLAG}`;
    }

    try {
        await CommandLine.executeAsync(command);
        Log.i(LOGTAG, `Action correctly executed on systemd service "${id}"!`);
    } catch (error) {
        Log.e(
            LOGTAG,
            `Cannot execute action on systemd service "${id}": ${error.message}`,
        );
        throw error;
    }
};

/**
 * Merge the list of all Systemd services with the list of loaded ones.
 *
 * @param {Arrat} allServices - the list of all services (i.e. list-unit-files command)
 * @param {Array} loadedServices - the list of loaded services (i.e. list-units command)
 * @return {Array} the list of loaded services filled with the unloaded ones
 */
const mergeAllAndLoadedServices = (allServices, loadedServices) => {
    let services = [];
    const idToLoadedServiceMap = loadedServices.reduce((map, service) => {
        map[service.id] = service;
        return map;
    }, {});
    allServices.forEach((service) => {
        const loadedService = idToLoadedServiceMap[service.id];
        if (loadedService) {
            services.push(
                Object.assign(service, {
                    isEnabled: loadedService.isEnabled,
                    isActive: loadedService.isActive,
                    isRunning: loadedService.isRunning,
                }),
            );
        } else {
            services.push(service);
        }
    });
    return services;
};

const parseServices = (stdout, all = false) => {
    const rows = stdout.split(ROWS_SEPARATOR);
    const services = rows
        .slice(1, rows.indexOf(LIST_EMPTY_LINE))
        .filter((item) => item.length > 0)
        .map((item) => _parseService(item, all));
    return filterServices(services);
};

const _parseService = (stdout, all = false) => {
    stdout = stdout
        .replace("●", " ")
        .replace(/\s+/g, " ")
        .trim()
        .split(LIST_COLUMNS_SEPARATOR, 4);

    let service = {};
    service.id = stdout[LIST_INDEX_ID];
    service.name = service.id.substring(
        0,
        service.id.lastIndexOf(LIST_ID_NAME_SEPARATOR),
    );
    if (all) {
        service.isEnabled =
            stdout[LIST_INDEX_STATE].startsWith(STATUS_ENABLED) ||
            stdout[LIST_INDEX_STATE] === STATUS_GENERATED;
        service.canBeEnabled =
            stdout[LIST_INDEX_STATE].startsWith(STATUS_ENABLED) ||
            stdout[LIST_INDEX_STATE] === STATUS_DISABLED;
        service.isActive = false;
        service.isRunning = false;
    } else {
        service.isEnabled = stdout[LIST_INDEX_STATE] === STATUS_LOADED;
        service.canBeEnabled = false;
        service.isActive = stdout[LIST_INDEX_ACTIVE] === STATUS_ACTIVE;
        service.isRunning = stdout[LIST_INDEX_RUNNING] === STATUS_RUNNING;
    }

    return service;
};

/**
 * Filter Systemd services list, according to both the status and the priority list preferences.
 */
const filterServices = (services) => {
    const priorityList = Settings.getSystemdServicesPriorityList();
    if (Settings.shouldFilterSystemdServicesByPriorityList()) {
        return services
            .filter((service) => _listContainsItem(priorityList, service))
            .sort((item1, item2) => _sortByRunningStatus(item1, item2));
    }
    return services
        .sort((item1, item2) => _sortByRunningStatus(item1, item2))
        .sort((item1, item2) => _sortByIdsPriority(priorityList, item1, item2));
};

const _sortByRunningStatus = (item1, item2) =>
    item1.isRunning === item2.isRunning
        ? _sortByActiveStatus(item1, item2)
        : item1.isRunning
        ? -1
        : 1;

const _sortByActiveStatus = (item1, item2) =>
    item1.isActive === item2.isActive ? 0 : item1.isActive ? -1 : 1;

const _sortByIdsPriority = (priorityList, item1, item2) => {
    if (priorityList.length === 0) {
        return 0;
    }
    const item1IsPrioritised = _listContainsItem(priorityList, item1);
    const item2IsPrioritised = _listContainsItem(priorityList, item2);
    return item1IsPrioritised === item2IsPrioritised
        ? 0
        : item1IsPrioritised
        ? -1
        : 1;
};

const _listContainsItem = (list, item) =>
    list.includes(item.id) || list.includes(item.name);
