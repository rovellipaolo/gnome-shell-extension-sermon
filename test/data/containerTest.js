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

    const ANY_ENGINE = "docker"
    const ANY_PATH = "~/any/path/to/docker";
    const NO_PATH = null;
    const ANY_ID = "123456789000"
    const ANY_CONTAINERS = 
        "123456789000 | Up 2 days | ubuntu\n" +
        "987654321000 | Exited (0) 5 seconds ago | tools,dev-tools";
    const NO_CONTAINER = "";

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
            const anyResolvedPromise = new Promise((resolve) => resolve(ANY_CONTAINERS));
            when(CommandLineMock, "execute").thenReturn(anyResolvedPromise);

            sut.getContainers(ANY_ENGINE);

            expectMock(CommandLineMock, "execute").toHaveBeenCalledWith(`${ANY_ENGINE} ps -a --format '{{.ID}} | {{.Status}} | {{.Names}}'`);
        });

        // it("when no container is found, returns an error", () => {});

        // it("when containers are found but cannot parse them, returns an error", () => {});

        // it("when containers are found, returns them sorted by running status", () => {});
    });

    describe("Container.parseContainers()", () => {
        it("when pasing command execution result with containers, returns a list of containers", () => {
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

        it("when pasing command execution result without containers, returns an empty list", () => {
            const result = sut.parseContainers(NO_CONTAINER);

            expect(result.length).toBe(0);
        });
    });

    describe("Container.startContainer()", () => {
        it("when starting a container, container engine start command is executed", () => {
            const anyResolvedPromise = new Promise((resolve) => resolve());
            when(CommandLineMock, "executeAsync").thenReturn(anyResolvedPromise);

            sut.startContainer(ANY_ENGINE, ANY_ID);

            expectMock(CommandLineMock, "executeAsync").toHaveBeenCalledWith(`${ANY_ENGINE} start ${ANY_ID}`);
        });

        // it("when container cannot be started, returns an error", () => {});

        // it("when container can be started, starts it", () => {});
    });

    describe("Container.stopContainer()", () => {
        it("when stopping a Docker container, container engine stop command is executed", () => {
            const anyResolvedPromise = new Promise((resolve) => resolve());
            when(CommandLineMock, "executeAsync").thenReturn(anyResolvedPromise);

            sut.stopContainer(ANY_ENGINE, ANY_ID);

            expectMock(CommandLineMock, "executeAsync").toHaveBeenCalledWith(`${ANY_ENGINE} stop ${ANY_ID}`);
        });

        // it("when container cannot be stopped, returns an error", () => {});

        // it("when container can be stopped, stops it", () => {});
    });

    describe("Container.restartContainer()", () => {
        it("when restarting a Docker container, container engine restart command is executed", () => {
            const anyResolvedPromise = new Promise((resolve) => resolve());
            when(CommandLineMock, "executeAsync").thenReturn(anyResolvedPromise);

            sut.restartContainer(ANY_ENGINE, ANY_ID);

            expectMock(CommandLineMock, "executeAsync").toHaveBeenCalledWith(`${ANY_ENGINE} restart ${ANY_ID}`);
        });

        // it("when container cannot be restarted, returns an error", () => {});

        // it("when container can be restarted, restarts it", () => {});
    });

    describe("Container.removeContainer()", () => {
        it("when removing a Docker container, container engine rm command is executed", () => {
            const anyResolvedPromise = new Promise((resolve) => resolve());
            when(CommandLineMock, "executeAsync").thenReturn(anyResolvedPromise);

            sut.removeContainer(ANY_ENGINE, ANY_ID);

            expectMock(CommandLineMock, "executeAsync").toHaveBeenCalledWith(`${ANY_ENGINE} rm ${ANY_ID}`);
        });

        // it("when container cannot be removed, returns an error", () => {});

        // it("when container can be removed, removes it", () => {});
    });

}
