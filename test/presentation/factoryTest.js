"use strict";

// Import dummy/fake Gjs implementations:
imports.searchPath.push("./test/util/fake");
const SettingsMock = imports.misc.Me.imports.src.data.settings;
const CronRepositoryMock = imports.misc.Me.imports.src.data.cronRepository;
const DockerRepositoryMock = imports.misc.Me.imports.src.data.dockerRepository;
const PodmanRepositoryMock = imports.misc.Me.imports.src.data.podmanRepository;
const SystemdRepositoryMock =
    imports.misc.Me.imports.src.data.systemdRepository;
const IconFactoryMock = imports.misc.Me.imports.src.presentation.iconFactory;

const GjsMockito = imports.test.util.gjsMockito;
const mock = GjsMockito.mock;
const when = GjsMockito.when;
const expectMock = GjsMockito.verify;

const sut = imports.src.presentation.factories;

/* exported testSuite */
function testSuite() {
    const ANY_PROMISE = new Promise((resolve, _) => resolve());

    describe("Factory.buildActiveSections()", () => {
        it("when no section is enabled, no one is returned", () => {
            when(SettingsMock, "isSystemdSectionEnabled").thenReturn(false);
            when(SettingsMock, "isCronSectionEnabled").thenReturn(false);
            when(SettingsMock, "isDockerSectionEnabled").thenReturn(false);
            when(SettingsMock, "isPodmanSectionEnabled").thenReturn(false);

            const result = sut.buildActiveSections();

            expect(result.length).toEqual(0);
        });

        it("when only one section is enabled, only this one is returned", () => {
            when(SettingsMock, "isSystemdSectionEnabled").thenReturn(true);
            when(SettingsMock, "isCronSectionEnabled").thenReturn(false);
            when(SettingsMock, "isDockerSectionEnabled").thenReturn(false);
            when(SettingsMock, "isPodmanSectionEnabled").thenReturn(false);

            const result = sut.buildActiveSections();

            expect(result.length).toEqual(1);
            expect(result[0]).toEqual(sut.SectionType.SYSTEMD);
        });

        it("when all the sections are enabled, all of them are returned", () => {
            when(SettingsMock, "isSystemdSectionEnabled").thenReturn(true);
            when(SettingsMock, "isCronSectionEnabled").thenReturn(true);
            when(SettingsMock, "isDockerSectionEnabled").thenReturn(true);
            when(SettingsMock, "isPodmanSectionEnabled").thenReturn(true);

            const result = sut.buildActiveSections();

            expect(result.length).toEqual(4);
            expect(result[0]).toEqual(sut.SectionType.SYSTEMD);
            expect(result[1]).toEqual(sut.SectionType.CRON);
            expect(result[2]).toEqual(sut.SectionType.DOCKER);
            expect(result[3]).toEqual(sut.SectionType.PODMAN);
        });
    });

    describe("Factory.buildIcon()", () => {
        const iconMock = mock("St.Icon");

        it("when building the Systemd icon for the status area, this is built correctly", () => {
            when(IconFactoryMock, "buildFromPath").thenReturn(iconMock);

            sut.buildIcon(
                sut.SectionType.SYSTEMD,
                sut.IconType.STATUS_AREA,
                true,
                true
            );

            expectMock(IconFactoryMock, "buildFromPath").toHaveBeenCalledWith(
                "/images/systemd_icon.svg",
                "16",
                ""
            );
        });

        it("when building the Cron icon for the status area, this is built correctly", () => {
            when(IconFactoryMock, "buildFromPath").thenReturn(iconMock);

            sut.buildIcon(
                sut.SectionType.CRON,
                sut.IconType.STATUS_AREA,
                true,
                true
            );

            expectMock(IconFactoryMock, "buildFromPath").toHaveBeenCalledWith(
                "/images/cron_icon.svg",
                "16",
                ""
            );
        });

        it("when building the Docker icon for the status area, this is built correctly", () => {
            when(IconFactoryMock, "buildFromPath").thenReturn(iconMock);

            sut.buildIcon(
                sut.SectionType.DOCKER,
                sut.IconType.STATUS_AREA,
                true,
                true
            );

            expectMock(IconFactoryMock, "buildFromPath").toHaveBeenCalledWith(
                "/images/docker_icon.svg",
                "16",
                ""
            );
        });

        it("when building the Podman icon for the status area, this is built correctly", () => {
            when(IconFactoryMock, "buildFromPath").thenReturn(iconMock);

            sut.buildIcon(
                sut.SectionType.PODMAN,
                sut.IconType.STATUS_AREA,
                true,
                true
            );

            expectMock(IconFactoryMock, "buildFromPath").toHaveBeenCalledWith(
                "/images/podman_icon.svg",
                "16",
                ""
            );
        });

        it("when building any icon for the section title, this is built correctly", () => {
            when(IconFactoryMock, "buildFromPath").thenReturn(iconMock);

            sut.buildIcon(
                sut.SectionType.SYSTEMD,
                sut.IconType.SECTION_TITLE,
                true,
                true
            );

            expectMock(IconFactoryMock, "buildFromPath").toHaveBeenCalledWith(
                "/images/systemd_icon.svg",
                "24",
                ""
            );
        });

        it("when there are more icons and building the first one, this is built correctly", () => {
            when(IconFactoryMock, "buildFromPath").thenReturn(iconMock);

            sut.buildIcon(
                sut.SectionType.SYSTEMD,
                sut.IconType.STATUS_AREA,
                true,
                false
            );

            expectMock(IconFactoryMock, "buildFromPath").toHaveBeenCalledWith(
                "/images/systemd_icon.svg",
                "16",
                "sermon-status-area-icon-first"
            );
        });

        it("when there are more icons and building the middle one, this is built correctly", () => {
            when(IconFactoryMock, "buildFromPath").thenReturn(iconMock);

            sut.buildIcon(
                sut.SectionType.SYSTEMD,
                sut.IconType.STATUS_AREA,
                false,
                false
            );

            expectMock(IconFactoryMock, "buildFromPath").toHaveBeenCalledWith(
                "/images/systemd_icon.svg",
                "16",
                "sermon-status-area-icon-middle"
            );
        });

        it("when there are more icons and building the last one, this is built correctly", () => {
            when(IconFactoryMock, "buildFromPath").thenReturn(iconMock);

            sut.buildIcon(
                sut.SectionType.SYSTEMD,
                sut.IconType.STATUS_AREA,
                false,
                true
            );

            expectMock(IconFactoryMock, "buildFromPath").toHaveBeenCalledWith(
                "/images/systemd_icon.svg",
                "16",
                "sermon-status-area-icon-last"
            );
        });
    });

    describe("Factory.buildGetItemsAction()", () => {
        it("when building the action for retieving Systemd items and this is executed, the SystemdRepository getServices is called", () => {
            when(SystemdRepositoryMock, "getServices").thenReturn(ANY_PROMISE);

            const result = sut.buildGetItemsAction(sut.SectionType.SYSTEMD);
            result();

            expectMock(SystemdRepositoryMock, "getServices").toHaveBeenCalled();
        });

        it("when building the action for retieving Cron items and this is executed, the CronRepository getJobs is called", () => {
            when(CronRepositoryMock, "getJobs").thenReturn(ANY_PROMISE);

            const result = sut.buildGetItemsAction(sut.SectionType.CRON);
            result();

            expectMock(CronRepositoryMock, "getJobs").toHaveBeenCalled();
        });

        it("when building the action for retieving Docker items and this is executed, the DockerRepository getContainers is called", () => {
            when(DockerRepositoryMock, "getContainers").thenReturn(ANY_PROMISE);

            const result = sut.buildGetItemsAction(sut.SectionType.DOCKER);
            result();

            expectMock(
                DockerRepositoryMock,
                "getContainers"
            ).toHaveBeenCalled();
        });

        it("when building the action for retieving Podman items and this is executed, the PodmanRepository getContainers is called", () => {
            when(PodmanRepositoryMock, "getContainers").thenReturn(ANY_PROMISE);

            const result = sut.buildGetItemsAction(sut.SectionType.PODMAN);
            result();

            expectMock(
                PodmanRepositoryMock,
                "getContainers"
            ).toHaveBeenCalled();
        });
    });

    describe("Factory.buildItemLabel()", () => {
        const ANY_ID = "any-id";
        const ANY_NAME = "any-name";
        const ANY_OTHER_NAME = "any-other-name";

        it("when building the label for a Systemd item, this is built correctly", () => {
            const anyItem = { name: ANY_NAME };

            const result = sut.buildItemLabel(sut.SectionType.SYSTEMD, anyItem);

            expect(result).toEqual(ANY_NAME);
        });

        it("when building the label for a Cron item, this is built correctly", () => {
            const anyItem = { id: ANY_ID };

            const result = sut.buildItemLabel(sut.SectionType.CRON, anyItem);

            expect(result).toEqual(ANY_ID);
        });

        it("when building the label for a Docker item no name, this is built correctly", () => {
            const anyItem = { id: ANY_ID, names: [] };

            const result = sut.buildItemLabel(sut.SectionType.DOCKER, anyItem);

            expect(result).toEqual(`- (${ANY_ID})`);
        });

        it("when building the label for a Docker item with a name, this is built correctly", () => {
            const anyItem = { id: ANY_ID, names: [ANY_NAME, ANY_OTHER_NAME] };

            const result = sut.buildItemLabel(sut.SectionType.DOCKER, anyItem);

            expect(result).toEqual(`${ANY_NAME} (${ANY_ID})`);
        });

        it("when building the label for a Podman item no name, this is built correctly", () => {
            const anyItem = { id: ANY_ID, names: [] };

            const result = sut.buildItemLabel(sut.SectionType.PODMAN, anyItem);

            expect(result).toEqual(`- (${ANY_ID})`);
        });

        it("when building the label for a Podman item with a name, this is built correctly", () => {
            const anyItem = { id: ANY_ID, names: [ANY_NAME, ANY_OTHER_NAME] };

            const result = sut.buildItemLabel(sut.SectionType.PODMAN, anyItem);

            expect(result).toEqual(`${ANY_NAME} (${ANY_ID})`);
        });
    });

    describe("Factory.buildItemActionTypes()", () => {
        it("when building the action types for an enabled and running item, the stop and restart actions are returned", () => {
            const result = sut.buildItemActionTypes(true, true, false);

            expect(result.length).toEqual(2);
            expect(result[0]).toEqual(sut.ActionType.STOP);
            expect(result[1]).toEqual(sut.ActionType.RESTART);
        });

        it("when building the action types for an enabled but non-running item that can be enabled, the start and remove actions are returned", () => {
            const result = sut.buildItemActionTypes(true, false, true);

            expect(result.length).toEqual(2);
            expect(result[0]).toEqual(sut.ActionType.START);
            expect(result[1]).toEqual(sut.ActionType.REMOVE);
        });

        it("when building the action types for an enabled but non-running item that cannot be enabled, the start and remove actions are returned", () => {
            const result = sut.buildItemActionTypes(true, false, false);

            expect(result.length).toEqual(1);
            expect(result[0]).toEqual(sut.ActionType.START);
        });

        it("when building the action types for a non-enabled item that can be enabled, the add action is returned", () => {
            const result = sut.buildItemActionTypes(false, false, true);

            expect(result.length).toEqual(1);
            expect(result[0]).toEqual(sut.ActionType.ADD);
        });

        it("when building the action types for a non-enabled item that cannot be enabled, no action is returned", () => {
            const result = sut.buildItemActionTypes(false, false, false);

            expect(result.length).toEqual(0);
        });
    });

    describe("Factory.buildItemActionIcon()", () => {
        const iconMock = mock("St.Icon");
        when(IconFactoryMock, "buildFromName").thenReturn(iconMock);

        it("when building the add action icon, this is built correctly", () => {
            sut.buildItemActionIcon(sut.ActionType.ADD);

            expectMock(IconFactoryMock, "buildFromName").toHaveBeenCalledWith(
                "list-add-symbolic",
                "12"
            );
        });

        it("when building the start action icon, this is built correctly", () => {
            sut.buildItemActionIcon(sut.ActionType.START);

            expectMock(IconFactoryMock, "buildFromName").toHaveBeenCalledWith(
                "media-playback-start-symbolic",
                "12"
            );
        });

        it("when building the stop action icon, this is built correctly", () => {
            sut.buildItemActionIcon(sut.ActionType.STOP);

            expectMock(IconFactoryMock, "buildFromName").toHaveBeenCalledWith(
                "media-playback-pause-symbolic",
                "12"
            );
        });

        it("when building the restart action icon, this is built correctly", () => {
            sut.buildItemActionIcon(sut.ActionType.RESTART);

            expectMock(IconFactoryMock, "buildFromName").toHaveBeenCalledWith(
                "view-refresh-symbolic",
                "12"
            );
        });

        it("when building the remove action icon, this is built correctly", () => {
            sut.buildItemActionIcon(sut.ActionType.REMOVE);

            expectMock(IconFactoryMock, "buildFromName").toHaveBeenCalledWith(
                "edit-delete-symbolic",
                "12"
            );
        });
    });

    describe("Factory.buildItemAction()", () => {
        const ANY_ACTOR = mock("Actor");

        it("when building the add action for a Systemd item and this is executed, the SystemdRepository enableService is called", () => {
            when(SystemdRepositoryMock, "enableService").thenReturn(
                ANY_PROMISE
            );

            const result = sut.buildItemAction(
                sut.SectionType.SYSTEMD,
                sut.ActionType.ADD
            );
            result(ANY_ACTOR);

            expectMock(
                SystemdRepositoryMock,
                "enableService"
            ).toHaveBeenCalledWith(ANY_ACTOR);
        });

        it("when building the start action for a Systemd item and this is executed, the SystemdRepository startService is called", () => {
            when(SystemdRepositoryMock, "startService").thenReturn(ANY_PROMISE);

            const result = sut.buildItemAction(
                sut.SectionType.SYSTEMD,
                sut.ActionType.START
            );
            result(ANY_ACTOR);

            expectMock(
                SystemdRepositoryMock,
                "startService"
            ).toHaveBeenCalledWith(ANY_ACTOR);
        });

        it("when building the stop action for a Systemd item and this is executed, the SystemdRepository stopService is called", () => {
            when(SystemdRepositoryMock, "stopService").thenReturn(ANY_PROMISE);

            const result = sut.buildItemAction(
                sut.SectionType.SYSTEMD,
                sut.ActionType.STOP
            );
            result(ANY_ACTOR);

            expectMock(
                SystemdRepositoryMock,
                "stopService"
            ).toHaveBeenCalledWith(ANY_ACTOR);
        });

        it("when building the restart action for a Systemd item and this is executed, the SystemdRepository restartService is called", () => {
            when(SystemdRepositoryMock, "restartService").thenReturn(
                ANY_PROMISE
            );

            const result = sut.buildItemAction(
                sut.SectionType.SYSTEMD,
                sut.ActionType.RESTART
            );
            result(ANY_ACTOR);

            expectMock(
                SystemdRepositoryMock,
                "restartService"
            ).toHaveBeenCalledWith(ANY_ACTOR);
        });

        it("when building the remove action for a Systemd item and this is executed, the SystemdRepository disableService is called", () => {
            when(SystemdRepositoryMock, "disableService").thenReturn(
                ANY_PROMISE
            );

            const result = sut.buildItemAction(
                sut.SectionType.SYSTEMD,
                sut.ActionType.REMOVE
            );
            result(ANY_ACTOR);

            expectMock(
                SystemdRepositoryMock,
                "disableService"
            ).toHaveBeenCalledWith(ANY_ACTOR);
        });

        it("when building the start action for a Docker item and this is executed, the DockerRepository startContainer is called", () => {
            when(DockerRepositoryMock, "startContainer").thenReturn(
                ANY_PROMISE
            );

            const result = sut.buildItemAction(
                sut.SectionType.DOCKER,
                sut.ActionType.START
            );
            result(ANY_ACTOR);

            expectMock(
                DockerRepositoryMock,
                "startContainer"
            ).toHaveBeenCalledWith(ANY_ACTOR);
        });

        it("when building the stop action for a Docker item and this is executed, the DockerRepository stopContainer is called", () => {
            when(DockerRepositoryMock, "stopContainer").thenReturn(ANY_PROMISE);

            const result = sut.buildItemAction(
                sut.SectionType.DOCKER,
                sut.ActionType.STOP
            );
            result(ANY_ACTOR);

            expectMock(
                DockerRepositoryMock,
                "stopContainer"
            ).toHaveBeenCalledWith(ANY_ACTOR);
        });

        it("when building the restart action for a Docker item and this is executed, the DockerRepository restartContainer is called", () => {
            when(DockerRepositoryMock, "restartContainer").thenReturn(
                ANY_PROMISE
            );

            const result = sut.buildItemAction(
                sut.SectionType.DOCKER,
                sut.ActionType.RESTART
            );
            result(ANY_ACTOR);

            expectMock(
                DockerRepositoryMock,
                "restartContainer"
            ).toHaveBeenCalledWith(ANY_ACTOR);
        });

        it("when building the remove action for a Docker item and this is executed, the DockerRepository removeContainer is called", () => {
            when(DockerRepositoryMock, "removeContainer").thenReturn(
                ANY_PROMISE
            );

            const result = sut.buildItemAction(
                sut.SectionType.DOCKER,
                sut.ActionType.REMOVE
            );
            result(ANY_ACTOR);

            expectMock(
                DockerRepositoryMock,
                "removeContainer"
            ).toHaveBeenCalledWith(ANY_ACTOR);
        });

        it("when building the start action for a Podman item and this is executed, the DockerRepository startContainer is called", () => {
            when(PodmanRepositoryMock, "startContainer").thenReturn(
                ANY_PROMISE
            );

            const result = sut.buildItemAction(
                sut.SectionType.PODMAN,
                sut.ActionType.START
            );
            result(ANY_ACTOR);

            expectMock(
                PodmanRepositoryMock,
                "startContainer"
            ).toHaveBeenCalledWith(ANY_ACTOR);
        });

        it("when building the stop action for a Podman item and this is executed, the DockerRepository stopContainer is called", () => {
            when(PodmanRepositoryMock, "stopContainer").thenReturn(ANY_PROMISE);

            const result = sut.buildItemAction(
                sut.SectionType.PODMAN,
                sut.ActionType.STOP
            );
            result(ANY_ACTOR);

            expectMock(
                PodmanRepositoryMock,
                "stopContainer"
            ).toHaveBeenCalledWith(ANY_ACTOR);
        });

        it("when building the restart action for a Podman item and this is executed, the DockerRepository restartContainer is called", () => {
            when(PodmanRepositoryMock, "restartContainer").thenReturn(
                ANY_PROMISE
            );

            const result = sut.buildItemAction(
                sut.SectionType.PODMAN,
                sut.ActionType.RESTART
            );
            result(ANY_ACTOR);

            expectMock(
                PodmanRepositoryMock,
                "restartContainer"
            ).toHaveBeenCalledWith(ANY_ACTOR);
        });

        it("when building the remove action for a Podman item and this is executed, the DockerRepository removeContainer is called", () => {
            when(PodmanRepositoryMock, "removeContainer").thenReturn(
                ANY_PROMISE
            );

            const result = sut.buildItemAction(
                sut.SectionType.PODMAN,
                sut.ActionType.REMOVE
            );
            result(ANY_ACTOR);

            expectMock(
                PodmanRepositoryMock,
                "removeContainer"
            ).toHaveBeenCalledWith(ANY_ACTOR);
        });
    });
}
