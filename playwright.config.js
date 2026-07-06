const path = require("path");
const dotenv = require("dotenv");

// 💀 ROOT DU PROJET (PAS __dirname)
dotenv.config({
  path: path.resolve(process.cwd(), ".env.test"),
});

const { defineConfig, devices } = require("@playwright/test");

// URLs avec 127.0.0.1 pour éviter les problèmes IPv6 sur Windows
const TEST_API_URL = process.env.TEST_API_URL || "http://127.0.0.1:5000";
const TEST_BASE_URL = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";

module.exports = defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  workers: process.env.CI ? 1 : undefined,

  use: {
    baseURL: TEST_BASE_URL,
    headless: true,
    storageState: path.resolve(process.cwd(), "auth.json"),
  },

  globalSetup: require.resolve("./backend/src/test/e2e/globalSetup.js"),
  
  webServer: [
  {
    command: "npm run start:test --prefix backend",
    url: TEST_API_URL + "/api/health",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  {
    command: "npm run dev --prefix frontend -- --host 127.0.0.1 --port 3000",
    url: TEST_BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
],

  projects: [
    {
      name: "auth-setup",
      testMatch: "**/auth.setup.js",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["auth-setup"],
    },
    // Firefox et WebKit désactivés par défaut pour les tests responsive
    // Utiliser: npx playwright test --project=firefox --project=webkit
    // { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    // { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
