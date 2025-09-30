// import * as dotenv from "dotenv";
// import { query, type Options } from "@anthropic-ai/claude-code";
// import * as path from "path";
// import * as fs from "fs-extra";
// import * as readline from "readline";

// // Load environment variables
// dotenv.config();
// // 
// // Ensure ANTHROPIC_API_KEY is set in environment
// if (!process.env.ANTHROPIC_API_KEY) {
//   console.error("ANTHROPIC_API_KEY environment variable is required");
//   console.error("Please set it in your .env file:");
//   console.error("ANTHROPIC_API_KEY=your_api_key_here");
//   process.exit(1);
// }

// class ClaudeCodeProjectApp {
//   private projectsDir: string = path.join(process.cwd(), ".projects");
//   private currentProjectPath: string = "";
//   private currentProjectId: string = "";

//   constructor() {
//     // Ensure .projects directory exists
//     fs.ensureDirSync(this.projectsDir);
//     console.log("Claude Code App initialized");
//     console.log(`Projects directory: ${this.projectsDir}`);
//     console.log("Using API key from ANTHROPIC_API_KEY environment variable");
//   }

//   // Set the current project
//   setProject(projectId: string): void {
//     this.currentProjectId = projectId;
//     this.currentProjectPath = path.join(this.projectsDir, projectId);

//     // Ensure project directory exists
//     fs.ensureDirSync(this.currentProjectPath);

//     console.log(`\nProject set to: ${projectId}`);
//     console.log(`Working directory: ${this.currentProjectPath}`);
//   }

//   // List all projects
//   listProjects(): string[] {
//     try {
//       const projects = fs.readdirSync(this.projectsDir).filter((item) => {
//         const itemPath = path.join(this.projectsDir, item);
//         return fs.statSync(itemPath).isDirectory();
//       });
//       return projects;
//     } catch (error) {
//       return [];
//     }
//   }

//   // Delete a project
//   deleteProject(projectId: string): void {
//     const projectPath = path.join(this.projectsDir, projectId);
//     if (fs.existsSync(projectPath)) {
//       fs.removeSync(projectPath);
//       console.log(`Deleted project: ${projectId}`);
//     } else {
//       console.log(`Project not found: ${projectId}`);
//     }
//   }

//   // File operations within current project
//   async writeFile(filePath: string, content: string): Promise<void> {
//     if (!this.currentProjectId) {
//       throw new Error(
//         "No project selected. Use /project <id> to select a project.",
//       );
//     }

//     const fullPath = path.join(this.currentProjectPath, filePath);
//     const dir = path.dirname(fullPath);

//     // Ensure directory exists
//     await fs.ensureDir(dir);
//     await fs.writeFile(fullPath, content, "utf8");
//     console.log(`Written to file: ${filePath}`);
//   }

//   async readFile(filePath: string): Promise<string> {
//     if (!this.currentProjectId) {
//       throw new Error(
//         "No project selected. Use /project <id> to select a project.",
//       );
//     }

//     const fullPath = path.join(this.currentProjectPath, filePath);
//     return await fs.readFile(fullPath, "utf8");
//   }

//   async listFiles(dirPath: string = "."): Promise<string[]> {
//     if (!this.currentProjectId) {
//       throw new Error(
//         "No project selected. Use /project <id> to select a project.",
//       );
//     }

//     const fullPath = path.join(this.currentProjectPath, dirPath);
//     return await fs.readdir(fullPath);
//   }

//   async fileExists(filePath: string): Promise<boolean> {
//     if (!this.currentProjectId) {
//       return false;
//     }

//     const fullPath = path.join(this.currentProjectPath, filePath);
//     return await fs.pathExists(fullPath);
//   }

//   async deleteFile(filePath: string): Promise<void> {
//     if (!this.currentProjectId) {
//       throw new Error(
//         "No project selected. Use /project <id> to select a project.",
//       );
//     }

//     const fullPath = path.join(this.currentProjectPath, filePath);
//     await fs.remove(fullPath);
//     console.log(`Deleted file: ${filePath}`);
//   }

//   // Execute Claude Code query
//   async executeClaudeCode(prompt: string): Promise<void> {
//     if (!this.currentProjectId) {
//       console.error(
//         "No project selected. Use /project <id> to select a project first.",
//       );
//       return;
//     }

//     try {
//       console.log("Processing with Claude Code SDK...");

//       // Configure options for Claude Code query
//       const options: Options = {
//         // Claude Code SDK will use ANTHROPIC_API_KEY from environment
//         allowedTools: ["Read", "Write", "Edit", "Bash", "Grep", "Glob"],
//         cwd: this.currentProjectPath,
//         model: "claude-sonnet-4-20250514", // $3 / MTok, $15 / MTok
//         // model: "claude-3-5-sonnet-20241022", // deprecated $3 / MTok, $15 / MTok
//         // model: "claude-3-5-haiku-20241022", // $0.80 / MTok, $4 / MTok
//         maxTurns: 10,
//         env: {
//           ...process.env,
//           PROJECT_DIR: this.currentProjectPath,
//           PROJECT_ID: this.currentProjectId,
//         },
//       };

//       // Execute the query using Claude Code SDK
//       const response = query({
//         prompt: prompt,
//         options: options,
//       });

//       // Stream and display the response
//       for await (const message of response) {
//         if (typeof message === "string") {
//           console.log(message);
//         } else if (message && typeof message === "object") {
//           // Handle different message types
//           if ("text" in message) {
//             console.log(message.text);
//           } else if ("toolUse" in message) {
//             console.log(`🛠️  Using tool: ${JSON.stringify(message.toolUse)}`);
//           } else {
//             // Log the full message for debugging
//             console.log(JSON.stringify(message, null, 2));
//           }
//         }
//       }
//     } catch (error: any) {
//       console.error("Error executing Claude Code query:");
//       console.error("Error message:", error.message || "No message");
//       console.error("Error details:", error);

//       if (error.message?.includes("API key")) {
//         console.error(
//           "\nAPI Key Issue: Make sure ANTHROPIC_API_KEY is set correctly in your .env file",
//         );
//       } else if (error.message?.includes("exited with code 1")) {
//         console.error("\nPossible issues:");
//         console.error("1. Check if Claude Code CLI is properly installed");
//         console.error("2. Verify API key is valid and has correct permissions");
//         console.error(
//           "3. Check if the model name is correct: claude-sonnet-4-20250514",
//         );
//         console.error(
//           "4. Try removing extraArgs to see if that fixes the issue",
//         );
//       }
//     }
//   }

//   // Interactive CLI
//   async startInteractiveSession(projectId?: string): Promise<void> {
//     // Set project if provided
//     if (projectId) {
//       this.setProject(projectId);
//     }

//     const rl = readline.createInterface({
//       input: process.stdin,
//       output: process.stdout,
//       prompt: `\nClaude Code${this.currentProjectId ? ` [${this.currentProjectId}]` : ""} > `,
//     });

//     console.log("\nWelcome to Claude Code App with Project Management!");
//     console.log("Commands:");
//     console.log("  - /project <id> - Select or create a project");
//     console.log("  - /projects - List all projects");
//     console.log("  - /delete-project <id> - Delete a project");
//     console.log(
//       "  - /write <path> <content> - Write to file in current project",
//     );
//     console.log("  - /read <path> - Read file from current project");
//     console.log("  - /list [path] - List files in current project");
//     console.log("  - /delete <path> - Delete file from current project");
//     console.log("  - /context - Show current project context");
//     console.log("  - /help - Show this help message");
//     console.log("  - /exit or Ctrl+C - Exit the application");
//     console.log(
//       "\n  After selecting a project, type any prompt to execute with Claude Code SDK",
//     );
//     console.log(
//       "  Claude can use tools: Read, Write, Edit, Bash, Grep, Glob\n",
//     );

//     if (!this.currentProjectId) {
//       console.log(
//         "No project selected. Use /project <id> to select or create a project.\n",
//       );
//     }

//     rl.prompt();

//     rl.on("line", async (line) => {
//       const input = line.trim();

//       try {
//         if (input.startsWith("/")) {
//           await this.handleCommand(input);
//           // Update prompt with current project
//           rl.setPrompt(
//             `\nClaude Code${this.currentProjectId ? ` [${this.currentProjectId}]` : ""} > `,
//           );
//         } else if (input) {
//           await this.executeClaudeCode(input);
//         }
//       } catch (error) {
//         console.error("Error:", error);
//       }

//       rl.prompt();
//     });

//     rl.on("close", () => {
//       console.log("\nGoodbye!");
//       process.exit(0);
//     });
//   }

//   private async handleCommand(command: string): Promise<void> {
//     const parts = command.split(" ");
//     const cmd = parts[0].toLowerCase();

//     switch (cmd) {
//       case "/project":
//         if (parts.length < 2) {
//           console.log("Usage: /project <id>");
//           break;
//         }
//         const projectId = parts[1];
//         this.setProject(projectId);
//         break;

//       case "/projects":
//         const projects = this.listProjects();
//         if (projects.length > 0) {
//           console.log("\nAvailable projects:");
//           projects.forEach((project) => {
//             const marker =
//               project === this.currentProjectId ? " (current)" : "";
//             console.log(`  - ${project}${marker}`);
//           });
//         } else {
//           console.log("\nNo projects found. Create one with /project <id>");
//         }
//         break;

//       case "/delete-project":
//         if (parts.length < 2) {
//           console.log("Usage: /delete-project <id>");
//           break;
//         }
//         const deleteProjectId = parts[1];
//         if (deleteProjectId === this.currentProjectId) {
//           this.currentProjectId = "";
//           this.currentProjectPath = "";
//         }
//         this.deleteProject(deleteProjectId);
//         break;

//       case "/write":
//         if (parts.length < 3) {
//           console.log("Usage: /write <path> <content>");
//           break;
//         }
//         const writePath = parts[1];
//         const content = parts.slice(2).join(" ");
//         await this.writeFile(writePath, content);
//         break;

//       case "/read":
//         if (parts.length < 2) {
//           console.log("Usage: /read <path>");
//           break;
//         }
//         const readPath = parts[1];
//         if (await this.fileExists(readPath)) {
//           const fileContent = await this.readFile(readPath);
//           console.log(`\nContent of ${readPath}:\n${fileContent}`);
//         } else {
//           console.log(`File not found: ${readPath}`);
//         }
//         break;

//       case "/list":
//         if (!this.currentProjectId) {
//           console.log(
//             "No project selected. Use /project <id> to select a project.",
//           );
//           break;
//         }
//         const listPath = parts[1] || ".";
//         try {
//           const files = await this.listFiles(listPath);
//           console.log(`\nFiles in ${listPath}:`);
//           files.forEach((file) => console.log(`  - ${file}`));
//         } catch (error) {
//           console.log(`Directory not found: ${listPath}`);
//         }
//         break;

//       case "/delete":
//         if (parts.length < 2) {
//           console.log("Usage: /delete <path>");
//           break;
//         }
//         const deletePath = parts[1];
//         if (await this.fileExists(deletePath)) {
//           await this.deleteFile(deletePath);
//         } else {
//           console.log(`File not found: ${deletePath}`);
//         }
//         break;

//       case "/context":
//         console.log("\nCurrent Context:");
//         console.log(`  Projects Directory: ${this.projectsDir}`);
//         if (this.currentProjectId) {
//           console.log(`  Current Project: ${this.currentProjectId}`);
//           console.log(`  Working Directory: ${this.currentProjectPath}`);
//           try {
//             const files = await this.listFiles(".");
//             console.log(`  Files in project: ${files.length} items`);
//             if (files.length > 0 && files.length <= 10) {
//               console.log("  Files:");
//               files.forEach((file) => console.log(`    - ${file}`));
//             } else if (files.length > 10) {
//               console.log("  Files (showing first 10):");
//               files
//                 .slice(0, 10)
//                 .forEach((file) => console.log(`    - ${file}`));
//               console.log(`    ... and ${files.length - 10} more`);
//             }
//           } catch (error) {
//             console.log("  No files in project");
//           }
//         } else {
//           console.log("  No project selected");
//         }
//         break;

//       case "/help":
//         console.log("\nAvailable commands:");
//         console.log("  /project <id> - Select or create a project");
//         console.log("  /projects - List all projects");
//         console.log("  /delete-project <id> - Delete a project");
//         console.log(
//           "  /write <path> <content> - Write to file in current project",
//         );
//         console.log("  /read <path> - Read file from current project");
//         console.log("  /list [path] - List files in current project");
//         console.log("  /delete <path> - Delete file from current project");
//         console.log("  /context - Show current project context");
//         console.log("  /help - Show this help message");
//         console.log("  /exit - Exit the application");
//         break;

//       case "/exit":
//         console.log("\nGoodbye!");
//         process.exit(0);
//         break;

//       default:
//         console.log(
//           `Unknown command: ${cmd}. Type /help for available commands.`,
//         );
//     }
//   }

//   // Demo: Show Claude Code capabilities
//   async demonstrateClaudeCode(): Promise<void> {
//     console.log("\nDemonstrating Claude Code SDK with Project Management...\n");

//     // Create a demo project
//     const demoProjectId = "demo-project";
//     this.setProject(demoProjectId);

//     // Pre-create a sample file
//     const jsCode =
//       'function hello(name) {\n  return "Hello, " + name + "!";\n}\n\nconsole.log(hello("World"));';

//     await this.writeFile("example.js", jsCode);

//     console.log("Created example.js in demo project\n");

//     // Use Claude Code to work with the file
//     console.log("1. Asking Claude to analyze the JavaScript file...\n");
//     await this.executeClaudeCode(
//       "Read the file example.js and suggest improvements. Add error handling and better code structure.",
//     );

//     console.log("\n2. Asking Claude to create a test file...\n");
//     await this.executeClaudeCode(
//       "Create a test file called test_example.js that tests the hello function from example.js",
//     );

//     // List all created files
//     console.log("\n3. Files in demo project:");
//     const files = await this.listFiles(".");
//     files.forEach((file) => console.log(`  - ${file}`));
//   }
// }

// // Main execution
// async function main() {
//   try {
//     const app = new ClaudeCodeProjectApp();

//     // Parse command line arguments
//     const args = process.argv.slice(2);
//     let projectId: string | undefined;
//     let shouldDemo = false;

//     for (let i = 0; i < args.length; i++) {
//       if (args[i] === "--project" && i + 1 < args.length) {
//         projectId = args[i + 1];
//         i++;
//       } else if (args[i] === "--demo") {
//         shouldDemo = true;
//       }
//     }

//     // Run demonstration if requested
//     if (shouldDemo) {
//       await app.demonstrateClaudeCode();
//       console.log("\nDemo completed! Now entering interactive mode...\n");
//     }

//     // Start interactive session
//     await app.startInteractiveSession(projectId);
//   } catch (error) {
//     console.error("Fatal error:", error);
//     process.exit(1);
//   }
// }

// // Run the application
// main();