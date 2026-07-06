const fs = require("fs");
const path = require("path");

function getAllProjectFiles() {
  const rootDir = path.join(__dirname);
  const results = [];

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (
          entry.name === "node_modules" ||
          entry.name === "coverage" ||
          entry.name === ".git" ||
          entry.name === "dist" ||
          entry.name === ".next"
        ) {
          continue;
        }
        walk(full);
      } else {
        results.push(full);
      }
    }
  }

  walk(rootDir);
  return results;
}

function readUtf8Safe(file) {
  try {
    return fs.readFileSync(file, "utf-8");
  } catch {
    return "";
  }
}

test("no direct modules API usage outside modules.api.js (frontend contract)", () => {
  const files = getAllProjectFiles();

  files.forEach((file) => {
    // backend is allowed to contain /api/organisation/modules mounts/routes
    if (file.includes(`${path.sep}backend${path.sep}src${path.sep}`)) return;

    // allow modules.api.js itself
    if (file.endsWith("modules.api.js")) return;

    // allow architecture docs
    if (file.endsWith("ARCHITECTURE_RULES.md")) return;

    const content = readUtf8Safe(file);

    // skip ESLint config that intentionally references the string pattern
    if (
      file.includes(`${path.sep}frontend${path.sep}`) &&
      (file.endsWith(".eslintrc.js") || file.endsWith("eslint.config.js"))
    ) {
      return;
    }

    expect(content).not.toMatch(/\/organisation\/modules/);
  });
});

test("modules data flows only through useModules", () => {
  const files = getAllProjectFiles();

  files.forEach((file) => {
    const content = readUtf8Safe(file);

    // frontend only
    if (!file.includes(`${path.sep}frontend${path.sep}src${path.sep}`)) return;

    if (file.includes("ModulesPanel")) return;
    if (file.includes("useModules")) return;
    if (file.includes("modules.api.js")) return;

    // very useful drift signal
    expect(content).not.toMatch(/getModules\s*\(\s*\)/);
  });
});
