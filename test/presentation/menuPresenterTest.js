"use strict";

// Import dummy/fake Gjs implementations:
imports.searchPath.push("./test/util/fake");

const GjsMockito = imports.test.util.gjsMockito;
const mock = GjsMockito.mock;
const when = GjsMockito.when;
const expectMock = GjsMockito.verify;

const { MenuPresenter } = imports.src.presentation.presenters;

/* exported testSuite */
function testSuite() {
    const sectionViewMock = mock("SectionView", [
        "showHeader",
        "buildSectionItemView",
        "buildClickableSectionItemView",
        "buildRunnableSectionItemView",
        "showItem",
        "hideItem",
        "destroy",
    ]);

    const factoryMock = mock("Factory", [
        "buildActiveSections",
        "buildIcon",
        "buildGetItemsAction",
        "buildItemLabel",
        "buildItemAction",
    ]);
    when(factoryMock, "buildActiveSections").thenReturn([]);

    const params = {
        factory: factoryMock,
    };

    const viewMock = mock("MenuView", [
        "addClickEvent",
        "clear",
        "isOpen",
        "showIcon",
        "showSectionContainer",
        "showSection",
        "hideSection",
        "buildSectionView",
        "removeEvent",
        "destroy",
    ]);
    when(viewMock, "buildSectionView").thenReturn(sectionViewMock);

    const ANY_EVENT_ID = 555;

    describe("MenuPresenter()", () => {
        viewMock.reset();
        const sut = new MenuPresenter(viewMock, params);

        it("when initialized, there is no event in the menu", () => {
            expect(Object.keys(sut.events).length).toBe(0);
        });

        it("when initialized, there is no section in the menu", () => {
            expect(Object.keys(sut.views).length).toBe(0);
        });

        it("when initialized, the active sections are retrieved", () => {
            expectMock(factoryMock, "buildActiveSections").toHaveBeenCalled();
        });

        it("when initialized, the icon in shown in the menu", () => {
            expectMock(viewMock, "showIcon").toHaveBeenCalled();
        });
    });

    describe("MenuPresenter.onClick()", () => {
        viewMock.reset();
        const sut = new MenuPresenter(viewMock, params);
        factoryMock.reset();

        it("when clicking on the menu and this is already open, no operation is performed", () => {
            when(viewMock, "isOpen").thenReturn(false);

            sut.onClick();

            expectMock(
                factoryMock,
                "buildActiveSections"
            ).not.toHaveBeenCalled();
            expectMock(viewMock, "clear").not.toHaveBeenCalled();
        });

        it("when clicking on the menu and this opens, the active sections are refreshed", () => {
            when(viewMock, "isOpen").thenReturn(true);

            sut.onClick();

            expectMock(factoryMock, "buildActiveSections").toHaveBeenCalled();
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

        it("when setting up the menu, this is cleared and then shown", () => {
            viewMock.reset();
            factoryMock.reset();
            when(factoryMock, "buildActiveSections").thenReturn([]);
            const sut = new MenuPresenter(viewMock, params);

            sut.setupView();

            expectMock(viewMock, "clear").toHaveBeenCalled();
        });

        it("when setting up the menu, the section container is shown in the menu", () => {
            viewMock.reset();
            factoryMock.reset();
            when(factoryMock, "buildActiveSections").thenReturn([]);
            const sut = new MenuPresenter(viewMock, params);

            sut.setupView();

            expectMock(viewMock, "showSectionContainer").toHaveBeenCalled();
        });

        it("when setting up the menu and Systemd is not enabled, its section is not shown", () => {
            viewMock.reset();
            factoryMock.reset();
            when(factoryMock, "buildActiveSections").thenReturn([]);
            const sut = new MenuPresenter(viewMock, params);

            sut.setupView();

            expect(Object.keys(sut.views).length).toBe(0);
            expectMock(viewMock, "buildSectionView").not.toHaveBeenCalled();
            expectMock(viewMock, "showSection").not.toHaveBeenCalled();
        });

        it("when setting up the menu and Systemd is enabled, its section is shown in first position", () => {
            viewMock.reset();
            factoryMock.reset();
            when(factoryMock, "buildActiveSections").thenReturn(["Systemd"]);
            const sut = new MenuPresenter(viewMock, params);
            when(viewMock, "buildSectionView").thenReturn(sectionViewMock);

            sut.setupView();

            expect(Object.keys(sut.views).length).toBe(1);
            expectMock(viewMock, "buildSectionView").toHaveBeenCalledWith(
                "Systemd"
            );
            expectMock(viewMock, "showSection").toHaveBeenCalledWith(
                sectionViewMock,
                MENU_FIRST_POSITION
            );
        });

        it("when setting up the menu and Cron is not enabled, its section is not shown", () => {
            viewMock.reset();
            factoryMock.reset();
            when(factoryMock, "buildActiveSections").thenReturn([]);
            const sut = new MenuPresenter(viewMock, params);

            sut.setupView();

            expect(Object.keys(sut.views).length).toBe(0);
            expectMock(viewMock, "buildSectionView").not.toHaveBeenCalled();
            expectMock(viewMock, "showSection").not.toHaveBeenCalled();
        });

        it("when setting up the menu and both Systemd and Cron are enabled, Cron section is shown in the menu in second position", () => {
            viewMock.reset();
            factoryMock.reset();
            when(factoryMock, "buildActiveSections").thenReturn([
                "Systemd",
                "Cron",
            ]);
            const sut = new MenuPresenter(viewMock, params);
            when(viewMock, "buildSectionView").thenReturn(sectionViewMock);

            sut.setupView();

            expect(Object.keys(sut.views).length).toBe(2);
            expectMock(viewMock, "buildSectionView").toHaveBeenCalledWith(
                "Cron"
            );
            expectMock(viewMock, "showSection").toHaveBeenCalledWith(
                sectionViewMock,
                MENU_SECOND_POSITION
            );
        });

        it("when setting up the menu and only Cron is enabled, Cron section is shown in the menu in first position", () => {
            viewMock.reset();
            factoryMock.reset();
            when(factoryMock, "buildActiveSections").thenReturn(["Cron"]);
            const sut = new MenuPresenter(viewMock, params);
            when(viewMock, "buildSectionView").thenReturn(sectionViewMock);

            sut.setupView();

            expect(Object.keys(sut.views).length).toBe(1);
            expectMock(viewMock, "buildSectionView").toHaveBeenCalledWith(
                "Cron"
            );
            expectMock(viewMock, "showSection").toHaveBeenCalledWith(
                sectionViewMock,
                MENU_FIRST_POSITION
            );
        });

        it("when setting up the menu and Docker is not enabled, its section is not shown", () => {
            viewMock.reset();
            factoryMock.reset();
            when(factoryMock, "buildActiveSections").thenReturn([]);
            const sut = new MenuPresenter(viewMock, params);

            sut.setupView();

            expect(Object.keys(sut.views).length).toBe(0);
            expectMock(viewMock, "buildSectionView").not.toHaveBeenCalled();
            expectMock(viewMock, "showSection").not.toHaveBeenCalled();
        });

        it("when setting up the menu and all sections are enabled, Docker section is shown in the menu in third position", () => {
            viewMock.reset();
            factoryMock.reset();
            when(factoryMock, "buildActiveSections").thenReturn([
                "Systemd",
                "Cron",
                "Docker",
            ]);
            const sut = new MenuPresenter(viewMock, params);
            when(viewMock, "buildSectionView").thenReturn(sectionViewMock);

            sut.setupView();

            expect(Object.keys(sut.views).length).toBe(3);
            expectMock(viewMock, "buildSectionView").toHaveBeenCalledWith(
                "Docker"
            );
            expectMock(viewMock, "showSection").toHaveBeenCalledWith(
                sectionViewMock,
                MENU_THIRD_POSITION
            );
        });

        it("when setting up the menu and both Systemd and Docker are enabled, Docker section is shown in the menu in second position", () => {
            viewMock.reset();
            factoryMock.reset();
            when(factoryMock, "buildActiveSections").thenReturn([
                "Systemd",
                "Docker",
            ]);
            const sut = new MenuPresenter(viewMock, params);
            when(viewMock, "buildSectionView").thenReturn(sectionViewMock);

            sut.setupView();

            expect(Object.keys(sut.views).length).toBe(2);
            expectMock(viewMock, "buildSectionView").toHaveBeenCalledWith(
                "Docker"
            );
            expectMock(viewMock, "showSection").toHaveBeenCalledWith(
                sectionViewMock,
                MENU_SECOND_POSITION
            );
        });

        it("when setting up the menu and only Docker is enabled, Docker section is shown in the menu in first position", () => {
            viewMock.reset();
            factoryMock.reset();
            when(factoryMock, "buildActiveSections").thenReturn(["Docker"]);
            const sut = new MenuPresenter(viewMock, params);
            when(viewMock, "buildSectionView").thenReturn(sectionViewMock);

            sut.setupView();

            expect(Object.keys(sut.views).length).toBe(1);
            expectMock(viewMock, "buildSectionView").toHaveBeenCalledWith(
                "Docker"
            );
            expectMock(viewMock, "showSection").toHaveBeenCalledWith(
                sectionViewMock,
                MENU_FIRST_POSITION
            );
        });
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
            expect(Object.keys(sut.events).length).toBe(1);

            sut.onDestroy();

            expect(Object.keys(sut.events).length).toBe(0);
            expectMock(viewMock, "removeEvent").toHaveBeenCalledWith(
                ANY_EVENT_ID
            );
        });

        it("when destroyed and without views, no operation is performed", () => {
            sut.onDestroy();

            expect(Object.keys(sut.views).length).toBe(0);
            expectMock(viewMock, "hideSection").not.toHaveBeenCalled();
        });

        it("when destroyed and with views, all views are removed from the menu", () => {
            sut.views["Docker"] = sectionViewMock;
            expect(Object.keys(sut.views).length).toBe(1);

            sut.onDestroy();

            expect(Object.keys(sut.views).length).toBe(0);
            expectMock(viewMock, "hideSection").toHaveBeenCalledWith(
                sectionViewMock
            );
        });
    });
}
