import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const ROOT_ENV_PATH = ".env";
const TEST_ENV_PATH = ".env.test";

const statusResult = spawnSync("supabase", ["status", "-o", "env"], {
  encoding: "utf8",
  stdio: "pipe",
});

if (statusResult.status !== 0) {
  const details = (statusResult.stderr || statusResult.stdout || "").trim();

  console.error("Failed to read local Supabase status.");

  if (details.length > 0) {
    console.error(details);
  }

  console.error("Run `pnpm run supabase:start` first.");
  process.exit(1);
}

const statusEnv = parseStatusEnv(statusResult.stdout);
const supabaseUrl = statusEnv.API_URL;
const publishableKey = statusEnv.PUBLISHABLE_KEY ?? statusEnv.ANON_KEY;
const secretKey = statusEnv.SERVICE_ROLE_KEY;

if (!supabaseUrl || !publishableKey || !secretKey) {
  console.error("Supabase status output is missing required values.");
  console.error(
    "Expected API_URL, (PUBLISHABLE_KEY or ANON_KEY), and SERVICE_ROLE_KEY.",
  );
  process.exit(1);
}

const envUpdates = {
  SUPABASE_URL: supabaseUrl,
  SUPABASE_KEY: publishableKey,
  SUPABASE_SECRET_KEY: secretKey,
};

writeMergedEnvFile(ROOT_ENV_PATH, envUpdates);
writeMergedEnvFile(TEST_ENV_PATH, envUpdates);

console.log(
  `Synced Supabase env vars to ${ROOT_ENV_PATH} and ${TEST_ENV_PATH}.`,
);

function parseStatusEnv(rawText) {
  const parsed = {};
  const lines = rawText.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = unquote(rawValue);

    parsed[key] = value;
  }

  return parsed;
}

function writeMergedEnvFile(filePath, updates) {
  const existingText = readEnvFileSafe(filePath);
  const lines = existingText.split(/\r?\n/);
  const missingKeys = new Set(Object.keys(updates));

  const nextLines = lines.map((line) => {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=/);

    if (!match) {
      return line;
    }

    const key = match[1];

    if (!(key in updates)) {
      return line;
    }

    missingKeys.delete(key);
    return `${key}=${updates[key]}`;
  });

  for (const key of missingKeys) {
    nextLines.push(`${key}=${updates[key]}`);
  }

  const normalized = nextLines.filter((line, index, arr) => {
    if (line !== "" || index === arr.length - 1) {
      return true;
    }

    return arr[index + 1] !== "";
  });

  writeFileSync(filePath, `${normalized.join("\n").trimEnd()}\n`, "utf8");
}

function readEnvFileSafe(filePath) {
  try {
    return readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

function unquote(value) {
  if (value.length < 2) {
    return value;
  }

  const first = value[0];
  const last = value[value.length - 1];

  if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
    return value.slice(1, -1);
  }

  return value;
}
