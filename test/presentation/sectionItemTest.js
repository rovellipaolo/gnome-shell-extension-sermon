"use strict";

// Import dummy/fake Gjs implementations:
imports.searchPath.push("./test/util/fake");

const GjsMockito = imports.test.util.gjsMockito;
const mock = GjsMockito.mock;
const when = GjsMockito.when;
const expectMock = GjsMockito.verify;

const SectionItemPresenter = imports.src.presentation.presenters.SectionItemPresenter;

/* exported testSuite */
function testSuite() {

    const viewMock = mock("SectionItemView", [
        "showLabel",
        "showFullLabel",
        "addMouseOverEvent",
        "removeEvent"
    ]);
    const ANY_ID = "anyId";
    const ANY_LABEL_TEXT = "anyLabelText";
    const ANY_EVENT_ID = 555;

    describe("SectionItemPresenter()", () => {
        viewMock.reset();
        const sut = new SectionItemPresenter(viewMock, ANY_ID, ANY_LABEL_TEXT);

        it("when initialized, the label is shown in the item", () => {
            expectMock(viewMock, "showLabel").toHaveBeenCalledWith(ANY_LABEL_TEXT);
        });
    });

    describe("SectionItemPresenter.setupEvents()", () => {
        viewMock.reset();
        it("when setting up the item events, an onMouseOver event is added to the item", () => {
            const sut = new SectionItemPresenter(viewMock, ANY_ID, ANY_LABEL_TEXT);
            when(viewMock, "addMouseOverEvent").thenReturn(ANY_EVENT_ID);

            sut.setupEvents();

            expect(Object.keys(sut.events).length).toBe(1);
            expectMock(viewMock, "addMouseOverEvent").toHaveBeenCalled();
        });
    });

    describe("SectionItemPresenter.onMouseOver()", () => {
        viewMock.reset();
        const sut = new SectionItemPresenter(viewMock, ANY_ID, ANY_LABEL_TEXT);

        it("when passing over the item, the item full label is shown", () => {
            sut.onMouseOver();

            expectMock(viewMock, "showFullLabel").toHaveBeenCalled();
        });
    });

    describe("SectionItemPresenter.onDestroy()", () => {
        viewMock.reset();
        const sut = new SectionItemPresenter(viewMock, ANY_ID, ANY_LABEL_TEXT);

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
