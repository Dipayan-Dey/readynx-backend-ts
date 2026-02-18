/**
 * Cloudinary Configuration Verification Script
 * Run this to verify your Cloudinary environment variables are set correctly
 *
 * Usage: npx ts-node scripts/verify-cloudinary-config.ts
 */

import { config } from "dotenv";
import { v2 as cloudinary } from "cloudinary";

// Load environment variables
config();

console.log("\n🔍 Verifying Cloudinary Configuration...\n");

// Check environment variables
const requiredVars = {
  CLOUD_NAME: process.env.CLOUD_NAME,
  CLOUD_API_KEY: process.env.CLOUD_API_KEY,
  CLOUD_API_SECRET: process.env.CLOUD_API_SECRET,
};

let hasErrors = false;

// Validate each variable
Object.entries(requiredVars).forEach(([key, value]) => {
  if (!value) {
    console.error(`❌ ${key} is not set`);
    hasErrors = true;
  } else {
    // Mask sensitive values
    const maskedValue =
      key === "CLOUD_API_SECRET" ? value.substring(0, 4) + "***" : value;
    console.log(`✅ ${key}: ${maskedValue}`);
  }
});

if (hasErrors) {
  console.error(
    "\n❌ Configuration incomplete. Please set all required environment variables.\n",
  );
  process.exit(1);
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Test connection by pinging Cloudinary API
async function testConnection() {
  try {
    console.log("\n🔌 Testing Cloudinary connection...\n");

    // Try to get account usage (lightweight API call)
    const result = await cloudinary.api.ping();

    console.log("✅ Successfully connected to Cloudinary!");
    console.log(`   Status: ${result.status}\n`);

    console.log(
      "✅ All checks passed! Your Cloudinary configuration is correct.\n",
    );
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Failed to connect to Cloudinary");
    console.error(`   Error: ${error.message}\n`);

    if (error.message.includes("api_key")) {
      console.error("💡 Tip: Check that your CLOUD_API_KEY is correct\n");
    } else if (error.message.includes("api_secret")) {
      console.error("💡 Tip: Check that your CLOUD_API_SECRET is correct\n");
    } else if (error.message.includes("cloud_name")) {
      console.error("💡 Tip: Check that your CLOUD_NAME is correct\n");
    }

    process.exit(1);
  }
}

testConnection();
