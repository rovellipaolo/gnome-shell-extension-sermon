import { jest, beforeEach, describe, expect, it } from "@jest/globals";

jest.unstable_mockModule("../../src/util/log.js", () => ({
    d: () => {},
    e: () => {},
    i: () => {},
    w: () => {},
}));

const { MenuPresenter } = await import("../../src/presentation/presenters.js");

describe("MenuPresenter", () => {
    const MenuViewMock = {
        addClickEvent: jest.fn(),
        buildSectionView: jest.fn(),
        clear: jest.fn(),
        hideSection: jest.fn(),
        isOpen: jest.fn(),
        removeEvent: jest.fn(),
        showIcon: jest.fn(),
        showSection: jest.fn(),
        showSectionContainer: jest.fn(),
    };
    const SectionViewMock = {
        asString: "any-section-view",
    };
    const FactoryMock = {
        buildActiveSections: jest.fn(),
    };
    const ANY_EVENT_ID = "123";

    let presenter;

    beforeEach(() => {
        FactoryMock.buildActiveSections.mockReturnValue([]);
        presenter = new MenuPresenter(MenuViewMock, {
            factory: FactoryMock,
        });

        jest.clearAllMocks();
    });

    describe("constructor()", () => {
        it.each`
            sections
            ${[]}
            ${["any-section"]}
            ${["any-section", "any-other-section"]}
            ${["any-section", "any-other-section", "any-yet-another-section"]}
        `(
            "initializes no events or views, but retrieves $sections.length sections and shows icons, when created",
            ({ sections }) => {
                FactoryMock.buildActiveSections.mockReturnValue(sections);

                // NOTE: Re-initialize the MenuPresenter with the given sections!
                const presenter = new MenuPresenter(MenuViewMock, {
                    factory: FactoryMock,
                });

                expect(presenter.view).toBe(MenuViewMock);
                expect(presenter.sections).toBe(sections);
                expect(Object.keys(presenter.events).length).toBe(0);
                expect(Object.keys(presenter.views).length).toBe(0);
                expect(FactoryMock.buildActiveSections).toHaveBeenCalledTimes(
                    1,
                );
                expect(MenuViewMock.showIcon).toHaveBeenCalledTimes(1);
                expect(MenuViewMock.showIcon).toHaveBeenCalledWith(sections);
            },
        );
    });

    describe("setupEvents()", () => {
        it("adds onClick event to the view", () => {
            MenuViewMock.addClickEvent.mockReturnValue(ANY_EVENT_ID);

            presenter.setupEvents();

            expect(Object.keys(presenter.events).length).toBe(1);
            expect(presenter.events.onClick).toBe(ANY_EVENT_ID);
            expect(MenuViewMock.addClickEvent).toHaveBeenCalledTimes(1);
        });
    });

    describe("setupView())", () => {
        it.each`
            sections
            ${[]}
            ${["any-section"]}
            ${["any-section", "any-other-section"]}
            ${["any-section", "any-other-section", "any-yet-another-section"]}
        `(
            "adds section container and views for $sections.length sections",
            ({ sections }) => {
                FactoryMock.buildActiveSections.mockReturnValue(sections);
                MenuViewMock.buildSectionView.mockReturnValue(SectionViewMock);

                // NOTE: Re-initialize the MenuPresenter with the given sections!
                const presenter = new MenuPresenter(MenuViewMock, {
                    factory: FactoryMock,
                });
                presenter.setupView();

                expect(Object.keys(presenter.views).length).toBe(
                    sections.length,
                );
                expect(MenuViewMock.clear).toHaveBeenCalledTimes(1);
                expect(MenuViewMock.showSectionContainer).toHaveBeenCalledTimes(
                    1,
                );
                expect(MenuViewMock.buildSectionView).toHaveBeenCalledTimes(
                    sections.length,
                );
                sections.forEach((section, index) => {
                    expect(MenuViewMock.buildSectionView).toHaveBeenCalledWith(
                        section,
                    );
                    expect(MenuViewMock.showSection).toHaveBeenCalledWith(
                        SectionViewMock,
                        index,
                    );
                });
            },
        );
    });

    describe("onClick()", () => {
        it.each`
            sections
            ${[]}
            ${["any-section"]}
            ${["any-section", "any-other-section"]}
            ${["any-section", "any-other-section", "any-yet-another-section"]}
        `(
            "refreshes section container and views for $sections.length sections when view is open",
            ({ sections }) => {
                MenuViewMock.isOpen.mockReturnValue(true);
                FactoryMock.buildActiveSections.mockReturnValue(sections);

                presenter.setupView = jest.fn();
                presenter.onClick();

                expect(presenter.sections).toBe(sections);
                expect(presenter.setupView).toHaveBeenCalledTimes(1);
                expect(FactoryMock.buildActiveSections).toHaveBeenCalledTimes(
                    1,
                );
            },
        );

        it("does nothing when view is close", () => {
            MenuViewMock.isOpen.mockReturnValue(false);
            FactoryMock.buildActiveSections.mockReturnValue(["any-section"]);

            presenter.setupView = jest.fn();
            presenter.onClick();

            expect(presenter.sections).toEqual([]);
            expect(presenter.setupView).not.toHaveBeenCalled();
        });
    });

    describe("onDestroy()", () => {
        it("does nothing when no event or view was added", () => {
            presenter.onDestroy();

            expect(Object.keys(presenter.events).length).toBe(0);
            expect(Object.keys(presenter.views).length).toBe(0);
            expect(MenuViewMock.removeEvent).not.toHaveBeenCalled();
            expect(MenuViewMock.hideSection).not.toHaveBeenCalled();
        });

        it("removes onClick event when this was added", () => {
            MenuViewMock.addClickEvent.mockReturnValue(ANY_EVENT_ID);

            presenter.setupEvents();
            presenter.onDestroy();

            expect(Object.keys(presenter.events).length).toBe(0);
            expect(Object.keys(presenter.views).length).toBe(0);
            expect(MenuViewMock.removeEvent).toHaveBeenCalledTimes(1);
            expect(MenuViewMock.removeEvent).toHaveBeenCalledWith(ANY_EVENT_ID);
            expect(MenuViewMock.hideSection).not.toHaveBeenCalled();
        });

        it.each`
            sections
            ${["any-section"]}
            ${["any-section", "any-other-section"]}
            ${["any-section", "any-other-section", "any-yet-another-section"]}
        `(
            "removes section views for $sections.length sections",
            ({ sections }) => {
                FactoryMock.buildActiveSections.mockReturnValue(sections);
                MenuViewMock.buildSectionView.mockReturnValue(SectionViewMock);

                // NOTE: Re-initialize the MenuPresenter with the given sections!
                const presenter = new MenuPresenter(MenuViewMock, {
                    factory: FactoryMock,
                });
                presenter.setupView();
                presenter.onDestroy();

                expect(Object.keys(presenter.events).length).toBe(0);
                expect(Object.keys(presenter.views).length).toBe(0);
                expect(MenuViewMock.removeEvent).not.toHaveBeenCalled();
                expect(MenuViewMock.hideSection).toHaveBeenCalledTimes(
                    sections.length,
                );
                sections.forEach((_) => {
                    expect(MenuViewMock.hideSection).toHaveBeenCalledWith(
                        SectionViewMock,
                    );
                });
            },
        );
    });
});
