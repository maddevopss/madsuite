const fs = require("fs");
const path = require("path");

const SRC_DIR = path.join(__dirname, "../frontend/src");
const EXTENSIONS = [".js", ".jsx"];

// Regex pour capturer les placeholders dans les composants et les appels dans les tests
const COMPONENT_PLACEHOLDER_REGEX = /placeholder=(["'])(.*?)\1/g;
const TEST_QUERY_REGEX = /getByPlaceholderText\s*\(\s*(["'`])([\s\S]*?)\1\s*\)/g;

function getFiles(dir, allFiles = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, allFiles);
    } else if (EXTENSIONS.includes(path.extname(name))) {
      allFiles.push(name);
    }
  });
  return allFiles;
}

function analyze() {
  const files = getFiles(SRC_DIR);
  const componentPlaceholders = new Set();
  const testExpectations = new Set();
  const mapping = { components: [], tests: [] };

  files.forEach((filePath) => {
    const content = fs.readFileSync(filePath, "utf8");
    const isTestFile = filePath.includes(".test.") || filePath.includes("__tests__");

    if (isTestFile) {
      let match;
      while ((match = TEST_QUERY_REGEX.exec(content)) !== null) {
        testExpectations.add(match[2]);
        mapping.tests.push({ text: match[2], file: path.relative(SRC_DIR, filePath) });
      }
    } else {
      let match;
      while ((match = COMPONENT_PLACEHOLDER_REGEX.exec(content)) !== null) {
        componentPlaceholders.add(match[2].trim());
        mapping.components.push({ text: match[2], file: path.relative(SRC_DIR, filePath) });
      }
    }
  });

  console.log("🔍 Analyse des Placeholders MADSuite...\n");

  // 1. Chercher les attentes de tests qui ne sont pas dans les composants
  const missingInComponents = [...testExpectations].filter((p) => !componentPlaceholders.has(p.trim()));

  if (missingInComponents.length > 0) {
    console.error("❌ ERREUR : Les tests attendent des placeholders introuvables dans l'UI :");
    missingInComponents.forEach((text) => {
      const testFile = mapping.tests.find((t) => t.text === text)?.file;
      const suggestion = [...componentPlaceholders].find((cp) => cp.toLowerCase().includes(text.toLowerCase()));
      console.error(`  - "${text}" (attendu dans : ${testFile})${suggestion ? ` -> Suggestion : "${suggestion}"` : ""}`);
    });
  } else {
    console.log("✅ Tous les placeholders testés existent dans les composants.");
  }

  // 2. Chercher les placeholders de composants non testés (Aide à la couverture)
  const untestedPlaceholders = [...componentPlaceholders].filter((p) => !testExpectations.has(p));
  if (untestedPlaceholders.length > 0) {
    console.log("\n⚠️  CONSEIL : Placeholders UI non couverts par les tests :");
    untestedPlaceholders.forEach((text) => {
      const compFile = mapping.components.find((c) => c.text === text)?.file;
      console.log(`  - "${text}" (défini dans : ${compFile})`);
    });
  }

  if (missingInComponents.length > 0) {
    process.exit(1);
  }
}

try {
  analyze();
} catch (err) {
  console.error("Erreur lors de l'exécution du script:", err);
  process.exit(1);
}
