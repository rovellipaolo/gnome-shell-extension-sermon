"use strict";

// Import dummy/fake Gjs implementations:
imports.searchPath.push("./test/util/fake");
const CommandLineMock = imports.misc.Me.imports.src.data.datasource.commandLine;

const GjsMockito = imports.test.util.gjsMockito;
const when = GjsMockito.when;
const expectMock = GjsMockito.verify;

const sut = imports.src.data.dockerRepository;

/* exported testSuite */
function testSuite() {

    const ANY_PATH = "~/any/path/to/docker";
    const NO_PATH = null;
    const ANY_ID = "123456789000"
    const ANY_CONTAINERS = "\
        123456789000 | ubuntu:18.04 | Up 2 days | ubuntu\
        987654321000 | tools | Up 9 days | tools";

    describe("DockerRepository.isDockerInstalled()", () => {
        it("when docker program is found, returns true", () => {
            when(CommandLineMock, "find").thenReturn(ANY_PATH);

            const result = sut.isDockerInstalled();

            expect(result).toBe(true);
        });

        it("when docker program is not found, returns false", () => {
            when(CommandLineMock, "find").thenReturn(NO_PATH);

            const result = sut.isDockerInstalled();

            expect(result).toBe(false);
        });
    });

    describe("DockerRepository.getContainers()", () => {
        it("when retrieving the containers, docker ps is executed", () => {
            const anyResolvedPromise = new Promise((resolve) => resolve(ANY_CONTAINERS));
            when(CommandLineMock, "execute").thenReturn(anyResolvedPromise);

            sut.getContainers();

            expectMock(CommandLineMock, "execute").toHaveBeenCalledWith("docker ps -a --format '{{.ID}} | {{.Image}} | {{.Status}} | {{.Names}}'");
        });

        // it("when no container is found, returns an error", () => {});

        // it("when containers are found but cannot parse them, returns an error", () => {});

        // it("when containers are found, returns them", () => {});
    });

    describe("DockerRepository.startContainer()", () => {
        it("when starting a container, docker start is executed", () => {
            const anyResolvedPromise = new Promise((resolve) => resolve());
            when(CommandLineMock, "executeAsync").thenReturn(anyResolvedPromise);

            sut.startContainer(ANY_ID);

            expectMock(CommandLineMock, "executeAsync").toHaveBeenCalledWith(`docker start ${ANY_ID}`);
        });

        // it("when docker start succeeds, the container is started", () => {});

        // it("when docker start fails, the container is not started", () => {});
    });

    describe("DockerRepository.stopContainer()", () => {
        it("when stopping a container, docker stop is executed", () => {
            const anyResolvedPromise = new Promise((resolve) => resolve());
            when(CommandLineMock, "executeAsync").thenReturn(anyResolvedPromise);

            sut.stopContainer(ANY_ID);

            expectMock(CommandLineMock, "executeAsync").toHaveBeenCalledWith(`docker stop ${ANY_ID}`);
        });

        // it("when docker stop succeeds, the container is stopped", () => {}):

        // it("when docker stop fails, the container is not stopped", () => {});
    });

}
