import { jest, beforeEach, describe, expect, it } from "@jest/globals";

jest.unstable_mockModule("../../src/data/container.js", () => ({
    isInstalled: jest.fn(),
    getContainers: jest.fn(),
    getImages: jest.fn(),
    startContainer: jest.fn(),
    restartContainer: jest.fn(),
    stopContainer: jest.fn(),
    removeContainer: jest.fn(),
}));
const ContainerMock = await import("../../src/data/container.js");

jest.unstable_mockModule("../../src/util/log.js", () => ({
    d: () => {},
    e: () => {},
    i: () => {},
    w: () => {},
}));

jest.unstable_mockModule("../../src/data/settings.js", () => ({
    default: {
        shouldShowPodmanImages: jest.fn(),
    },
}));
const SettingsMock = await import("../../src/data/settings.js");

const PodmanRepository = await import("../../src/data/podmanRepository.js");

describe("PodmanRepository", () => {
    const ANY_ID = "123456789000";
    const ANY_CONTAINER = {
        id: "123456789000",
        names: ["any-container", "container"],
        isEnabled: true,
        canBeEnabled: true,
        isRunning: true,
    };
    const ANY_IMAGE = {
        id: "fedcba9876543210",
        names: ["any-image:1.0.0-latest"],
        isEnabled: false,
        canBeEnabled: false,
        isRunning: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("isInstalled()", () => {
        it.each([[false], [true]])(
            "calls the Container datasource and returns its value %s without modifications",
            (isInstalled) => {
                ContainerMock.isInstalled.mockReturnValue(isInstalled);

                const result = PodmanRepository.isInstalled();

                expect(result).toBe(isInstalled);
                expect(ContainerMock.isInstalled).toHaveBeenCalledTimes(1);
                expect(ContainerMock.isInstalled).toHaveBeenCalledWith(
                    "podman",
                );
            },
        );
    });

    describe("getContainers()", () => {
        it("returns only the containers from the Container datasource (without modifications) when shouldShowPodmanImages is false", async () => {
            SettingsMock.default.shouldShowPodmanImages.mockReturnValue(false);
            ContainerMock.getContainers.mockResolvedValue([ANY_CONTAINER]);

            const result = await PodmanRepository.getContainers();

            expect(result).toEqual([ANY_CONTAINER]);
            expect(ContainerMock.getContainers).toHaveBeenCalledTimes(1);
            expect(ContainerMock.getContainers).toHaveBeenCalledWith("podman");
            expect(ContainerMock.getImages).not.toHaveBeenCalled();
        });

        it("returns both containers and images when shouldShowPodmanImages is true", async () => {
            SettingsMock.default.shouldShowPodmanImages.mockReturnValue(true);
            ContainerMock.getContainers.mockResolvedValue([ANY_CONTAINER]);
            ContainerMock.getImages.mockResolvedValue([ANY_IMAGE]);

            const result = await PodmanRepository.getContainers();

            expect(result).toEqual([ANY_CONTAINER, ANY_IMAGE]);
            expect(ContainerMock.getContainers).toHaveBeenCalledTimes(1);
            expect(ContainerMock.getContainers).toHaveBeenCalledWith("podman");
            expect(ContainerMock.getImages).toHaveBeenCalledTimes(1);
            expect(ContainerMock.getImages).toHaveBeenCalledWith("podman");
        });

        it("returns only containers when shouldShowPodmanImages is true but no image is returned", async () => {
            SettingsMock.default.shouldShowPodmanImages.mockReturnValue(true);
            ContainerMock.getContainers.mockResolvedValue([ANY_CONTAINER]);
            ContainerMock.getImages.mockRejectedValue(new Error("any-error"));

            const result = await PodmanRepository.getContainers();

            expect(result).toEqual([ANY_CONTAINER]);
        });

        it("returns only images when shouldShowPodmanImages is true and no container is returned", async () => {
            SettingsMock.default.shouldShowPodmanImages.mockReturnValue(true);
            ContainerMock.getContainers.mockRejectedValue(
                new Error("any-error"),
            );
            ContainerMock.getImages.mockResolvedValue([ANY_IMAGE]);

            const result = await PodmanRepository.getContainers();

            expect(result).toEqual([ANY_IMAGE]);
        });

        it.each([[false], [true]])(
            "throws an error when no container or image is returned and shouldShowPodmanImages is %s",
            async (shouldShowPodmanImages) => {
                ContainerMock.getContainers.mockRejectedValue(
                    new Error("any-error"),
                );
                ContainerMock.getImages.mockRejectedValue(
                    new Error("any-error"),
                );
                SettingsMock.default.shouldShowPodmanImages.mockReturnValue(
                    shouldShowPodmanImages,
                );

                await expect(PodmanRepository.getContainers()).rejects.toThrow(
                    new Error("No container found!"),
                );
            },
        );

        it.each([[false], [true]])(
            "throws an error when an empty containers and images list is returned and shouldShowPodmanImages is %s",
            async (shouldShowPodmanImages) => {
                ContainerMock.getContainers.mockResolvedValue([]);
                ContainerMock.getImages.mockResolvedValue([]);
                SettingsMock.default.shouldShowPodmanImages.mockReturnValue(
                    shouldShowPodmanImages,
                );

                await expect(PodmanRepository.getContainers()).rejects.toEqual(
                    new Error("No container found!"),
                );
            },
        );
    });

    describe("startContainer()", () => {
        it("calls the Container datasource and returns a resolved promise when container is started", async () => {
            ContainerMock.startContainer.mockResolvedValue();

            await expect(
                PodmanRepository.startContainer(ANY_ID),
            ).resolves.not.toThrow();
            expect(ContainerMock.startContainer).toHaveBeenCalledTimes(1);
            expect(ContainerMock.startContainer).toHaveBeenCalledWith(
                "podman",
                ANY_ID,
            );
        });

        it("calls the Container datasource and returns a rejected promise when container is not started", async () => {
            ContainerMock.startContainer.mockRejectedValue(
                new Error("any-error"),
            );

            await expect(
                PodmanRepository.startContainer(ANY_ID),
            ).rejects.toThrow();
        });
    });

    describe("restartContainer()", () => {
        it("calls the Container datasource and returns a resolved promise when container is restarted", async () => {
            ContainerMock.restartContainer.mockResolvedValue();

            await expect(
                PodmanRepository.restartContainer(ANY_ID),
            ).resolves.not.toThrow();
            expect(ContainerMock.restartContainer).toHaveBeenCalledTimes(1);
            expect(ContainerMock.restartContainer).toHaveBeenCalledWith(
                "podman",
                ANY_ID,
            );
        });

        it("calls the Container datasource and returns a rejected promise when container is not restarted", async () => {
            ContainerMock.restartContainer.mockRejectedValue(
                new Error("any-error"),
            );

            await expect(
                PodmanRepository.restartContainer(ANY_ID),
            ).rejects.toThrow();
        });
    });

    describe("stopContainer()", () => {
        it("calls the Container datasource and returns a resolved promise when container is stopped", async () => {
            ContainerMock.stopContainer.mockResolvedValue();

            await expect(
                PodmanRepository.stopContainer(ANY_ID),
            ).resolves.not.toThrow();
            expect(ContainerMock.stopContainer).toHaveBeenCalledTimes(1);
            expect(ContainerMock.stopContainer).toHaveBeenCalledWith(
                "podman",
                ANY_ID,
            );
        });

        it("calls the Container datasource and returns a rejected promise when container is not stopped", async () => {
            ContainerMock.stopContainer.mockRejectedValue(
                new Error("any-error"),
            );

            await expect(
                PodmanRepository.stopContainer(ANY_ID),
            ).rejects.toThrow();
        });
    });

    describe("removeContainer()", () => {
        it("calls the Container datasource and returns a resolved promise when container is removed", async () => {
            ContainerMock.removeContainer.mockResolvedValue();

            await expect(
                PodmanRepository.removeContainer(ANY_ID),
            ).resolves.not.toThrow();
            expect(ContainerMock.removeContainer).toHaveBeenCalledTimes(1);
            expect(ContainerMock.removeContainer).toHaveBeenCalledWith(
                "podman",
                ANY_ID,
            );
        });

        it("calls the Container datasource and returns a rejected promise when container is not removed", async () => {
            ContainerMock.removeContainer.mockRejectedValue(
                new Error("any-error"),
            );

            await expect(
                PodmanRepository.removeContainer(ANY_ID),
            ).rejects.toThrow();
        });
    });
});
