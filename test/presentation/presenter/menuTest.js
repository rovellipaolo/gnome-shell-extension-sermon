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

    const dockerRepositoryMock = mock("DockerRepository", [
        "isDockerInstalled",
        "getContainers",
        "startContainer",
        "stopContainer"
    ]);
    const viewMock = mock("MenuView", [
        "show",
        "clear",
        "isOpen",
        "buildDockerSectionView",
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
        const sut = new MenuPresenter(viewMock, dockerRepositoryMock);

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
        const sut = new MenuPresenter(viewMock, dockerRepositoryMock);

        it("when clicking on the menu and this is already open, no operation is performed", () => {
            when(viewMock, "isOpen").thenReturn(false);

            sut.onClick();

            expectMock(viewMock, "show").not.toHaveBeenCalled();
        });

        it("when clicking on the menu and this opens, the menu is shown", () => {
            when(viewMock, "isOpen").thenReturn(true);

            sut.onClick();

            expectMock(viewMock, "show").toHaveBeenCalled();
        });
    });

    describe("MenuPresenter.setupEvents()", () => {
        viewMock.reset();
        it("when setting up the menu events, a click event is added to the menu", () => {
            const sut = new MenuPresenter(viewMock, dockerRepositoryMock);
            when(viewMock, "addClickEvent").thenReturn(ANY_EVENT_ID);

            sut.setupEvents();

            expect(Object.keys(sut.events).length).toBe(1);
            expectMock(viewMock, "addClickEvent").toHaveBeenCalled();
        });
    });

    describe("MenuPresenter.setupView()", () => {
        viewMock.reset();
        const sut = new MenuPresenter(viewMock, dockerRepositoryMock);

        it("when setting up the menu, this is cleared and shown", () => {
            sut.setupView();

            expectMock(viewMock, "clear").toHaveBeenCalled();
            expectMock(viewMock, "show").toHaveBeenCalled();
        });

        it("when setting up the menu, the section container is shown in the menu", () => {
            sut.setupView();

            expectMock(viewMock, "showSectionContainer").toHaveBeenCalled();
        });

        it("when setting up the menu, the docker section is shown in the menu", () => {
            const dockerSectionPosition = 0;
            when(viewMock, "buildDockerSectionView").thenReturn(sectionViewMock);

            sut.setupView();

            expect(Object.keys(sut.sections).length).toBe(1);
            expectMock(viewMock, "buildDockerSectionView").toHaveBeenCalled();
            expectMock(viewMock, "showSection").toHaveBeenCalledWith(sectionViewMock, dockerSectionPosition);
        });

        it("when setting up the menu and docker is not installed, an error item is shown in the menu", () => {
            when(dockerRepositoryMock, "isDockerInstalled").thenReturn(false);

            sut.setupView();

            expectMock(viewMock, "showErrorSectionItem").toHaveBeenCalled();
        });

        // it("when setting up the menu and docker is installed but fails to retrieve containers, an error item is shown in the menu", () => {});

        // it("when setting up the menu and docker is installed and succeed to retrieve containers, the docker items are shown in the menu", () => {});
    });

    describe("MenuPresenter.onDestroy()", () => {
        viewMock.reset();
        const sut = new MenuPresenter(viewMock, dockerRepositoryMock);

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
