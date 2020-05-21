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
    const ANY_CONTAINERS = 
        "123456789000 | Exited (0) 5 seconds ago | memcached\n" +
        "112233445566 | Up 8 seconds | mysql\n" +
        "987654321000 | Up 2 days | tools,dev-tools";
    const NO_CONTAINER = "";

    const CONTAINER_MEMCACHED = { id: "123456789000", isRunning: false, names: ["memcached"] };
    const CONTAINER_MYSQL = { id: "112233445566", isRunning: true, names: ["mysql"] };
    const CONTAINER_DEVTOOLS = { id: "987654321000", isRunning: true, names: ["tools", "dev-tools"] };

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
        it("when pasing command execution result with Docker containers, returns a list of Docker containers", () => {
            const result = sut.parseContainers(ANY_CONTAINERS);

            expect(result.length).toBe(3);
            expect(result[0].id).toBe(CONTAINER_MEMCACHED.id);
            expect(result[0].isRunning).toBe(CONTAINER_MEMCACHED.isRunning);
            expect(result[0].names.length).toBe(CONTAINER_MEMCACHED.names.length);
            expect(result[0].names[0]).toBe(CONTAINER_MEMCACHED.names[0]);
            expect(result[1].id).toBe(CONTAINER_MYSQL.id);
            expect(result[1].isRunning).toBe(CONTAINER_MYSQL.isRunning);
            expect(result[1].names.length).toBe(CONTAINER_MYSQL.names.length);
            expect(result[1].names[0]).toBe(CONTAINER_MYSQL.names[0]);
            expect(result[2].id).toBe(CONTAINER_DEVTOOLS.id);
            expect(result[2].isRunning).toBe(CONTAINER_DEVTOOLS.isRunning);
            expect(result[2].names.length).toBe(CONTAINER_DEVTOOLS.names.length);
            expect(result[2].names[0]).toBe(CONTAINER_DEVTOOLS.names[0]);
            expect(result[2].names[1]).toBe(CONTAINER_DEVTOOLS.names[1]);
        });

        it("when pasing command execution result without Docker containers, returns an empty list", () => {
            const result = sut.parseContainers(NO_CONTAINER);

            expect(result.length).toBe(0);
        });
    });

    describe("DockerRepository.filterContainers()", () => {
        it("returns the list of Docker containers ordered by status", () => {
            const result = sut.filterContainers([CONTAINER_MEMCACHED, CONTAINER_MYSQL, CONTAINER_DEVTOOLS]);

            expect(result.length).toBe(3);
            expect(result[0]).toBe(CONTAINER_MYSQL);      // status: running
            expect(result[1]).toBe(CONTAINER_DEVTOOLS);   // status: running
            expect(result[2]).toBe(CONTAINER_MEMCACHED);  // status: not running
        });

        it("when no Docker container is passed, returns an empty list", () => {
            const result = sut.filterContainers([]);

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
