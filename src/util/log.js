"use strict";

const SYSTEM = "SerMon";

/* exported d */
var d = (tag, message) => log(`[${SYSTEM}] DEBUG (${tag}) ${message}`);

/* exported i */
var i = (tag, message) => log(`[${SYSTEM}] INFO (${tag}) ${message}`);

/* exported w */
var w = (tag, message) => log(`[${SYSTEM}] WARN (${tag}) ${message}`);

/* exported e */
var e = (tag, message) => log(`[${SYSTEM}] ERROR (${tag}) ${message}`);
