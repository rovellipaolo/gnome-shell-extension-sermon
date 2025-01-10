import { jest, beforeEach, describe, expect, it } from "@jest/globals";

jest.unstable_mockModule("../../src/data/settings.js", () => ({
    default: {
        isSystemdSectionEnabled: jest.fn(),
        isCronSectionEnabled: jest.fn(),
        isDockerSectionEnabled: jest.fn(),
        isPodmanSectionEnabled: jest.fn(),
    },
}));
const SettingsMock = await import("../../src/data/settings.js");

jest.unstable_mockModule("../../src/data/cronRepository.js", () => ({
    getJobs: jest.fn(),
}));
const CronRepositoryMock = await import("../../src/data/cronRepository.js");

jest.unstable_mockModule("../../src/data/dockerRepository.js", () => ({
    getContainers: jest.fn(),
    startContainer: jest.fn(),
    stopContainer: jest.fn(),
    restartContainer: jest.fn(),
    removeContainer: jest.fn(),
}));
const DockerRepositoryMock = await import("../../src/data/dockerRepository.js");

jest.unstable_mockModule("../../src/data/podmanRepository.js", () => ({
    getContainers: jest.fn(),
    startContainer: jest.fn(),
    stopContainer: jest.fn(),
    restartContainer: jest.fn(),
    removeContainer: jest.fn(),
}));
const PodmanRepositoryMock = await import("../../src/data/podmanRepository.js");

jest.unstable_mockModule("../../src/data/systemdRepository.js", () => ({
    getServices: jest.fn(),
    isServiceRunning: jest.fn(),
    enableService: jest.fn(),
    startService: jest.fn(),
    restartService: jest.fn(),
    stopService: jest.fn(),
    disableService: jest.fn(),
}));
const SystemdRepositoryMock = await import(
    "../../src/data/systemdRepository.js"
);

jest.unstable_mockModule("../../src/util/log.js", () => ({
    d: () => {},
    e: () => {},
    i: () => {},
    w: () => {},
}));

jest.unstable_mockModule("../../src/presentation/iconFactory.js", () => ({
    buildFromName: jest.fn(),
    buildFromPath: jest.fn(),
}));
const IconFactoryMock = await import("../../src/presentation/iconFactory.js");

const Factories = await import("../../src/presentation/factories.js");

describe("Factories", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("buildActiveSections()", () => {
        it.each`
            isSystemdSectionEnabled | isCronSectionEnabled | isDockerSectionEnabled | isPodmanSectionEnabled | expected
            ${false}                | ${false}             | ${false}               | ${false}               | ${[]}
            ${true}                 | ${false}             | ${false}               | ${false}               | ${[Factories.SectionType.SYSTEMD]}
            ${false}                | ${true}              | ${false}               | ${false}               | ${[Factories.SectionType.CRON]}
            ${false}                | ${false}             | ${true}                | ${false}               | ${[Factories.SectionType.DOCKER]}
            ${false}                | ${false}             | ${false}               | ${true}                | ${[Factories.SectionType.PODMAN]}
            ${true}                 | ${true}              | ${false}               | ${false}               | ${[Factories.SectionType.SYSTEMD, Factories.SectionType.CRON]}
            ${true}                 | ${false}             | ${true}                | ${false}               | ${[Factories.SectionType.SYSTEMD, Factories.SectionType.DOCKER]}
            ${false}                | ${true}              | ${true}                | ${false}               | ${[Factories.SectionType.CRON, Factories.SectionType.DOCKER]}
            ${true}                 | ${true}              | ${true}                | ${false}               | ${[Factories.SectionType.SYSTEMD, Factories.SectionType.CRON, Factories.SectionType.DOCKER]}
            ${true}                 | ${true}              | ${true}                | ${true}                | ${[Factories.SectionType.SYSTEMD, Factories.SectionType.CRON, Factories.SectionType.DOCKER, Factories.SectionType.PODMAN]}
        `(
            "returns $expected.length section/s when those are enabled: $isSystemdSectionEnabled, $isCronSectionEnabled, $isDockerSectionEnabled, $isPodmanSectionEnabled",
            ({
                isSystemdSectionEnabled,
                isCronSectionEnabled,
                isDockerSectionEnabled,
                isPodmanSectionEnabled,
                expected,
            }) => {
                SettingsMock.default.isSystemdSectionEnabled.mockReturnValue(
                    isSystemdSectionEnabled,
                );
                SettingsMock.default.isCronSectionEnabled.mockReturnValue(
                    isCronSectionEnabled,
                );
                SettingsMock.default.isDockerSectionEnabled.mockReturnValue(
                    isDockerSectionEnabled,
                );
                SettingsMock.default.isPodmanSectionEnabled.mockReturnValue(
                    isPodmanSectionEnabled,
                );

                const result = Factories.buildActiveSections();

                expect(result).toEqual(expected);
            },
        );
    });

    describe("buildIcon()", () => {
        const IconMock = jest.fn();

        it.each`
            section                          | type                                | isFirst  | isLast   | expectedPath                 | expectedSize | expectedStyle
            ${Factories.SectionType.SYSTEMD} | ${Factories.IconType.STATUS_AREA}   | ${false} | ${false} | ${"images/systemd_icon.svg"} | ${"16"}      | ${"sermon-status-area-icon-middle"}
            ${Factories.SectionType.SYSTEMD} | ${Factories.IconType.STATUS_AREA}   | ${true}  | ${false} | ${"images/systemd_icon.svg"} | ${"16"}      | ${"sermon-status-area-icon-first"}
            ${Factories.SectionType.SYSTEMD} | ${Factories.IconType.STATUS_AREA}   | ${false} | ${true}  | ${"images/systemd_icon.svg"} | ${"16"}      | ${"sermon-status-area-icon-last"}
            ${Factories.SectionType.SYSTEMD} | ${Factories.IconType.STATUS_AREA}   | ${true}  | ${true}  | ${"images/systemd_icon.svg"} | ${"16"}      | ${""}
            ${Factories.SectionType.SYSTEMD} | ${Factories.IconType.SECTION_TITLE} | ${false} | ${false} | ${"images/systemd_icon.svg"} | ${"24"}      | ${""}
            ${Factories.SectionType.SYSTEMD} | ${Factories.IconType.SECTION_TITLE} | ${true}  | ${false} | ${"images/systemd_icon.svg"} | ${"24"}      | ${""}
            ${Factories.SectionType.SYSTEMD} | ${Factories.IconType.SECTION_TITLE} | ${false} | ${true}  | ${"images/systemd_icon.svg"} | ${"24"}      | ${""}
            ${Factories.SectionType.SYSTEMD} | ${Factories.IconType.SECTION_TITLE} | ${true}  | ${true}  | ${"images/systemd_icon.svg"} | ${"24"}      | ${""}
            ${Factories.SectionType.CRON}    | ${Factories.IconType.SECTION_TITLE} | ${true}  | ${true}  | ${"images/cron_icon.svg"}    | ${"24"}      | ${""}
            ${Factories.SectionType.DOCKER}  | ${Factories.IconType.SECTION_TITLE} | ${true}  | ${true}  | ${"images/docker_icon.svg"}  | ${"24"}      | ${""}
            ${Factories.SectionType.PODMAN}  | ${Factories.IconType.SECTION_TITLE} | ${true}  | ${true}  | ${"images/podman_icon.svg"}  | ${"24"}      | ${""}
            ${"unknown"}                     | ${Factories.IconType.SECTION_TITLE} | ${true}  | ${true}  | ${""}                        | ${"24"}      | ${""}
        `(
            "returns the correct icon when building section $section, $type, $isFirst and $isLast",
            ({
                section,
                type,
                isFirst,
                isLast,
                expectedPath,
                expectedSize,
                expectedStyle,
            }) => {
                IconFactoryMock.buildFromPath.mockReturnValue(IconMock);

                const result = Factories.buildIcon(
                    section,
                    type,
                    isFirst,
                    isLast,
                );

                expect(result).toBe(IconMock);
                expect(IconFactoryMock.buildFromPath).toHaveBeenCalledTimes(1);
                expect(IconFactoryMock.buildFromPath).toHaveBeenCalledWith(
                    expectedPath,
                    expectedSize,
                    expectedStyle,
                );
            },
        );
    });

    describe("buildGetItemsAction()", () => {
        it("returns a lambda executing the SystemdRepository.getServices() when building the Systemd get items action", async () => {
            const anyService = {
                id: "any-service.service",
                name: "any-service",
                isEnabled: true,
                canBeEnabled: true,
                isActive: true,
                isRunning: true,
            };
            SystemdRepositoryMock.getServices.mockResolvedValue([anyService]);

            const action = Factories.buildGetItemsAction(
                Factories.SectionType.SYSTEMD,
            );
            const result = await action();

            expect(result).toEqual([anyService]);
            expect(SystemdRepositoryMock.getServices).toHaveBeenCalledTimes(1);
        });

        it("returns a lambda executing the CronRepository.getJobs() when building the Cron get items action", async () => {
            const anyJob = { id: "0 * * * * any-job", isRunning: true };
            CronRepositoryMock.getJobs.mockResolvedValue([anyJob]);

            const action = Factories.buildGetItemsAction(
                Factories.SectionType.CRON,
            );
            const result = await action();

            expect(result).toEqual([anyJob]);
            expect(CronRepositoryMock.getJobs).toHaveBeenCalledTimes(1);
        });

        it("returns a lambda successfully executing the DockerRepository.getContainers() when building the Docker get items action and Docker is installed", async () => {
            const anyContainer = {
                id: "123456789000",
                names: ["any-container"],
                isEnabled: true,
                canBeEnabled: true,
                isRunning: true,
            };
            DockerRepositoryMock.getContainers.mockResolvedValue([
                anyContainer,
            ]);
            SystemdRepositoryMock.isServiceRunning.mockResolvedValue(true);

            const action = Factories.buildGetItemsAction(
                Factories.SectionType.DOCKER,
            );
            const result = await action();

            expect(result).toEqual([anyContainer]);
            expect(DockerRepositoryMock.getContainers).toHaveBeenCalledTimes(1);
            expect(
                SystemdRepositoryMock.isServiceRunning,
            ).toHaveBeenCalledTimes(1);
            expect(SystemdRepositoryMock.isServiceRunning).toHaveBeenCalledWith(
                "docker.service",
            );
        });

        it("returns a lambda successfully executing the DockerRepository.getContainers() when building the Docker get items action and Docker is not installed but DockerDesktop is", async () => {
            const anyContainer = {
                id: "123456789000",
                names: ["any-container"],
                isEnabled: true,
                canBeEnabled: true,
                isRunning: true,
            };
            DockerRepositoryMock.getContainers.mockResolvedValue([
                anyContainer,
            ]);
            SystemdRepositoryMock.isServiceRunning
                .mockResolvedValueOnce(false)
                .mockResolvedValueOnce(true);

            const action = Factories.buildGetItemsAction(
                Factories.SectionType.DOCKER,
            );
            const result = await action();

            expect(result).toEqual([anyContainer]);
            expect(DockerRepositoryMock.getContainers).toHaveBeenCalledTimes(1);
            expect(
                SystemdRepositoryMock.isServiceRunning,
            ).toHaveBeenCalledTimes(2);
            expect(
                SystemdRepositoryMock.isServiceRunning,
            ).toHaveBeenNthCalledWith(1, "docker.service");
            expect(
                SystemdRepositoryMock.isServiceRunning,
            ).toHaveBeenNthCalledWith(2, "docker-desktop.service", true);
        });

        it("returns a lambda throwing an error when building the Docker get items action and neither Docker nor DockerDesktop are installed", async () => {
            SystemdRepositoryMock.isServiceRunning.mockResolvedValue(false);

            const action = Factories.buildGetItemsAction(
                Factories.SectionType.DOCKER,
            );
            await expect(action()).rejects.toThrow(
                new Error("Docker is not running!"),
            );

            expect(DockerRepositoryMock.getContainers).toHaveBeenCalledTimes(0);
            expect(
                SystemdRepositoryMock.isServiceRunning,
            ).toHaveBeenCalledTimes(2);
            expect(
                SystemdRepositoryMock.isServiceRunning,
            ).toHaveBeenNthCalledWith(1, "docker.service");
            expect(
                SystemdRepositoryMock.isServiceRunning,
            ).toHaveBeenNthCalledWith(2, "docker-desktop.service", true);
        });

        it("returns a lambda successfully executing the PodmanRepository.getContainers() when building the Podman get items action and Podman is installed", async () => {
            const anyContainer = {
                id: "123456789000",
                names: ["any-container"],
                isEnabled: true,
                canBeEnabled: true,
                isRunning: true,
            };
            PodmanRepositoryMock.getContainers.mockResolvedValue([
                anyContainer,
            ]);
            SystemdRepositoryMock.isServiceRunning.mockResolvedValue(true);

            const action = Factories.buildGetItemsAction(
                Factories.SectionType.PODMAN,
            );
            const result = await action();

            expect(result).toEqual([anyContainer]);
            expect(PodmanRepositoryMock.getContainers).toHaveBeenCalledTimes(1);
            expect(
                SystemdRepositoryMock.isServiceRunning,
            ).toHaveBeenCalledTimes(1);
            expect(SystemdRepositoryMock.isServiceRunning).toHaveBeenCalledWith(
                "podman.service",
            );
        });

        it("returns a lambda throwing an error when building the Podman get items action and Podman is not installed", async () => {
            SystemdRepositoryMock.isServiceRunning.mockResolvedValue(false);

            const action = Factories.buildGetItemsAction(
                Factories.SectionType.PODMAN,
            );
            await expect(action()).rejects.toThrow(
                new Error("Podman is not running!"),
            );

            expect(PodmanRepositoryMock.getContainers).toHaveBeenCalledTimes(0);
        });

        it("returns an empty lambda when building an unknown get items action", () => {
            const action = Factories.buildGetItemsAction("unknown");
            action();

            expect(SystemdRepositoryMock.getServices).toHaveBeenCalledTimes(0);
            expect(CronRepositoryMock.getJobs).toHaveBeenCalledTimes(0);
            expect(DockerRepositoryMock.getContainers).toHaveBeenCalledTimes(0);
            expect(PodmanRepositoryMock.getContainers).toHaveBeenCalledTimes(0);
        });
    });

    describe("buildItemLabel()", () => {
        it.each`
            section                          | item                                                       | expected
            ${Factories.SectionType.SYSTEMD} | ${{ id: "any-id", name: "any-name" }}                      | ${"any-name"}
            ${Factories.SectionType.CRON}    | ${{ id: "any-id", name: "any-name" }}                      | ${"any-id"}
            ${Factories.SectionType.DOCKER}  | ${{ id: "any-id", names: [] }}                             | ${"- (any-id)"}
            ${Factories.SectionType.DOCKER}  | ${{ id: "any-id", names: ["any-name"] }}                   | ${"any-name (any-id)"}
            ${Factories.SectionType.DOCKER}  | ${{ id: "any-id", names: ["any-name", "any-other-name"] }} | ${"any-name (any-id)"}
            ${Factories.SectionType.PODMAN}  | ${{ id: "any-id", names: [] }}                             | ${"- (any-id)"}
            ${Factories.SectionType.PODMAN}  | ${{ id: "any-id", names: ["any-name"] }}                   | ${"any-name (any-id)"}
            ${Factories.SectionType.PODMAN}  | ${{ id: "any-id", names: ["any-name", "any-other-name"] }} | ${"any-name (any-id)"}
            ${"unknown"}                     | ${{ id: "any-id", name: "any-name" }}                      | ${""}
        `(
            "returns the correct item label when building $section $item section",
            ({ section, item, expected }) => {
                const result = Factories.buildItemLabel(section, item);

                expect(result).toBe(expected);
            },
        );
    });

    describe("buildItemActionTypes()", () => {
        it.each`
            isEnabled | running  | canBeEnabled | expected
            ${false}  | ${false} | ${undefined} | ${[]}
            ${false}  | ${false} | ${false}     | ${[]}
            ${false}  | ${false} | ${true}      | ${[Factories.ActionType.ADD]}
            ${false}  | ${true}  | ${undefined} | ${[]}
            ${false}  | ${true}  | ${false}     | ${[]}
            ${false}  | ${true}  | ${true}      | ${[Factories.ActionType.ADD]}
            ${true}   | ${false} | ${undefined} | ${[Factories.ActionType.START]}
            ${true}   | ${false} | ${false}     | ${[Factories.ActionType.START]}
            ${true}   | ${false} | ${true}      | ${[Factories.ActionType.START, Factories.ActionType.REMOVE]}
            ${true}   | ${true}  | ${undefined} | ${[Factories.ActionType.STOP, Factories.ActionType.RESTART]}
            ${true}   | ${true}  | ${false}     | ${[Factories.ActionType.STOP, Factories.ActionType.RESTART]}
            ${true}   | ${true}  | ${true}      | ${[Factories.ActionType.STOP, Factories.ActionType.RESTART]}
        `(
            "returns the correct item action type when building item $isEnabled, $running and $canBeEnabled",
            ({ isEnabled, running, canBeEnabled, expected }) => {
                const result = Factories.buildItemActionTypes(
                    isEnabled,
                    running,
                    canBeEnabled,
                );

                expect(result).toEqual(expected);
            },
        );
    });

    describe("buildItemActionIcon()", () => {
        const IconMock = jest.fn();

        it.each`
            action                          | expectedName
            ${Factories.ActionType.ADD}     | ${"list-add-symbolic"}
            ${Factories.ActionType.START}   | ${"media-playback-start-symbolic"}
            ${Factories.ActionType.STOP}    | ${"media-playback-pause-symbolic"}
            ${Factories.ActionType.RESTART} | ${"view-refresh-symbolic"}
            ${Factories.ActionType.REMOVE}  | ${"edit-delete-symbolic"}
            ${"unknown"}                    | ${""}
        `(
            "returns the correct item action icon when building $action action",
            ({ action, expectedName }) => {
                IconFactoryMock.buildFromName.mockReturnValue(IconMock);

                const result = Factories.buildItemActionIcon(action);

                expect(result).toBe(IconMock);
                expect(IconFactoryMock.buildFromName).toHaveBeenCalledTimes(1);
                expect(IconFactoryMock.buildFromName).toHaveBeenCalledWith(
                    expectedName,
                    "12",
                );
            },
        );
    });

    describe("buildItemAction()", () => {
        const ActorMock = jest.fn();

        it.each`
            section                         | action
            ${Factories.SectionType.CRON}   | ${Factories.ActionType.ADD}
            ${Factories.SectionType.CRON}   | ${Factories.ActionType.START}
            ${Factories.SectionType.CRON}   | ${Factories.ActionType.STOP}
            ${Factories.SectionType.CRON}   | ${Factories.ActionType.RESTART}
            ${Factories.SectionType.CRON}   | ${Factories.ActionType.REMOVE}
            ${Factories.SectionType.CRON}   | ${"unknown"}
            ${Factories.SectionType.DOCKER} | ${Factories.ActionType.ADD}
            ${Factories.SectionType.DOCKER} | ${"unknown"}
            ${Factories.SectionType.PODMAN} | ${Factories.ActionType.ADD}
            ${Factories.SectionType.PODMAN} | ${"unknown"}
            ${"unknown"}                    | ${Factories.ActionType.ADD}
            ${"unknown"}                    | ${Factories.ActionType.START}
            ${"unknown"}                    | ${Factories.ActionType.STOP}
            ${"unknown"}                    | ${Factories.ActionType.RESTART}
            ${"unknown"}                    | ${Factories.ActionType.RMOVE}
            ${"unknown"}                    | ${"unknown"}
        `(
            "returns no item action when building $section $action section",
            ({ section, action }) => {
                const result = Factories.buildItemAction(section, action);

                expect(result).toBe(null);
            },
        );

        it("returns the correct item action when building Systemd add action", async () => {
            SystemdRepositoryMock.enableService.mockResolvedValue();

            const action = Factories.buildItemAction(
                Factories.SectionType.SYSTEMD,
                Factories.ActionType.ADD,
            );
            await action(ActorMock, null);

            expect(SystemdRepositoryMock.enableService).toHaveBeenCalledTimes(
                1,
            );
            expect(SystemdRepositoryMock.enableService).toHaveBeenCalledWith(
                ActorMock,
            );
        });

        it("returns the correct item action when building Systemd start action", async () => {
            SystemdRepositoryMock.startService.mockResolvedValue();

            const action = Factories.buildItemAction(
                Factories.SectionType.SYSTEMD,
                Factories.ActionType.START,
            );
            await action(ActorMock, null);

            expect(SystemdRepositoryMock.startService).toHaveBeenCalledTimes(1);
            expect(SystemdRepositoryMock.startService).toHaveBeenCalledWith(
                ActorMock,
            );
        });

        it("returns the correct item action when building Systemd stop action", async () => {
            SystemdRepositoryMock.stopService.mockResolvedValue();

            const action = Factories.buildItemAction(
                Factories.SectionType.SYSTEMD,
                Factories.ActionType.STOP,
            );
            await action(ActorMock, null);

            expect(SystemdRepositoryMock.stopService).toHaveBeenCalledTimes(1);
            expect(SystemdRepositoryMock.stopService).toHaveBeenCalledWith(
                ActorMock,
            );
        });

        it("returns the correct item action when building Systemd restart action", async () => {
            SystemdRepositoryMock.restartService.mockResolvedValue();

            const action = Factories.buildItemAction(
                Factories.SectionType.SYSTEMD,
                Factories.ActionType.RESTART,
            );
            await action(ActorMock, null);

            expect(SystemdRepositoryMock.restartService).toHaveBeenCalledTimes(
                1,
            );
            expect(SystemdRepositoryMock.restartService).toHaveBeenCalledWith(
                ActorMock,
            );
        });

        it("returns the correct item action when building Systemd remove action", async () => {
            SystemdRepositoryMock.disableService.mockResolvedValue();

            const action = Factories.buildItemAction(
                Factories.SectionType.SYSTEMD,
                Factories.ActionType.REMOVE,
            );
            await action(ActorMock, null);

            expect(SystemdRepositoryMock.disableService).toHaveBeenCalledTimes(
                1,
            );
            expect(SystemdRepositoryMock.disableService).toHaveBeenCalledWith(
                ActorMock,
            );
        });

        it("returns the correct item action when building Docker start action", async () => {
            DockerRepositoryMock.startContainer.mockResolvedValue();

            const action = Factories.buildItemAction(
                Factories.SectionType.DOCKER,
                Factories.ActionType.START,
            );
            await action(ActorMock, null);

            expect(DockerRepositoryMock.startContainer).toHaveBeenCalledTimes(
                1,
            );
            expect(DockerRepositoryMock.startContainer).toHaveBeenCalledWith(
                ActorMock,
            );
        });

        it("returns the correct item action when building Docker stop action", async () => {
            DockerRepositoryMock.stopContainer.mockResolvedValue();

            const action = Factories.buildItemAction(
                Factories.SectionType.DOCKER,
                Factories.ActionType.STOP,
            );
            await action(ActorMock, null);

            expect(DockerRepositoryMock.stopContainer).toHaveBeenCalledTimes(1);
            expect(DockerRepositoryMock.stopContainer).toHaveBeenCalledWith(
                ActorMock,
            );
        });

        it("returns the correct item action when building Docker restart action", async () => {
            DockerRepositoryMock.restartContainer.mockResolvedValue();

            const action = Factories.buildItemAction(
                Factories.SectionType.DOCKER,
                Factories.ActionType.RESTART,
            );
            await action(ActorMock, null);

            expect(DockerRepositoryMock.restartContainer).toHaveBeenCalledTimes(
                1,
            );
            expect(DockerRepositoryMock.restartContainer).toHaveBeenCalledWith(
                ActorMock,
            );
        });

        it("returns the correct item action when building Docker remove action", async () => {
            DockerRepositoryMock.removeContainer.mockResolvedValue();

            const action = Factories.buildItemAction(
                Factories.SectionType.DOCKER,
                Factories.ActionType.REMOVE,
            );
            await action(ActorMock, null);

            expect(DockerRepositoryMock.removeContainer).toHaveBeenCalledTimes(
                1,
            );
            expect(DockerRepositoryMock.removeContainer).toHaveBeenCalledWith(
                ActorMock,
            );
        });

        it("returns the correct item action when building Podman start action", async () => {
            PodmanRepositoryMock.startContainer.mockResolvedValue();

            const action = Factories.buildItemAction(
                Factories.SectionType.PODMAN,
                Factories.ActionType.START,
            );
            await action(ActorMock, null);

            expect(PodmanRepositoryMock.startContainer).toHaveBeenCalledTimes(
                1,
            );
            expect(PodmanRepositoryMock.startContainer).toHaveBeenCalledWith(
                ActorMock,
            );
        });

        it("returns the correct item action when building Podman stop action", async () => {
            PodmanRepositoryMock.stopContainer.mockResolvedValue();

            const action = Factories.buildItemAction(
                Factories.SectionType.PODMAN,
                Factories.ActionType.STOP,
            );
            await action(ActorMock, null);

            expect(PodmanRepositoryMock.stopContainer).toHaveBeenCalledTimes(1);
            expect(PodmanRepositoryMock.stopContainer).toHaveBeenCalledWith(
                ActorMock,
            );
        });

        it("returns the correct item action when building Podman restart action", async () => {
            PodmanRepositoryMock.restartContainer.mockResolvedValue();

            const action = Factories.buildItemAction(
                Factories.SectionType.PODMAN,
                Factories.ActionType.RESTART,
            );
            await action(ActorMock, null);

            expect(PodmanRepositoryMock.restartContainer).toHaveBeenCalledTimes(
                1,
            );
            expect(PodmanRepositoryMock.restartContainer).toHaveBeenCalledWith(
                ActorMock,
            );
        });

        it("returns the correct item action when building Podman remove action", async () => {
            PodmanRepositoryMock.removeContainer.mockResolvedValue();

            const action = Factories.buildItemAction(
                Factories.SectionType.PODMAN,
                Factories.ActionType.REMOVE,
            );
            await action(ActorMock, null);

            expect(PodmanRepositoryMock.removeContainer).toHaveBeenCalledTimes(
                1,
            );
            expect(PodmanRepositoryMock.removeContainer).toHaveBeenCalledWith(
                ActorMock,
            );
        });
    });
});
