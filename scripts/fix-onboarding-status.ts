/**
 * Script to mark all existing users as having completed onboarding
 * Run with: npx tsx scripts/fix-onboarding-status.ts
 */

import { db } from "../src/db";
import { user } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function fixOnboardingStatus() {
  console.log("Fixing onboarding status for existing users...");

  try {
    // Get all users
    const allUsers = await db.select().from(user);
    
    console.log(`Found ${allUsers.length} users`);

    // Update users who don't have onboarding completed
    for (const currentUser of allUsers) {
      if (!currentUser.onboardingCompleted) {
        await db
          .update(user)
          .set({ onboardingCompleted: true })
          .where(eq(user.id, currentUser.id));
        
        console.log(`✅ Updated user: ${currentUser.email}`);
      } else {
        console.log(`⏭️  User already completed: ${currentUser.email}`);
      }
    }

    console.log("\n✅ All users updated successfully!");
  } catch (error) {
    console.error("❌ Error updating users:", error);
    process.exit(1);
  }
}

fixOnboardingStatus();
