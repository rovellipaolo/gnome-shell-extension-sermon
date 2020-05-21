"use strict";

// Import dummy/fake Gjs implementations:
imports.searchPath.push("./test/util/fake");
const CommandLineMock = imports.misc.Me.imports.src.data.commandLine;
const SettingsMock = imports.misc.Me.imports.src.data.settings;

const GjsMockito = imports.test.util.gjsMockito;
const when = GjsMockito.when;
const expectMock = GjsMockito.verify;

const sut = imports.src.data.systemdRepository;

/* exported testSuite */
function testSuite() {

    const ANY_PATH = "~/any/path/to/systemd";
    const NO_PATH = null;
    const ANY_IS_RUNNING_STATUS = "running";
    const ANY_IS_ACTIVE_STATUS = "active";
    const ANY_SERVICES_STDOUT = 
        "UNIT                                                                                      LOAD   ACTIVE SUB     DESCRIPTION\n" +
        "● apparmor.service                                                                            not-found inactive dead  AppArmor initialization\n" +
        "cron.service                                                                              loaded    inactive   dead Regular background program processing daemon\n" +
        "docker.service                                                                            loaded    active   running Docker Application Container Engine\n" +
        "lxc.service                                                                               loaded    active   exited    lxc.service\n" +
        "rsync.service                                                                             loaded    active   running    fast remote file copy program daemon\n" +
        "\n" +
        "LOAD   = Reflects whether the unit definition was properly loaded.\n" +
        "ACTIVE = The high-level unit activation state, i.e. generalization of SUB.\n" +
        "SUB    = The low-level unit activation state, values depend on unit type.\n" +
        "\n" +
        "5 loaded units listed.\n" +
        "To show all installed unit files use 'systemctl list-unit-files'.";
    const NO_SERVICE_STDOUT = "UNIT                                                                                      LOAD   ACTIVE SUB     DESCRIPTION\n" +
    "\n" +
    "LOAD   = Reflects whether the unit definition was properly loaded.\n" +
    "ACTIVE = The high-level unit activation state, i.e. generalization of SUB.\n" +
    "SUB    = The low-level unit activation state, values depend on unit type.\n" +
    "\n" +
    "0 loaded units listed.\n" +
    "To show all installed unit files use 'systemctl list-unit-files'.";

    const SERVICE_APPARMOR = { id: "apparmor.service", isActive: false, isRunning: false, name: "apparmor" };
    const SERVICE_CRON = { id: "cron.service", isActive: false, isRunning: false, name: "cron" };
    const SERVICE_DOCKER = { id: "docker.service", isActive: true, isRunning: true, name: "docker" };
    const SERVICE_LXC = { id: "lxc.service", isActive: true, isRunning: false, name: "lxc" };
    const SERVICE_RSYNC = { id: "rsync.service", isActive: true, isRunning: true, name: "rsync" };

    describe("SystemdRepository.isInstalled()", () => {
        it("when Systemd program is found, returns true", () => {
            when(CommandLineMock, "find").thenReturn(ANY_PATH);

            const result = sut.isInstalled();

            expect(result).toBe(true);
        });

        it("when Systemd program is not found, returns false", () => {
            when(CommandLineMock, "find").thenReturn(NO_PATH);

            const result = sut.isInstalled();

            expect(result).toBe(false);
        });
    });

    describe("SystemdRepository.isRunning()", () => {
        it("when retrieving whether Systemd is running, systemctl is-system-running command is executed", () => {
            const anyResolvedPromise = new Promise((resolve) => resolve(ANY_IS_RUNNING_STATUS));
            when(CommandLineMock, "execute").thenReturn(anyResolvedPromise);

            sut.isRunning();

            expectMock(CommandLineMock, "execute").toHaveBeenCalledWith("systemctl is-system-running");
        });

        // it("when systemd is not running, returns false", () => {});

        // it("when systemd is running, returns true", () => {});
    });

    describe("SystemdRepository.getServices()", () => {
        it("when retrieving all Systemd services, systemctl list-units --system command is executed", () => {
            const anyResolvedPromise = new Promise((resolve) => resolve(ANY_SERVICES));
            when(CommandLineMock, "execute").thenReturn(anyResolvedPromise);
            when(SettingsMock, "shouldFilterSystemdUserServices").thenReturn(false);

            sut.getServices()
                .catch(_ => {});

            expectMock(CommandLineMock, "execute").toHaveBeenCalledWith("systemctl list-units --type=service --all --system");
        });

        it("when retrieving only Systemd user services, systemctl list-units --user command is executed", () => {
            const anyResolvedPromise = new Promise((resolve) => resolve(ANY_SERVICES));
            when(CommandLineMock, "execute").thenReturn(anyResolvedPromise);
            when(SettingsMock, "shouldFilterSystemdUserServices").thenReturn(true);

            sut.getServices()
                .catch(_ => {});

            expectMock(CommandLineMock, "execute").toHaveBeenCalledWith("systemctl list-units --type=service --all --user");
        });

        // it("when no Systemd service is found, returns an error", () => {});

        // it("when Systemd services are found but cannot parse them, returns an error", () => {});

        // it("when Systemd services are found, returns them sorted by running status and priority", () => {});
    });

    describe("SystemdRepository.parseServices()", () => {
        it("when pasing command execution result with Systemd services, returns a list of services", () => {
            const result = sut.parseServices(ANY_SERVICES_STDOUT);

            expect(result.length).toBe(5);
            expect(result[0].id).toBe(SERVICE_APPARMOR.id);
            expect(result[0].isActive).toBe(SERVICE_APPARMOR.isActive);
            expect(result[0].isRunning).toBe(SERVICE_APPARMOR.isRunning);
            expect(result[0].name).toBe(SERVICE_APPARMOR.name);
            expect(result[1].id).toBe(SERVICE_CRON.id);
            expect(result[1].isActive).toBe(SERVICE_CRON.isActive);
            expect(result[1].isRunning).toBe(SERVICE_CRON.isRunning);
            expect(result[1].name).toBe(SERVICE_CRON.name);
            expect(result[2].id).toBe(SERVICE_DOCKER.id);
            expect(result[2].isActive).toBe(SERVICE_DOCKER.isActive);
            expect(result[2].isRunning).toBe(SERVICE_DOCKER.isRunning);
            expect(result[2].name).toBe(SERVICE_DOCKER.name);
            expect(result[3].id).toBe(SERVICE_LXC.id);
            expect(result[3].isActive).toBe(SERVICE_LXC.isActive);
            expect(result[3].isRunning).toBe(SERVICE_LXC.isRunning);
            expect(result[3].name).toBe(SERVICE_LXC.name);
            expect(result[4].id).toBe(SERVICE_RSYNC.id);
            expect(result[4].isActive).toBe(SERVICE_RSYNC.isActive);
            expect(result[4].isRunning).toBe(SERVICE_RSYNC.isRunning);
            expect(result[4].name).toBe(SERVICE_RSYNC.name);
        });

        it("when pasing command execution result without Systemd services, returns an empty list", () => {
            const result = sut.parseServices(NO_SERVICE_STDOUT);

            expect(result.length).toBe(0);
        });
    });

    describe("SystemdRepository.filterServices()", () => {
        it("when should not filter by priority list (only order), returns the list of services ordered by status and priority list", () => {
            when(SettingsMock, "shouldFilterSystemdServicesByPriorityList").thenReturn(false);
            when(SettingsMock, "getSystemdSectionItemsPriorityList").thenReturn([SERVICE_CRON.id, SERVICE_DOCKER.name]);

            const result = sut.filterServices([SERVICE_APPARMOR, SERVICE_CRON, SERVICE_DOCKER, SERVICE_LXC, SERVICE_RSYNC]);

            expect(result.length).toBe(5);
            expect(result[0]).toBe(SERVICE_DOCKER);    // priority list + status: active and running
            expect(result[1]).toBe(SERVICE_CRON);      // priority list + status: not active and not running
            expect(result[2]).toBe(SERVICE_RSYNC);     // status: active and running
            expect(result[3]).toBe(SERVICE_LXC);       // status: active but not running
            expect(result[4]).toBe(SERVICE_APPARMOR);  // status: not active and not running
            expectMock(SettingsMock, "shouldFilterSystemdServicesByPriorityList").toHaveBeenCalled();
            expectMock(SettingsMock, "getSystemdSectionItemsPriorityList").toHaveBeenCalled();
        });

        it("when should not filter by priority list (only order) and no priority list is passed, returns the list of services ordered by status only", () => {
            when(SettingsMock, "shouldFilterSystemdServicesByPriorityList").thenReturn(false);
            when(SettingsMock, "getSystemdSectionItemsPriorityList").thenReturn([]);

            const result = sut.filterServices([SERVICE_APPARMOR, SERVICE_CRON, SERVICE_DOCKER, SERVICE_LXC, SERVICE_RSYNC]);

            expect(result.length).toBe(5);
            expect(result[0]).toBe(SERVICE_DOCKER);    // status: active and running
            expect(result[1]).toBe(SERVICE_RSYNC);     // status: active and running
            expect(result[2]).toBe(SERVICE_LXC);       // status: active but not running
            expect(result[3]).toBe(SERVICE_APPARMOR);  // status: not active and not running
            expect(result[4]).toBe(SERVICE_CRON);      // status: not active and not running
        });

        it("when should not filter by priority list (only order) and no service is passed, returns an empty list", () => {
            when(SettingsMock, "shouldFilterSystemdServicesByPriorityList").thenReturn(false);
            when(SettingsMock, "getSystemdSectionItemsPriorityList").thenReturn([]);

            const result = sut.filterServices([]);

            expect(result.length).toBe(0);
        });

        it("when should filter by priority list, returns only the services contained in the priority list ordered by status", () => {
            when(SettingsMock, "shouldFilterSystemdServicesByPriorityList").thenReturn(true);
            when(SettingsMock, "getSystemdSectionItemsPriorityList").thenReturn([SERVICE_CRON.id, SERVICE_DOCKER.name]);

            const result = sut.filterServices([SERVICE_APPARMOR, SERVICE_CRON, SERVICE_DOCKER, SERVICE_LXC, SERVICE_RSYNC]);

            expect(result.length).toBe(2);
            expect(result[0]).toBe(SERVICE_DOCKER);    // priority list + status: active and running
            expect(result[1]).toBe(SERVICE_CRON);      // priority list + status: not active and not running
            expectMock(SettingsMock, "shouldFilterSystemdServicesByPriorityList").toHaveBeenCalled();
            expectMock(SettingsMock, "getSystemdSectionItemsPriorityList").toHaveBeenCalled();
        });

        it("when should filter by priority list and no priority list is passed, returns an empty list", () => {
            when(SettingsMock, "shouldFilterSystemdServicesByPriorityList").thenReturn(true);
            when(SettingsMock, "getSystemdSectionItemsPriorityList").thenReturn([]);

            const result = sut.filterServices([SERVICE_APPARMOR, SERVICE_CRON, SERVICE_DOCKER, SERVICE_LXC, SERVICE_RSYNC]);

            expect(result.length).toBe(0);
        });

        it("when should filter by priority list and no service is passed, returns an empty list", () => {
            when(SettingsMock, "shouldFilterSystemdServicesByPriorityList").thenReturn(true);
            when(SettingsMock, "getSystemdSectionItemsPriorityList").thenReturn([]);

            const result = sut.filterServices([]);

            expect(result.length).toBe(0);
        });
    });

    describe("SystemdRepository.isServiceRunning()", () => {
        it("when retrieving whether a Systemd service is running, systemctl is-active command is executed", () => {
            const anyResolvedPromise = new Promise((resolve) => resolve(ANY_IS_ACTIVE_STATUS));
            when(CommandLineMock, "execute").thenReturn(anyResolvedPromise);

            sut.isServiceRunning("docker");

            expectMock(CommandLineMock, "execute").toHaveBeenCalledWith("systemctl is-active docker");
        });

        // it("when the Systemd service is not running, returns false", () => {});

        // it("when the Systemd service is running, returns true", () => {});
    });

    describe("SystemdRepository.startService()", () => {
        it("when starting a Systemd service, systemctl start command is executed", () => {
            const anyResolvedPromise = new Promise((resolve) => resolve());
            when(CommandLineMock, "executeAsync").thenReturn(anyResolvedPromise);
            when(SettingsMock, "shouldFilterSystemdUserServices").thenReturn(false);

            sut.startService("docker");

            expectMock(CommandLineMock, "executeAsync").toHaveBeenCalledWith("systemctl start docker --type=service");
        });

        it("when starting a Systemd user service, systemctl start --user command is executed", () => {
            const anyResolvedPromise = new Promise((resolve) => resolve());
            when(CommandLineMock, "executeAsync").thenReturn(anyResolvedPromise);
            when(SettingsMock, "shouldFilterSystemdUserServices").thenReturn(true);

            sut.startService("docker");

            expectMock(CommandLineMock, "executeAsync").toHaveBeenCalledWith("systemctl start docker --type=service --user");
        });

        // it("when Systemd service cannot be started, returns an error", () => {});

        // it("when Systemd service can be started, starts it", () => {});
    });

    describe("SystemdRepository.stopService()", () => {
        it("when starting a Systemd service, systemctl stop command is executed", () => {
            const anyResolvedPromise = new Promise((resolve) => resolve());
            when(CommandLineMock, "executeAsync").thenReturn(anyResolvedPromise);
            when(SettingsMock, "shouldFilterSystemdUserServices").thenReturn(false);

            sut.stopService("docker");

            expectMock(CommandLineMock, "executeAsync").toHaveBeenCalledWith("systemctl stop docker --type=service");
        });

        it("when starting a Systemd user service, systemctl stop --user command is executed", () => {
            const anyResolvedPromise = new Promise((resolve) => resolve());
            when(CommandLineMock, "executeAsync").thenReturn(anyResolvedPromise);
            when(SettingsMock, "shouldFilterSystemdUserServices").thenReturn(true);

            sut.stopService("docker");

            expectMock(CommandLineMock, "executeAsync").toHaveBeenCalledWith("systemctl stop docker --type=service --user");
        });

        // it("when Systemd service cannot be stopped, returns an error", () => {});

        // it("when Systemd service can be stopped, stops it", () => {});
    });

    describe("SystemdRepository.restartService()", () => {
        it("when restarting a Systemd service, systemctl restart command is executed", () => {
            const anyResolvedPromise = new Promise((resolve) => resolve());
            when(CommandLineMock, "executeAsync").thenReturn(anyResolvedPromise);
            when(SettingsMock, "shouldFilterSystemdUserServices").thenReturn(false);

            sut.restartService("docker");

            expectMock(CommandLineMock, "executeAsync").toHaveBeenCalledWith("systemctl restart docker --type=service");
        });

        it("when restarting a Systemd user service, systemctl restart --user command is executed", () => {
            const anyResolvedPromise = new Promise((resolve) => resolve());
            when(CommandLineMock, "executeAsync").thenReturn(anyResolvedPromise);
            when(SettingsMock, "shouldFilterSystemdUserServices").thenReturn(true);

            sut.restartService("docker");

            expectMock(CommandLineMock, "executeAsync").toHaveBeenCalledWith("systemctl restart docker --type=service --user");
        });

        // it("when Systemd service cannot be restarted, returns an error", () => {});

        // it("when Systemd service can be restarted, restarts it", () => {});
    });

}
