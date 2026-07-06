const db = require("./backend/db");

async function check() {
  try {
    console.log("Adding missing columns to utilisateurs...");
    await db.query(`
      ALTER TABLE utilisateurs
        ADD COLUMN IF NOT EXISTS pin_hash VARCHAR(255),
        ADD COLUMN IF NOT EXISTS is_kiosk_user BOOLEAN DEFAULT FALSE;
    `);
    console.log("Columns added successfully.");
    
    const result = await db.query(
      `SELECT id, nom, email, role, is_kiosk_user, created_at
       FROM utilisateurs
       WHERE deleted_at IS NULL
       ORDER BY id DESC LIMIT 1`
    );
    console.log("Select success:", result.rows);
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    process.exit(0);
  }
}

check();
