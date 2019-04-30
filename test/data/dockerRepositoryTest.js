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
    const ANY_CONTAINERS = 
        "123456789000 | Up 2 days | ubuntu\n" +
        "987654321000 | Exited (0) 5 seconds ago | tools,dev-tools";
    const NO_CONTAINER = "";

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
        it("when retrieving the docker containers, docker ps is executed", () => {
            const anyResolvedPromise = new Promise((resolve) => resolve(ANY_CONTAINERS));
            when(CommandLineMock, "execute").thenReturn(anyResolvedPromise);

            sut.getContainers();

            expectMock(CommandLineMock, "execute").toHaveBeenCalledWith("docker ps -a --format '{{.ID}} | {{.Status}} | {{.Names}}'");
        });

        // it("when no docker container is found, returns an error", () => {});

        // it("when docker containers are found but cannot parse them, returns an error", () => {});

        // it("when docker containers are found, returns them", () => {});
    });

    describe("DockerRepository.parseContainers()", () => {
        it("when pasing command execution result with docker containers, returns a list of containers", () => {
            const result = sut.parseContainers(ANY_CONTAINERS);

            expect(result.length).toBe(2);
            expect(result[0].id).toBe("123456789000");
            expect(result[0].isRunning).toBe(true);
            expect(result[0].names.length).toBe(1);
            expect(result[0].names[0]).toBe("ubuntu");
            expect(result[1].id).toBe("987654321000");
            expect(result[1].isRunning).toBe(false);
            expect(result[1].names.length).toBe(2);
            expect(result[1].names[0]).toBe("tools");
            expect(result[1].names[1]).toBe("dev-tools");
        });

        it("when pasing command execution result without docker containers, returns an empty list", () => {
            const result = sut.parseContainers(NO_CONTAINER);

            expect(result.length).toBe(0);
        });
    });

    describe("DockerRepository.startContainer()", () => {
        it("when starting a docker container, docker start is executed", () => {
            const anyResolvedPromise = new Promise((resolve) => resolve());
            when(CommandLineMock, "executeAsync").thenReturn(anyResolvedPromise);

            sut.startContainer(ANY_ID);

            expectMock(CommandLineMock, "executeAsync").toHaveBeenCalledWith(`docker start ${ANY_ID}`);
        });

        // it("when docker start succeeds, the container is started", () => {});

        // it("when docker start fails, the container is not started", () => {});
    });

    describe("DockerRepository.stopContainer()", () => {
        it("when stopping a docker container, docker stop is executed", () => {
            const anyResolvedPromise = new Promise((resolve) => resolve());
            when(CommandLineMock, "executeAsync").thenReturn(anyResolvedPromise);

            sut.stopContainer(ANY_ID);

            expectMock(CommandLineMock, "executeAsync").toHaveBeenCalledWith(`docker stop ${ANY_ID}`);
        });

        // it("when docker stop succeeds, the container is stopped", () => {}):

        // it("when docker stop fails, the container is not stopped", () => {});
    });

}
