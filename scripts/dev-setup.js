#!/usr/bin/env node

// Development setup script
import { execSync } from "child_process";
import { existsSync } from "fs";

console.log("🚀 Setting up development environment...\n");

// Check if VS Code is installed
try {
  execSync("code --version", { stdio: "pipe" });
  console.log("✅ VS Code detected");
} catch {
  console.log(
    "⚠️  VS Code not found - make sure to install the recommended extensions manually",
  );
}

// Run lint fix
console.log("\n🔧 Running ESLint auto-fix...");
try {
  execSync("pnpm run lint -- --fix", { stdio: "inherit" });
  console.log("✅ ESLint auto-fix completed");
} catch (error) {
  console.log("❌ ESLint auto-fix failed:", error.message);
}

// Check if .vscode directory exists
if (existsSync(".vscode")) {
  console.log("✅ VS Code workspace settings configured");
} else {
  console.log("⚠️  .vscode directory not found");
}

console.log("\n🎉 Development setup complete!");
console.log("\n📝 Next steps:");
console.log("1. Install recommended VS Code extensions");
console.log(
  "2. Reload VS Code window (Cmd+Shift+P -> 'Developer: Reload Window')",
);
console.log("3. ESLint should now auto-fix on save");
console.log(
  "\n💡 Tip: You can also run 'pnpm run lint -- --fix' anytime to fix formatting issues",
);
