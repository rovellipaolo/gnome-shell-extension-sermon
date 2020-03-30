"use strict";

// Import dummy/fake Gjs implementations:
imports.searchPath.push("./test/util/fake");

const GjsMockito = imports.test.util.gjsMockito;
const mock = GjsMockito.mock;
const when = GjsMockito.when;
const expectMock = GjsMockito.verify;

const RunnableSectionItemPresenter = imports.src.presentation.presenters.RunnableSectionItemPresenter;

/* exported testSuite */
function testSuite() {

    const viewMock = mock("RunnableSectionItemView", [
        "showLabel",
        "showFullLabel",
        "showButton",
        "hideButton",
        "addMouseOverEvent",
        "addButtonClickEvent",
        "removeEvent"
    ]);
    const ANY_ID = "anyId";
    const ANY_LABEL_TEXT = "anyLabelText";
    const ANY_IS_RUNNING = true;
    const ANY_ACTION = (_) => {}
    const ANY_EVENT_ID = 555;

    describe("RunnableSectionItemPresenter()", () => {
        viewMock.reset();
        const sut = new RunnableSectionItemPresenter(viewMock, ANY_ID, ANY_LABEL_TEXT);

        it("when initialized, the label is shown in the item", () => {
            expectMock(viewMock, "showLabel").toHaveBeenCalledWith(ANY_LABEL_TEXT);
        });
    });

    describe("RunnableSectionItemPresenter.setupEvents()", () => {
        viewMock.reset();
        it("when setting up the item events, an onMouseOver event is added to the item", () => {
            const sut = new RunnableSectionItemPresenter(viewMock, ANY_ID, ANY_LABEL_TEXT);
            when(viewMock, "addMouseOverEvent").thenReturn(ANY_EVENT_ID);

            sut.setupEvents();

            expect(Object.keys(sut.events).length).toBe(1);
            expectMock(viewMock, "addMouseOverEvent").toHaveBeenCalled();
        });

        it("when setting up the item events and an action is passed, the item button is shown and an onClick event is added to it", () => {
            const sut = new RunnableSectionItemPresenter(viewMock, ANY_ID, ANY_LABEL_TEXT);
            when(viewMock, "addButtonClickEvent").thenReturn(ANY_EVENT_ID);

            sut.setupRunnableEvents(ANY_ACTION, ANY_IS_RUNNING);

            expect(Object.keys(sut.events).length).toBe(2);
            expectMock(viewMock, "showButton").toHaveBeenCalledWith(ANY_IS_RUNNING);
            expectMock(viewMock, "addButtonClickEvent").toHaveBeenCalled();
        });
    });

    describe("RunnableSectionItemPresenter.onMouseOver()", () => {
        viewMock.reset();
        const sut = new RunnableSectionItemPresenter(viewMock, ANY_ID, ANY_LABEL_TEXT);

        it("when passing over the item, the item full label is shown", () => {
            sut.onMouseOver();

            expectMock(viewMock, "showFullLabel").toHaveBeenCalled();
        });
    });

    describe("RunnableSectionItemPresenter.onButtonClick()", () => {
        viewMock.reset();
        const sut = new RunnableSectionItemPresenter(viewMock, ANY_ID, ANY_LABEL_TEXT);

        it("when clicking on the item button, this is removed and the action is performed", () => {
            sut.setupRunnableEvents(ANY_ACTION, ANY_IS_RUNNING);

            sut.onButtonClick();

            expectMock(viewMock, "hideButton").toHaveBeenCalled();
        });
    });

    describe("RunnableSectionItemPresenter.onDestroy()", () => {
        viewMock.reset();
        const sut = new RunnableSectionItemPresenter(viewMock, ANY_ID, ANY_LABEL_TEXT);

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
            expectMock(viewMock, "removeEvent").toHaveBeenCalledWith(ANY_EVENT_ID);
        });
    });

}
