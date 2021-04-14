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
    const ANY_IS_ACTIVE_STATUS = "active";
    const ANY_ALL_SERVICES_STDOUT =
        "UNIT FILE                                  STATE           VENDOR PRESET\n" +
        "apparmor.service                           enabled         enabled      \n" +
        "acpid.service                              disabled        enabled      \n" +
        "apport.service                             masked          enabled      \n" +
        "cron.service                               enabled-runtime enabled      \n" +
        "dbus.service                               static          enabled      \n" +
        "docker.service                             enabled         enabled      \n" +
        "lxc.service                                generated       enabled      \n" +
        "rsync.service                              enabled         enabled      \n" +
        "8 unit files listed.";
    const NO_ALL_SERVICES_STDOUT =
        "UNIT FILE                                  STATE           VENDOR PRESET\n" +
        "0 unit files listed.";
    const ANY_LOADED_SERVICES_STDOUT =
        "UNIT                                                                                      LOAD      ACTIVE   SUB     DESCRIPTION\n" +
        "● apparmor.service                                                                        not-found inactive dead    AppArmor initialization\n" +
        "● apport.service                                                                          masked    inactive dead    LSB: automatic crash report generation\n" +
        "cron.service                                                                              loaded    inactive dead    Regular background program processing daemon\n" +
        "docker.service                                                                            loaded    active   running Docker Application Container Engine\n" +
        "lxc.service                                                                               loaded    active   exited  lxc.service\n" +
        "rsync.service                                                                             loaded    active   running fast remote file copy program daemon\n" +
        "\n" +
        "LOAD   = Reflects whether the unit definition was properly loaded.\n" +
        "ACTIVE = The high-level unit activation state, i.e. generalization of SUB.\n" +
        "SUB    = The low-level unit activation state, values depend on unit type.\n" +
        "\n" +
        "6 loaded units listed.\n" +
        "To show all installed unit files use 'systemctl list-unit-files'.";
    const NO_LOADED_SERVICE_STDOUT =
        "UNIT                                                                                      LOAD   ACTIVE SUB     DESCRIPTION\n" +
        "\n" +
        "LOAD   = Reflects whether the unit definition was properly loaded.\n" +
        "ACTIVE = The high-level unit activation state, i.e. generalization of SUB.\n" +
        "SUB    = The low-level unit activation state, values depend on unit type.\n" +
        "\n" +
        "0 loaded units listed.\n" +
        "To show all installed unit files use 'systemctl list-unit-files'.";

    const SERVICE_ACPID = {
        id: "acpid.service",
        name: "acpid",
        isEnabled: false,
        canBeEnabled: true,
        isActive: false,
        isRunning: false,
    };
    const SERVICE_APPARMOR = {
        id: "apparmor.service",
        name: "apparmor",
        isEnabled: false,
        canBeEnabled: false,
        isActive: false,
        isRunning: false,
    };
    const SERVICE_APPORT = {
        id: "apport.service",
        name: "apport",
        isEnabled: false,
        canBeEnabled: false,
        isActive: false,
        isRunning: false,
    };
    const SERVICE_CRON = {
        id: "cron.service",
        name: "cron",
        isEnabled: true,
        canBeEnabled: false,
        isActive: false,
        isRunning: false,
    };
    const SERVICE_DBUS = {
        id: "dbus.service",
        name: "dbus",
        isEnabled: false,
        canBeEnabled: false,
        isActive: false,
        isRunning: false,
    };
    const SERVICE_DOCKER = {
        id: "docker.service",
        name: "docker",
        isEnabled: true,
        canBeEnabled: false,
        isActive: true,
        isRunning: true,
    };
    const SERVICE_LXC = {
        id: "lxc.service",
        name: "lxc",
        isEnabled: true,
        canBeEnabled: false,
        isActive: true,
        isRunning: false,
    };
    const SERVICE_RSYNC = {
        id: "rsync.service",
        name: "rsync",
        isEnabled: true,
        canBeEnabled: false,
        isActive: true,
        isRunning: true,
    };

    const expectService = (actual, expected) => {
        expect(actual.id).toBe(expected.id);
        expect(actual.name).toBe(expected.name);
        expect(actual.isEnabled).toBe(expected.isEnabled);
        expect(actual.canBeEnabled).toBe(expected.canBeEnabled);
        expect(actual.isActive).toBe(expected.isActive);
        expect(actual.isRunning).toBe(expected.isRunning);
    };

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

    describe("SystemdRepository.getServices()", () => {
        it("when retrieving all Systemd services, systemctl list-units --system command is executed anyway", () => {
            const anyResolvedPromise = new Promise((resolve) =>
                resolve(ANY_LOADED_SERVICES_STDOUT)
            );
            when(CommandLineMock, "execute").thenReturn(anyResolvedPromise);
            when(SettingsMock, "shouldFilterSystemdUserServices").thenReturn(
                false
            );
            when(SettingsMock, "shouldFilterSystemdLoadedServices").thenReturn(
                false
            );

            sut.getServices().catch((_) => {});

            expectMock(CommandLineMock, "execute").toHaveBeenCalledWith(
                "systemctl list-units --type=service --all --system"
            );
        });

        it("when retrieving all user Systemd services, systemctl list-units --user command is executed anyway", () => {
            const anyResolvedPromise = new Promise((resolve) =>
                resolve(ANY_LOADED_SERVICES_STDOUT)
            );
            CommandLineMock.reset();
            when(CommandLineMock, "execute").thenReturn(anyResolvedPromise);
            when(SettingsMock, "shouldFilterSystemdUserServices").thenReturn(
                true
            );
            when(SettingsMock, "shouldFilterSystemdLoadedServices").thenReturn(
                false
            );

            sut.getServices().catch((_) => {});

            expectMock(CommandLineMock, "execute").toHaveBeenCalledWith(
                "systemctl list-units --type=service --all --user"
            );
        });

        it("when retrieving only loaded Systemd services, systemctl list-units --system command is executed", () => {
            const anyResolvedPromise = new Promise((resolve) =>
                resolve(ANY_LOADED_SERVICES_STDOUT)
            );
            when(CommandLineMock, "execute").thenReturn(anyResolvedPromise);
            when(SettingsMock, "shouldFilterSystemdUserServices").thenReturn(
                false
            );
            when(SettingsMock, "shouldFilterSystemdLoadedServices").thenReturn(
                true
            );

            sut.getServices().catch((_) => {});

            expectMock(CommandLineMock, "execute").toHaveBeenCalledWith(
                "systemctl list-units --type=service --all --system"
            );
        });

        it("when retrieving only loaded user Systemd services, systemctl list-units --user command is executed", () => {
            const anyResolvedPromise = new Promise((resolve) =>
                resolve(ANY_LOADED_SERVICES_STDOUT)
            );
            when(CommandLineMock, "execute").thenReturn(anyResolvedPromise);
            when(SettingsMock, "shouldFilterSystemdUserServices").thenReturn(
                true
            );
            when(SettingsMock, "shouldFilterSystemdLoadedServices").thenReturn(
                true
            );

            sut.getServices().catch((_) => {});

            expectMock(CommandLineMock, "execute").toHaveBeenCalledWith(
                "systemctl list-units --type=service --all --user"
            );
        });

        // it("when no Systemd service is found, returns an error", () => {});

        // it("when Systemd services are found but cannot parse them, returns an error", () => {});

        // it("when Systemd services are found, returns them sorted by running status and priority", () => {});
    });

    describe("SystemdRepository.getAllServices()", () => {
        it("when retrieving all Systemd services, systemctl list-unit-files --system command is executed", () => {
            const anyResolvedPromise = new Promise((resolve) =>
                resolve(ANY_LOADED_SERVICES_STDOUT)
            );
            when(CommandLineMock, "execute").thenReturn(anyResolvedPromise);
            when(SettingsMock, "shouldFilterSystemdUserServices").thenReturn(
                false
            );

            sut.getAllServices([]).catch((_) => {});

            expectMock(CommandLineMock, "execute").toHaveBeenCalledWith(
                "systemctl list-unit-files --type=service --all --system"
            );
        });

        it("when retrieving all user Systemd services, systemctl list-unit-files --user command is executed", () => {
            const anyResolvedPromise = new Promise((resolve) =>
                resolve(ANY_LOADED_SERVICES_STDOUT)
            );
            when(CommandLineMock, "execute").thenReturn(anyResolvedPromise);
            when(SettingsMock, "shouldFilterSystemdUserServices").thenReturn(
                true
            );

            sut.getAllServices([]).catch((_) => {});

            expectMock(CommandLineMock, "execute").toHaveBeenCalledWith(
                "systemctl list-unit-files --type=service --all --user"
            );
        });
    });

    describe("SystemdRepository.mergeAllAndLoadedServices()", () => {
        it("when passing a list of all Systemd services and a list of only loaded ones, returns the list of loaded services filled with the unloaded ones", () => {
            when(
                SettingsMock,
                "shouldFilterSystemdServicesByPriorityList"
            ).thenReturn(false);
            when(SettingsMock, "getSystemdSectionItemsPriorityList").thenReturn(
                []
            );

            const result = sut.mergeAllAndLoadedServices(
                [
                    Object.assign({}, SERVICE_DOCKER, {
                        canBeEnabled: true,
                        isActive: false,
                        isRunning: false,
                    }),
                    Object.assign({}, SERVICE_LXC, {
                        canBeEnabled: true,
                        isActive: true,
                        isRunning: false,
                    }),
                    Object.assign({}, SERVICE_CRON, {
                        canBeEnabled: true,
                        isActive: false,
                        isRunning: false,
                    }),
                    SERVICE_ACPID,
                    SERVICE_APPORT,
                ],
                [SERVICE_DOCKER, SERVICE_LXC, SERVICE_CRON]
            );

            expect(result.length).toBe(5);
            // NOTE: isEnabled/isActive/isRunning are taken from loadedService (if present), canBeEnabled is taken from allServices...
            expectService(
                result[0],
                Object.assign({}, SERVICE_DOCKER, {
                    canBeEnabled: true,
                })
            );
            expectService(
                result[1],
                Object.assign({}, SERVICE_LXC, {
                    canBeEnabled: true,
                })
            );
            expectService(
                result[2],
                Object.assign({}, SERVICE_CRON, {
                    canBeEnabled: true,
                })
            );
            expectService(result[3], SERVICE_ACPID);
            expectService(result[4], SERVICE_APPORT);
        });

        it("when passing a list of all Systemd services and no loaded ones, returns the list of all services without modifications", () => {
            when(
                SettingsMock,
                "shouldFilterSystemdServicesByPriorityList"
            ).thenReturn(false);
            when(SettingsMock, "getSystemdSectionItemsPriorityList").thenReturn(
                []
            );

            const result = sut.mergeAllAndLoadedServices(
                [SERVICE_ACPID, SERVICE_APPORT],
                []
            );

            expect(result.length).toBe(2);
            expectService(result[0], SERVICE_ACPID);
            expectService(result[1], SERVICE_APPORT);
        });
    });

    describe("SystemdRepository.parseServices()", () => {
        it("when passing systemctl list-units response, returns the list of services sorted by status", () => {
            when(
                SettingsMock,
                "shouldFilterSystemdServicesByPriorityList"
            ).thenReturn(false);
            when(SettingsMock, "getSystemdSectionItemsPriorityList").thenReturn(
                []
            );

            const result = sut.parseServices(ANY_LOADED_SERVICES_STDOUT, false);

            expect(result.length).toBe(6);
            expectService(result[0], SERVICE_DOCKER); // status: active and running
            expectService(result[1], SERVICE_RSYNC); // status: active and running
            expectService(result[2], SERVICE_LXC); // status: active but not running
            expectService(result[3], SERVICE_APPARMOR); // status: not active and not running
            expectService(result[4], SERVICE_APPORT); // status: not active and not running
            expectService(result[5], SERVICE_CRON); // status: not active and not running
            expectMock(
                SettingsMock,
                "shouldFilterSystemdServicesByPriorityList"
            ).toHaveBeenCalled();
            expectMock(
                SettingsMock,
                "getSystemdSectionItemsPriorityList"
            ).toHaveBeenCalled();
        });

        it("when passing systemctl list-units response and should sort by priority list, returns the list of services sorted by status and priority list", () => {
            when(
                SettingsMock,
                "shouldFilterSystemdServicesByPriorityList"
            ).thenReturn(false);
            when(
                SettingsMock,
                "getSystemdSectionItemsPriorityList"
            ).thenReturn([SERVICE_CRON.name, SERVICE_DOCKER.name]);

            const result = sut.parseServices(ANY_LOADED_SERVICES_STDOUT, false);

            expect(result.length).toBe(6);
            expectService(result[0], SERVICE_DOCKER); // priority list + status: active and running
            expectService(result[1], SERVICE_CRON); // priority list + status: not active and not running
            expectService(result[2], SERVICE_RSYNC); // status: active and running
            expectService(result[3], SERVICE_LXC); // status: active but not running
            expectService(result[4], SERVICE_APPARMOR); // status: not active and not running
            expectService(result[5], SERVICE_APPORT); // status: not active and not running
            expectMock(
                SettingsMock,
                "shouldFilterSystemdServicesByPriorityList"
            ).toHaveBeenCalled();
            expectMock(
                SettingsMock,
                "getSystemdSectionItemsPriorityList"
            ).toHaveBeenCalled();
        });

        it("when passing systemctl list-units response and should filter by priority list, returns the list of services filtered by priority list", () => {
            when(
                SettingsMock,
                "shouldFilterSystemdServicesByPriorityList"
            ).thenReturn(true);
            when(
                SettingsMock,
                "getSystemdSectionItemsPriorityList"
            ).thenReturn([SERVICE_CRON.name]);

            const result = sut.parseServices(ANY_LOADED_SERVICES_STDOUT, false);

            expect(result.length).toBe(1);
            expectService(result[0], SERVICE_CRON);
            expectMock(
                SettingsMock,
                "shouldFilterSystemdServicesByPriorityList"
            ).toHaveBeenCalled();
            expectMock(
                SettingsMock,
                "getSystemdSectionItemsPriorityList"
            ).toHaveBeenCalled();
        });

        it("when passing systemctl list-units response and should filter by priority list but no one is passed, returns an empty list", () => {
            when(
                SettingsMock,
                "shouldFilterSystemdServicesByPriorityList"
            ).thenReturn(true);
            when(SettingsMock, "getSystemdSectionItemsPriorityList").thenReturn(
                []
            );

            const result = sut.parseServices(ANY_LOADED_SERVICES_STDOUT, false);

            expect(result.length).toBe(0);
        });

        it("when passing an empty systemctl list-units response, returns an empty list", () => {
            const result = sut.parseServices(NO_LOADED_SERVICE_STDOUT, false);

            expect(result.length).toBe(0);
        });

        it("when passing systemctl list-unit-files response, returns the list of services", () => {
            when(
                SettingsMock,
                "shouldFilterSystemdServicesByPriorityList"
            ).thenReturn(false);
            when(SettingsMock, "getSystemdSectionItemsPriorityList").thenReturn(
                []
            );

            const result = sut.parseServices(ANY_ALL_SERVICES_STDOUT, true);

            expect(result.length).toBe(8);
            expectService(
                result[0],
                Object.assign({}, SERVICE_APPARMOR, {
                    isEnabled: true,
                    canBeEnabled: true,
                })
            );
            expectService(result[1], SERVICE_ACPID);
            expectService(result[2], SERVICE_APPORT);
            expectService(
                result[3],
                Object.assign({}, SERVICE_CRON, { canBeEnabled: true })
            );
            expectService(result[4], SERVICE_DBUS);
            expectService(
                result[5],
                Object.assign({}, SERVICE_DOCKER, {
                    canBeEnabled: true,
                    isActive: false,
                    isRunning: false,
                })
            );
            expectService(
                result[6],
                Object.assign({}, SERVICE_LXC, {
                    isEnabled: true,
                    isActive: false,
                })
            );
            expectService(
                result[7],
                Object.assign({}, SERVICE_RSYNC, {
                    canBeEnabled: true,
                    isActive: false,
                    isRunning: false,
                })
            );
        });

        it("when passing an empty systemctl list-unit-files response, returns an empty list", () => {
            const result = sut.parseServices(NO_ALL_SERVICES_STDOUT, false);

            expect(result.length).toBe(0);
        });
    });

    describe("SystemdRepository.filterServices()", () => {
        it("when should not filter by priority list (only order), returns the list of services ordered by status and priority list", () => {
            when(
                SettingsMock,
                "shouldFilterSystemdServicesByPriorityList"
            ).thenReturn(false);
            when(
                SettingsMock,
                "getSystemdSectionItemsPriorityList"
            ).thenReturn([SERVICE_CRON.id, SERVICE_DOCKER.name]);

            const result = sut.filterServices([
                SERVICE_APPARMOR,
                SERVICE_CRON,
                SERVICE_DOCKER,
                SERVICE_LXC,
                SERVICE_RSYNC,
            ]);

            expect(result.length).toBe(5);
            expect(result[0]).toBe(SERVICE_DOCKER); // priority list + status: active and running
            expect(result[1]).toBe(SERVICE_CRON); // priority list + status: not active and not running
            expect(result[2]).toBe(SERVICE_RSYNC); // status: active and running
            expect(result[3]).toBe(SERVICE_LXC); // status: active but not running
            expect(result[4]).toBe(SERVICE_APPARMOR); // status: not active and not running
            expectMock(
                SettingsMock,
                "shouldFilterSystemdServicesByPriorityList"
            ).toHaveBeenCalled();
            expectMock(
                SettingsMock,
                "getSystemdSectionItemsPriorityList"
            ).toHaveBeenCalled();
        });

        it("when should not filter by priority list (only order) and no priority list is passed, returns the list of services ordered by status only", () => {
            when(
                SettingsMock,
                "shouldFilterSystemdServicesByPriorityList"
            ).thenReturn(false);
            when(SettingsMock, "getSystemdSectionItemsPriorityList").thenReturn(
                []
            );

            const result = sut.filterServices([
                SERVICE_APPARMOR,
                SERVICE_CRON,
                SERVICE_DOCKER,
                SERVICE_LXC,
                SERVICE_RSYNC,
            ]);

            expect(result.length).toBe(5);
            expect(result[0]).toBe(SERVICE_DOCKER); // status: active and running
            expect(result[1]).toBe(SERVICE_RSYNC); // status: active and running
            expect(result[2]).toBe(SERVICE_LXC); // status: active but not running
            expect(result[3]).toBe(SERVICE_APPARMOR); // status: not active and not running
            expect(result[4]).toBe(SERVICE_CRON); // status: not active and not running
        });

        it("when should not filter by priority list (only order) and no service is passed, returns an empty list", () => {
            when(
                SettingsMock,
                "shouldFilterSystemdServicesByPriorityList"
            ).thenReturn(false);
            when(SettingsMock, "getSystemdSectionItemsPriorityList").thenReturn(
                []
            );

            const result = sut.filterServices([]);

            expect(result.length).toBe(0);
        });

        it("when should filter by priority list, returns only the services contained in the priority list ordered by status", () => {
            when(
                SettingsMock,
                "shouldFilterSystemdServicesByPriorityList"
            ).thenReturn(true);
            when(
                SettingsMock,
                "getSystemdSectionItemsPriorityList"
            ).thenReturn([SERVICE_CRON.id, SERVICE_DOCKER.name]);

            const result = sut.filterServices([
                SERVICE_APPARMOR,
                SERVICE_CRON,
                SERVICE_DOCKER,
                SERVICE_LXC,
                SERVICE_RSYNC,
            ]);

            expect(result.length).toBe(2);
            expect(result[0]).toBe(SERVICE_DOCKER); // priority list + status: active and running
            expect(result[1]).toBe(SERVICE_CRON); // priority list + status: not active and not running
            expectMock(
                SettingsMock,
                "shouldFilterSystemdServicesByPriorityList"
            ).toHaveBeenCalled();
            expectMock(
                SettingsMock,
                "getSystemdSectionItemsPriorityList"
            ).toHaveBeenCalled();
        });

        it("when should filter by priority list and no priority list is passed, returns an empty list", () => {
            when(
                SettingsMock,
                "shouldFilterSystemdServicesByPriorityList"
            ).thenReturn(true);
            when(SettingsMock, "getSystemdSectionItemsPriorityList").thenReturn(
                []
            );

            const result = sut.filterServices([
                SERVICE_APPARMOR,
                SERVICE_CRON,
                SERVICE_DOCKER,
                SERVICE_LXC,
                SERVICE_RSYNC,
            ]);

            expect(result.length).toBe(0);
        });

        it("when should filter by priority list and no service is passed, returns an empty list", () => {
            when(
                SettingsMock,
                "shouldFilterSystemdServicesByPriorityList"
            ).thenReturn(true);
            when(SettingsMock, "getSystemdSectionItemsPriorityList").thenReturn(
                []
            );

            const result = sut.filterServices([]);

            expect(result.length).toBe(0);
        });
    });

    describe("SystemdRepository.isServiceRunning()", () => {
        it("when retrieving whether a Systemd service is running, systemctl is-active command is executed", () => {
            const anyResolvedPromise = new Promise((resolve) =>
                resolve(ANY_IS_ACTIVE_STATUS)
            );
            when(CommandLineMock, "execute").thenReturn(anyResolvedPromise);

            sut.isServiceRunning("docker");

            expectMock(CommandLineMock, "execute").toHaveBeenCalledWith(
                "systemctl is-active docker"
            );
        });

        // it("when the Systemd service is not running, returns false", () => {});

        // it("when the Systemd service is running, returns true", () => {});
    });

    describe("SystemdRepository.enableService()", () => {
        it("when enabling a Systemd service, systemctl enable command is executed", () => {
            const anyResolvedPromise = new Promise((resolve) => resolve());
            when(CommandLineMock, "executeAsync").thenReturn(
                anyResolvedPromise
            );
            when(SettingsMock, "shouldFilterSystemdUserServices").thenReturn(
                false
            );

            sut.enableService("docker");

            expectMock(CommandLineMock, "executeAsync").toHaveBeenCalledWith(
                "systemctl enable docker"
            );
        });

        it("when enabling a Systemd user service, systemctl enable --user command is executed", () => {
            const anyResolvedPromise = new Promise((resolve) => resolve());
            when(CommandLineMock, "executeAsync").thenReturn(
                anyResolvedPromise
            );
            when(SettingsMock, "shouldFilterSystemdUserServices").thenReturn(
                true
            );

            sut.enableService("docker");

            expectMock(CommandLineMock, "executeAsync").toHaveBeenCalledWith(
                "systemctl enable docker --user"
            );
        });

        // it("when Systemd service cannot be enabled, returns an error", () => {});

        // it("when Systemd service can be enabled, enables it", () => {});
    });

    describe("SystemdRepository.startService()", () => {
        it("when starting a Systemd service, systemctl start command is executed", () => {
            const anyResolvedPromise = new Promise((resolve) => resolve());
            when(CommandLineMock, "executeAsync").thenReturn(
                anyResolvedPromise
            );
            when(SettingsMock, "shouldFilterSystemdUserServices").thenReturn(
                false
            );

            sut.startService("docker");

            expectMock(CommandLineMock, "executeAsync").toHaveBeenCalledWith(
                "systemctl start docker"
            );
        });

        it("when starting a Systemd user service, systemctl start --user command is executed", () => {
            const anyResolvedPromise = new Promise((resolve) => resolve());
            when(CommandLineMock, "executeAsync").thenReturn(
                anyResolvedPromise
            );
            when(SettingsMock, "shouldFilterSystemdUserServices").thenReturn(
                true
            );

            sut.startService("docker");

            expectMock(CommandLineMock, "executeAsync").toHaveBeenCalledWith(
                "systemctl start docker --user"
            );
        });

        // it("when Systemd service cannot be started, returns an error", () => {});

        // it("when Systemd service can be started, starts it", () => {});
    });

    describe("SystemdRepository.stopService()", () => {
        it("when starting a Systemd service, systemctl stop command is executed", () => {
            const anyResolvedPromise = new Promise((resolve) => resolve());
            when(CommandLineMock, "executeAsync").thenReturn(
                anyResolvedPromise
            );
            when(SettingsMock, "shouldFilterSystemdUserServices").thenReturn(
                false
            );

            sut.stopService("docker");

            expectMock(CommandLineMock, "executeAsync").toHaveBeenCalledWith(
                "systemctl stop docker"
            );
        });

        it("when starting a Systemd user service, systemctl stop --user command is executed", () => {
            const anyResolvedPromise = new Promise((resolve) => resolve());
            when(CommandLineMock, "executeAsync").thenReturn(
                anyResolvedPromise
            );
            when(SettingsMock, "shouldFilterSystemdUserServices").thenReturn(
                true
            );

            sut.stopService("docker");

            expectMock(CommandLineMock, "executeAsync").toHaveBeenCalledWith(
                "systemctl stop docker --user"
            );
        });

        // it("when Systemd service cannot be stopped, returns an error", () => {});

        // it("when Systemd service can be stopped, stops it", () => {});
    });

    describe("SystemdRepository.restartService()", () => {
        it("when restarting a Systemd service, systemctl restart command is executed", () => {
            const anyResolvedPromise = new Promise((resolve) => resolve());
            when(CommandLineMock, "executeAsync").thenReturn(
                anyResolvedPromise
            );
            when(SettingsMock, "shouldFilterSystemdUserServices").thenReturn(
                false
            );

            sut.restartService("docker");

            expectMock(CommandLineMock, "executeAsync").toHaveBeenCalledWith(
                "systemctl restart docker"
            );
        });

        it("when restarting a Systemd user service, systemctl restart --user command is executed", () => {
            const anyResolvedPromise = new Promise((resolve) => resolve());
            when(CommandLineMock, "executeAsync").thenReturn(
                anyResolvedPromise
            );
            when(SettingsMock, "shouldFilterSystemdUserServices").thenReturn(
                true
            );

            sut.restartService("docker");

            expectMock(CommandLineMock, "executeAsync").toHaveBeenCalledWith(
                "systemctl restart docker --user"
            );
        });

        // it("when Systemd service cannot be restarted, returns an error", () => {});

        // it("when Systemd service can be restarted, restarts it", () => {});
    });

    describe("SystemdRepository.disableService()", () => {
        it("when disabling a Systemd service, systemctl disable command is executed", () => {
            const anyResolvedPromise = new Promise((resolve) => resolve());
            when(CommandLineMock, "executeAsync").thenReturn(
                anyResolvedPromise
            );
            when(SettingsMock, "shouldFilterSystemdUserServices").thenReturn(
                false
            );

            sut.disableService("docker");

            expectMock(CommandLineMock, "executeAsync").toHaveBeenCalledWith(
                "systemctl disable docker"
            );
        });

        it("when disabling a Systemd user service, systemctl disable --user command is executed", () => {
            const anyResolvedPromise = new Promise((resolve) => resolve());
            when(CommandLineMock, "executeAsync").thenReturn(
                anyResolvedPromise
            );
            when(SettingsMock, "shouldFilterSystemdUserServices").thenReturn(
                true
            );

            sut.disableService("docker");

            expectMock(CommandLineMock, "executeAsync").toHaveBeenCalledWith(
                "systemctl disable docker --user"
            );
        });

        // it("when Systemd service cannot be disabled, returns an error", () => {});

        // it("when Systemd service can be disabled, disables it", () => {});
    });
}
