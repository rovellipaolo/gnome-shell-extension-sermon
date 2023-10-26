import * as Container from "./container.js";
import * as Log from "../util/log.js";
import Settings from "./settings.js";

const LOGTAG = "DockerRepository";
const ENGINE = "docker";

export const isInstalled = () => Container.isInstalled(ENGINE);

export const getContainers = async () => {
    let containers = [];
    try {
        containers = await Container.getContainers(ENGINE);
    } catch (error) {
        Log.w(LOGTAG, `Cannot retrieve ${ENGINE} containers: ${error.message}`);
    }

    if (Settings.shouldShowDockerImages()) {
        try {
            const images = await Container.getImages(ENGINE);
            containers = containers.concat(images);
        } catch (error) {
            Log.w(LOGTAG, `Cannot retrieve ${ENGINE} images: ${error.message}`);
        }
    }

    if (containers.length === 0) {
        throw new Error("No container found!");
    }

    return containers;
};

export const startContainer = (id) => Container.startContainer(ENGINE, id);

export const restartContainer = (id) => Container.restartContainer(ENGINE, id);

export const stopContainer = (id) => Container.stopContainer(ENGINE, id);

export const removeContainer = (id) => Container.removeContainer(ENGINE, id);
