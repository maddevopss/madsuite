const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const migrationsSources = [
  path.join(root, "backend/db/archive/migrations"),
  path.join(root, "backend/db/migrations"),
];
const archiveDir = path.join(root, "backend/db/archive/migrations");
const outputFile = path.join(root, "backend/db/schema_current.sql");
const archiveReadme = path.join(root, "backend/db/archive/README.md");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function listMigrationFiles() {
  const seen = new Set();
  const files = [];

  for (const dir of migrationsSources) {
    if (!fs.existsSync(dir)) continue;

    const entries = fs
      .readdirSync(dir)
      .filter((file) => /^\d+[a-z]?_.+\.sql$/i.test(file))
      .sort();

    for (const file of entries) {
      if (seen.has(file)) continue;
      seen.add(file);
      files.push({
        file,
        fullPath: path.join(dir, file),
      });
    }
  }

  return files;
}

function buildSnapshot(files) {
  const chunks = [
    "-- MADSuite / TimeMonitoring",
    "-- schema_current.sql",
    "-- Snapshot complet de la base courante.",
    "-- Generé automatiquement à partir des migrations actives.",
    "",
  ];

  for (const { file, fullPath } of files) {
    const sql = fs.readFileSync(fullPath, "utf8").trimEnd();
    chunks.push(
      `-- ============================================================`,
      `-- Migration source: ${file}`,
      `-- ============================================================`,
      sql,
      "",
    );
  }

  return `${chunks.join("\n").trimEnd()}\n`;
}

function copyArchive(files) {
  ensureDir(archiveDir);

  for (const { file, fullPath } of files) {
    fs.copyFileSync(fullPath, path.join(archiveDir, file));
  }
}

function writeArchiveReadme() {
  ensureDir(path.dirname(archiveReadme));

  const content = [
    "# Archive migrations",
    "",
    "This folder keeps a copy of the current migration history for reference.",
    "Fresh installations should use `backend/db/schema_current.sql`.",
    "The active migration runner still lives in `backend/src/migrate/runMigrations.js`.",
    "",
  ].join("\n");

  fs.writeFileSync(archiveReadme, content, "utf8");
}

function main() {
  const files = listMigrationFiles();
  if (!files.length) {
    throw new Error(`Aucune migration trouvée dans ${migrationsSources.join(", ")}`);
  }

  const snapshot = buildSnapshot(files);
  fs.writeFileSync(outputFile, snapshot, "utf8");
  copyArchive(files);
  writeArchiveReadme();

  console.log(`Snapshot généré: ${path.relative(root, outputFile)}`);
  console.log(`Archive copiée: ${path.relative(root, archiveDir)}`);
}

main();
