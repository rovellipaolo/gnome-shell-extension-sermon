"use strict";

// Import dummy/fake Gjs implementations:
imports.searchPath.push("./test/util/fake");
const SettingsMock = imports.misc.Me.imports.src.data.settings;

const GjsMockito = imports.test.util.gjsMockito;
const when = GjsMockito.when;

const sut = imports.src.presentation.pager;

/* exported testSuite */
function testSuite() {
    const ANY_MAX_ITEMS_PER_SECTIONS = 5;

    describe("Pager.getFirstPage()", () => {
        it("first page is always zero", () => {
            const result = sut.getFirstPage();

            expect(result).toEqual(0);
        });
    });

    describe("Pager.getItemsPerPage()", () => {
        it("the max items per section is taken from settings", () => {
            when(SettingsMock, "getMaxItemsPerSection").thenReturn(
                ANY_MAX_ITEMS_PER_SECTIONS
            );

            const result = sut.getItemsPerPage();

            expect(result).toEqual(ANY_MAX_ITEMS_PER_SECTIONS);
        });
    });

    describe("Pager.getFistItemInPage()", () => {
        it("the first item in the first page is always 0", () => {
            when(SettingsMock, "getMaxItemsPerSection").thenReturn(
                ANY_MAX_ITEMS_PER_SECTIONS
            );

            const result = sut.getFistItemInPage(0);

            expect(result).toEqual(0);
        });

        it("the first item in the second page is calculated correctly", () => {
            when(SettingsMock, "getMaxItemsPerSection").thenReturn(
                ANY_MAX_ITEMS_PER_SECTIONS
            );

            const result = sut.getFistItemInPage(1);

            expect(result).toEqual(ANY_MAX_ITEMS_PER_SECTIONS);
        });

        it("the first item in the third page is calculated correctly", () => {
            when(SettingsMock, "getMaxItemsPerSection").thenReturn(
                ANY_MAX_ITEMS_PER_SECTIONS
            );

            const result = sut.getFistItemInPage(2);

            expect(result).toEqual(ANY_MAX_ITEMS_PER_SECTIONS * 2);
        });
    });

    describe("Pager.getLastItemInPage()", () => {
        it("the last item in the first page is always equal to the max items per sections", () => {
            when(SettingsMock, "getMaxItemsPerSection").thenReturn(
                ANY_MAX_ITEMS_PER_SECTIONS
            );

            const result = sut.getLastItemInPage(0);

            expect(result).toEqual(ANY_MAX_ITEMS_PER_SECTIONS - 1);
        });

        it("the last item in the second page is calculated correctly", () => {
            when(SettingsMock, "getMaxItemsPerSection").thenReturn(
                ANY_MAX_ITEMS_PER_SECTIONS
            );

            const result = sut.getLastItemInPage(1);

            expect(result).toEqual(ANY_MAX_ITEMS_PER_SECTIONS * 2 - 1);
        });

        it("the last item in the third page is calculated correctly", () => {
            when(SettingsMock, "getMaxItemsPerSection").thenReturn(
                ANY_MAX_ITEMS_PER_SECTIONS
            );

            const result = sut.getLastItemInPage(2);

            expect(result).toEqual(ANY_MAX_ITEMS_PER_SECTIONS * 3 - 1);
        });
    });

    describe("Pager.isFirstPage()", () => {
        it("isFirstPage returns true for the first page in the section", () => {
            const result = sut.isFirstPage(0);

            expect(result).toEqual(true);
        });

        it("isFirstPage returns false for any other page in the section that is not the first one", () => {
            const result = sut.isFirstPage(1);

            expect(result).toEqual(false);
        });
    });

    describe("Pager.isLastPage()", () => {
        const ANY_ITEM = {};

        it("isLastPage returns true for a one-item single page section", () => {
            const items = [ANY_ITEM];
            when(SettingsMock, "getMaxItemsPerSection").thenReturn(
                ANY_MAX_ITEMS_PER_SECTIONS
            );

            const result = sut.isLastPage(0, items);

            expect(result).toEqual(true);
        });

        it("isLastPage returns true for a all-item single page section", () => {
            const items = [ANY_ITEM, ANY_ITEM, ANY_ITEM, ANY_ITEM, ANY_ITEM];
            when(SettingsMock, "getMaxItemsPerSection").thenReturn(
                ANY_MAX_ITEMS_PER_SECTIONS
            );

            const result = sut.isLastPage(0, items);

            expect(result).toEqual(true);
        });

        it("isLastPage returns true for the last page in the section", () => {
            const items = [
                ANY_ITEM,
                ANY_ITEM,
                ANY_ITEM,
                ANY_ITEM,
                ANY_ITEM,
                ANY_ITEM,
            ];
            when(SettingsMock, "getMaxItemsPerSection").thenReturn(
                ANY_MAX_ITEMS_PER_SECTIONS
            );

            const result = sut.isLastPage(1, items);

            expect(result).toEqual(true);
        });

        it("isLastPage returns false for any other page in the section that is not the last one", () => {
            const items = [
                ANY_ITEM,
                ANY_ITEM,
                ANY_ITEM,
                ANY_ITEM,
                ANY_ITEM,
                ANY_ITEM,
            ];
            when(SettingsMock, "getMaxItemsPerSection").thenReturn(
                ANY_MAX_ITEMS_PER_SECTIONS
            );

            const result = sut.isLastPage(0, items);

            expect(result).toEqual(false);
        });
    });
}
