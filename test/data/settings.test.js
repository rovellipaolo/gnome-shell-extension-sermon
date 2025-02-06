import {
    jest,
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
} from "@jest/globals";

jest.unstable_mockModule("../util/fake/gsettings.js", () => ({
    bind: jest.fn(),
    get_boolean: jest.fn(),
    get_int: jest.fn(),
    get_string: jest.fn(),
    settings_schema: {
        get_key: jest.fn(),
    },
}));
const GSettingsMock = await import("../util/fake/gsettings.js");

import Settings from "../../src/data/settings.js";

describe("Settings", () => {
    let _sut;
    const ANY_FIELD_NAME = "any-field-name";
    const ANY_BIND_FLAG = "any-bind-flag";
    const ANY_SCHEMA = {
        get_summary: () => "any-summary",
        get_description: () => "any-description",
    };
    const ANY_BOOLEAN_VALUE = true;
    const ANY_INT_VALUE = 123;
    const ANY_STRING_VALUE = "a0";

    beforeAll(() => {
        _sut = new Settings({
            getSettings: () => GSettingsMock,
        });
    });

    afterAll(() => {
        _sut.destroy();
        _sut = null;
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("constructor()", () => {
        it("is a singleton", () => {
            new Settings({
                getSettings: () => {},
            });

            const instance = Settings.getInstance();

            expect(instance).toBe(GSettingsMock);
        });
    });

    describe("MaxItemsPerSection", () => {
        it("getMaxItemsPerSection() returns the value from GSettings without modifications", () => {
            GSettingsMock.get_int.mockReturnValue(ANY_INT_VALUE);

            const result = Settings.getMaxItemsPerSection();

            expect(result).toBe(ANY_INT_VALUE);
            expect(GSettingsMock.get_int).toHaveBeenCalledTimes(1);
            expect(GSettingsMock.get_int).toHaveBeenCalledWith(
                "max-items-per-section",
            );
        });

        it("bindMaxItemsPerSection() bind the value of GSettings", () => {
            Settings.bindMaxItemsPerSection(ANY_FIELD_NAME, ANY_BIND_FLAG);

            expect(GSettingsMock.bind).toHaveBeenCalledTimes(1);
            expect(GSettingsMock.bind).toHaveBeenCalledWith(
                "max-items-per-section",
                ANY_FIELD_NAME,
                "value",
                ANY_BIND_FLAG,
            );
        });

        it("describeMaxItemsPerSection() returns the schema from GSettings without modifications", () => {
            GSettingsMock.settings_schema.get_key.mockReturnValue(ANY_SCHEMA);

            const result = Settings.describeMaxItemsPerSection();

            expect(result).toBe(ANY_SCHEMA);
            expect(GSettingsMock.settings_schema.get_key).toHaveBeenCalledTimes(
                1,
            );
            expect(GSettingsMock.settings_schema.get_key).toHaveBeenCalledWith(
                "max-items-per-section",
            );
        });
    });

    describe("SystemdSectionEnabled", () => {
        it("isSystemdSectionEnabled() returns the value from GSettings without modifications", () => {
            GSettingsMock.get_boolean.mockReturnValue(ANY_BOOLEAN_VALUE);

            const result = Settings.isSystemdSectionEnabled();

            expect(result).toBe(ANY_BOOLEAN_VALUE);
            expect(GSettingsMock.get_boolean).toHaveBeenCalledTimes(1);
            expect(GSettingsMock.get_boolean).toHaveBeenCalledWith(
                "systemd-section-enabled",
            );
        });

        it("bindSystemdSectionEnabled() binds the value of GSettings", () => {
            Settings.bindSystemdSectionEnabled(ANY_FIELD_NAME, ANY_BIND_FLAG);

            expect(GSettingsMock.bind).toHaveBeenCalledTimes(1);
            expect(GSettingsMock.bind).toHaveBeenCalledWith(
                "systemd-section-enabled",
                ANY_FIELD_NAME,
                "active",
                ANY_BIND_FLAG,
            );
        });

        it("describeSystemdSectionEnabled() returns the schema from GSettings without modifications", () => {
            GSettingsMock.settings_schema.get_key.mockReturnValue(ANY_SCHEMA);

            const result = Settings.describeSystemdSectionEnabled();

            expect(result).toBe(ANY_SCHEMA);
            expect(GSettingsMock.settings_schema.get_key).toHaveBeenCalledTimes(
                1,
            );
            expect(GSettingsMock.settings_schema.get_key).toHaveBeenCalledWith(
                "systemd-section-enabled",
            );
        });
    });

    describe("ShowOnlySystemdLoadedServices", () => {
        it("shouldShowOnlySystemdLoadedServices() returns the value from GSettings without modifications", () => {
            GSettingsMock.get_boolean.mockReturnValue(ANY_BOOLEAN_VALUE);

            const result = Settings.shouldShowOnlySystemdLoadedServices();

            expect(result).toBe(ANY_BOOLEAN_VALUE);
            expect(GSettingsMock.get_boolean).toHaveBeenCalledTimes(1);
            expect(GSettingsMock.get_boolean).toHaveBeenCalledWith(
                "systemd-section-filter-loaded-services",
            );
        });

        it("bindShowOnlySystemdLoadedServices() binds the value of settings", () => {
            Settings.bindShowOnlySystemdLoadedServices(
                ANY_FIELD_NAME,
                ANY_BIND_FLAG,
            );

            expect(GSettingsMock.bind).toHaveBeenCalledTimes(1);
            expect(GSettingsMock.bind).toHaveBeenCalledWith(
                "systemd-section-filter-loaded-services",
                ANY_FIELD_NAME,
                "active",
                ANY_BIND_FLAG,
            );
        });

        it("describeShowOnlySystemdLoadedServices() returns the schema from GSettings without modifications", () => {
            GSettingsMock.settings_schema.get_key.mockReturnValue(ANY_SCHEMA);

            const result = Settings.describeShowOnlySystemdLoadedServices();

            expect(result).toBe(ANY_SCHEMA);
            expect(GSettingsMock.settings_schema.get_key).toHaveBeenCalledTimes(
                1,
            );
            expect(GSettingsMock.settings_schema.get_key).toHaveBeenCalledWith(
                "systemd-section-filter-loaded-services",
            );
        });
    });

    describe("ShowSystemdSystemServices", () => {
        it("shouldShowSystemdSystemServices() returns the value from GSettings without modifications", () => {
            GSettingsMock.get_boolean.mockReturnValue(ANY_INT_VALUE);

            const result = Settings.shouldShowSystemdSystemServices();

            expect(GSettingsMock.get_boolean).toHaveBeenCalledWith(
                "systemd-section-filter-system-services",
            );
            expect(result).toBe(ANY_INT_VALUE);
        });

        it("bindShowSystemdSystemServices() binds the value of GSettings", () => {
            Settings.bindShowSystemdSystemServices(
                ANY_FIELD_NAME,
                ANY_BIND_FLAG,
            );

            expect(GSettingsMock.bind).toHaveBeenCalledWith(
                "systemd-section-filter-system-services",
                ANY_FIELD_NAME,
                "active",
                ANY_BIND_FLAG,
            );
        });

        it("describeShowSystemdSystemServices() returns the schema from GSettings without modifications", () => {
            GSettingsMock.settings_schema.get_key.mockReturnValue(ANY_SCHEMA);

            const result = Settings.describeShowSystemdSystemServices();

            expect(result).toBe(ANY_SCHEMA);
            expect(GSettingsMock.settings_schema.get_key).toHaveBeenCalledTimes(
                1,
            );
            expect(GSettingsMock.settings_schema.get_key).toHaveBeenCalledWith(
                "systemd-section-filter-system-services",
            );
        });
    });

    describe("ShowSystemdUserServices", () => {
        it("shouldShowSystemdUserServices() returns the value from GSettings without modifications", () => {
            GSettingsMock.get_boolean.mockReturnValue(ANY_INT_VALUE);

            const result = Settings.shouldShowSystemdUserServices();

            expect(GSettingsMock.get_boolean).toHaveBeenCalledWith(
                "systemd-section-filter-user-services",
            );
            expect(result).toBe(ANY_INT_VALUE);
        });

        it("bindShowSystemdUserServices() binds the value of GSettings", () => {
            Settings.bindShowSystemdUserServices(ANY_FIELD_NAME, ANY_BIND_FLAG);

            expect(GSettingsMock.bind).toHaveBeenCalledWith(
                "systemd-section-filter-user-services",
                ANY_FIELD_NAME,
                "active",
                ANY_BIND_FLAG,
            );
        });

        it("describeShowSystemdUserServices() returns the schema from GSettings without modifications", () => {
            GSettingsMock.settings_schema.get_key.mockReturnValue(ANY_SCHEMA);

            const result = Settings.describeShowSystemdUserServices();

            expect(result).toBe(ANY_SCHEMA);
            expect(GSettingsMock.settings_schema.get_key).toHaveBeenCalledTimes(
                1,
            );
            expect(GSettingsMock.settings_schema.get_key).toHaveBeenCalledWith(
                "systemd-section-filter-user-services",
            );
        });
    });

    describe("FilterSystemdServicesByPriorityList", () => {
        it("shouldFilterSystemdServicesByPriorityList() returns the value from GSettings without modifications", () => {
            GSettingsMock.get_boolean.mockReturnValue(ANY_INT_VALUE);

            const result = Settings.shouldFilterSystemdServicesByPriorityList();

            expect(GSettingsMock.get_boolean).toHaveBeenCalledWith(
                "systemd-section-filter-priority-list",
            );
            expect(result).toBe(ANY_INT_VALUE);
        });

        it("bindFilterSystemdServicesByPriorityList() binds the value of GSettings", () => {
            Settings.bindFilterSystemdServicesByPriorityList(
                ANY_FIELD_NAME,
                ANY_BIND_FLAG,
            );

            expect(GSettingsMock.bind).toHaveBeenCalledWith(
                "systemd-section-filter-priority-list",
                ANY_FIELD_NAME,
                "active",
                ANY_BIND_FLAG,
            );
        });

        it("describeFilterSystemdServicesByPriorityList() returns the schema from GSettings without modifications", () => {
            GSettingsMock.settings_schema.get_key.mockReturnValue(ANY_SCHEMA);

            const result =
                Settings.describeFilterSystemdServicesByPriorityList();

            expect(result).toBe(ANY_SCHEMA);
            expect(GSettingsMock.settings_schema.get_key).toHaveBeenCalledTimes(
                1,
            );
            expect(GSettingsMock.settings_schema.get_key).toHaveBeenCalledWith(
                "systemd-section-filter-priority-list",
            );
        });
    });

    describe("SystemdServicesPriorityList", () => {
        it.each`
            raw                          | expected
            ${ANY_STRING_VALUE}          | ${[ANY_STRING_VALUE]}
            ${"a0,b1"}                   | ${["a0", "b1"]}
            ${"a0, b1"}                  | ${["a0", "b1"]}
            ${"a0,b1 , c2,, ,  ,  d3  "} | ${["a0", "b1", "c2", "d3"]}
        `(
            "getSystemdServicesPriorityList() returns '$expected' when GSettings value is '$raw'",
            ({ raw, expected }) => {
                GSettingsMock.get_string.mockReturnValue(raw);

                const result = Settings.getSystemdServicesPriorityList();

                expect(GSettingsMock.get_string).toHaveBeenCalledWith(
                    "systemd-section-items-priority-list",
                );
                expect(result).toEqual(expected);
            },
        );

        it("bindSystemdServicesPriorityList() binds the value of GSettings", () => {
            Settings.bindSystemdServicesPriorityList(
                ANY_FIELD_NAME,
                ANY_BIND_FLAG,
            );

            expect(GSettingsMock.bind).toHaveBeenCalledWith(
                "systemd-section-items-priority-list",
                ANY_FIELD_NAME,
                "text",
                ANY_BIND_FLAG,
            );
        });

        it("describeSystemdServicesPriorityList() returns the schema from GSettings without modifications", () => {
            GSettingsMock.settings_schema.get_key.mockReturnValue(ANY_SCHEMA);

            const result = Settings.describeSystemdServicesPriorityList();

            expect(result).toBe(ANY_SCHEMA);
            expect(GSettingsMock.settings_schema.get_key).toHaveBeenCalledTimes(
                1,
            );
            expect(GSettingsMock.settings_schema.get_key).toHaveBeenCalledWith(
                "systemd-section-items-priority-list",
            );
        });
    });

    describe("CronSectionEnabled", () => {
        it("isCronSectionEnabled() returns the value from GSettings without modifications", () => {
            GSettingsMock.get_boolean.mockReturnValue(ANY_INT_VALUE);

            const result = Settings.isCronSectionEnabled();

            expect(GSettingsMock.get_boolean).toHaveBeenCalledWith(
                "cron-section-enabled",
            );
            expect(result).toBe(ANY_INT_VALUE);
        });

        it("bindCronSectionEnabled() binds the value of GSettings", () => {
            Settings.bindCronSectionEnabled(ANY_FIELD_NAME, ANY_BIND_FLAG);

            expect(GSettingsMock.bind).toHaveBeenCalledWith(
                "cron-section-enabled",
                ANY_FIELD_NAME,
                "active",
                ANY_BIND_FLAG,
            );
        });

        it("describeCronSectionEnabled() returns the schema from GSettings without modifications", () => {
            GSettingsMock.settings_schema.get_key.mockReturnValue(ANY_SCHEMA);

            const result = Settings.describeCronSectionEnabled();

            expect(result).toBe(ANY_SCHEMA);
            expect(GSettingsMock.settings_schema.get_key).toHaveBeenCalledTimes(
                1,
            );
            expect(GSettingsMock.settings_schema.get_key).toHaveBeenCalledWith(
                "cron-section-enabled",
            );
        });
    });

    describe("DockerSectionEnabled", () => {
        it("isDockerSectionEnabled() returns the value from GSettings without modifications", () => {
            GSettingsMock.get_boolean.mockReturnValue(ANY_INT_VALUE);

            const result = Settings.isDockerSectionEnabled();

            expect(GSettingsMock.get_boolean).toHaveBeenCalledWith(
                "docker-section-enabled",
            );
            expect(result).toBe(ANY_INT_VALUE);
        });

        it("bindDockerSectionEnabled() binds the value of GSettings", () => {
            Settings.bindDockerSectionEnabled(ANY_FIELD_NAME, ANY_BIND_FLAG);

            expect(GSettingsMock.bind).toHaveBeenCalledWith(
                "docker-section-enabled",
                ANY_FIELD_NAME,
                "active",
                ANY_BIND_FLAG,
            );
        });

        it("describeDockerSectionEnabled() returns the schema from GSettings without modifications", () => {
            GSettingsMock.settings_schema.get_key.mockReturnValue(ANY_SCHEMA);

            const result = Settings.describeDockerSectionEnabled();

            expect(result).toBe(ANY_SCHEMA);
            expect(GSettingsMock.settings_schema.get_key).toHaveBeenCalledTimes(
                1,
            );
            expect(GSettingsMock.settings_schema.get_key).toHaveBeenCalledWith(
                "docker-section-enabled",
            );
        });
    });

    describe("DockerShowImages", () => {
        it("shouldShowDockerImages() returns the value from GSettings without modifications", () => {
            GSettingsMock.get_boolean.mockReturnValue(ANY_INT_VALUE);

            const result = Settings.shouldShowDockerImages();

            expect(GSettingsMock.get_boolean).toHaveBeenCalledWith(
                "docker-section-show-images",
            );
            expect(result).toBe(ANY_INT_VALUE);
        });

        it("bindShowDockerImages() binds the value of GSettings", () => {
            Settings.bindShowDockerImages(ANY_FIELD_NAME, ANY_BIND_FLAG);

            expect(GSettingsMock.bind).toHaveBeenCalledWith(
                "docker-section-show-images",
                ANY_FIELD_NAME,
                "active",
                ANY_BIND_FLAG,
            );
        });

        it("describeShowDockerImages() returns the schema from GSettings without modifications", () => {
            GSettingsMock.settings_schema.get_key.mockReturnValue(ANY_SCHEMA);

            const result = Settings.describeShowDockerImages();

            expect(result).toBe(ANY_SCHEMA);
            expect(GSettingsMock.settings_schema.get_key).toHaveBeenCalledTimes(
                1,
            );
            expect(GSettingsMock.settings_schema.get_key).toHaveBeenCalledWith(
                "docker-section-show-images",
            );
        });
    });

    describe("PodmanSectionEnabled", () => {
        it("isPodmanSectionEnabled() returns the value from GSettings without modifications", () => {
            GSettingsMock.get_boolean.mockReturnValue(ANY_INT_VALUE);

            const result = Settings.isPodmanSectionEnabled();

            expect(GSettingsMock.get_boolean).toHaveBeenCalledWith(
                "podman-section-enabled",
            );
            expect(result).toBe(ANY_INT_VALUE);
        });

        it("bindPodmanSectionEnabled() binds the value of GSettings", () => {
            Settings.bindPodmanSectionEnabled(ANY_FIELD_NAME, ANY_BIND_FLAG);

            expect(GSettingsMock.bind).toHaveBeenCalledWith(
                "podman-section-enabled",
                ANY_FIELD_NAME,
                "active",
                ANY_BIND_FLAG,
            );
        });

        it("describePodmanSectionEnabled() returns the schema from GSettings without modifications", () => {
            GSettingsMock.settings_schema.get_key.mockReturnValue(ANY_SCHEMA);

            const result = Settings.describePodmanSectionEnabled();

            expect(result).toBe(ANY_SCHEMA);
            expect(GSettingsMock.settings_schema.get_key).toHaveBeenCalledTimes(
                1,
            );
            expect(GSettingsMock.settings_schema.get_key).toHaveBeenCalledWith(
                "podman-section-enabled",
            );
        });
    });

    describe("ShowPodmanImages", () => {
        it("shouldShowPodmanImages() returns the value from GSettings without modifications", () => {
            GSettingsMock.get_boolean.mockReturnValue(ANY_INT_VALUE);

            const result = Settings.shouldShowPodmanImages();

            expect(GSettingsMock.get_boolean).toHaveBeenCalledWith(
                "podman-section-show-images",
            );
            expect(result).toBe(ANY_INT_VALUE);
        });

        it("bindShowPodmanImages() binds the value of GSettings", () => {
            Settings.bindShowPodmanImages(ANY_FIELD_NAME, ANY_BIND_FLAG);

            expect(GSettingsMock.bind).toHaveBeenCalledWith(
                "podman-section-show-images",
                ANY_FIELD_NAME,
                "active",
                ANY_BIND_FLAG,
            );
        });

        it("describeShowPodmanImages() returns the schema from GSettings without modifications", () => {
            GSettingsMock.settings_schema.get_key.mockReturnValue(ANY_SCHEMA);

            const result = Settings.describeShowPodmanImages();

            expect(result).toBe(ANY_SCHEMA);
            expect(GSettingsMock.settings_schema.get_key).toHaveBeenCalledTimes(
                1,
            );
            expect(GSettingsMock.settings_schema.get_key).toHaveBeenCalledWith(
                "podman-section-show-images",
            );
        });
    });
});
