import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    firebaseUid: string;
    fullName: string;
    email: string;
    role: "admin" | "entrepreneur" | "investor";
    status: "unverified" | "pending" | "verified";
    photoURL: string | null;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        firebaseUid: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        role: {
            type: String,
            enum: ["admin", "entrepreneur", "investor"],
            default: "entrepreneur",
        },
        status: {
            type: String,
            enum: ["unverified", "pending", "verified"],
            default: "unverified",
        },
        photoURL: {
            type: String,
            default: null,
        },
        emailVerified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IUser>("User", userSchema);
