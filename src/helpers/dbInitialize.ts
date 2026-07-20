import mongoose from "mongoose";

export async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in the environment variables");
  }
  if (mongoose.connection.readyState === mongoose.ConnectionStates.connected) {
    return;
  }

  if (mongoose.connection.readyState === mongoose.ConnectionStates.connecting) {
    await mongoose.connection.asPromise();
    return;
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");
}
