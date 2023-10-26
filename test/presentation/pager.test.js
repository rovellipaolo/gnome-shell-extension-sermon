import { jest, beforeEach, describe, expect, it } from "@jest/globals";

jest.unstable_mockModule("../../src/data/settings.js", () => ({
    default: {
        getMaxItemsPerSection: jest.fn(),
    },
}));
const SettingsMock = await import("../../src/data/settings.js");

const Pager = await import("../../src/presentation/pager.js");

describe("Pager", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getFirstPage()", () => {
        it("returns the first page correctly", () => {
            const result = Pager.getFirstPage();

            expect(result).toBe(0);
        });
    });

    describe("getItemsPerPage()", () => {
        const ANY_NUMBER_OF_ITEMS = 5;

        it("returns the value from Settings.getMaxItemsPerSection() without modifications", () => {
            SettingsMock.default.getMaxItemsPerSection.mockReturnValue(
                ANY_NUMBER_OF_ITEMS,
            );

            const result = Pager.getItemsPerPage();

            expect(result).toBe(ANY_NUMBER_OF_ITEMS);
            expect(
                SettingsMock.default.getMaxItemsPerSection,
            ).toHaveBeenCalledTimes(1);
        });
    });

    describe("getFirstItemInPage()", () => {
        it.each`
            page | itemsPerPage | expected
            ${0} | ${1}         | ${0}
            ${1} | ${1}         | ${1}
            ${2} | ${1}         | ${2}
            ${3} | ${1}         | ${3}
            ${4} | ${1}         | ${4}
            ${0} | ${3}         | ${0}
            ${1} | ${3}         | ${3}
            ${2} | ${3}         | ${6}
            ${3} | ${3}         | ${9}
            ${4} | ${3}         | ${12}
            ${0} | ${5}         | ${0}
            ${1} | ${5}         | ${5}
            ${2} | ${5}         | ${10}
            ${3} | ${5}         | ${15}
            ${4} | ${5}         | ${20}
        `(
            "returns the first item in page correctly when page is $page and items per page $itemsPerPage",
            ({ page, itemsPerPage, expected }) => {
                SettingsMock.default.getMaxItemsPerSection.mockReturnValue(
                    itemsPerPage,
                );

                const result = Pager.getFirstItemInPage(page);

                expect(result).toBe(expected);
                expect(
                    SettingsMock.default.getMaxItemsPerSection,
                ).toHaveBeenCalledTimes(1);
            },
        );
    });

    describe("getLastItemInPage()", () => {
        it.each`
            page | itemsPerPage | expected
            ${0} | ${1}         | ${0}
            ${1} | ${1}         | ${1}
            ${2} | ${1}         | ${2}
            ${3} | ${1}         | ${3}
            ${4} | ${1}         | ${4}
            ${0} | ${3}         | ${2}
            ${1} | ${3}         | ${5}
            ${2} | ${3}         | ${8}
            ${3} | ${3}         | ${11}
            ${4} | ${3}         | ${14}
            ${0} | ${5}         | ${4}
            ${1} | ${5}         | ${9}
            ${2} | ${5}         | ${14}
            ${3} | ${5}         | ${19}
            ${4} | ${5}         | ${24}
        `(
            "returns the last item in page correctly when page is $page and items per page are $itemsPerPage",
            ({ page, itemsPerPage, expected }) => {
                SettingsMock.default.getMaxItemsPerSection.mockReturnValue(
                    itemsPerPage,
                );

                const result = Pager.getLastItemInPage(page);

                expect(result).toBe(expected);
                expect(
                    SettingsMock.default.getMaxItemsPerSection,
                ).toHaveBeenCalledTimes(1);
            },
        );
    });

    describe("isFirstPage()", () => {
        it.each`
            page | expected
            ${0} | ${true}
            ${1} | ${false}
            ${2} | ${false}
            ${3} | ${false}
            ${4} | ${false}
            ${5} | ${false}
        `("returns $expected if page is $page", ({ page, expected }) => {
            const result = Pager.isFirstPage(page);

            expect(result).toBe(expected);
        });
    });

    describe("isLastPage()", () => {
        it.each`
            page | items                                                                               | itemsPerPage | expected
            ${0} | ${[]}                                                                               | ${1}         | ${true}
            ${0} | ${["0"]}                                                                            | ${1}         | ${true}
            ${0} | ${["0"]}                                                                            | ${1}         | ${true}
            ${0} | ${["0", "1"]}                                                                       | ${1}         | ${false}
            ${1} | ${["0", "1"]}                                                                       | ${1}         | ${true}
            ${0} | ${["0", "1", "2"]}                                                                  | ${1}         | ${false}
            ${1} | ${["0", "1", "2"]}                                                                  | ${1}         | ${false}
            ${2} | ${["0", "1", "2"]}                                                                  | ${1}         | ${true}
            ${0} | ${[]}                                                                               | ${5}         | ${true}
            ${0} | ${["0"]}                                                                            | ${5}         | ${true}
            ${0} | ${["0", "1", "2", "3", "4"]}                                                        | ${5}         | ${true}
            ${0} | ${["0", "1", "2", "3", "4", "5"]}                                                   | ${5}         | ${false}
            ${1} | ${["0", "1", "2", "3", "4", "5"]}                                                   | ${5}         | ${true}
            ${1} | ${["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}                               | ${5}         | ${true}
            ${0} | ${["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]}                         | ${5}         | ${false}
            ${1} | ${["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]}                         | ${5}         | ${false}
            ${2} | ${["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]}                         | ${5}         | ${true}
            ${2} | ${["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14"]} | ${5}         | ${true}
        `(
            "returns $expected if page is $page, items $items and items per page $itemsPerPage",
            ({ page, items, itemsPerPage, expected }) => {
                SettingsMock.default.getMaxItemsPerSection.mockReturnValue(
                    itemsPerPage,
                );

                const result = Pager.isLastPage(page, items);

                expect(result).toBe(expected);
                expect(
                    SettingsMock.default.getMaxItemsPerSection,
                ).toHaveBeenCalledTimes(1);
            },
        );
    });
});
