import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstname: { type: String, default: "" }, // not required for Google
    lastname: { type: String, default: "" },  // not required for Google
    email: { type: String, required: true, unique: true },
    password: { type: String, select: false }, // only for credentials users
    role: { type: String, enum: ["user", "admin"], default: "user" },
    image: { type: String },
    authProviderId: { type: String }, // e.g., Google account ID
    provider: { type: String, enum: ["credentials", "google"], default: "credentials" },
  },
  { timestamps: true }
);

export const User = mongoose.models?.User || mongoose.model("User", userSchema);
