"use strict";

// Import dummy/fake Gjs implementations:
imports.searchPath.push("./test/util/fake");
const GSettingsMock = imports.misc.GSettings;

const GjsMockito = imports.test.util.gjsMockito;
const when = GjsMockito.when;
const expectMock = GjsMockito.verify;

const sut = imports.src.data.settings;

/* exported testSuite */
function testSuite() {

    const ANY_NUMBER_OF_ITEMS = 10;
    const IS_ENABLED = true;
    const ANY_SINGLE_ELEMENT = "a0";
    const ANY_COMMA_SEPARATED_LIST = "a0,b1 , c2    ,,    d3 ";

    describe("Settings.getMaxItemsPerSection()", () => {
        it("returns the value from settings without modifications", () => {
            when(GSettingsMock, "get_int").thenReturn(ANY_NUMBER_OF_ITEMS);

            const result = sut.getMaxItemsPerSection();

            expectMock(GSettingsMock, "get_int").toHaveBeenCalledWith("max-items-per-section");
            expect(result).toBe(ANY_NUMBER_OF_ITEMS);
        });
    });

    describe("Settings.isSystemdSectionEnabled()", () => {
        it("returns the value from settings without modifications", () => {
            when(GSettingsMock, "get_boolean").thenReturn(IS_ENABLED);

            const result = sut.isSystemdSectionEnabled();

            expectMock(GSettingsMock, "get_boolean").toHaveBeenCalledWith("systemd-section-enabled");
            expect(result).toBe(IS_ENABLED);
        });
    });

    describe("Settings.getSystemdSectionItemsPriorityList()", () => {
        it("when the settings value is a single element, returns an array with it", () => {
            when(GSettingsMock, "get_string").thenReturn(ANY_SINGLE_ELEMENT);

            const result = sut.getSystemdSectionItemsPriorityList();

            expectMock(GSettingsMock, "get_string").toHaveBeenCalledWith("systemd-section-items-priority-list");
            expect(result.length).toBe(1);
            expect(result[0]).toBe("a0");
        });

        it("when the settings value is a comma-separated list, returns an array with its values", () => {
            when(GSettingsMock, "get_string").thenReturn(ANY_COMMA_SEPARATED_LIST);

            const result = sut.getSystemdSectionItemsPriorityList();

            expectMock(GSettingsMock, "get_string").toHaveBeenCalledWith("systemd-section-items-priority-list");
            expect(result.length).toBe(4);
            expect(result[0]).toBe("a0");
            expect(result[1]).toBe("b1");
            expect(result[2]).toBe("c2");
            expect(result[3]).toBe("d3");
        });
    });

    describe("Settings.isCronSectionEnabled()", () => {
        it("returns the value from settings without modifications", () => {
            when(GSettingsMock, "get_boolean").thenReturn(IS_ENABLED);

            const result = sut.isCronSectionEnabled();

            expectMock(GSettingsMock, "get_boolean").toHaveBeenCalledWith("cron-section-enabled");
            expect(result).toBe(IS_ENABLED);
        });
    });

    describe("Settings.isDockerSectionEnabled()", () => {
        it("returns the value from settings without modifications", () => {
            when(GSettingsMock, "get_boolean").thenReturn(IS_ENABLED);

            const result = sut.isDockerSectionEnabled();

            expectMock(GSettingsMock, "get_boolean").toHaveBeenCalledWith("docker-section-enabled");
            expect(result).toBe(IS_ENABLED);
        });
    });

}
