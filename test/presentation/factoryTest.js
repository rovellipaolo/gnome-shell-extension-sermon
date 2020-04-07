"use strict";

// Import dummy/fake Gjs implementations:
imports.searchPath.push("./test/util/fake");
const SettingsMock = imports.misc.Me.imports.src.data.settings;
const CronRepositoryMock = imports.misc.Me.imports.src.data.cronRepository;
const DockerRepositoryMock = imports.misc.Me.imports.src.data.dockerRepository;
const SystemdRepositoryMock = imports.misc.Me.imports.src.data.systemdRepository;
const IconFactoryMock = imports.misc.Me.imports.src.presentation.iconFactory;

const GjsMockito = imports.test.util.gjsMockito;
const mock = GjsMockito.mock;
const when = GjsMockito.when;
const expectMock = GjsMockito.verify;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const sut = imports.src.presentation.factories;

/* exported testSuite */
function testSuite() {

    const ANY_PROMISE = new Promise((resolve, _) => resolve());

    describe("Factory.buildActiveSections()", () => {
        it("when no section is enabled, no one is returned", () => {
            when(SettingsMock, "isSystemdSectionEnabled").thenReturn(false);
            when(SettingsMock, "isCronSectionEnabled").thenReturn(false);
            when(SettingsMock, "isDockerSectionEnabled").thenReturn(false);

            const result = sut.buildActiveSections();

            expect(result.length).toEqual(0);
        });

        it("when only one section is enabled, only this one is returned", () => {
            when(SettingsMock, "isSystemdSectionEnabled").thenReturn(true);
            when(SettingsMock, "isCronSectionEnabled").thenReturn(false);
            when(SettingsMock, "isDockerSectionEnabled").thenReturn(false);

            const result = sut.buildActiveSections();

            expect(result.length).toEqual(1);
            expect(result[0]).toEqual(sut.SectionType.SYSTEMD);
        });

        it("when all the sections are enabled, all of them are returned", () => {
            when(SettingsMock, "isSystemdSectionEnabled").thenReturn(true);
            when(SettingsMock, "isCronSectionEnabled").thenReturn(true);
            when(SettingsMock, "isDockerSectionEnabled").thenReturn(true);

            const result = sut.buildActiveSections();

            expect(result.length).toEqual(3);
            expect(result[0]).toEqual(sut.SectionType.SYSTEMD);
            expect(result[1]).toEqual(sut.SectionType.CRON);
            expect(result[2]).toEqual(sut.SectionType.DOCKER);
        });
    });

    describe("Factory.buildIcon()", () => {
        const iconMock = mock("St.Icon");

        it("when building the Systemd icon for the status area, this is built correctly", () => {
            when(IconFactoryMock, "build").thenReturn(iconMock);

            sut.buildIcon(sut.SectionType.SYSTEMD, sut.IconType.STATUS_AREA, true, true);

            expectMock(IconFactoryMock, "build").toHaveBeenCalledWith(`/images/systemd_icon.svg`, "16", "");
        });

        it("when building the Cron icon for the status area, this is built correctly", () => {
            when(IconFactoryMock, "build").thenReturn(iconMock);

            sut.buildIcon(sut.SectionType.CRON, sut.IconType.STATUS_AREA, true, true);

            expectMock(IconFactoryMock, "build").toHaveBeenCalledWith(`/images/cron_icon.svg`, "16", "");
        });

        it("when building the Docker icon for the status area, this is built correctly", () => {
            when(IconFactoryMock, "build").thenReturn(iconMock);

            sut.buildIcon(sut.SectionType.DOCKER, sut.IconType.STATUS_AREA, true, true);

            expectMock(IconFactoryMock, "build").toHaveBeenCalledWith(`/images/docker_icon.svg`, "16", "");
        });

        it("when building any icon for the section title, this is built correctly", () => {
            when(IconFactoryMock, "build").thenReturn(iconMock);

            sut.buildIcon(sut.SectionType.SYSTEMD, sut.IconType.SECTION_TITLE, true, true);

            expectMock(IconFactoryMock, "build").toHaveBeenCalledWith(`/images/systemd_icon.svg`, "24", "");
        });

        it("when there are more icons and building the first one, this is built correctly", () => {
            when(IconFactoryMock, "build").thenReturn(iconMock);

            sut.buildIcon(sut.SectionType.SYSTEMD, sut.IconType.STATUS_AREA, true, false);

            expectMock(IconFactoryMock, "build").toHaveBeenCalledWith(`/images/systemd_icon.svg`, "16", "sermon-status-area-icon-first");
        });

        it("when there are more icons and building the middle one, this is built correctly", () => {
            when(IconFactoryMock, "build").thenReturn(iconMock);

            sut.buildIcon(sut.SectionType.SYSTEMD, sut.IconType.STATUS_AREA, false, false);

            expectMock(IconFactoryMock, "build").toHaveBeenCalledWith(`/images/systemd_icon.svg`, "16", "sermon-status-area-icon-middle");
        });

        it("when there are more icons and building the last one, this is built correctly", () => {
            when(IconFactoryMock, "build").thenReturn(iconMock);

            sut.buildIcon(sut.SectionType.SYSTEMD, sut.IconType.STATUS_AREA, false, true);

            expectMock(IconFactoryMock, "build").toHaveBeenCalledWith(`/images/systemd_icon.svg`, "16", "sermon-status-area-icon-last");
        });
    });

    describe("Factory.buildVersion()", () => {
        it("when building the Systemd version, this is built correctly", () => {
            when(SystemdRepositoryMock, "getVersion").thenReturn(ANY_PROMISE);

            sut.buildVersion(sut.SectionType.SYSTEMD);

            expectMock(SystemdRepositoryMock, "getVersion").toHaveBeenCalled();
        });

        it("when building the Docker version, this is built correctly", () => {
            when(DockerRepositoryMock, "getVersion").thenReturn(ANY_PROMISE);

            sut.buildVersion(sut.SectionType.DOCKER);

            expectMock(DockerRepositoryMock, "getVersion").toHaveBeenCalled();
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

            expectMock(DockerRepositoryMock, "getContainers").toHaveBeenCalled();
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
    });

    describe("Factory.buildItemAction()", () => {
        const ANY_ACTOR = mock("Actor");

        it("when building the action for a Systemd item that is not running and this is executed, the SystemdRepository startService is called", () => {
            const anyItem = { isRunning: false };
            when(SystemdRepositoryMock, "startService").thenReturn(ANY_PROMISE);

            const result = sut.buildItemAction(sut.SectionType.SYSTEMD, anyItem);
            result(ANY_ACTOR);

            expectMock(SystemdRepositoryMock, "startService").toHaveBeenCalledWith(ANY_ACTOR);
        });

        it("when building the action for a Systemd item that is running and this is executed, the SystemdRepository stopService is called", () => {
            const anyItem = { isRunning: true };
            when(SystemdRepositoryMock, "stopService").thenReturn(ANY_PROMISE);

            const result = sut.buildItemAction(sut.SectionType.SYSTEMD, anyItem);
            result(ANY_ACTOR);

            expectMock(SystemdRepositoryMock, "stopService").toHaveBeenCalledWith(ANY_ACTOR);
        });

        it("when building the action for a Docker item that is not running and this is executed, the DockerRepository startContainer is called", () => {
            const anyItem = { isRunning: false };
            when(DockerRepositoryMock, "startContainer").thenReturn(ANY_PROMISE);

            const result = sut.buildItemAction(sut.SectionType.DOCKER, anyItem);
            result(ANY_ACTOR);

            expectMock(DockerRepositoryMock, "startContainer").toHaveBeenCalledWith(ANY_ACTOR);
        });

        it("when building the action for a Docker item that is running and this is executed, the DockerRepository stopContainer is called", () => {
            const anyItem = { isRunning: true };
            when(DockerRepositoryMock, "stopContainer").thenReturn(ANY_PROMISE);

            const result = sut.buildItemAction(sut.SectionType.DOCKER, anyItem);
            result(ANY_ACTOR);

            expectMock(DockerRepositoryMock, "stopContainer").toHaveBeenCalledWith(ANY_ACTOR);
        });
    });

}
