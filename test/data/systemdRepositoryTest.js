"use strict";

// Import dummy/fake Gjs implementations:
imports.searchPath.push("./test/util/fake");
const CommandLineMock = imports.misc.Me.imports.src.data.datasource.commandLine;
//const SettingsMock = imports.misc.Me.imports.src.data.settings;

const GjsMockito = imports.test.util.gjsMockito;
const when = GjsMockito.when;
const expectMock = GjsMockito.verify;

const sut = imports.src.data.systemdRepository;

/* exported testSuite */
function testSuite() {

    const ANY_PATH = "~/any/path/to/systemd";
    const NO_PATH = null;
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

    describe("SystemdRepository.isSystemdInstalled()", () => {
        it("when systemd program is found, returns true", () => {
            when(CommandLineMock, "find").thenReturn(ANY_PATH);

            const result = sut.isSystemdInstalled();

            expect(result).toBe(true);
        });

        it("when systemd program is not found, returns false", () => {
            when(CommandLineMock, "find").thenReturn(NO_PATH);

            const result = sut.isSystemdInstalled();

            expect(result).toBe(false);
        });
    });

    describe("SystemdRepository.getServices()", () => {
        it("when retrieving the systemd services, systemctl list is executed", () => {
            const anyResolvedPromise = new Promise((resolve) => resolve(ANY_SERVICES));
            when(CommandLineMock, "execute").thenReturn(anyResolvedPromise);

            sut.getServices();

            expectMock(CommandLineMock, "execute").toHaveBeenCalledWith("systemctl list-units --type=service --all");
        });

        // it("when no systemd service is found, returns an error", () => {});

        // it("when systemd services are found but cannot parse them, returns an error", () => {});

        // it("when systemd services are found, returns them sorted by running status and priority", () => {});
    });

    describe("SystemdRepository.parseServices()", () => {
        it("when pasing command execution result with systemd services, returns a list of services", () => {
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

        it("when pasing command execution result without systemd services, returns an empty list", () => {
            const result = sut.parseServices(NO_SERVICE);

            expect(result.length).toBe(0);
        });
    });

}
