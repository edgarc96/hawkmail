import { createClient } from "@libsql/client";

async function addBodyContentColumn() {
  // Get Vercel's production DB credentials
  const url = process.env.TURSO_CONNECTION_URL || "libsql://db-abd887e9-f493-4931-b980-ae13dd9c4515-orchids.aws-us-west-2.turso.io";
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!authToken) {
    console.error("❌ TURSO_AUTH_TOKEN not found in environment");
    process.exit(1);
  }

  console.log("🔌 Connecting to:", url);

  const db = createClient({
    url,
    authToken,
  });

  try {
    // Check if column already exists
    const tableInfo = await db.execute("PRAGMA table_info(emails);");
    const hasBodyContent = tableInfo.rows.some((row: any) => row.name === "body_content");

    if (hasBodyContent) {
      console.log("✅ Column 'body_content' already exists!");
      process.exit(0);
    }

    // Add the column
    console.log("📝 Adding body_content column to emails table...");
    await db.execute("ALTER TABLE emails ADD COLUMN body_content TEXT;");
    console.log("✅ Column added successfully!");

    // Verify
    const verifyTableInfo = await db.execute("PRAGMA table_info(emails);");
    const verified = verifyTableInfo.rows.some((row: any) => row.name === "body_content");
    
    if (verified) {
      console.log("✅ Verified: body_content column exists!");
    } else {
      console.log("❌ Verification failed!");
    }

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

addBodyContentColumn();
