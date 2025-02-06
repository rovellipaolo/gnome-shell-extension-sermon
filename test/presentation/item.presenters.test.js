import { jest, beforeEach, describe, expect, it } from "@jest/globals";

jest.unstable_mockModule("../../src/util/log.js", () => ({
    d: () => {},
    e: () => {},
    i: () => {},
    w: () => {},
}));

const {
    ClickableSectionItemPresenter,
    RunnableSectionItemPresenter,
    SectionItemPresenter,
} = await import("../../src/presentation/presenters.js");

const SectionItemViewMock = {
    addMouseOverEvent: jest.fn(),
    addMouseClickEvent: jest.fn(),
    hideButtons: jest.fn(),
    showButton: jest.fn(),
    showFullLabel: jest.fn(),
    showLabel: jest.fn(),
    removeEvent: jest.fn(),
};
const FactoryMock = {
    buildItemAction: jest.fn(),
    buildItemActionTypes: jest.fn(),
};
const ANY_SECTION = "any-section";
const ANY_ID = "any-id";
const ANY_LABEL_TEXT = "any-label-text";
const ANY_EVENT_ID = "123";

describe("SectionItemPresenter", () => {
    let presenter;

    beforeEach(() => {
        presenter = new SectionItemPresenter(SectionItemViewMock, {
            factory: FactoryMock,
            section: ANY_SECTION,
            id: ANY_ID,
            labelText: ANY_LABEL_TEXT,
        });

        jest.clearAllMocks();
    });

    describe("constructor()", () => {
        it("initializes the item with no event, but shows label, when created", () => {
            // NOTE: Re-initialize the SectionItemPresenter!
            const presenter = new SectionItemPresenter(SectionItemViewMock, {
                factory: FactoryMock,
                section: ANY_SECTION,
                id: ANY_ID,
                labelText: ANY_LABEL_TEXT,
            });

            expect(presenter.view).toBe(SectionItemViewMock);
            expect(presenter.section).toBe(ANY_SECTION);
            expect(presenter.id).toBe(ANY_ID);
            expect(presenter.labelText).toBe(ANY_LABEL_TEXT);
            expect(Object.keys(presenter.events).length).toBe(0);
            expect(SectionItemViewMock.showLabel).toHaveBeenCalledTimes(1);
            expect(SectionItemViewMock.showLabel).toHaveBeenCalledWith(
                ANY_LABEL_TEXT,
            );
        });
    });

    describe("setupEvents()", () => {
        it("adds onMouseOver event to the view", () => {
            SectionItemViewMock.addMouseOverEvent.mockReturnValue(ANY_EVENT_ID);

            presenter.setupEvents();

            expect(Object.keys(presenter.events).length).toBe(1);
            expect(presenter.events.onMouseOver).toBe(ANY_EVENT_ID);
            expect(SectionItemViewMock.addMouseOverEvent).toHaveBeenCalledTimes(
                1,
            );
        });
    });

    describe("onMouseOver()", () => {
        it("shows item view fill label", () => {
            presenter.onMouseOver();

            expect(SectionItemViewMock.showFullLabel).toHaveBeenCalledTimes(1);
        });
    });

    describe("onDestroy()", () => {
        it("does nothing when no event was added", () => {
            presenter.onDestroy();

            expect(Object.keys(presenter.events).length).toBe(0);
            expect(SectionItemViewMock.removeEvent).not.toHaveBeenCalled();
        });

        it("removes onMouseOver event when this was added", () => {
            SectionItemViewMock.addMouseOverEvent.mockReturnValue(ANY_EVENT_ID);

            presenter.setupEvents();
            presenter.onDestroy();

            expect(Object.keys(presenter.events).length).toBe(0);
            expect(SectionItemViewMock.removeEvent).toHaveBeenCalledTimes(1);
            expect(SectionItemViewMock.removeEvent).toHaveBeenCalledWith(
                ANY_EVENT_ID,
            );
        });
    });
});

describe("ClickableSectionItemPresenter", () => {
    const ANY_CLICK_EVENT_ID = "987";
    const ANY_ACTION = jest.fn();

    let presenter;

    beforeEach(() => {
        presenter = new ClickableSectionItemPresenter(SectionItemViewMock, {
            factory: FactoryMock,
            section: ANY_SECTION,
            id: ANY_ID,
            labelText: ANY_LABEL_TEXT,
        });

        jest.clearAllMocks();
    });

    describe("setupClickableEvents()", () => {
        it("adds onMouseOver and onClick events to the view", () => {
            SectionItemViewMock.addMouseOverEvent.mockReturnValue(ANY_EVENT_ID);
            SectionItemViewMock.addMouseClickEvent.mockReturnValue(
                ANY_CLICK_EVENT_ID,
            );

            presenter.setupClickableEvents(ANY_ACTION);

            expect(Object.keys(presenter.events).length).toBe(2);
            expect(presenter.events.onMouseOver).toBe(ANY_EVENT_ID);
            expect(presenter.events.onClick).toBe(ANY_CLICK_EVENT_ID);
            expect(presenter.action).toBe(ANY_ACTION);
            expect(SectionItemViewMock.addMouseOverEvent).toHaveBeenCalledTimes(
                1,
            );
            expect(
                SectionItemViewMock.addMouseClickEvent,
            ).toHaveBeenCalledTimes(1);
        });
    });

    describe("onMouseClick()", () => {
        it("executes given actions", () => {
            SectionItemViewMock.addMouseOverEvent.mockReturnValue(ANY_EVENT_ID);
            SectionItemViewMock.addMouseClickEvent.mockReturnValue(
                ANY_CLICK_EVENT_ID,
            );

            presenter.setupClickableEvents(ANY_ACTION);
            presenter.onMouseClick();

            expect(ANY_ACTION).toHaveBeenCalledTimes(1);
            expect(ANY_ACTION).toHaveBeenCalledWith(ANY_ID);
        });
    });

    describe("onDestroy()", () => {
        it("removes onMouseOver and onClick events", () => {
            SectionItemViewMock.addMouseOverEvent.mockReturnValue(ANY_EVENT_ID);
            SectionItemViewMock.addMouseClickEvent.mockReturnValue(
                ANY_CLICK_EVENT_ID,
            );

            presenter.setupClickableEvents(ANY_ACTION);
            presenter.onDestroy();

            expect(Object.keys(presenter.events).length).toBe(0);
            expect(SectionItemViewMock.removeEvent).toHaveBeenCalledTimes(2);
            expect(SectionItemViewMock.removeEvent).toHaveBeenNthCalledWith(
                1,
                ANY_EVENT_ID,
            );
            expect(SectionItemViewMock.removeEvent).toHaveBeenNthCalledWith(
                2,
                ANY_CLICK_EVENT_ID,
            );
        });
    });
});

describe("RunnableSectionItemPresenter", () => {
    const ANY_BUTTON_CLICK_EVENT_ID = "987";
    const ANY_ACTION_TYPE = "any-action-type";
    const ANY_ACTION = jest.fn();

    let presenter;

    beforeEach(() => {
        presenter = new RunnableSectionItemPresenter(SectionItemViewMock, {
            factory: FactoryMock,
            section: ANY_SECTION,
            id: ANY_ID,
            labelText: ANY_LABEL_TEXT,
        });

        jest.clearAllMocks();
    });

    describe("setupRunnableEvents()", () => {
        it.each`
            isEnabled | isRunning | canBeEnabled | isUser   | actionTypes
            ${false}  | ${false}  | ${false}     | ${false} | ${[]}
            ${false}  | ${false}  | ${true}      | ${false} | ${["any-action-type"]}
            ${true}   | ${true}   | ${false}     | ${false} | ${["any-action-type", "any-other-action-type"]}
            ${false}  | ${false}  | ${false}     | ${true}  | ${[]}
            ${false}  | ${false}  | ${true}      | ${true}  | ${["any-action-type"]}
            ${true}   | ${true}   | ${false}     | ${true}  | ${["any-action-type", "any-other-action-type"]}
        `(
            "adds onMouseOver and $actionTypes.length onButtonClick events to the view when isEnabled=$isEnabled, isRunning=$isRunning, canBeEnabled=$canBeEnabled, isUser=$isUser",
            ({ isEnabled, isRunning, canBeEnabled, isUser, actionTypes }) => {
                FactoryMock.buildItemActionTypes.mockReturnValue(actionTypes);
                FactoryMock.buildItemAction.mockReturnValue(ANY_ACTION);
                SectionItemViewMock.addMouseOverEvent.mockReturnValue(
                    ANY_EVENT_ID,
                );
                SectionItemViewMock.showButton.mockReturnValue(
                    ANY_BUTTON_CLICK_EVENT_ID,
                );

                presenter.setupRunnableEvents(
                    isEnabled,
                    isRunning,
                    canBeEnabled,
                    isUser,
                );

                expect(Object.keys(presenter.events).length).toBe(
                    1 + actionTypes.length,
                );
                expect(presenter.events.onMouseOver).toBe(ANY_EVENT_ID);
                expect(Object.keys(presenter.actions).length).toBe(
                    actionTypes.length,
                );
                expect(FactoryMock.buildItemActionTypes).toHaveBeenCalledTimes(
                    1,
                );
                expect(FactoryMock.buildItemActionTypes).toHaveBeenCalledWith(
                    isEnabled,
                    isRunning,
                    canBeEnabled,
                );
                expect(FactoryMock.buildItemAction).toHaveBeenCalledTimes(
                    actionTypes.length,
                );
                expect(
                    SectionItemViewMock.addMouseOverEvent,
                ).toHaveBeenCalledTimes(1);
                expect(SectionItemViewMock.showButton).toHaveBeenCalledTimes(
                    actionTypes.length,
                );
                actionTypes.forEach((type) => {
                    expect(presenter.events[type]).toBe(
                        ANY_BUTTON_CLICK_EVENT_ID,
                    );
                    expect(presenter.actions[type]).toBe(ANY_ACTION);
                    expect(FactoryMock.buildItemAction).toHaveBeenCalledWith(
                        ANY_SECTION,
                        type,
                        isUser,
                    );
                    expect(SectionItemViewMock.showButton).toHaveBeenCalledWith(
                        type,
                    );
                });
            },
        );

        it("adds only onMouseOver when builtItemAction() returns null for onButtonClick events", () => {
            FactoryMock.buildItemActionTypes.mockReturnValue([ANY_ACTION_TYPE]);
            FactoryMock.buildItemAction.mockReturnValue(null);
            SectionItemViewMock.addMouseOverEvent.mockReturnValue(ANY_EVENT_ID);

            presenter.setupRunnableEvents(true, true, true, false);

            expect(Object.keys(presenter.events).length).toBe(1);
            expect(presenter.events.onMouseOver).toBe(ANY_EVENT_ID);
            expect(FactoryMock.buildItemAction).toHaveBeenCalledTimes(1);
            expect(FactoryMock.buildItemAction).toHaveBeenCalledWith(
                ANY_SECTION,
                ANY_ACTION_TYPE,
                false,
            );
            expect(SectionItemViewMock.addMouseOverEvent).toHaveBeenCalledTimes(
                1,
            );
            expect(SectionItemViewMock.showButton).not.toHaveBeenCalled();
        });
    });

    describe("onButtonClicked()", () => {
        it("executes given action", () => {
            FactoryMock.buildItemActionTypes.mockReturnValue([ANY_ACTION_TYPE]);
            FactoryMock.buildItemAction.mockReturnValue(ANY_ACTION);
            SectionItemViewMock.addMouseOverEvent.mockReturnValue(ANY_EVENT_ID);
            SectionItemViewMock.showButton.mockReturnValue(
                ANY_BUTTON_CLICK_EVENT_ID,
            );

            presenter.setupRunnableEvents(true, true, true);
            presenter.onButtonClicked(ANY_ACTION_TYPE);

            expect(ANY_ACTION).toHaveBeenCalledTimes(1);
            expect(ANY_ACTION).toHaveBeenCalledWith(ANY_ID);
            expect(SectionItemViewMock.hideButtons).toHaveBeenCalledTimes(1);
        });
    });

    describe("onDestroy()", () => {
        it.each`
            actionTypes
            ${["any-action-type"]}
            ${["any-action-type", "any-other-action-type"]}
        `(
            "removes onMouseOver and $actionTypes.length onButtonClick events",
            ({ actionTypes }) => {
                FactoryMock.buildItemActionTypes.mockReturnValue(actionTypes);
                FactoryMock.buildItemAction.mockReturnValue(ANY_ACTION);
                SectionItemViewMock.addMouseOverEvent.mockReturnValue(
                    ANY_EVENT_ID,
                );
                SectionItemViewMock.showButton.mockReturnValue(
                    ANY_BUTTON_CLICK_EVENT_ID,
                );

                presenter.setupRunnableEvents(true, true, true);
                presenter.onDestroy();

                expect(Object.keys(presenter.events).length).toBe(0);
                expect(Object.keys(presenter.actions).length).toBe(0);
                expect(SectionItemViewMock.removeEvent).toHaveBeenCalledTimes(
                    1 + actionTypes.length,
                );
                expect(SectionItemViewMock.removeEvent).toHaveBeenNthCalledWith(
                    1,
                    ANY_EVENT_ID,
                );
                expect(SectionItemViewMock.removeEvent).toHaveBeenNthCalledWith(
                    2,
                    ANY_BUTTON_CLICK_EVENT_ID,
                );
            },
        );
    });
});
