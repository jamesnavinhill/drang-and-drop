#!/usr/bin/env node

import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");
const [, , command, ...rawArgs] = process.argv;

if (!command) {
  console.error("Missing Next.js command. Expected one of: dev, build, start.");
  process.exit(1);
}

const forwardedArgs = rawArgs[0] === "--" ? rawArgs.slice(1) : rawArgs;
const child = spawn(process.execPath, [nextBin, command, ...forwardedArgs], {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});
