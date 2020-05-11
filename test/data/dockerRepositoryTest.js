"use strict";

// Import dummy/fake Gjs implementations:
imports.searchPath.push("./test/util/fake");
const CommandLineMock = imports.misc.Me.imports.src.data.commandLine;

const GjsMockito = imports.test.util.gjsMockito;
const when = GjsMockito.when;
const expectMock = GjsMockito.verify;

const sut = imports.src.data.dockerRepository;

/* exported testSuite */
function testSuite() {

    const ANY_PATH = "~/any/path/to/docker";
    const NO_PATH = null;
    const ANY_ID = "123456789000"
    const ANY_VERSION = "Docker version 19.03.7, build 7141c199a2";
    const ANY_CONTAINERS = 
        "123456789000 | Up 2 days | ubuntu\n" +
        "987654321000 | Exited (0) 5 seconds ago | tools,dev-tools";
    const NO_CONTAINER = "";

    describe("DockerRepository.isInstalled()", () => {
        it("when Docker program is found, returns true", () => {
            when(CommandLineMock, "find").thenReturn(ANY_PATH);

            const result = sut.isInstalled();

            expect(result).toBe(true);
        });

        it("when Docker program is not found, returns false", () => {
            when(CommandLineMock, "find").thenReturn(NO_PATH);

            const result = sut.isInstalled();

            expect(result).toBe(false);
        });
    });

    describe("DockerRepository.getContainers()", () => {
        it("when retrieving the Docker containers, docker ps command is executed", () => {
            const anyResolvedPromise = new Promise((resolve) => resolve(ANY_CONTAINERS));
            when(CommandLineMock, "execute").thenReturn(anyResolvedPromise);

            sut.getContainers();

            expectMock(CommandLineMock, "execute").toHaveBeenCalledWith("docker ps -a --format '{{.ID}} | {{.Status}} | {{.Names}}'");
        });

        // it("when no Docker container is found, returns an error", () => {});

        // it("when Docker containers are found but cannot parse them, returns an error", () => {});

        // it("when Docker containers are found, returns them sorted by running status", () => {});
    });

    describe("DockerRepository.parseContainers()", () => {
        it("when pasing command execution result with Docker containers, returns a list of containers", () => {
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

        it("when pasing command execution result without Docker containers, returns an empty list", () => {
            const result = sut.parseContainers(NO_CONTAINER);

            expect(result.length).toBe(0);
        });
    });

    describe("DockerRepository.startContainer()", () => {
        it("when starting a Docker container, docker start command is executed", () => {
            const anyResolvedPromise = new Promise((resolve) => resolve());
            when(CommandLineMock, "executeAsync").thenReturn(anyResolvedPromise);

            sut.startContainer(ANY_ID);

            expectMock(CommandLineMock, "executeAsync").toHaveBeenCalledWith(`docker start ${ANY_ID}`);
        });

        // it("when Docker container cannot be started, returns an error", () => {});

        // it("when Docker container can be started, starts it", () => {});
    });

    describe("DockerRepository.stopContainer()", () => {
        it("when stopping a Docker container, docker stop command is executed", () => {
            const anyResolvedPromise = new Promise((resolve) => resolve());
            when(CommandLineMock, "executeAsync").thenReturn(anyResolvedPromise);

            sut.stopContainer(ANY_ID);

            expectMock(CommandLineMock, "executeAsync").toHaveBeenCalledWith(`docker stop ${ANY_ID}`);
        });

        // it("when Docker container cannot be stopped, returns an error", () => {});

        // it("when Docker container can be stopped, stops it", () => {});
    });

    describe("DockerRepository.restartContainer()", () => {
        it("when restarting a Docker container, docker restart command is executed", () => {
            const anyResolvedPromise = new Promise((resolve) => resolve());
            when(CommandLineMock, "executeAsync").thenReturn(anyResolvedPromise);

            sut.restartContainer(ANY_ID);

            expectMock(CommandLineMock, "executeAsync").toHaveBeenCalledWith(`docker restart ${ANY_ID}`);
        });

        // it("when Docker container cannot be restarted, returns an error", () => {});

        // it("when Docker container can be restarted, restarts it", () => {});
    });

    describe("DockerRepository.removeContainer()", () => {
        it("when removing a Docker container, docker rm command is executed", () => {
            const anyResolvedPromise = new Promise((resolve) => resolve());
            when(CommandLineMock, "executeAsync").thenReturn(anyResolvedPromise);

            sut.removeContainer(ANY_ID);

            expectMock(CommandLineMock, "executeAsync").toHaveBeenCalledWith(`docker rm ${ANY_ID}`);
        });

        // it("when Docker container cannot be removed, returns an error", () => {});

        // it("when Docker container can be removed, removes it", () => {});
    });

}
