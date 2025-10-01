import dotenv from "dotenv";
import { App } from "./app";

// Load environment variables
dotenv.config();

// Main entry point - Single Responsibility: Start the application
const main = () => {
  const port = parseInt(process.env.PORT || "3000");

  // Create and start the application
  const app = new App();
  app.start(port);
};

// Start the application
main();
