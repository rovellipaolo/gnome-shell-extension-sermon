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
    const ANY_FIELD_NAME = "any_widget_field";
    const ANY_BIND_FLAG = "G_SETTINGS_BIND_GET|G_SETTINGS_BIND_SET";

    describe("max-items-per-section", () => {
        it("Settings.getMaxItemsPerSection() returns the value from settings without modifications", () => {
            when(GSettingsMock, "get_int").thenReturn(ANY_NUMBER_OF_ITEMS);

            const result = sut.getMaxItemsPerSection();

            expectMock(GSettingsMock, "get_int").toHaveBeenCalledWith(
                "max-items-per-section"
            );
            expect(result).toBe(ANY_NUMBER_OF_ITEMS);
        });

        it("Settings.bindMaxItemsPerSection() binds the value of settings", () => {
            sut.bindMaxItemsPerSection(ANY_FIELD_NAME, ANY_BIND_FLAG);

            expectMock(GSettingsMock, "bind").toHaveBeenCalledWith(
                "max-items-per-section",
                ANY_FIELD_NAME,
                "value",
                ANY_BIND_FLAG
            );
        });
    });

    describe("systemd-section-enabled", () => {
        it("Settings.isSystemdSectionEnabled() returns the value from settings without modifications", () => {
            when(GSettingsMock, "get_boolean").thenReturn(IS_ENABLED);

            const result = sut.isSystemdSectionEnabled();

            expectMock(GSettingsMock, "get_boolean").toHaveBeenCalledWith(
                "systemd-section-enabled"
            );
            expect(result).toBe(IS_ENABLED);
        });

        it("Settings.bindSystemdSectionEnabled() binds the value of settings", () => {
            sut.bindSystemdSectionEnabled(ANY_FIELD_NAME, ANY_BIND_FLAG);

            expectMock(GSettingsMock, "bind").toHaveBeenCalledWith(
                "systemd-section-enabled",
                ANY_FIELD_NAME,
                "active",
                ANY_BIND_FLAG
            );
        });
    });

    describe("systemd-section-filter-loaded-services", () => {
        it("Settings.shouldFilterSystemdLoadedServices() returns the value from settings without modifications", () => {
            when(GSettingsMock, "get_boolean").thenReturn(IS_ENABLED);

            const result = sut.shouldFilterSystemdLoadedServices();

            expectMock(GSettingsMock, "get_boolean").toHaveBeenCalledWith(
                "systemd-section-filter-loaded-services"
            );
            expect(result).toBe(IS_ENABLED);
        });

        it("Settings.bindFilterSystemdLoadedServices() binds the value of settings", () => {
            sut.bindFilterSystemdLoadedServices(ANY_FIELD_NAME, ANY_BIND_FLAG);

            expectMock(GSettingsMock, "bind").toHaveBeenCalledWith(
                "systemd-section-filter-loaded-services",
                ANY_FIELD_NAME,
                "active",
                ANY_BIND_FLAG
            );
        });
    });

    describe("systemd-section-filter-user-services", () => {
        it("Settings.shouldFilterSystemdUserServices() returns the value from settings without modifications", () => {
            when(GSettingsMock, "get_boolean").thenReturn(IS_ENABLED);

            const result = sut.shouldFilterSystemdUserServices();

            expectMock(GSettingsMock, "get_boolean").toHaveBeenCalledWith(
                "systemd-section-filter-user-services"
            );
            expect(result).toBe(IS_ENABLED);
        });

        it("Settings.bindFilterSystemdUserServices() binds the value of settings", () => {
            sut.bindFilterSystemdUserServices(ANY_FIELD_NAME, ANY_BIND_FLAG);

            expectMock(GSettingsMock, "bind").toHaveBeenCalledWith(
                "systemd-section-filter-user-services",
                ANY_FIELD_NAME,
                "active",
                ANY_BIND_FLAG
            );
        });
    });

    describe("systemd-section-filter-priority-list", () => {
        it("Settings.shouldFilterSystemdServicesByPriorityList() returns the value from settings without modifications", () => {
            when(GSettingsMock, "get_boolean").thenReturn(IS_ENABLED);

            const result = sut.shouldFilterSystemdServicesByPriorityList();

            expectMock(GSettingsMock, "get_boolean").toHaveBeenCalledWith(
                "systemd-section-filter-priority-list"
            );
            expect(result).toBe(IS_ENABLED);
        });

        it("Settings.bindFilterSystemdServicesByPriorityList() binds the value of settings", () => {
            sut.bindFilterSystemdServicesByPriorityList(
                ANY_FIELD_NAME,
                ANY_BIND_FLAG
            );

            expectMock(GSettingsMock, "bind").toHaveBeenCalledWith(
                "systemd-section-filter-priority-list",
                ANY_FIELD_NAME,
                "active",
                ANY_BIND_FLAG
            );
        });
    });

    describe("systemd-section-items-priority-list", () => {
        it("when the settings value is a single element, Settings.getSystemdSectionItemsPriorityList() returns an array with it", () => {
            when(GSettingsMock, "get_string").thenReturn(ANY_SINGLE_ELEMENT);

            const result = sut.getSystemdSectionItemsPriorityList();

            expectMock(GSettingsMock, "get_string").toHaveBeenCalledWith(
                "systemd-section-items-priority-list"
            );
            expect(result.length).toBe(1);
            expect(result[0]).toBe("a0");
        });

        it("when the settings value is a comma-separated list, Settings.getSystemdSectionItemsPriorityList() returns an array with its values", () => {
            when(GSettingsMock, "get_string").thenReturn(
                ANY_COMMA_SEPARATED_LIST
            );

            const result = sut.getSystemdSectionItemsPriorityList();

            expectMock(GSettingsMock, "get_string").toHaveBeenCalledWith(
                "systemd-section-items-priority-list"
            );
            expect(result.length).toBe(4);
            expect(result[0]).toBe("a0");
            expect(result[1]).toBe("b1");
            expect(result[2]).toBe("c2");
            expect(result[3]).toBe("d3");
        });

        it("Settings.bindSystemdSectionItemsPriorityList() binds the value of settings", () => {
            sut.bindSystemdSectionItemsPriorityList(
                ANY_FIELD_NAME,
                ANY_BIND_FLAG
            );

            expectMock(GSettingsMock, "bind").toHaveBeenCalledWith(
                "systemd-section-items-priority-list",
                ANY_FIELD_NAME,
                "text",
                ANY_BIND_FLAG
            );
        });
    });

    describe("cron-section-enabled", () => {
        it("Settings.isCronSectionEnabled() returns the value from settings without modifications", () => {
            when(GSettingsMock, "get_boolean").thenReturn(IS_ENABLED);

            const result = sut.isCronSectionEnabled();

            expectMock(GSettingsMock, "get_boolean").toHaveBeenCalledWith(
                "cron-section-enabled"
            );
            expect(result).toBe(IS_ENABLED);
        });

        it("Settings.bindCronSectionEnabled() binds the value of settings", () => {
            sut.bindCronSectionEnabled(ANY_FIELD_NAME, ANY_BIND_FLAG);

            expectMock(GSettingsMock, "bind").toHaveBeenCalledWith(
                "cron-section-enabled",
                ANY_FIELD_NAME,
                "active",
                ANY_BIND_FLAG
            );
        });
    });

    describe("docker-section-enabled", () => {
        it("Settings.isDockerSectionEnabled() returns the value from settings without modifications", () => {
            when(GSettingsMock, "get_boolean").thenReturn(IS_ENABLED);

            const result = sut.isDockerSectionEnabled();

            expectMock(GSettingsMock, "get_boolean").toHaveBeenCalledWith(
                "docker-section-enabled"
            );
            expect(result).toBe(IS_ENABLED);
        });

        it("Settings.bindDockerSectionEnabled() binds the value of settings", () => {
            sut.bindDockerSectionEnabled(ANY_FIELD_NAME, ANY_BIND_FLAG);

            expectMock(GSettingsMock, "bind").toHaveBeenCalledWith(
                "docker-section-enabled",
                ANY_FIELD_NAME,
                "active",
                ANY_BIND_FLAG
            );
        });
    });

    describe("podman-section-enabled", () => {
        it("Settings.isPodmanSectionEnabled() returns the value from settings without modifications", () => {
            when(GSettingsMock, "get_boolean").thenReturn(IS_ENABLED);

            const result = sut.isPodmanSectionEnabled();

            expectMock(GSettingsMock, "get_boolean").toHaveBeenCalledWith(
                "podman-section-enabled"
            );
            expect(result).toBe(IS_ENABLED);
        });

        it("Settings.bindPodmanSectionEnabled() binds the value of settings", () => {
            sut.bindPodmanSectionEnabled(ANY_FIELD_NAME, ANY_BIND_FLAG);

            expectMock(GSettingsMock, "bind").toHaveBeenCalledWith(
                "podman-section-enabled",
                ANY_FIELD_NAME,
                "active",
                ANY_BIND_FLAG
            );
        });
    });
}
