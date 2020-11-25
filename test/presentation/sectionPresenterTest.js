"use strict";

// Import dummy/fake Gjs implementations:
imports.searchPath.push("./test/util/fake");

const GjsMockito = imports.test.util.gjsMockito;
const mock = GjsMockito.mock;
const when = GjsMockito.when;
const expectMock = GjsMockito.verify;

const { SectionPresenter } = imports.src.presentation.presenters;

/* exported testSuite */
function testSuite() {
    const ANY_SECTION = "anySection";
    const iconMock = mock("St.Icon");
    const ANY_PROMISE = new Promise((resolve, _) => resolve());
    const ANY_ACTION = () => ANY_PROMISE;

    const viewMock = mock("SectionView", [
        "showHeader",
        "showItem",
        "hideItem",
        "buildSectionItemView",
        "buildClickableSectionItemView",
        "buildRunnableSectionItemView",
        "destroy",
    ]);
    const itemViewMock = mock("SectionItemView");

    const factoryMock = mock("Factory", [
        "buildActiveSections",
        "buildIcon",
        "buildGetItemsAction",
        "buildItemLabel",
        "buildItemActionTypes",
        "buildItemActionIcon",
        "buildItemAction",
    ]);
    when(factoryMock, "buildGetItemsAction").thenReturn(ANY_ACTION);

    const pagerMock = mock("Pager", [
        "getFirstPage",
        "getItemsPerPage",
        "getFistItemInPage",
        "getLastItemInPage",
        "isFirstPage",
        "isLastPage",
    ]);
    when(pagerMock, "getFirstPage").thenReturn(0);

    const params = {
        factory: factoryMock,
        pager: pagerMock,
        section: ANY_SECTION,
        icon: iconMock,
    };

    describe("SectionPresenter()", () => {
        viewMock.reset();
        const sut = new SectionPresenter(viewMock, params);

        it("when initialized, there is no item in the section", () => {
            expect(sut.items.length).toBe(0);
        });

        it("when initialized, the header is shown in the section", () => {
            expectMock(viewMock, "showHeader").toHaveBeenCalledWith(
                ANY_SECTION,
                iconMock
            );
        });

        it("when initialized, the pager is called", () => {
            expect(sut.page).toBe(0);
            expectMock(pagerMock, "getFirstPage").toHaveBeenCalled();
        });

        it("when initialized, the items are retrieved", () => {
            expectMock(factoryMock, "buildGetItemsAction").toHaveBeenCalledWith(
                ANY_SECTION
            );
        });

        //it("when the items cannot be retrieved, an error is shown", () => {});

        //it("when the items can be retrieved, this items are shown", () => {});
    });

    describe("SectionPresenter.showItem()", () => {
        viewMock.reset();
        const sut = new SectionPresenter(viewMock, params);

        it("when an item is added, this is shown in the section", () => {
            sut.showItem(itemViewMock);

            expect(sut.items.length).toBe(1);
            expectMock(viewMock, "showItem").toHaveBeenCalledWith(itemViewMock);
        });
    });

    describe("SectionPresenter.onDestroy()", () => {
        viewMock.reset();
        const sut = new SectionPresenter(viewMock, params);

        it("when destroyed and without items, no operation is performed", () => {
            sut.onDestroy();

            expect(sut.items.length).toBe(0);
            expectMock(viewMock, "hideItem").not.toHaveBeenCalled();
        });

        it("when destroyed and with items, all items are removed from the section", () => {
            sut.showItem(itemViewMock);

            sut.onDestroy();

            expect(sut.items.length).toBe(0);
            expectMock(viewMock, "hideItem").toHaveBeenCalledWith(itemViewMock);
        });
    });
}
