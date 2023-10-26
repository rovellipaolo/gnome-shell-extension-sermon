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
        shouldShowDockerImages: jest.fn(),
    },
}));
const SettingsMock = await import("../../src/data/settings.js");

const DockerRepository = await import("../../src/data/dockerRepository.js");

describe("DockerRepository", () => {
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

                const result = DockerRepository.isInstalled();

                expect(result).toBe(isInstalled);
                expect(ContainerMock.isInstalled).toHaveBeenCalledTimes(1);
                expect(ContainerMock.isInstalled).toHaveBeenCalledWith(
                    "docker",
                );
            },
        );
    });

    describe("getContainers()", () => {
        it("returns only the containers from the Container datasource (without modifications) when shouldShowDockerImages is false", async () => {
            SettingsMock.default.shouldShowDockerImages.mockReturnValue(false);
            ContainerMock.getContainers.mockResolvedValue([ANY_CONTAINER]);

            const result = await DockerRepository.getContainers();

            expect(result).toEqual([ANY_CONTAINER]);
            expect(ContainerMock.getContainers).toHaveBeenCalledTimes(1);
            expect(ContainerMock.getContainers).toHaveBeenCalledWith("docker");
            expect(ContainerMock.getImages).not.toHaveBeenCalled();
        });

        it("returns both containers and images when shouldShowDockerImages is true", async () => {
            SettingsMock.default.shouldShowDockerImages.mockReturnValue(true);
            ContainerMock.getContainers.mockResolvedValue([ANY_CONTAINER]);
            ContainerMock.getImages.mockResolvedValue([ANY_IMAGE]);

            const result = await DockerRepository.getContainers();

            expect(result).toEqual([ANY_CONTAINER, ANY_IMAGE]);
            expect(ContainerMock.getContainers).toHaveBeenCalledTimes(1);
            expect(ContainerMock.getContainers).toHaveBeenCalledWith("docker");
            expect(ContainerMock.getImages).toHaveBeenCalledTimes(1);
            expect(ContainerMock.getImages).toHaveBeenCalledWith("docker");
        });

        it("returns only containers when shouldShowDockerImages is true but no image is returned", async () => {
            SettingsMock.default.shouldShowDockerImages.mockReturnValue(true);
            ContainerMock.getContainers.mockResolvedValue([ANY_CONTAINER]);
            ContainerMock.getImages.mockRejectedValue(new Error("any-error"));

            const result = await DockerRepository.getContainers();

            expect(result).toEqual([ANY_CONTAINER]);
        });

        it("returns only images when shouldShowDockerImages is true and no container is returned", async () => {
            SettingsMock.default.shouldShowDockerImages.mockReturnValue(true);
            ContainerMock.getContainers.mockRejectedValue(
                new Error("any-error"),
            );
            ContainerMock.getImages.mockResolvedValue([ANY_IMAGE]);

            const result = await DockerRepository.getContainers();

            expect(result).toEqual([ANY_IMAGE]);
        });

        it.each([[false], [true]])(
            "throws an error when no container or image is returned and shouldShowDockerImages is %s",
            async (shouldShowDockerImages) => {
                ContainerMock.getContainers.mockRejectedValue(
                    new Error("any-error"),
                );
                ContainerMock.getImages.mockRejectedValue(
                    new Error("any-error"),
                );
                SettingsMock.default.shouldShowDockerImages.mockReturnValue(
                    shouldShowDockerImages,
                );

                await expect(DockerRepository.getContainers()).rejects.toThrow(
                    new Error("No container found!"),
                );
            },
        );

        it.each([[false], [true]])(
            "throws an error when an empty containers and images list is returned and shouldShowDockerImages is %s",
            async (shouldShowDockerImages) => {
                ContainerMock.getContainers.mockResolvedValue([]);
                ContainerMock.getImages.mockResolvedValue([]);
                SettingsMock.default.shouldShowDockerImages.mockReturnValue(
                    shouldShowDockerImages,
                );

                await expect(DockerRepository.getContainers()).rejects.toEqual(
                    new Error("No container found!"),
                );
            },
        );
    });

    describe("startContainer()", () => {
        it("calls the Container datasource and returns a resolved promise when container is started", async () => {
            ContainerMock.startContainer.mockResolvedValue();

            await expect(
                DockerRepository.startContainer(ANY_ID),
            ).resolves.not.toThrow();
            expect(ContainerMock.startContainer).toHaveBeenCalledTimes(1);
            expect(ContainerMock.startContainer).toHaveBeenCalledWith(
                "docker",
                ANY_ID,
            );
        });

        it("calls the Container datasource and returns a rejected promise when container is not started", async () => {
            ContainerMock.startContainer.mockRejectedValue(
                new Error("any-error"),
            );

            await expect(
                DockerRepository.startContainer(ANY_ID),
            ).rejects.toThrow();
        });
    });

    describe("restartContainer()", () => {
        it("calls the Container datasource and returns a resolved promise when container is restarted", async () => {
            ContainerMock.restartContainer.mockResolvedValue();

            await expect(
                DockerRepository.restartContainer(ANY_ID),
            ).resolves.not.toThrow();
            expect(ContainerMock.restartContainer).toHaveBeenCalledTimes(1);
            expect(ContainerMock.restartContainer).toHaveBeenCalledWith(
                "docker",
                ANY_ID,
            );
        });

        it("calls the Container datasource and returns a rejected promise when container is not restarted", async () => {
            ContainerMock.restartContainer.mockRejectedValue(
                new Error("any-error"),
            );

            await expect(
                DockerRepository.restartContainer(ANY_ID),
            ).rejects.toThrow();
        });
    });

    describe("stopContainer()", () => {
        it("calls the Container datasource and returns a resolved promise when container is stopped", async () => {
            ContainerMock.stopContainer.mockResolvedValue();

            await expect(
                DockerRepository.stopContainer(ANY_ID),
            ).resolves.not.toThrow();
            expect(ContainerMock.stopContainer).toHaveBeenCalledTimes(1);
            expect(ContainerMock.stopContainer).toHaveBeenCalledWith(
                "docker",
                ANY_ID,
            );
        });

        it("calls the Container datasource and returns a rejected promise when container is not stopped", async () => {
            ContainerMock.stopContainer.mockRejectedValue(
                new Error("any-error"),
            );

            await expect(
                DockerRepository.stopContainer(ANY_ID),
            ).rejects.toThrow();
        });
    });

    describe("removeContainer()", () => {
        it("calls the Container datasource and returns a resolved promise when container is removed", async () => {
            ContainerMock.removeContainer.mockResolvedValue();

            await expect(
                DockerRepository.removeContainer(ANY_ID),
            ).resolves.not.toThrow();
            expect(ContainerMock.removeContainer).toHaveBeenCalledTimes(1);
            expect(ContainerMock.removeContainer).toHaveBeenCalledWith(
                "docker",
                ANY_ID,
            );
        });

        it("calls the Container datasource and returns a rejected promise when container is not removed", async () => {
            ContainerMock.removeContainer.mockRejectedValue(
                new Error("any-error"),
            );

            await expect(
                DockerRepository.removeContainer(ANY_ID),
            ).rejects.toThrow();
        });
    });
});
