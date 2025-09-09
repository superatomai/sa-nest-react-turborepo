import * as path from "path"; 
import * as dotenv from "dotenv"; 
import * as fs from "fs";

// Find the .env file by looking for the backend root directory
// This works whether running from src or dist
function findEnvFile(): string {
  // Start from current file location
  let currentDir = __dirname;
  
  // Traverse up until we find the backend directory with package.json
  while (currentDir !== path.dirname(currentDir)) {
    const packageJsonPath = path.join(currentDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        if (packageJson.name === 'backend') {
          // Found the backend root, look for .env here
          const envPath = path.join(currentDir, '.env');
          if (fs.existsSync(envPath)) {
            return envPath;
          }
        }
      } catch (e) {
        // Continue searching
      }
    }
    currentDir = path.dirname(currentDir);
  }
  
  // Fallback: try common locations
  const fallbackPaths = [
    path.join(__dirname, '../.env'),
    path.join(__dirname, '../../.env'),
    path.join(__dirname, '../../../.env'),
  ];
  
  for (const fallbackPath of fallbackPaths) {
    if (fs.existsSync(fallbackPath)) {
      return fallbackPath;
    }
  }
  
  // Last resort: current working directory
  return path.join(process.cwd(), '.env');
}

const envPath = findEnvFile();
console.log(`[ENV] Loading from: ${envPath}`);
dotenv.config({ path: envPath }); 

console.log('[ENV] Loaded OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? '[set]' : '[missing]'); 
export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY; 
export const DATABASE_URL = process.env.DATABASE_URL; 
export const WEBSOCKET_URL = process.env.WEBSOCKET_URL; 
export const RUNTIME_PROJECT_ID = process.env.RUNTIME_PROJECT_ID; 
export const CLERK_PUBLISHABLE_KEY = process.env.CLERK_PUBLISHABLE_KEY; 
export const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
