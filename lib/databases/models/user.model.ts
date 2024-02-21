import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
	clerkId: { type: String, require: true, unique: true },
	email: { type: String, require: true, unique: true },
	username: { type: String, require: true, unique: true },
	photo: { type: String, require: true },
	firstName: { type: String, require: true },
	lastName: { type: String, require: true },
	planId: { type: Number, default: 1 },
	creditBalance: { type: Number, default: 10 },
});

const User = models.User || model("User", UserSchema);

export default User;
