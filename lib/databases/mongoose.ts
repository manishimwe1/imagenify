import mongoose, { Mongoose } from "mongoose";

interface MongooseConnextion {
	conn: Mongoose | null;
	promise: Promise<Mongoose> | null;
}
const MONGODB_URL = process.env.MONGODB_URL;
let cached: MongooseConnextion = (global as any).mongoose;

if (!cached) {
	cached = (global as any).mongoose = {
		conn: null,
		promise: null,
	};
}

export const connectToDatabase = async () => {
	if (cached.conn) {
		return cached.conn;
	}
	if (!MONGODB_URL)
		throw new Error("Missing MONGODB_URL");

	cached.promise =
		cached.promise ||
		mongoose.connect(MONGODB_URL, {
			dbName: "Imagenify",
			bufferCommands: false,
		});

	cached.conn = await cached.promise;
};
