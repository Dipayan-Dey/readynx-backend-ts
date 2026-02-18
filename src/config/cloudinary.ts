import { v2 as cloudinary } from "cloudinary";

// Log environment check (will help debug on Render)
console.log("[Cloudinary Config] Checking environment variables...");
console.log(
  "[Cloudinary Config] CLOUD_NAME:",
  process.env.CLOUD_NAME ? "✓ Set" : "✗ Missing",
);
console.log(
  "[Cloudinary Config] CLOUD_API_KEY:",
  process.env.CLOUD_API_KEY ? "✓ Set" : "✗ Missing",
);
console.log(
  "[Cloudinary Config] CLOUD_API_SECRET:",
  process.env.CLOUD_API_SECRET ? "✓ Set" : "✗ Missing",
);

// Validate required environment variables
const requiredEnvVars = {
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error(
    `[Cloudinary Config Error] Missing environment variables: ${missingVars.join(", ")}`,
  );
  console.error(
    "Please ensure CLOUD_NAME, CLOUD_API_KEY, and CLOUD_API_SECRET are set in your environment",
  );
  console.error(
    "Available env vars:",
    Object.keys(process.env)
      .filter((k) => k.includes("CLOUD"))
      .join(", "),
  );
}

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

console.log("[Cloudinary Config] Configuration complete");

export default cloudinary;
