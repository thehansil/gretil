import mongoose from "mongoose";

export async function connectDB() {
  if (mongoose.connection.readyState === mongoose.ConnectionStates.connected) {
    return;
  }

  if (mongoose.connection.readyState === mongoose.ConnectionStates.connecting) {
    await mongoose.connection.asPromise();
    return;
  }

  await mongoose.connect(process.env.MONGODB_URI!);
  console.log("MongoDB connected");
}
