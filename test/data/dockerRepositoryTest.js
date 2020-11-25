"use strict";

// Import dummy/fake Gjs implementations:
imports.searchPath.push("./test/util/fake");
const ContainerMock = imports.misc.Me.imports.src.data.container;

const GjsMockito = imports.test.util.gjsMockito;
const when = GjsMockito.when;
const expectMock = GjsMockito.verify;

const sut = imports.src.data.dockerRepository;

/* exported testSuite */
function testSuite() {
    const ANY_ID = "123456789000";
    const ANY_PROMISE = new Promise((resolve) => resolve());

    describe("DockerRepository.isInstalled()", () => {
        const IS_INSTALLED = true;

        it("when retrieving whether Docker is installed, returns the response of the Container datasource without modifications", () => {
            when(ContainerMock, "isInstalled").thenReturn(IS_INSTALLED);

            const result = sut.isInstalled();

            expect(result).toBe(IS_INSTALLED);
            expectMock(ContainerMock, "isInstalled").toHaveBeenCalledWith(
                "docker"
            );
        });
    });

    describe("DockerRepository.getContainers()", () => {
        it("when retrieving the Docker containers, the value from the Container datasource is returned without modifications", () => {
            when(ContainerMock, "getContainers").thenReturn(ANY_PROMISE);

            const result = sut.getContainers();

            expect(result).toBe(ANY_PROMISE);
            expectMock(ContainerMock, "getContainers").toHaveBeenCalledWith(
                "docker"
            );
        });
    });

    describe("DockerRepository.startContainer()", () => {
        it("when starting a Docker container, the Container datasource is called", () => {
            when(ContainerMock, "startContainer").thenReturn(ANY_PROMISE);

            const result = sut.startContainer(ANY_ID);

            expect(result).toBe(ANY_PROMISE);
            expectMock(ContainerMock, "startContainer").toHaveBeenCalledWith(
                "docker",
                ANY_ID
            );
        });
    });

    describe("DockerRepository.stopContainer()", () => {
        it("when stopping a Docker container, the Container datasource is called", () => {
            when(ContainerMock, "stopContainer").thenReturn(ANY_PROMISE);

            const result = sut.stopContainer(ANY_ID);

            expect(result).toBe(ANY_PROMISE);
            expectMock(ContainerMock, "stopContainer").toHaveBeenCalledWith(
                "docker",
                ANY_ID
            );
        });
    });

    describe("DockerRepository.restartContainer()", () => {
        it("when restarting a Docker container, the Container datasource is called", () => {
            when(ContainerMock, "restartContainer").thenReturn(ANY_PROMISE);

            const result = sut.restartContainer(ANY_ID);

            expect(result).toBe(ANY_PROMISE);
            expectMock(ContainerMock, "restartContainer").toHaveBeenCalledWith(
                "docker",
                ANY_ID
            );
        });
    });

    describe("DockerRepository.removeContainer()", () => {
        it("when removing a Docker container, the Container datasource is called", () => {
            when(ContainerMock, "removeContainer").thenReturn(ANY_PROMISE);

            const result = sut.removeContainer(ANY_ID);

            expect(result).toBe(ANY_PROMISE);
            expectMock(ContainerMock, "removeContainer").toHaveBeenCalledWith(
                "docker",
                ANY_ID
            );
        });
    });
}
