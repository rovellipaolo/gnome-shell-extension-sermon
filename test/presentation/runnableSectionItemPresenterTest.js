"use strict";

// Import dummy/fake Gjs implementations:
imports.searchPath.push("./test/util/fake");

const GjsMockito = imports.test.util.gjsMockito;
const mock = GjsMockito.mock;
const when = GjsMockito.when;
const expectMock = GjsMockito.verify;

const { RunnableSectionItemPresenter } = imports.src.presentation.presenters;

/* exported testSuite */
function testSuite() {
    const viewMock = mock("RunnableSectionItemView", [
        "showLabel",
        "showFullLabel",
        "showButton",
        "hideButtons",
        "addMouseOverEvent",
        "addButtonClickEvent",
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
    const ANY_IS_ENABLED = true;
    const ANY_IS_RUNNING = true;
    const ANY_CAN_BE_ENABLED = true;
    const ANY_ACTION_TYPE = "stop";
    const ANY_ACTION = (_) => {};
    const ANY_EVENT_ID = 555;

    const params = {
        factory: factoryMock,
        section: ANY_SECTION,
        id: ANY_ID,
        labelText: ANY_LABEL_TEXT,
        isEnabled: ANY_IS_ENABLED,
        isRunning: ANY_IS_RUNNING,
        canBeEnabled: ANY_CAN_BE_ENABLED,
    };

    describe("RunnableSectionItemPresenter()", () => {
        viewMock.reset();
        const sut = new RunnableSectionItemPresenter(viewMock, params);

        it("when initialized, the label is shown in the item", () => {
            expectMock(viewMock, "showLabel").toHaveBeenCalledWith(
                ANY_LABEL_TEXT
            );
        });
    });

    describe("RunnableSectionItemPresenter.setupEvents()", () => {
        viewMock.reset();

        it("when setting up the item events, an onMouseOver event is added to the item", () => {
            const sut = new RunnableSectionItemPresenter(viewMock, params);
            when(viewMock, "addMouseOverEvent").thenReturn(ANY_EVENT_ID);

            sut.setupEvents();

            expect(Object.keys(sut.actions).length).toBe(0);
            expect(Object.keys(sut.events).length).toBe(1);
            expectMock(viewMock, "addMouseOverEvent").toHaveBeenCalled();
        });

        it("when setting up the item events and no valid action is passed, the item buttons are not shown", () => {
            const sut = new RunnableSectionItemPresenter(viewMock, params);
            when(factoryMock, "buildItemActionTypes").thenReturn([]);

            sut.setupRunnableEvents(
                ANY_IS_ENABLED,
                ANY_IS_RUNNING,
                ANY_CAN_BE_ENABLED
            );

            expect(Object.keys(sut.actions).length).toBe(0);
            expect(Object.keys(sut.events).length).toBe(1);
            expectMock(
                factoryMock,
                "buildItemActionTypes"
            ).toHaveBeenCalledWith(
                ANY_IS_ENABLED,
                ANY_IS_RUNNING,
                ANY_CAN_BE_ENABLED
            );
            expectMock(factoryMock, "buildItemAction").not.toHaveBeenCalled();
            expectMock(viewMock, "showButton").not.toHaveBeenCalled();
        });

        it("when setting up the item events and some valid actions are passed, the item buttons are shown", () => {
            const sut = new RunnableSectionItemPresenter(viewMock, params);
            when(factoryMock, "buildItemActionTypes").thenReturn([
                ANY_ACTION_TYPE,
            ]);
            when(factoryMock, "buildItemAction").thenReturn(ANY_ACTION);
            when(viewMock, "showButton").thenReturn(ANY_EVENT_ID);

            sut.setupRunnableEvents(
                ANY_IS_ENABLED,
                ANY_IS_RUNNING,
                ANY_CAN_BE_ENABLED
            );

            expect(Object.keys(sut.actions).length).toBe(1);
            expect(Object.keys(sut.events).length).toBe(2);
            expectMock(
                factoryMock,
                "buildItemActionTypes"
            ).toHaveBeenCalledWith(
                ANY_IS_ENABLED,
                ANY_IS_RUNNING,
                ANY_CAN_BE_ENABLED
            );
            expectMock(factoryMock, "buildItemAction").toHaveBeenCalledWith(
                ANY_SECTION,
                ANY_ACTION_TYPE
            );
            expectMock(viewMock, "showButton").toHaveBeenCalledWith(
                ANY_ACTION_TYPE
            );
        });
    });

    describe("RunnableSectionItemPresenter.onMouseOver()", () => {
        viewMock.reset();
        const sut = new RunnableSectionItemPresenter(viewMock, params);

        it("when passing over the item, the item full label is shown", () => {
            sut.onMouseOver();

            expectMock(viewMock, "showFullLabel").toHaveBeenCalled();
        });
    });

    describe("RunnableSectionItemPresenter.onButtonClicked()", () => {
        viewMock.reset();
        const sut = new RunnableSectionItemPresenter(viewMock, params);

        it("when clicking on the item button, this is removed and the action is performed", () => {
            when(factoryMock, "buildItemActionTypes").thenReturn([
                ANY_ACTION_TYPE,
            ]);
            when(factoryMock, "buildItemAction").thenReturn(ANY_ACTION);
            sut.setupRunnableEvents(ANY_IS_RUNNING);

            sut.onButtonClicked(ANY_ACTION_TYPE);

            expectMock(viewMock, "hideButtons").toHaveBeenCalled();
        });
    });

    describe("RunnableSectionItemPresenter.onDestroy()", () => {
        viewMock.reset();
        const sut = new RunnableSectionItemPresenter(viewMock, params);

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

        it("when destroyed and with actions, all actions are removed from the menu", () => {
            when(factoryMock, "buildItemActionTypes").thenReturn([
                ANY_ACTION_TYPE,
            ]);
            when(factoryMock, "buildItemAction").thenReturn(ANY_ACTION);
            sut.setupRunnableEvents(
                ANY_IS_ENABLED,
                ANY_IS_RUNNING,
                ANY_CAN_BE_ENABLED
            );

            sut.onDestroy();

            expect(Object.keys(sut.actions).length).toBe(0);
        });
    });
}
