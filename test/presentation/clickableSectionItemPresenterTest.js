"use strict";

// Import dummy/fake Gjs implementations:
imports.searchPath.push("./test/util/fake");

const GjsMockito = imports.test.util.gjsMockito;
const mock = GjsMockito.mock;
const when = GjsMockito.when;
const expectMock = GjsMockito.verify;

const { ClickableSectionItemPresenter } = imports.src.presentation.presenters;

/* exported testSuite */
function testSuite() {
    const viewMock = mock("ClickableSectionItemView", [
        "showLabel",
        "showFullLabel",
        "addMouseOverEvent",
        "addMouseClickEvent",
        "removeEvent",
    ]);

    const factoryMock = mock("Factory", [
        "buildActiveSections",
        "buildIcon",
        "buildGetItemsAction",
        "buildItemLabel",
        "buildItemActionTypes",
        "buildItemActionIcon",
        "buildItemAction",
    ]);

    const ANY_SECTION = "anySection";
    const ANY_ID = "anyId";
    const ANY_LABEL_TEXT = "anyLabelText";
    const ANY_ACTION = (_) => {};
    const ANY_EVENT_ID = 555;

    const params = {
        factory: factoryMock,
        section: ANY_SECTION,
        id: ANY_ID,
        labelText: ANY_LABEL_TEXT,
        action: ANY_ACTION,
    };

    describe("ClickableSectionItemPresenter()", () => {
        viewMock.reset();
        const sut = new ClickableSectionItemPresenter(viewMock, params);

        it("when initialized, the label is shown in the item", () => {
            expectMock(viewMock, "showLabel").toHaveBeenCalledWith(
                ANY_LABEL_TEXT
            );
        });
    });

    describe("ClickableSectionItemPresenter.setupEvents()", () => {
        viewMock.reset();
        it("when setting up the item events, an onMouseOver event is added to the item", () => {
            const sut = new ClickableSectionItemPresenter(viewMock, params);
            when(viewMock, "addMouseOverEvent").thenReturn(ANY_EVENT_ID);

            sut.setupEvents();

            expect(Object.keys(sut.events).length).toBe(1);
            expectMock(viewMock, "addMouseOverEvent").toHaveBeenCalled();
        });

        it("when setting up the item events and an action is passed, an onClick event is added to it", () => {
            const sut = new ClickableSectionItemPresenter(viewMock, params);
            when(viewMock, "addMouseClickEvent").thenReturn(ANY_EVENT_ID);

            sut.setupClickableEvents(ANY_ACTION);

            expect(Object.keys(sut.events).length).toBe(2);
            expectMock(viewMock, "addMouseClickEvent").toHaveBeenCalled();
        });
    });

    describe("ClickableSectionItemPresenter.onMouseOver()", () => {
        viewMock.reset();
        const sut = new ClickableSectionItemPresenter(viewMock, params);

        it("when passing over the item, the item full label is shown", () => {
            sut.onMouseOver();

            expectMock(viewMock, "showFullLabel").toHaveBeenCalled();
        });
    });

    //describe("ClickableSectionItemPresenter.onMouseClick()", () => {
    //it("when clicking on the item, the action is performed", () => {});
    //});

    describe("ClickableSectionItemPresenter.onDestroy()", () => {
        viewMock.reset();
        const sut = new ClickableSectionItemPresenter(viewMock, params);

        it("when destroyed and without events, no operation is performed", () => {
            sut.onDestroy();

            expect(Object.keys(sut.events).length).toBe(0);
            expectMock(viewMock, "removeEvent").not.toHaveBeenCalled();
        });

        it("when destroyed and with events, all events are removed from the menu", () => {
            when(viewMock, "addMouseOverEvent").thenReturn(ANY_EVENT_ID);
            sut.setupEvents();

            sut.onDestroy();

            expect(Object.keys(sut.events).length).toBe(0);
            expectMock(viewMock, "removeEvent").toHaveBeenCalledWith(
                ANY_EVENT_ID
            );
        });
    });
}
