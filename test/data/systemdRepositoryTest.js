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
    const ANY_VERSION = "systemd 237\n" +
        "+PAM +AUDIT +SELINUX +IMA +APPARMOR +SMACK +SYSVINIT +UTMP +LIBCRYPTSETUP +GCRYPT +GNUTLS" +
        "+ACL +XZ +LZ4 +SECCOMP +BLKID +ELFUTILS +KMOD -IDN2 +IDN -PCRE2 default-hierarchy=hybrid";
    const ANY_IS_RUNNING_STATUS = "running";
    const ANY_IS_ACTIVE_STATUS = "active";
    const ANY_SERVICES = 
        "UNIT                                                                                      LOAD   ACTIVE SUB     DESCRIPTION\n" +
        "apparmor.service                                                                          loaded    active   exited  AppArmor initialization\n" +
        "cron.service                                                                              loaded    active   running Regular background program processing daemon\n" +
        "docker.service                                                                            loaded    active   running Docker Application Container Engine\n" +
        "lxc.service                                                                               not-found inactive dead    lxc.service\n" +
        "rsync.service                                                                             loaded    inactive dead    fast remote file copy program daemon\n" +
        "\n" +
        "LOAD   = Reflects whether the unit definition was properly loaded.\n" +
        "ACTIVE = The high-level unit activation state, i.e. generalization of SUB.\n" +
        "SUB    = The low-level unit activation state, values depend on unit type.\n" +
        "\n" +
        "5 loaded units listed.\n" +
        "To show all installed unit files use 'systemctl list-unit-files'.";
    const NO_SERVICE = "UNIT                                                                                      LOAD   ACTIVE SUB     DESCRIPTION\n" +
    "\n" +
    "LOAD   = Reflects whether the unit definition was properly loaded.\n" +
    "ACTIVE = The high-level unit activation state, i.e. generalization of SUB.\n" +
    "SUB    = The low-level unit activation state, values depend on unit type.\n" +
    "\n" +
    "0 loaded units listed.\n" +
    "To show all installed unit files use 'systemctl list-unit-files'.";

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

    describe("SystemdRepository.getVersion()", () => {
        it("when retrieving the Systemd version, systemctl version command is executed", () => {
            const anyResolvedPromise = new Promise((resolve) => resolve(ANY_VERSION));
            when(CommandLineMock, "execute").thenReturn(anyResolvedPromise);

            sut.getVersion();

            expectMock(CommandLineMock, "execute").toHaveBeenCalledWith("systemctl --version");
        });

        // it("when no systemd version is found, returns an error", () => {});

        // it("when systemd version is found, returns it", () => {});
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
            const result = sut.parseServices(ANY_SERVICES);

            expect(result.length).toBe(5);
            expect(result[0].id).toBe("apparmor.service");
            expect(result[0].isActive).toBe(true);
            expect(result[0].isRunning).toBe(false);
            expect(result[0].name).toBe("apparmor");
            expect(result[1].id).toBe("cron.service");
            expect(result[1].isActive).toBe(true);
            expect(result[1].isRunning).toBe(true);
            expect(result[1].name).toBe("cron");
            expect(result[2].id).toBe("docker.service");
            expect(result[2].isActive).toBe(true);
            expect(result[2].isRunning).toBe(true);
            expect(result[2].name).toBe("docker");
            expect(result[3].id).toBe("lxc.service");
            expect(result[3].isActive).toBe(false);
            expect(result[3].isRunning).toBe(false);
            expect(result[3].name).toBe("lxc");
            expect(result[4].id).toBe("rsync.service");
            expect(result[4].isActive).toBe(false);
            expect(result[4].isRunning).toBe(false);
            expect(result[4].name).toBe("rsync");
        });

        it("when pasing command execution result without Systemd services, returns an empty list", () => {
            const result = sut.parseServices(NO_SERVICE);

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

        // it("when Systemd services cannot be started, returns an error", () => {});

        // it("when Systemd services can be started, starts it", () => {});
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

        // it("when Systemd services cannot be stopped, returns an error", () => {});

        // it("when Systemd services can be stopped, stops it", () => {});
    });

}
