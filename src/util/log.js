const SYSTEM = "SerMon";

export const d = (tag, message) =>
    console.log(`[${SYSTEM}] DEBUG (${tag}) ${message}`);

export const e = (tag, message) =>
    console.log(`[${SYSTEM}] ERROR (${tag}) ${message}`);

export const i = (tag, message) =>
    console.log(`[${SYSTEM}] INFO (${tag}) ${message}`);

export const w = (tag, message) =>
    console.log(`[${SYSTEM}] WARN (${tag}) ${message}`);
