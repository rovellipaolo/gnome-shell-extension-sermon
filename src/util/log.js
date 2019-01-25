"use strict";

const SYSTEM = "SerMon";


/* exported d */
const d = (tag, message) => log(`[${SYSTEM}] DEBUG (${tag}) ${message}`);

/* exported i */
const i = (tag, message) => log(`[${SYSTEM}] INFO (${tag}) ${message}`);

/* exported w */
const w = (tag, message) => log(`[${SYSTEM}] WARN (${tag}) ${message}`);

/* exported e */
const e = (tag, message) => log(`[${SYSTEM}] ERROR (${tag}) ${message}`);
