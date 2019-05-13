"use strict";

// Import dummy/fake Gjs implementations:
imports.searchPath.push("./test/util/fake");

const GjsMockito = imports.test.util.gjsMockito;
const mock = GjsMockito.mock;
const when = GjsMockito.when;
const expectMock = GjsMockito.verify;

const MenuPresenter = imports.src.presentation.presenter.menu.MenuPresenter;

/* exported testSuite */
function testSuite() {

    const settingsMock = mock("Settings", [
        "getMaxItemsPerSection",
        "isSystemdSectionEnabled",
        "getSystemdSectionItemsPriorityList",
        "isCronSectionEnabled",
        "isDockerSectionEnabled"
    ]);
    const systemdRepositoryMock = mock("SystemdRepository", [
        "isSystemdInstalled",
        "getServices",
        "startService",
        "stopService"
    ]);
    const cronRepositoryMock = mock("CronRepository", [
        "isCronInstalled",
        "getJobs"
    ]);
    const dockerRepositoryMock = mock("DockerRepository", [
        "isDockerInstalled",
        "getContainers",
        "startContainer",
        "stopContainer"
    ]);
    const params =  {
        settings: settingsMock,
        systemdRepository: systemdRepositoryMock,
        cronRepository: cronRepositoryMock,
        dockerRepository: dockerRepositoryMock
    };
    const viewMock = mock("MenuView", [
        "clear",
        "isOpen",
        "buildSystemdSectionView",
        "buildCronSectionView",
        "buildDockerSectionView",
        "buildSectionItemView",
        "buildClickableSectionItemView",
        "showIcon",
        "showSectionContainer",
        "showSection",
        "showSectionItem",
        "showErrorSectionItem",
        "addClickEvent",
        "removeEvent"
    ]);
    const sectionViewMock = mock("SectionView");
    const ANY_EVENT_ID = 555;

    describe("MenuPresenter()", () => {
        viewMock.reset();
        const sut = new MenuPresenter(viewMock, params);

        it("when initialized, there is no event in the menu", () => {
            expect(Object.keys(sut.events).length).toBe(0);
        });

        it("when initialized, there is no section in the menu", () => {
            expect(Object.keys(sut.sections).length).toBe(0);
        });

        it("when initialized, the icon in shown in the menu", () => {
            expectMock(viewMock, "showIcon").toHaveBeenCalled();
        });
    });

    describe("MenuPresenter.onClick()", () => {
        viewMock.reset();
        const sut = new MenuPresenter(viewMock, params);

        it("when clicking on the menu and this is already open, no operation is performed", () => {
            when(viewMock, "isOpen").thenReturn(false);

            sut.onClick();

            expectMock(viewMock, "clear").not.toHaveBeenCalled();
        });

        it("when clicking on the menu and this opens, the menu is cleared and then shown again", () => {
            when(viewMock, "isOpen").thenReturn(true);

            sut.onClick();

            expectMock(viewMock, "clear").toHaveBeenCalled();
        });
    });

    describe("MenuPresenter.setupEvents()", () => {
        viewMock.reset();
        it("when setting up the menu events, a click event is added to the menu", () => {
            const sut = new MenuPresenter(viewMock, params);
            when(viewMock, "addClickEvent").thenReturn(ANY_EVENT_ID);

            sut.setupEvents();

            expect(Object.keys(sut.events).length).toBe(1);
            expectMock(viewMock, "addClickEvent").toHaveBeenCalled();
        });
    });

    describe("MenuPresenter.setupView()", () => {
        const MENU_FIRST_POSITION = 0;
        const MENU_SECOND_POSITION = 1;
        const MENU_THIRD_POSITION = 2;
        const ANY_PROMISE = new Promise((resolve, _) => resolve());

        it("when setting up the menu, this is cleared and then shown", () => {
            viewMock.reset();
            const sut = new MenuPresenter(viewMock,  params);

            sut.setupView();

            expectMock(viewMock, "clear").toHaveBeenCalled();
        });

        it("when setting up the menu, the section container is shown in the menu", () => {
            viewMock.reset();
            const sut = new MenuPresenter(viewMock, params);

            sut.setupView();

            expectMock(viewMock, "showSectionContainer").toHaveBeenCalled();
        });

        it("when setting up the menu and systemd is not enabled, its section is not shown", () => {
            viewMock.reset();
            const sut = new MenuPresenter(viewMock, params);
            when(settingsMock, "isSystemdSectionEnabled").thenReturn(false);
            when(settingsMock, "isCronSectionEnabled").thenReturn(true);
            when(settingsMock, "isDockerSectionEnabled").thenReturn(true);
            when(cronRepositoryMock, "isCronInstalled").thenReturn(false);
            when(dockerRepositoryMock, "isDockerInstalled").thenReturn(false);

            sut.setupView();

            expect(Object.keys(sut.sections).length).toBe(0);
            expectMock(systemdRepositoryMock, "getServices").not.toHaveBeenCalled();
            expectMock(viewMock, "buildSystemdSectionView").not.toHaveBeenCalled();
        });

        it("when setting up the menu and systemd is not installed, its section is not shown", () => {
            viewMock.reset();
            const sut = new MenuPresenter(viewMock, params);
            when(settingsMock, "isSystemdSectionEnabled").thenReturn(true);
            when(settingsMock, "isCronSectionEnabled").thenReturn(false);
            when(settingsMock, "isDockerSectionEnabled").thenReturn(false);
            when(systemdRepositoryMock, "isSystemdInstalled").thenReturn(false);

            sut.setupView();

            expect(Object.keys(sut.sections).length).toBe(0);
            expectMock(systemdRepositoryMock, "getServices").not.toHaveBeenCalled();
            expectMock(viewMock, "buildSystemdSectionView").not.toHaveBeenCalled();
            expectMock(viewMock, "showSection").not.toHaveBeenCalled();
        });

        it("when setting up the menu and systemd is installed, its section is shown in the menu in first position", () => {
            viewMock.reset();
            const sut = new MenuPresenter(viewMock, params);
            when(settingsMock, "isSystemdSectionEnabled").thenReturn(true);
            when(settingsMock, "isDockerSectionEnabled").thenReturn(true);
            when(systemdRepositoryMock, "isSystemdInstalled").thenReturn(true);
            when(settingsMock, "isCronSectionEnabled").thenReturn(false);
            when(dockerRepositoryMock, "isDockerInstalled").thenReturn(false);
            when(systemdRepositoryMock, "getServices").thenReturn(ANY_PROMISE);
            when(viewMock, "buildSystemdSectionView").thenReturn(sectionViewMock);

            sut.setupView();

            expect(Object.keys(sut.sections).length).toBe(1);
            expectMock(systemdRepositoryMock, "getServices").toHaveBeenCalled();
            expectMock(viewMock, "buildSystemdSectionView").toHaveBeenCalled();
            expectMock(viewMock, "showSection").toHaveBeenCalledWith(sectionViewMock, MENU_FIRST_POSITION);
        });

        // it("when setting up the menu and systemd is installed but fails to retrieve services, an error item is shown in the menu", () => {});

        // it("when setting up the menu and systemd is installed and succeed to retrieve services, the systemd items are shown in the menu", () => {});

        it("when setting up the menu and cron is not enabled, its section is not shown", () => {
            viewMock.reset();
            const sut = new MenuPresenter(viewMock, params);
            when(settingsMock, "isSystemdSectionEnabled").thenReturn(true);
            when(settingsMock, "isCronSectionEnabled").thenReturn(false);
            when(settingsMock, "isDockerSectionEnabled").thenReturn(true);
            when(systemdRepositoryMock, "isSystemdInstalled").thenReturn(false);
            when(dockerRepositoryMock, "isDockerInstalled").thenReturn(false);

            sut.setupView();

            expect(Object.keys(sut.sections).length).toBe(0);
            expectMock(cronRepositoryMock, "getJobs").not.toHaveBeenCalled();
            expectMock(viewMock, "buildCronSectionView").not.toHaveBeenCalled();
        });

        it("when setting up the menu and cron is not installed, its section is not shown", () => {
            viewMock.reset();
            const sut = new MenuPresenter(viewMock, params);
            when(settingsMock, "isSystemdSectionEnabled").thenReturn(false);
            when(settingsMock, "isCronSectionEnabled").thenReturn(true);
            when(settingsMock, "isDockerSectionEnabled").thenReturn(false);
            when(cronRepositoryMock, "isCronInstalled").thenReturn(false);

            sut.setupView();

            expect(Object.keys(sut.sections).length).toBe(0);
            expectMock(cronRepositoryMock, "getJobs").not.toHaveBeenCalled();
            expectMock(viewMock, "buildCronSectionView").not.toHaveBeenCalled();
            expectMock(viewMock, "showSection").not.toHaveBeenCalled();
        });

        it("when setting up the menu, systemd is enabled and cron is installed, cron section is shown in the menu in second position", () => {
            viewMock.reset();
            const sut = new MenuPresenter(viewMock, params);
            when(settingsMock, "isSystemdSectionEnabled").thenReturn(true);
            when(settingsMock, "isCronSectionEnabled").thenReturn(true);
            when(settingsMock, "isDockerSectionEnabled").thenReturn(true);
            when(systemdRepositoryMock, "isSystemdInstalled").thenReturn(false);
            when(cronRepositoryMock, "isCronInstalled").thenReturn(true);
            when(dockerRepositoryMock, "isDockerInstalled").thenReturn(false);
            when(cronRepositoryMock, "getJobs").thenReturn(ANY_PROMISE);
            when(viewMock, "buildCronSectionView").thenReturn(sectionViewMock);

            sut.setupView();

            expect(Object.keys(sut.sections).length).toBe(1);
            expectMock(cronRepositoryMock, "getJobs").toHaveBeenCalled();
            expectMock(viewMock, "buildCronSectionView").toHaveBeenCalled();
            expectMock(viewMock, "showSection").toHaveBeenCalledWith(sectionViewMock, MENU_SECOND_POSITION);
        });

        it("when setting up the menu, systemd is disabled and cron is installed, cron section is shown in the menu in first position", () => {
            viewMock.reset();
            const sut = new MenuPresenter(viewMock, params);
            when(settingsMock, "isSystemdSectionEnabled").thenReturn(false);
            when(settingsMock, "isCronSectionEnabled").thenReturn(true);
            when(settingsMock, "isDockerSectionEnabled").thenReturn(false);
            when(cronRepositoryMock, "isCronInstalled").thenReturn(true);
            when(cronRepositoryMock, "getJobs").thenReturn(ANY_PROMISE);
            when(viewMock, "buildCronSectionView").thenReturn(sectionViewMock);

            sut.setupView();

            expect(Object.keys(sut.sections).length).toBe(1);
            expectMock(cronRepositoryMock, "getJobs").toHaveBeenCalled();
            expectMock(viewMock, "buildCronSectionView").toHaveBeenCalled();
            expectMock(viewMock, "showSection").toHaveBeenCalledWith(sectionViewMock, MENU_FIRST_POSITION);
        });

        // it("when setting up the menu and cron is installed but fails to retrieve jobs, an error item is shown in the menu", () => {});

        // it("when setting up the menu and cron is installed and succeed to retrieve jobs, the cron items are shown in the menu", () => {});

        it("when setting up the menu and docker is not enabled, its section is not shown", () => {
            viewMock.reset();
            const sut = new MenuPresenter(viewMock, params);
            when(settingsMock, "isSystemdSectionEnabled").thenReturn(true);
            when(settingsMock, "isCronSectionEnabled").thenReturn(true);
            when(settingsMock, "isDockerSectionEnabled").thenReturn(false);
            when(systemdRepositoryMock, "isSystemdInstalled").thenReturn(false);
            when(cronRepositoryMock, "isCronInstalled").thenReturn(false);

            sut.setupView();

            expect(Object.keys(sut.sections).length).toBe(0);
            expectMock(dockerRepositoryMock, "getContainers").not.toHaveBeenCalled();
            expectMock(viewMock, "buildDockerSectionView").not.toHaveBeenCalled();
        });

        it("when setting up the menu and docker is not installed, its section is not shown", () => {
            viewMock.reset();
            const sut = new MenuPresenter(viewMock, params);
            when(settingsMock, "isSystemdSectionEnabled").thenReturn(false);
            when(settingsMock, "isCronSectionEnabled").thenReturn(false);
            when(settingsMock, "isDockerSectionEnabled").thenReturn(true);
            when(dockerRepositoryMock, "isDockerInstalled").thenReturn(false);

            sut.setupView();

            expect(Object.keys(sut.sections).length).toBe(0);
            expectMock(dockerRepositoryMock, "getContainers").not.toHaveBeenCalled();
            expectMock(viewMock, "buildDockerSectionView").not.toHaveBeenCalled();
            expectMock(viewMock, "showSection").not.toHaveBeenCalled();
        });

        it("when setting up the menu, systemd and cron are enabled and docker is installed, docker section is shown in the menu in third position", () => {
            viewMock.reset();
            const sut = new MenuPresenter(viewMock, params);
            when(settingsMock, "isSystemdSectionEnabled").thenReturn(true);
            when(settingsMock, "isCronSectionEnabled").thenReturn(true);
            when(settingsMock, "isDockerSectionEnabled").thenReturn(true);
            when(systemdRepositoryMock, "isSystemdInstalled").thenReturn(false);
            when(systemdRepositoryMock, "isCronInstalled").thenReturn(false);
            when(dockerRepositoryMock, "isDockerInstalled").thenReturn(true);
            when(dockerRepositoryMock, "getContainers").thenReturn(ANY_PROMISE);
            when(viewMock, "buildDockerSectionView").thenReturn(sectionViewMock);

            sut.setupView();

            expect(Object.keys(sut.sections).length).toBe(1);
            expectMock(dockerRepositoryMock, "getContainers").toHaveBeenCalled();
            expectMock(viewMock, "buildDockerSectionView").toHaveBeenCalled();
            expectMock(viewMock, "showSection").toHaveBeenCalledWith(sectionViewMock, MENU_THIRD_POSITION);
        });

        it("when setting up the menu, systemd is disabled and docker is installed, docker section is shown in the menu in second position", () => {
            viewMock.reset();
            const sut = new MenuPresenter(viewMock, params);
            when(settingsMock, "isSystemdSectionEnabled").thenReturn(false);
            when(settingsMock, "isCronSectionEnabled").thenReturn(true);
            when(settingsMock, "isDockerSectionEnabled").thenReturn(true);
            when(systemdRepositoryMock, "isCronInstalled").thenReturn(true);
            when(dockerRepositoryMock, "isDockerInstalled").thenReturn(true);
            when(dockerRepositoryMock, "getContainers").thenReturn(ANY_PROMISE);
            when(viewMock, "buildDockerSectionView").thenReturn(sectionViewMock);

            sut.setupView();

            expect(Object.keys(sut.sections).length).toBe(1);
            expectMock(dockerRepositoryMock, "getContainers").toHaveBeenCalled();
            expectMock(viewMock, "buildDockerSectionView").toHaveBeenCalled();
            expectMock(viewMock, "showSection").toHaveBeenCalledWith(sectionViewMock, MENU_SECOND_POSITION);
        });

        it("when setting up the menu, systemd and cron are disabled and docker is installed, docker section is shown in the menu in first position", () => {
            viewMock.reset();
            const sut = new MenuPresenter(viewMock, params);
            when(settingsMock, "isSystemdSectionEnabled").thenReturn(false);
            when(settingsMock, "isCronSectionEnabled").thenReturn(false);
            when(settingsMock, "isDockerSectionEnabled").thenReturn(true);
            when(dockerRepositoryMock, "isDockerInstalled").thenReturn(true);
            when(dockerRepositoryMock, "getContainers").thenReturn(ANY_PROMISE);
            when(viewMock, "buildDockerSectionView").thenReturn(sectionViewMock);

            sut.setupView();

            expect(Object.keys(sut.sections).length).toBe(1);
            expectMock(dockerRepositoryMock, "getContainers").toHaveBeenCalled();
            expectMock(viewMock, "buildDockerSectionView").toHaveBeenCalled();
            expectMock(viewMock, "showSection").toHaveBeenCalledWith(sectionViewMock, MENU_FIRST_POSITION);
        });

        // it("when setting up the menu and docker is installed but fails to retrieve containers, an error item is shown in the menu", () => {});

        // it("when setting up the menu and docker is installed and succeed to retrieve containers, the docker items are shown in the menu", () => {});
    });

    describe("MenuPresenter.onDestroy()", () => {
        viewMock.reset();
        const sut = new MenuPresenter(viewMock, params);

        it("when destroyed and without events, no operation is performed", () => {
            sut.onDestroy();

            expect(Object.keys(sut.events).length).toBe(0);
            expectMock(viewMock, "removeEvent").not.toHaveBeenCalled();
        });

        it("when destroyed and with events, all events are removed from the menu", () => {
            when(viewMock, "addClickEvent").thenReturn(ANY_EVENT_ID);
            sut.setupEvents();

            sut.onDestroy();

            expect(Object.keys(sut.events).length).toBe(0);
            expectMock(viewMock, "removeEvent").toHaveBeenCalledWith(ANY_EVENT_ID);
        });
    });

}
