import mongoose from "mongoose";

// Database configuration
export class DatabaseConfig {
  private static instance: DatabaseConfig;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): DatabaseConfig {
    if (!DatabaseConfig.instance) {
      DatabaseConfig.instance = new DatabaseConfig();
    }
    return DatabaseConfig.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log("📊 MongoDB already connected");
      return;
    }

    try {
      const mongoUri =
        process.env.MONGODB_URI || "mongodb://localhost:27017/trading-bot";

      await mongoose.connect(mongoUri, {
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        bufferCommands: false, // Disable mongoose buffering
        // bufferMaxEntries: 0, // Disable mongoose buffering
      });

      this.isConnected = true;
      console.log("✅ MongoDB connected successfully");

      // Handle connection events
      mongoose.connection.on("error", (err) => {
        console.error("❌ MongoDB connection error:", err);
        this.isConnected = false;
      });

      mongoose.connection.on("disconnected", () => {
        console.log("⚠️ MongoDB disconnected");
        this.isConnected = false;
      });

      mongoose.connection.on("reconnected", () => {
        console.log("🔄 MongoDB reconnected");
        this.isConnected = true;
      });
    } catch (error) {
      console.error("❌ MongoDB connection failed:", error);
      this.isConnected = false;
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log("📊 MongoDB disconnected");
    } catch (error) {
      console.error("❌ Error disconnecting from MongoDB:", error);
      throw error;
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  public getConnection(): typeof mongoose.connection {
    return mongoose.connection;
  }
}

// Export singleton instance
export const database = DatabaseConfig.getInstance();
