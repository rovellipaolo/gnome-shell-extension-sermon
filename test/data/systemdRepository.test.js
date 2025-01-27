import { jest, beforeEach, describe, expect, it } from "@jest/globals";

jest.unstable_mockModule("../../src/data/commandLine.js", () => ({
    find: jest.fn(),
    execute: jest.fn(),
    executeAsync: jest.fn(),
}));
const CommandLineMock = await import("../../src/data/commandLine.js");

jest.unstable_mockModule("../../src/util/log.js", () => ({
    d: () => {},
    e: () => {},
    i: () => {},
    w: () => {},
}));

jest.unstable_mockModule("../../src/data/settings.js", () => ({
    default: {
        shouldShowSystemdUserServices: jest.fn(),
        shouldShowOnlySystemdLoadedServices: jest.fn(),
        shouldFilterSystemdServicesByPriorityList: jest.fn(),
        getSystemdServicesPriorityList: jest.fn(),
    },
}));
const SettingsMock = await import("../../src/data/settings.js");

const SystemdRepository = await import("../../src/data/systemdRepository.js");

describe("SystemdRepository", () => {
    const ANY_SERVICE_ID = "any-service.service";
    const ANY_SERVICE_NAME = "any-service";
    const ANY_OTHER_SERVICE_ID = "any-other-service.service";
    const ANY_OTHER_SERVICE_NAME = "any-other-service";
    const ANY_LIST_UNITS_STDOUT =
        "UNIT                       LOAD      ACTIVE    SUB     DESCRIPTION\n" +
        `${ANY_SERVICE_ID}          loaded    active   running  Any description\n` +
        `${ANY_OTHER_SERVICE_ID}    loaded    active   running  Any description\n` +
        "\n" +
        "LOAD   = Reflects whether the unit definition was properly loaded.\n" +
        "ACTIVE = The high-level unit activation state, i.e. generalization of SUB.\n" +
        "SUB    = The low-level unit activation state, values depend on unit type.\n" +
        "\n" +
        "2 loaded units listed.\n" +
        "To show all installed unit files use 'systemctl list-unit-files'.";
    const ANY_LIST_UNIT_FILES_STDOUT =
        "UNIT FILE                  STATE       VENDOR PRESET\n" +
        `${ANY_SERVICE_ID}          enabled     enabled      \n` +
        `${ANY_OTHER_SERVICE_ID}    enabled     enabled      \n` +
        "2 unit files listed.";

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("isInstalled()", () => {
        it.each`
            path                    | expected
            ${null}                 | ${false}
            ${"~/any/path/to/cron"} | ${true}
        `(
            "returns $expected when CommandLine datasource returns '$path'",
            ({ path, expected }) => {
                CommandLineMock.find.mockReturnValue(path);

                const result = SystemdRepository.isInstalled();

                expect(result).toBe(expected);
                expect(CommandLineMock.find).toHaveBeenCalledTimes(1);
                expect(CommandLineMock.find).toHaveBeenCalledWith("systemctl");
            },
        );
    });

    describe("getServices()", () => {
        it.each`
            isUser       | expectedFlag
            ${undefined} | ${"--system"}
            ${false}     | ${"--system"}
            ${true}      | ${"--user"}
        `(
            "calls systemctl list-units and list-unit-files commands successfully with $expectedFlag flag when isUser=$isUser",
            async ({ isUser, expectedFlag }) => {
                SettingsMock.default.shouldShowOnlySystemdLoadedServices.mockReturnValue(
                    false,
                );
                SettingsMock.default.shouldFilterSystemdServicesByPriorityList.mockReturnValue(
                    false,
                );
                SettingsMock.default.getSystemdServicesPriorityList.mockReturnValue(
                    "",
                );
                CommandLineMock.execute
                    .mockResolvedValueOnce(ANY_LIST_UNITS_STDOUT)
                    .mockResolvedValueOnce(ANY_LIST_UNIT_FILES_STDOUT);

                await SystemdRepository.getServices(isUser);

                expect(CommandLineMock.execute).toHaveBeenCalledTimes(2);
                expect(CommandLineMock.execute).toHaveBeenNthCalledWith(
                    1,
                    `systemctl list-units --type=service --all ${expectedFlag}`,
                );
                expect(CommandLineMock.execute).toHaveBeenNthCalledWith(
                    2,
                    `systemctl list-unit-files --type=service --all ${expectedFlag}`,
                );
            },
        );

        it.each`
            isUser       | expectedFlag
            ${undefined} | ${"--system"}
            ${false}     | ${"--system"}
            ${true}      | ${"--user"}
        `(
            "calls systemctl list-units command only, not list-unit-files one, with $expectedFlag flag when isUser=$isUser",
            async ({ isUser, expectedFlag }) => {
                SettingsMock.default.shouldShowOnlySystemdLoadedServices.mockReturnValue(
                    true,
                );
                SettingsMock.default.shouldFilterSystemdServicesByPriorityList.mockReturnValue(
                    false,
                );
                SettingsMock.default.getSystemdServicesPriorityList.mockReturnValue(
                    "",
                );
                CommandLineMock.execute.mockResolvedValue(
                    ANY_LIST_UNITS_STDOUT,
                );

                await SystemdRepository.getServices(isUser);

                expect(CommandLineMock.execute).toHaveBeenCalledTimes(1);
                expect(CommandLineMock.execute).toHaveBeenCalledWith(
                    `systemctl list-units --type=service --all ${expectedFlag}`,
                );
            },
        );

        it.each`
            unit                           | load           | active        | sub          | expectedName           | isEnabled | isActive | isRunning | isUser
            ${"any-service.service"}       | ${"not-found"} | ${"inactive"} | ${"dead"}    | ${"any-service"}       | ${false}  | ${false} | ${false}  | ${false}
            ${"any-service.service"}       | ${"masked"}    | ${"inactive"} | ${"dead"}    | ${"any-service"}       | ${false}  | ${false} | ${false}  | ${false}
            ${"any-service.service"}       | ${"loaded"}    | ${"active"}   | ${"exited"}  | ${"any-service"}       | ${true}   | ${true}  | ${false}  | ${false}
            ${"any-service.service"}       | ${"loaded"}    | ${"active"}   | ${"running"} | ${"any-service"}       | ${true}   | ${true}  | ${true}   | ${false}
            ${"● any-service.service"}     | ${"loaded"}    | ${"active"}   | ${"running"} | ${"any-service"}       | ${true}   | ${true}  | ${true}   | ${false}
            ${"any-service.v1.service"}    | ${"loaded"}    | ${"active"}   | ${"running"} | ${"any-service.v1"}    | ${true}   | ${true}  | ${true}   | ${false}
            ${"any-service.v1.v2.service"} | ${"loaded"}    | ${"active"}   | ${"running"} | ${"any-service.v1.v2"} | ${true}   | ${true}  | ${true}   | ${false}
            ${"any-service.service"}       | ${"not-found"} | ${"inactive"} | ${"dead"}    | ${"any-service"}       | ${false}  | ${false} | ${false}  | ${true}
            ${"any-service.service"}       | ${"masked"}    | ${"inactive"} | ${"dead"}    | ${"any-service"}       | ${false}  | ${false} | ${false}  | ${true}
            ${"any-service.service"}       | ${"loaded"}    | ${"active"}   | ${"exited"}  | ${"any-service"}       | ${true}   | ${true}  | ${false}  | ${true}
            ${"any-service.service"}       | ${"loaded"}    | ${"active"}   | ${"running"} | ${"any-service"}       | ${true}   | ${true}  | ${true}   | ${true}
            ${"● any-service.service"}     | ${"loaded"}    | ${"active"}   | ${"running"} | ${"any-service"}       | ${true}   | ${true}  | ${true}   | ${true}
            ${"any-service.v1.service"}    | ${"loaded"}    | ${"active"}   | ${"running"} | ${"any-service.v1"}    | ${true}   | ${true}  | ${true}   | ${true}
            ${"any-service.v1.v2.service"} | ${"loaded"}    | ${"active"}   | ${"running"} | ${"any-service.v1.v2"} | ${true}   | ${true}  | ${true}   | ${true}
        `(
            "returns the parsed (loaded) services when systemctl list-units command successfully returns service $unit, $load, $active and $sub",
            async ({
                unit,
                load,
                active,
                sub,
                expectedName,
                isEnabled,
                isActive,
                isRunning,
                isUser,
            }) => {
                SettingsMock.default.shouldShowOnlySystemdLoadedServices.mockReturnValue(
                    true,
                );
                SettingsMock.default.shouldFilterSystemdServicesByPriorityList.mockReturnValue(
                    false,
                );
                SettingsMock.default.getSystemdServicesPriorityList.mockReturnValue(
                    "",
                );
                CommandLineMock.execute.mockResolvedValue(
                    "UNIT      LOAD      ACTIVE      SUB     DESCRIPTION\n" +
                        `${unit}   ${load}   ${active}   ${sub}  Any description\n` +
                        "\n" +
                        "LOAD   = Reflects whether the unit definition was properly loaded.\n" +
                        "ACTIVE = The high-level unit activation state, i.e. generalization of SUB.\n" +
                        "SUB    = The low-level unit activation state, values depend on unit type.\n" +
                        "\n" +
                        "1 loaded units listed.\n" +
                        "To show all installed unit files use 'systemctl list-unit-files'.",
                );

                const result = await SystemdRepository.getServices(isUser);

                expect(result).toEqual([
                    {
                        id: `${expectedName}.service`,
                        name: expectedName,
                        isEnabled: isEnabled,
                        canBeEnabled: false,
                        isActive: isActive,
                        isRunning: isRunning,
                        isUser: isUser,
                    },
                ]);
            },
        );

        it.each`
            shouldFilterByPriorityList | priorityList                                          | expectedServiceIds
            ${false}                   | ${""}                                                 | ${["any-running-s5.service", "any-running-s6.service", "any-active-s3.service", "any-active-s4.service", "any-inactive-s1.service", "any-inactive-s2.service"]}
            ${false}                   | ${"any-not-existing-service"}                         | ${["any-running-s5.service", "any-running-s6.service", "any-active-s3.service", "any-active-s4.service", "any-inactive-s1.service", "any-inactive-s2.service"]}
            ${false}                   | ${"any-inactive-s2.service,any-not-existing-service"} | ${["any-inactive-s2.service", "any-running-s5.service", "any-running-s6.service", "any-active-s3.service", "any-active-s4.service", "any-inactive-s1.service"]}
            ${false}                   | ${"any-inactive-s2,any-active-s4,any-running-s6"}     | ${["any-running-s6.service", "any-active-s4.service", "any-inactive-s2.service", "any-running-s5.service", "any-active-s3.service", "any-inactive-s1.service"]}
            ${true}                    | ${"any-inactive-s2.service,any-not-existing-service"} | ${["any-inactive-s2.service"]}
            ${true}                    | ${"any-inactive-s2,any-active-s4,any-running-s6"}     | ${["any-running-s6.service", "any-active-s4.service", "any-inactive-s2.service"]}
        `(
            "returns the parsed (loaded) services sorted by priority and status when SystemdServicesPriorityList is '$priorityList' and shouldFilterSystemdServicesByPriorityList is $shouldFilterByPriorityList",
            async ({
                shouldFilterByPriorityList,
                priorityList,
                expectedServiceIds,
            }) => {
                SettingsMock.default.shouldShowOnlySystemdLoadedServices.mockReturnValue(
                    true,
                );
                SettingsMock.default.shouldFilterSystemdServicesByPriorityList.mockReturnValue(
                    shouldFilterByPriorityList,
                );
                SettingsMock.default.getSystemdServicesPriorityList.mockReturnValue(
                    priorityList,
                );
                CommandLineMock.execute.mockResolvedValue(
                    "UNIT                       LOAD        ACTIVE      SUB         DESCRIPTION\n" +
                        "any-inactive-s1.service    not-found   inactive    dead        Any service1 description\n" +
                        "any-inactive-s2.service    masked      inactive    dead        Any service2 description\n" +
                        "any-active-s3.service      loaded      active      exited      Any service3 description\n" +
                        "any-active-s4.service      loaded      active      exited      Any service4 description\n" +
                        "any-running-s5.service     loaded      active      running     Any service4 description\n" +
                        "any-running-s6.service     loaded      active      running     Any service4 description\n" +
                        "\n" +
                        "LOAD   = Reflects whether the unit definition was properly loaded.\n" +
                        "ACTIVE = The high-level unit activation state, i.e. generalization of SUB.\n" +
                        "SUB    = The low-level unit activation state, values depend on unit type.\n" +
                        "\n" +
                        "6 loaded units listed.\n" +
                        "To show all installed unit files use 'systemctl list-unit-files'.",
                );

                const result = await SystemdRepository.getServices();

                const ids = result.map((service) => service.id);
                expect(ids).toEqual(expectedServiceIds);
            },
        );

        it.each`
            unitFile                                | state                | expectedName                    | isEnabled | canBeEnabled | isUser
            ${"any-unloaded-service.service"}       | ${"disabled"}        | ${"any-unloaded-service"}       | ${false}  | ${true}      | ${false}
            ${"any-unloaded-service.service"}       | ${"masked"}          | ${"any-unloaded-service"}       | ${false}  | ${false}     | ${false}
            ${"any-unloaded-service.service"}       | ${"static"}          | ${"any-unloaded-service"}       | ${false}  | ${false}     | ${false}
            ${"any-unloaded-service.service"}       | ${"generated"}       | ${"any-unloaded-service"}       | ${true}   | ${false}     | ${false}
            ${"any-unloaded-service.service"}       | ${"enabled-runtime"} | ${"any-unloaded-service"}       | ${true}   | ${true}      | ${false}
            ${"any-unloaded-service.service"}       | ${"enabled"}         | ${"any-unloaded-service"}       | ${true}   | ${true}      | ${false}
            ${"any-unloaded-service.v1.service"}    | ${"enabled"}         | ${"any-unloaded-service.v1"}    | ${true}   | ${true}      | ${false}
            ${"any-unloaded-service.v1.v2.service"} | ${"enabled"}         | ${"any-unloaded-service.v1.v2"} | ${true}   | ${true}      | ${false}
            ${"any-unloaded-service.service"}       | ${"disabled"}        | ${"any-unloaded-service"}       | ${false}  | ${true}      | ${true}
            ${"any-unloaded-service.service"}       | ${"masked"}          | ${"any-unloaded-service"}       | ${false}  | ${false}     | ${true}
            ${"any-unloaded-service.service"}       | ${"static"}          | ${"any-unloaded-service"}       | ${false}  | ${false}     | ${true}
            ${"any-unloaded-service.service"}       | ${"generated"}       | ${"any-unloaded-service"}       | ${true}   | ${false}     | ${true}
            ${"any-unloaded-service.service"}       | ${"enabled-runtime"} | ${"any-unloaded-service"}       | ${true}   | ${true}      | ${true}
            ${"any-unloaded-service.service"}       | ${"enabled"}         | ${"any-unloaded-service"}       | ${true}   | ${true}      | ${true}
            ${"any-unloaded-service.v1.service"}    | ${"enabled"}         | ${"any-unloaded-service.v1"}    | ${true}   | ${true}      | ${true}
            ${"any-unloaded-service.v1.v2.service"} | ${"enabled"}         | ${"any-unloaded-service.v1.v2"} | ${true}   | ${true}      | ${true}
        `(
            "returns the parsed (loaded and unloaded) services when systemctl list-units and list-unit-files commands successfully return service $unitFile and $state",
            async ({
                unitFile,
                state,
                expectedName,
                isEnabled,
                canBeEnabled,
                isUser,
            }) => {
                SettingsMock.default.shouldShowOnlySystemdLoadedServices.mockReturnValue(
                    false,
                );
                SettingsMock.default.shouldFilterSystemdServicesByPriorityList.mockReturnValue(
                    false,
                );
                SettingsMock.default.getSystemdServicesPriorityList.mockReturnValue(
                    "",
                );
                CommandLineMock.execute
                    .mockResolvedValueOnce(
                        "UNIT                         LOAD     ACTIVE   SUB      DESCRIPTION\n" +
                            "any-loaded-service.service   loaded   active   running  Any description\n" +
                            "\n" +
                            "LOAD   = Reflects whether the unit definition was properly loaded.\n" +
                            "ACTIVE = The high-level unit activation state, i.e. generalization of SUB.\n" +
                            "SUB    = The low-level unit activation state, values depend on unit type.\n" +
                            "\n" +
                            "1 loaded units listed.\n" +
                            "To show all installed unit files use 'systemctl list-unit-files'.",
                    )
                    .mockResolvedValueOnce(
                        "UNIT FILE                      STATE       VENDOR PRESET\n" +
                            "any-loaded-service.service     enabled     enabled      \n" +
                            `${unitFile}                    ${state}    enabled      \n` +
                            "2 unit files listed.",
                    );

                const result = await SystemdRepository.getServices(isUser);

                expect(result).toEqual([
                    {
                        id: "any-loaded-service.service",
                        name: "any-loaded-service",
                        isEnabled: true,
                        canBeEnabled: true,
                        isActive: true,
                        isRunning: true,
                        isUser: isUser,
                    },
                    {
                        id: unitFile,
                        name: expectedName,
                        isEnabled: isEnabled,
                        canBeEnabled: canBeEnabled,
                        isActive: false,
                        isRunning: false,
                        isUser: isUser,
                    },
                ]);
            },
        );

        it.each`
            shouldFilterByPriorityList | priorityList                                                      | expectedServiceIds
            ${false}                   | ${""}                                                             | ${["any-running-s5.service", "any-running-s6.service", "any-active-s3.service", "any-active-s4.service", "any-unloaded-s0.service", "any-inactive-s1.service", "any-inactive-s2.service", "any-unloaded-s7.service"]}
            ${false}                   | ${"any-not-existing-service"}                                     | ${["any-running-s5.service", "any-running-s6.service", "any-active-s3.service", "any-active-s4.service", "any-unloaded-s0.service", "any-inactive-s1.service", "any-inactive-s2.service", "any-unloaded-s7.service"]}
            ${false}                   | ${"any-inactive-s2.service,any-not-existing-service"}             | ${["any-inactive-s2.service", "any-running-s5.service", "any-running-s6.service", "any-active-s3.service", "any-active-s4.service", "any-unloaded-s0.service", "any-inactive-s1.service", "any-unloaded-s7.service"]}
            ${false}                   | ${"any-unloaded-s0,any-inactive-s2,any-active-s4,any-running-s6"} | ${["any-running-s6.service", "any-active-s4.service", "any-unloaded-s0.service", "any-inactive-s2.service", "any-running-s5.service", "any-active-s3.service", "any-inactive-s1.service", "any-unloaded-s7.service"]}
            ${true}                    | ${"any-inactive-s2.service,any-not-existing-service"}             | ${["any-inactive-s2.service"]}
            ${true}                    | ${"any-unloaded-s0,any-inactive-s2,any-active-s4,any-running-s6"} | ${["any-running-s6.service", "any-active-s4.service", "any-unloaded-s0.service", "any-inactive-s2.service"]}
        `(
            "returns the parsed (loaded and unloaded) services sorted by priority and status when SystemdServicesPriorityList is '$priorityList' and shouldFilterSystemdServicesByPriorityList is $shouldFilterByPriorityList",
            async ({
                shouldFilterByPriorityList,
                priorityList,
                expectedServiceIds,
            }) => {
                SettingsMock.default.shouldShowOnlySystemdLoadedServices.mockReturnValue(
                    false,
                );
                SettingsMock.default.shouldFilterSystemdServicesByPriorityList.mockReturnValue(
                    shouldFilterByPriorityList,
                );
                SettingsMock.default.getSystemdServicesPriorityList.mockReturnValue(
                    priorityList,
                );
                CommandLineMock.execute
                    .mockResolvedValueOnce(
                        "UNIT                       LOAD        ACTIVE      SUB         DESCRIPTION\n" +
                            "any-inactive-s1.service    not-found   inactive    dead        Any service1 description\n" +
                            "any-inactive-s2.service    masked      inactive    dead        Any service2 description\n" +
                            "any-active-s3.service      loaded      active      exited      Any service3 description\n" +
                            "any-active-s4.service      loaded      active      exited      Any service4 description\n" +
                            "any-running-s5.service     loaded      active      running     Any service4 description\n" +
                            "any-running-s6.service     loaded      active      running     Any service4 description\n" +
                            "\n" +
                            "LOAD   = Reflects whether the unit definition was properly loaded.\n" +
                            "ACTIVE = The high-level unit activation state, i.e. generalization of SUB.\n" +
                            "SUB    = The low-level unit activation state, values depend on unit type.\n" +
                            "\n" +
                            "6 loaded units listed.\n" +
                            "To show all installed unit files use 'systemctl list-unit-files'.",
                    )
                    .mockResolvedValueOnce(
                        "UNIT FILE                  STATE               VENDOR PRESET\n" +
                            "any-unloaded-s0.service    disabled            enabled      \n" +
                            "any-inactive-s1.service    disabled            enabled      \n" +
                            "any-inactive-s2.service    masked              enabled      \n" +
                            "any-active-s3.service      static              enabled      \n" +
                            "any-active-s4.service      generated           enabled      \n" +
                            "any-running-s5.service     enabled-runtime     enabled      \n" +
                            "any-running-s6.service     enabled             enabled      \n" +
                            "any-unloaded-s7.service    masked              enabled      \n" +
                            "8 unit files listed.",
                    );

                const result = await SystemdRepository.getServices();

                const ids = result.map((service) => service.id);
                expect(ids).toEqual(expectedServiceIds);
            },
        );

        it.each([
            [""],
            ["any-not-existing-service.service"],
            ["yet-another-service", "any-not-existing-service.service"],
        ])(
            "throws an error when SystemdServicesPriorityList is '%s' (empty or no service matching) and shouldFilterSystemdServicesByPriorityList is true",
            async (priorityList) => {
                SettingsMock.default.shouldShowOnlySystemdLoadedServices.mockReturnValue(
                    false,
                );
                SettingsMock.default.shouldFilterSystemdServicesByPriorityList.mockReturnValue(
                    true,
                );
                SettingsMock.default.getSystemdServicesPriorityList.mockReturnValue(
                    priorityList,
                );
                CommandLineMock.execute
                    .mockResolvedValueOnce(ANY_LIST_UNITS_STDOUT)
                    .mockResolvedValueOnce(ANY_LIST_UNIT_FILES_STDOUT);

                await expect(SystemdRepository.getServices()).rejects.toThrow(
                    new Error("No service found!"),
                );
            },
        );

        it.each([[false], [true]])(
            "returns only loaded services when systemctl list-unit command succeed but list-unit-files command fails and isUser=%s",
            async (isUser) => {
                SettingsMock.default.shouldShowOnlySystemdLoadedServices.mockReturnValue(
                    false,
                );
                SettingsMock.default.shouldFilterSystemdServicesByPriorityList.mockReturnValue(
                    false,
                );
                SettingsMock.default.getSystemdServicesPriorityList.mockReturnValue(
                    "",
                );
                CommandLineMock.execute
                    .mockResolvedValueOnce(ANY_LIST_UNITS_STDOUT)
                    .mockRejectedValueOnce(new Error("any-error"));

                const result = await SystemdRepository.getServices(isUser);

                expect(result).toEqual([
                    {
                        id: ANY_SERVICE_ID,
                        name: ANY_SERVICE_NAME,
                        isEnabled: true,
                        canBeEnabled: false,
                        isActive: true,
                        isRunning: true,
                        isUser: isUser,
                    },
                    {
                        id: ANY_OTHER_SERVICE_ID,
                        name: ANY_OTHER_SERVICE_NAME,
                        isEnabled: true,
                        canBeEnabled: false,
                        isActive: true,
                        isRunning: true,
                        isUser: isUser,
                    },
                ]);
            },
        );

        it("throws an error when systemctl list-units and list-unit-files commands return no service", async () => {
            SettingsMock.default.shouldShowOnlySystemdLoadedServices.mockReturnValue(
                false,
            );
            SettingsMock.default.shouldFilterSystemdServicesByPriorityList.mockReturnValue(
                false,
            );
            SettingsMock.default.getSystemdServicesPriorityList.mockReturnValue(
                "",
            );
            CommandLineMock.execute
                .mockResolvedValueOnce(
                    "UNIT      LOAD      ACTIVE      SUB     DESCRIPTION\n" +
                        "\n" +
                        "LOAD   = Reflects whether the unit definition was properly loaded.\n" +
                        "ACTIVE = The high-level unit activation state, i.e. generalization of SUB.\n" +
                        "SUB    = The low-level unit activation state, values depend on unit type.\n" +
                        "\n" +
                        "6 loaded units listed.\n" +
                        "To show all installed unit files use 'systemctl list-unit-files'.",
                )
                .mockResolvedValueOnce(
                    "UNIT FILE    STATE    VENDOR PRESET\n" +
                        "0 unit files listed.",
                );

            await expect(SystemdRepository.getServices()).rejects.toThrow(
                new Error("No service found!"),
            );
        });

        it.each([[false], [true]])(
            "throws an error when systemctl list-units command fails and isUser=%s",
            async (isUser) => {
                CommandLineMock.execute.mockRejectedValue(
                    new Error("any-error"),
                );

                await expect(
                    SystemdRepository.getServices(isUser),
                ).rejects.toThrow(new Error("any-error"));
            },
        );
    });

    describe("isServiceRunning()", () => {
        it.each`
            stdout        | userFlag | expectedFlag | expected
            ${"inactive"} | ${false} | ${""}        | ${false}
            ${"inactive"} | ${true}  | ${" --user"} | ${false}
            ${"active"}   | ${false} | ${""}        | ${true}
            ${"active"}   | ${true}  | ${" --user"} | ${true}
        `(
            "returns '$expected' when systemctl is-active command successfully returns '$stdout'",
            async ({ stdout, userFlag, expectedFlag, expected }) => {
                CommandLineMock.execute.mockResolvedValue(stdout);

                const result = await SystemdRepository.isServiceRunning(
                    ANY_SERVICE_ID,
                    userFlag,
                );

                expect(result).toBe(expected);
                expect(CommandLineMock.execute).toHaveBeenCalledTimes(1);
                expect(CommandLineMock.execute).toHaveBeenCalledWith(
                    `systemctl is-active ${ANY_SERVICE_ID}${expectedFlag}`,
                );
            },
        );

        it.each(
            "returns 'false' when systemctl is-active command returns no response",
            async () => {
                CommandLineMock.execute.mockResolvedValue(null);

                const result =
                    await SystemdRepository.isServiceRunning(ANY_SERVICE_ID);

                expect(result).toBe(false);
            },
        );

        it.each(
            "returns 'false' when systemctl is-active command fails",
            async () => {
                CommandLineMock.execute.mockRejectedValue(
                    new Error("any-error"),
                );

                const result =
                    await SystemdRepository.isServiceRunning(ANY_SERVICE_ID);

                expect(result).toBe(false);
            },
        );
    });

    describe("enableService()", () => {
        it.each`
            isUser   | expectedFlag
            ${false} | ${""}
            ${true}  | ${" --user"}
        `(
            "calls systemctl enable command with '$expectedFlag' when isUser=$isUser",
            async ({ isUser, expectedFlag }) => {
                CommandLineMock.executeAsync.mockResolvedValue();

                await SystemdRepository.enableService(ANY_SERVICE_ID, isUser);

                expect(CommandLineMock.executeAsync).toHaveBeenCalledTimes(1);
                expect(CommandLineMock.executeAsync).toHaveBeenCalledWith(
                    `systemctl enable ${ANY_SERVICE_ID}${expectedFlag}`,
                );
            },
        );

        it.each([[false], [true]])(
            "throws an error when no systemctl enable command fails and isUser=%s",
            async (isUser) => {
                const anyError = new Error("any-error");
                CommandLineMock.executeAsync.mockRejectedValue(anyError);

                await expect(
                    SystemdRepository.enableService(ANY_SERVICE_ID, isUser),
                ).rejects.toThrow(anyError);
            },
        );
    });

    describe("startService()", () => {
        it.each`
            isUser   | expectedFlag
            ${false} | ${""}
            ${true}  | ${" --user"}
        `(
            "calls systemctl start command with '$expectedFlag' when isUser=$isUser",
            async ({ isUser, expectedFlag }) => {
                CommandLineMock.executeAsync.mockResolvedValue();

                await SystemdRepository.startService(ANY_SERVICE_ID, isUser);

                expect(CommandLineMock.executeAsync).toHaveBeenCalledTimes(1);
                expect(CommandLineMock.executeAsync).toHaveBeenCalledWith(
                    `systemctl start ${ANY_SERVICE_ID}${expectedFlag}`,
                );
            },
        );

        it.each([[false], [true]])(
            "throws an error when systemctl start command fails and isUser=%s",
            async (isUser) => {
                const anyError = new Error("any-error");
                CommandLineMock.executeAsync.mockRejectedValue(anyError);

                await expect(
                    SystemdRepository.startService(ANY_SERVICE_ID, isUser),
                ).rejects.toThrow(anyError);
            },
        );
    });

    describe("stopService()", () => {
        it.each`
            isUser   | expectedFlag
            ${false} | ${""}
            ${true}  | ${" --user"}
        `(
            "calls systemctl stop command with '$expectedFlag' when isUser=$isUser",
            async ({ isUser, expectedFlag }) => {
                CommandLineMock.executeAsync.mockResolvedValue();

                await SystemdRepository.stopService(ANY_SERVICE_ID, isUser);

                expect(CommandLineMock.executeAsync).toHaveBeenCalledTimes(1);
                expect(CommandLineMock.executeAsync).toHaveBeenCalledWith(
                    `systemctl stop ${ANY_SERVICE_ID}${expectedFlag}`,
                );
            },
        );

        it.each([[false], [true]])(
            "throws an error when systemctl stop command fails and isUser=%s",
            async (isUser) => {
                const anyError = new Error("any-error");
                CommandLineMock.executeAsync.mockRejectedValue(anyError);

                await expect(
                    SystemdRepository.stopService(ANY_SERVICE_ID, isUser),
                ).rejects.toThrow(anyError);
            },
        );
    });

    describe("restartService()", () => {
        it.each`
            isUser   | expectedFlag
            ${false} | ${""}
            ${true}  | ${" --user"}
        `(
            "calls systemctl restart command with '$expectedFlag' when isUser=$isUser",
            async ({ isUser, expectedFlag }) => {
                CommandLineMock.executeAsync.mockResolvedValue();

                await SystemdRepository.restartService(ANY_SERVICE_ID, isUser);

                expect(CommandLineMock.executeAsync).toHaveBeenCalledTimes(1);
                expect(CommandLineMock.executeAsync).toHaveBeenCalledWith(
                    `systemctl restart ${ANY_SERVICE_ID}${expectedFlag}`,
                );
            },
        );

        it.each([[false], [true]])(
            "throws an error when systemctl restart command fails and isUser=%s",
            async (isUser) => {
                const anyError = new Error("any-error");
                CommandLineMock.executeAsync.mockRejectedValue(anyError);

                await expect(
                    SystemdRepository.restartService(ANY_SERVICE_ID, isUser),
                ).rejects.toThrow(anyError);
            },
        );
    });

    describe("disableService()", () => {
        it.each`
            isUser   | expectedFlag
            ${false} | ${""}
            ${true}  | ${" --user"}
        `(
            "calls systemctl disable command with '$expectedFlag' when isUser=$isUser",
            async ({ isUser, expectedFlag }) => {
                CommandLineMock.executeAsync.mockResolvedValue();

                await SystemdRepository.disableService(ANY_SERVICE_ID, isUser);

                expect(CommandLineMock.executeAsync).toHaveBeenCalledTimes(1);
                expect(CommandLineMock.executeAsync).toHaveBeenCalledWith(
                    `systemctl disable ${ANY_SERVICE_ID}${expectedFlag}`,
                );
            },
        );

        it.each([[false], [true]])(
            "throws an error when systemctl disable command fails and isUser=%s",
            async (isUser) => {
                const anyError = new Error("any-error");
                CommandLineMock.executeAsync.mockRejectedValue(anyError);

                await expect(
                    SystemdRepository.disableService(ANY_SERVICE_ID, isUser),
                ).rejects.toThrow(anyError);
            },
        );
    });
});
