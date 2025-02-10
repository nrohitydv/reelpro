import mongoose from "mongoose";

// Get the MongoDB connection URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI!;

// Throw an error if the connection URI is missing
if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined");
}

// Check if a cached connection already exists in the global scope
const cached = global.mongoose;

// If no cached object exists, initialize it
if (!cached) {
  global.mongoose = { conn: null, promise: null };
}

// Function to establish and reuse a MongoDB connection
export async function connectToMongoDb() {
  // If a connection already exists, return it
  if (cached.conn) {
    return cached.conn;
  }

  // If no connection promise exists, create a new one
  if (!cached.promise) {
    const opts = {
      bufferCommands: true, // Enable buffering for Mongoose commands
      maxPoolSize: 10, // Set the max number of database connections
    };

    // Connect to MongoDB and store the promise
    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then(() => mongoose.connection);
  }

  try {
    // Wait for the connection to be established
    cached.conn = await cached.promise;
  } catch (error) {
    // Reset the connection cache if an error occurs
    cached.conn = null;
    throw error;
  }

  // Return the established database connection
  return cached.conn;
}
