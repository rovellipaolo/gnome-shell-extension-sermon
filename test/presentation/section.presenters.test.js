import { jest, beforeEach, describe, expect, it } from "@jest/globals";

jest.unstable_mockModule("../../src/util/log.js", () => ({
    d: () => {},
    e: () => {},
    i: () => {},
    w: () => {},
}));

const { SectionPresenter } = await import(
    "../../src/presentation/presenters.js"
);

describe("SectionPresenter", () => {
    const SectionViewMock = {
        buildClickableSectionItemView: jest.fn(),
        buildRunnableSectionItemView: jest.fn(),
        buildSectionItemView: jest.fn(),
        hideItem: jest.fn(),
        showHeader: jest.fn(),
        showItem: jest.fn(),
    };
    const SectionItemViewMock = {
        asString: "any-section-item-view",
    };
    const NavigationItemViewMock = {
        asString: "any-navigation-item-view",
    };
    const FactoryMock = {
        buildGetItemsAction: jest.fn(),
        buildItemLabel: jest.fn(),
    };
    const PagerMock = {
        getFirstPage: jest.fn(),
        getFirstItemInPage: jest.fn(),
        getLastItemInPage: jest.fn(),
        isFirstPage: jest.fn(),
        isLastPage: jest.fn(),
    };
    const ANY_SECTION = "any-section";
    const ANY_ICON = "any-icon";
    const ANY_PAGE = 0;
    const ANY_LABEL = "any-label";

    let presenter;

    beforeEach(() => {
        PagerMock.getFirstPage.mockReturnValue(ANY_PAGE);
        presenter = new SectionPresenter(SectionViewMock, {
            factory: FactoryMock,
            pager: PagerMock,
            section: ANY_SECTION,
            icon: ANY_ICON,
        });

        jest.clearAllMocks();
    });

    describe("constructor()", () => {
        it("initializes the section with no item when created", () => {
            PagerMock.getFirstPage.mockReturnValue(ANY_PAGE);

            // NOTE: Re-initialize the SectionPresenter!
            const presenter = new SectionPresenter(SectionViewMock, {
                factory: FactoryMock,
                pager: PagerMock,
                section: ANY_SECTION,
                icon: ANY_ICON,
            });

            expect(presenter.view).toBe(SectionViewMock);
            expect(presenter.section).toBe(ANY_SECTION);
            expect(presenter.icon).toBe(ANY_ICON);
            expect(presenter.items.length).toBe(0);
            expect(presenter.page).toBe(ANY_PAGE);
            expect(PagerMock.getFirstPage).toHaveBeenCalledTimes(1);
        });
    });

    describe("setupView()", () => {
        it.each`
            items
            ${[]}
            ${[{ id: "any-id", isEnabled: true, isRunning: true, canBeEnabled: true }]}
            ${[{ id: "any-id", isEnabled: true, isRunning: true, canBeEnabled: true }, { id: "any-other-id", isEnabled: false, isRunning: false, canBeEnabled: true }]}
        `(
            "adds item views when getItems returns $items.length items",
            async ({ items }) => {
                FactoryMock.buildGetItemsAction.mockReturnValue(() =>
                    Promise.resolve(items),
                );
                PagerMock.getFirstItemInPage.mockReturnValue(0);
                PagerMock.getLastItemInPage.mockReturnValue(items.length - 1);
                PagerMock.isFirstPage.mockReturnValue(true);
                PagerMock.isLastPage.mockReturnValue(true);
                FactoryMock.buildItemLabel.mockReturnValue(ANY_LABEL);
                SectionViewMock.buildRunnableSectionItemView.mockReturnValue(
                    SectionItemViewMock,
                );

                await presenter.setupView();

                expect(presenter.items.length).toBe(items.length);
                expect(SectionViewMock.showHeader).toHaveBeenCalledTimes(1);
                expect(SectionViewMock.showHeader).toHaveBeenCalledWith(
                    ANY_SECTION,
                    ANY_ICON,
                );
                expect(FactoryMock.buildGetItemsAction).toHaveBeenCalledTimes(
                    1,
                );
                expect(FactoryMock.buildGetItemsAction).toHaveBeenCalledWith(
                    ANY_SECTION,
                );
                expect(PagerMock.getFirstItemInPage).toHaveBeenCalledTimes(1);
                expect(PagerMock.getFirstItemInPage).toHaveBeenCalledWith(
                    ANY_PAGE,
                );
                expect(PagerMock.getLastItemInPage).toHaveBeenCalledTimes(1);
                expect(PagerMock.getLastItemInPage).toHaveBeenCalledWith(
                    ANY_PAGE,
                );
                expect(PagerMock.isFirstPage).toHaveBeenCalledTimes(1);
                expect(PagerMock.isLastPage).toHaveBeenCalledTimes(1);
                expect(FactoryMock.buildItemLabel).toHaveBeenCalledTimes(
                    items.length,
                );
                expect(
                    SectionViewMock.buildRunnableSectionItemView,
                ).toHaveBeenCalledTimes(items.length);
                expect(SectionViewMock.showItem).toHaveBeenCalledTimes(
                    items.length,
                );
                items.forEach((item) => {
                    expect(FactoryMock.buildItemLabel).toHaveBeenCalledWith(
                        ANY_SECTION,
                        item,
                    );
                    expect(
                        SectionViewMock.buildRunnableSectionItemView,
                    ).toHaveBeenCalledWith(
                        ANY_SECTION,
                        item.id,
                        ANY_LABEL,
                        item.isEnabled,
                        item.isRunning,
                        item.canBeEnabled,
                    );
                    expect(SectionViewMock.showItem).toHaveBeenCalledWith(
                        SectionItemViewMock,
                    );
                });
            },
        );

        it.each`
            isFirst  | isLast   | expectedAdditionalItemViews
            ${false} | ${true}  | ${1}
            ${true}  | ${false} | ${1}
            ${false} | ${false} | ${2}
        `(
            "adds $expectedAdditionalItemViews additional '...' navigation item views when getItems() returns items, isFirst $isFirst and isLast $isLast",
            async ({ isFirst, isLast, expectedAdditionalItemViews }) => {
                const items = [
                    {
                        id: "any-id",
                        isEnabled: true,
                        isRunning: true,
                        canBeEnabled: true,
                    },
                ];
                FactoryMock.buildGetItemsAction.mockReturnValue(() =>
                    Promise.resolve(items),
                );
                PagerMock.getFirstItemInPage.mockReturnValue(0);
                PagerMock.getLastItemInPage.mockReturnValue(items.length - 1);
                PagerMock.isFirstPage.mockReturnValue(isFirst);
                PagerMock.isLastPage.mockReturnValue(isLast);
                FactoryMock.buildItemLabel.mockReturnValue(ANY_LABEL);
                SectionViewMock.buildClickableSectionItemView.mockReturnValue(
                    NavigationItemViewMock,
                );
                SectionViewMock.buildRunnableSectionItemView.mockReturnValue(
                    SectionItemViewMock,
                );

                await presenter.setupView();

                expect(presenter.items.length).toBe(
                    items.length + expectedAdditionalItemViews,
                );
                // NOTE: The additional "..." navigation item view is added!
                expect(
                    SectionViewMock.buildClickableSectionItemView,
                ).toHaveBeenCalledTimes(expectedAdditionalItemViews);
                expect(
                    SectionViewMock.buildClickableSectionItemView,
                ).toHaveBeenCalledWith(
                    ANY_SECTION,
                    "#00#",
                    "...",
                    expect.anything(),
                );
                // NOTE: The rest of the item views are added!
                expect(FactoryMock.buildItemLabel).toHaveBeenCalledTimes(
                    items.length,
                );
                expect(
                    SectionViewMock.buildRunnableSectionItemView,
                ).toHaveBeenCalledTimes(items.length);
                expect(SectionViewMock.showItem).toHaveBeenCalledTimes(
                    items.length + expectedAdditionalItemViews,
                );
                expect(SectionViewMock.showItem).toHaveBeenCalledWith(
                    NavigationItemViewMock,
                );
            },
        );
    });

    describe("showItem()", () => {
        it("shows the item", () => {
            presenter.showItem(SectionItemViewMock);

            expect(presenter.items.at(-1)).toBe(SectionItemViewMock);
            expect(SectionViewMock.showItem).toHaveBeenCalledTimes(1);
            expect(SectionViewMock.showItem).toHaveBeenCalledWith(
                SectionItemViewMock,
            );
        });
    });

    describe("onDestroy()", () => {
        it.each`
            items
            ${[]}
            ${[{ id: "any-id", isEnabled: true, isRunning: true, canBeEnabled: true }]}
            ${[{ id: "any-id", isEnabled: true, isRunning: true, canBeEnabled: true }, { id: "any-other-id", isEnabled: false, isRunning: false, canBeEnabled: true }]}
        `("removes item views for $items.length items", async ({ items }) => {
            FactoryMock.buildGetItemsAction.mockReturnValue(() =>
                Promise.resolve(items),
            );
            PagerMock.getFirstItemInPage.mockReturnValue(0);
            PagerMock.getLastItemInPage.mockReturnValue(items.length - 1);
            PagerMock.isFirstPage.mockReturnValue(true);
            PagerMock.isLastPage.mockReturnValue(true);
            FactoryMock.buildItemLabel.mockReturnValue(ANY_LABEL);
            SectionViewMock.buildRunnableSectionItemView.mockReturnValue(
                SectionItemViewMock,
            );

            await presenter.setupView();
            presenter.onDestroy();

            expect(presenter.items.length).toBe(0);
            expect(SectionViewMock.hideItem).toHaveBeenCalledTimes(
                items.length,
            );
            items.forEach((_) => {
                expect(SectionViewMock.hideItem).toHaveBeenCalledWith(
                    SectionItemViewMock,
                );
            });
        });
    });
});
