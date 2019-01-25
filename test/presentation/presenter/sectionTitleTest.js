"use strict";

// Import dummy/fake Gjs implementations:
imports.searchPath.push("./test/util/fake");

const GjsMockito = imports.test.util.gjsMockito;
const mock = GjsMockito.mock;
const expectMock = GjsMockito.verify;

const SectionTitlePresenter = imports.src.presentation.presenter.sectionTitle.SectionTitlePresenter;

/* exported testSuite */
function testSuite() {

    const viewMock = mock("SectionTitleView", ["showText", "showIcon"]);
    const iconMock = mock("St.Icon");
    const ANY_TEXT = "anyText";

    describe("SectionTitlePresenter()", () => {
        viewMock.reset();
        const sut = new SectionTitlePresenter(viewMock, ANY_TEXT, iconMock);

        it("when initialized, the text is shown in the title", () => {
            expectMock(viewMock, "showText").toHaveBeenCalledWith(ANY_TEXT);
        });

        it("when initialized, the icon is shown in the title", () => {
            expectMock(viewMock, "showIcon").toHaveBeenCalledWith(iconMock);
        });
    });

}
