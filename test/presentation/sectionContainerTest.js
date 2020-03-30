"use strict";

// Import dummy/fake Gjs implementations:
imports.searchPath.push("./test/util/fake");

const GjsMockito = imports.test.util.gjsMockito;
const mock = GjsMockito.mock;
const expectMock = GjsMockito.verify;

const SectionContainerPresenter = imports.src.presentation.presenters.SectionContainerPresenter;

/* exported testSuite */
function testSuite() {

    const viewMock = mock("SectionContainerView", ["showSection", "hideSection"]);
    const sectionMock = mock("SectionView");
    const anySectionPosition = 0;

    describe("SectionContainerPresenter()", () => {
        viewMock.reset();
        const sut = new SectionContainerPresenter(viewMock);

        it("when initialized, there is no section in the container", () => {
            expect(sut.sections.length).toBe(0);
        });
    });

    describe("SectionContainerPresenter.onSectionAdded()", () => {
        viewMock.reset();
        const sut = new SectionContainerPresenter(viewMock);

        it("when a section is added, this is shown in the container", () => {
            sut.onSectionAdded(sectionMock, anySectionPosition);

            expect(sut.sections.length).toBe(1);
            expectMock(viewMock, "showSection").toHaveBeenCalledWith(sectionMock, anySectionPosition);
        });
    });

    describe("SectionContainerPresenter.onDestroy()", () => {
        viewMock.reset();
        const sut = new SectionContainerPresenter(viewMock);

        it("when destroyed and without sections, no operation is performed", () => {
            sut.onDestroy();

            expect(sut.sections.length).toBe(0);
            expectMock(viewMock, "hideSection").not.toHaveBeenCalled();
        });

        it("when destroyed and with sections, all sections are removed from the container", () => {
            sut.onSectionAdded(sectionMock, anySectionPosition);

            sut.onDestroy();

            expect(sut.sections.length).toBe(0);
            expectMock(viewMock, "hideSection").toHaveBeenCalledWith(sectionMock);
        });
    });

}
