"use strict";

// Import dummy/fake Gjs implementations:
imports.searchPath.push("./test/util/fake");
const CommandLineMock = imports.misc.Me.imports.src.data.commandLine;

const GjsMockito = imports.test.util.gjsMockito;
const when = GjsMockito.when;
const expectMock = GjsMockito.verify;

const sut = imports.src.data.container;

/* exported testSuite */
function testSuite() {
    const ANY_ENGINE = "docker";
    const ANY_PATH = "~/any/path/to/docker";
    const NO_PATH = null;
    const ANY_ID = "123456789000";
    const ANY_CONTAINERS =
        "123456789000 | Exited (0) 5 seconds ago | memcached\n" +
        "112233445566 | Up 8 seconds | mysql\n" +
        "987654321000 | Up 2 days | tools,dev-tools";
    const NO_CONTAINER = "";

    const CONTAINER_MEMCACHED = {
        id: "123456789000",
        names: ["memcached"],
        isEnabled: true,
        canBeEnabled: true,
        isRunning: false,
    };
    const CONTAINER_MYSQL = {
        id: "112233445566",
        names: ["mysql"],
        isEnabled: true,
        canBeEnabled: true,
        isRunning: true,
    };
    const CONTAINER_DEVTOOLS = {
        id: "987654321000",
        names: ["tools", "dev-tools"],
        isEnabled: true,
        canBeEnabled: true,
        isRunning: true,
    };

    describe("Container.isInstalled()", () => {
        it("when container engine is found, returns true", () => {
            when(CommandLineMock, "find").thenReturn(ANY_PATH);

            const result = sut.isInstalled(ANY_ENGINE);

            expect(result).toBe(true);
        });

        it("when container engine is not found, returns false", () => {
            when(CommandLineMock, "find").thenReturn(NO_PATH);

            const result = sut.isInstalled(ANY_ENGINE);

            expect(result).toBe(false);
        });
    });

    describe("Container.getContainers()", () => {
        it("when retrieving the containers, container engine ps command is executed", () => {
            const anyResolvedPromise = new Promise((resolve) =>
                resolve(ANY_CONTAINERS)
            );
            when(CommandLineMock, "execute").thenReturn(anyResolvedPromise);

            sut.getContainers(ANY_ENGINE);

            expectMock(CommandLineMock, "execute").toHaveBeenCalledWith(
                `${ANY_ENGINE} ps -a --format '{{.ID}} | {{.Status}} | {{.Names}}'`
            );
        });

        // it("when no container is found, returns an error", () => {});

        // it("when containers are found but cannot parse them, returns an error", () => {});

        // it("when containers are found, returns them sorted by running status", () => {});
    });

    describe("Container.parseContainers()", () => {
        it("when pasing command execution result with containers, returns a list of containers", () => {
            const result = sut.parseContainers(ANY_CONTAINERS);

            expect(result.length).toBe(3);
            expect(result[0].id).toBe(CONTAINER_MEMCACHED.id);
            expect(result[0].names.length).toBe(
                CONTAINER_MEMCACHED.names.length
            );
            expect(result[0].names[0]).toBe(CONTAINER_MEMCACHED.names[0]);
            expect(result[0].isEnabled).toBe(CONTAINER_MEMCACHED.isEnabled);
            expect(result[0].canBeEnabled).toBe(
                CONTAINER_MEMCACHED.canBeEnabled
            );
            expect(result[0].isRunning).toBe(CONTAINER_MEMCACHED.isRunning);
            expect(result[1].id).toBe(CONTAINER_MYSQL.id);
            expect(result[1].names.length).toBe(CONTAINER_MYSQL.names.length);
            expect(result[1].names[0]).toBe(CONTAINER_MYSQL.names[0]);
            expect(result[1].isEnabled).toBe(CONTAINER_MYSQL.isEnabled);
            expect(result[1].canBeEnabled).toBe(CONTAINER_MYSQL.canBeEnabled);
            expect(result[1].isRunning).toBe(CONTAINER_MYSQL.isRunning);
            expect(result[2].id).toBe(CONTAINER_DEVTOOLS.id);
            expect(result[2].names.length).toBe(
                CONTAINER_DEVTOOLS.names.length
            );
            expect(result[2].names[0]).toBe(CONTAINER_DEVTOOLS.names[0]);
            expect(result[2].names[1]).toBe(CONTAINER_DEVTOOLS.names[1]);
            expect(result[2].isEnabled).toBe(CONTAINER_DEVTOOLS.isEnabled);
            expect(result[2].canBeEnabled).toBe(
                CONTAINER_DEVTOOLS.canBeEnabled
            );
            expect(result[2].isRunning).toBe(CONTAINER_DEVTOOLS.isRunning);
        });

        it("when pasing command execution result without containers, returns an empty list", () => {
            const result = sut.parseContainers(NO_CONTAINER);

            expect(result.length).toBe(0);
        });
    });

    describe("Container.filterContainers()", () => {
        it("returns the list of containers ordered by status", () => {
            const result = sut.filterContainers([
                CONTAINER_MEMCACHED,
                CONTAINER_MYSQL,
                CONTAINER_DEVTOOLS,
            ]);

            expect(result.length).toBe(3);
            expect(result[0]).toBe(CONTAINER_MYSQL); // status: running
            expect(result[1]).toBe(CONTAINER_DEVTOOLS); // status: running
            expect(result[2]).toBe(CONTAINER_MEMCACHED); // status: not running
        });

        it("when no container is passed, returns an empty list", () => {
            const result = sut.filterContainers([]);

            expect(result.length).toBe(0);
        });
    });

    describe("Container.startContainer()", () => {
        it("when starting a container, container engine start command is executed", () => {
            const anyResolvedPromise = new Promise((resolve) => resolve());
            when(CommandLineMock, "executeAsync").thenReturn(
                anyResolvedPromise
            );

            sut.startContainer(ANY_ENGINE, ANY_ID);

            expectMock(CommandLineMock, "executeAsync").toHaveBeenCalledWith(
                `${ANY_ENGINE} start ${ANY_ID}`
            );
        });

        // it("when container cannot be started, returns an error", () => {});

        // it("when container can be started, starts it", () => {});
    });

    describe("Container.stopContainer()", () => {
        it("when stopping a Docker container, container engine stop command is executed", () => {
            const anyResolvedPromise = new Promise((resolve) => resolve());
            when(CommandLineMock, "executeAsync").thenReturn(
                anyResolvedPromise
            );

            sut.stopContainer(ANY_ENGINE, ANY_ID);

            expectMock(CommandLineMock, "executeAsync").toHaveBeenCalledWith(
                `${ANY_ENGINE} stop ${ANY_ID}`
            );
        });

        // it("when container cannot be stopped, returns an error", () => {});

        // it("when container can be stopped, stops it", () => {});
    });

    describe("Container.restartContainer()", () => {
        it("when restarting a Docker container, container engine restart command is executed", () => {
            const anyResolvedPromise = new Promise((resolve) => resolve());
            when(CommandLineMock, "executeAsync").thenReturn(
                anyResolvedPromise
            );

            sut.restartContainer(ANY_ENGINE, ANY_ID);

            expectMock(CommandLineMock, "executeAsync").toHaveBeenCalledWith(
                `${ANY_ENGINE} restart ${ANY_ID}`
            );
        });

        // it("when container cannot be restarted, returns an error", () => {});

        // it("when container can be restarted, restarts it", () => {});
    });

    describe("Container.removeContainer()", () => {
        it("when removing a Docker container, container engine rm command is executed", () => {
            const anyResolvedPromise = new Promise((resolve) => resolve());
            when(CommandLineMock, "executeAsync").thenReturn(
                anyResolvedPromise
            );

            sut.removeContainer(ANY_ENGINE, ANY_ID);

            expectMock(CommandLineMock, "executeAsync").toHaveBeenCalledWith(
                `${ANY_ENGINE} rm ${ANY_ID}`
            );
        });

        // it("when container cannot be removed, returns an error", () => {});

        // it("when container can be removed, removes it", () => {});
    });
}
