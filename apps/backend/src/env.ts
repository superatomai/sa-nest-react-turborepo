import * as path from "path"; 
import * as dotenv from "dotenv"; 
// Resolve .env file location no matter if running from src or dist 
dotenv.config({ path: path.resolve(__dirname, "../.env"), }); 

console.log('[ENV] Loaded OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '[set]' : '[missing]'); 
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY; 
export const DATABASE_URL = process.env.DATABASE_URL; 
export const WEBSOCKET_URL = process.env.WEBSOCKET_URL; 
export const RUNTIME_PROJECT_ID = process.env.RUNTIME_PROJECT_ID; 
export const CLERK_PUBLISHABLE_KEY = process.env.CLERK_PUBLISHABLE_KEY; 
export const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;