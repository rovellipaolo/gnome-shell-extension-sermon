"use strict";

// Import dummy/fake Gjs implementations:
imports.searchPath.push("./test/util/fake");

const GjsMockito = imports.test.util.gjsMockito;
const mock = GjsMockito.mock;
const expectMock = GjsMockito.verify;

const SectionPresenter = imports.src.presentation.presenters.SectionPresenter;

/* exported testSuite */
function testSuite() {

    const viewMock = mock("SectionView", ["showTitle", "showItem", "hideItem"]);
    const itemMock = mock("SectionItemView");
    const ANY_TITLE = "anyTitle";

    describe("SectionPresenter()", () => {
        viewMock.reset();
        const sut = new SectionPresenter(viewMock, ANY_TITLE);

        it("when initialized, there is no item in the section", () => {
            expect(sut.items.length).toBe(0);
        });

        it("when initialized, the title is shown in the section", () => {
            expectMock(viewMock, "showTitle").toHaveBeenCalledWith(ANY_TITLE);
        });
    });

    describe("SectionPresenter.onItemAdded()", () => {
        viewMock.reset();
        const sut = new SectionPresenter(viewMock, ANY_TITLE);

        it("when an item is added, this is shown in the section", () => {
            sut.onItemAdded(itemMock);

            expect(sut.items.length).toBe(1);
            expectMock(viewMock, "showItem").toHaveBeenCalledWith(itemMock);
        });
    });

    describe("SectionPresenter.onDestroy()", () => {
        viewMock.reset();
        const sut = new SectionPresenter(viewMock, ANY_TITLE);

        it("when destroyed and without items, no operation is performed", () => {
            sut.onDestroy();

            expect(sut.items.length).toBe(0);
            expectMock(viewMock, "hideItem").not.toHaveBeenCalled();
        });

        it("when destroyed and with items, all items are removed from the section", () => {
            sut.onItemAdded(itemMock);

            sut.onDestroy();

            expect(sut.items.length).toBe(0);
            expectMock(viewMock, "hideItem").toHaveBeenCalledWith(itemMock);
        });
    });

}
