import mongoose, { Document, Schema } from "mongoose";

export type DealCategory =
  | "cloud"
  | "marketing"
  | "analytics"
  | "productivity"
  | "design"
  | "development"
  | "communication"
  | "finance"
  | "other";

export interface IDeal extends Document {
  title: string;
  description: string;
  partnerName: string;
  partnerLogo?: string;
  category: DealCategory;
  isLocked: boolean;
  eligibilityText: string;
  dealValue: string;
  expiresAt?: Date;
  claimCount: number;
  isExpired(): boolean;
  createdAt: Date;
  updatedAt: Date;
}

const dealSchema = new Schema<IDeal>(
  {
    title: {
      type: String,
      required: [true, "Deal title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    partnerName: {
      type: String,
      required: [true, "Partner name is required"],
      trim: true,
    },
    partnerLogo: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "cloud",
        "marketing",
        "analytics",
        "productivity",
        "design",
        "development",
        "communication",
        "finance",
        "other",
      ],
      index: true,
    },
    isLocked: {
      type: Boolean,
      default: false,
      index: true,
    },
    eligibilityText: {
      type: String,
      default: "Available to all users",
      maxlength: [500, "Eligibility text cannot exceed 500 characters"],
    },
    dealValue: {
      type: String,
      required: [true, "Deal value is required"],
      trim: true,
    },
    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },
    claimCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for filtering
dealSchema.index({ category: 1, isLocked: 1 });

// TTL index for expired deals
dealSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Instance method to check if deal is expired
dealSchema.methods.isExpired = function (): boolean {
  return this.expiresAt ? this.expiresAt < new Date() : false;
};

const Deal = mongoose.model<IDeal>("Deal", dealSchema);

export default Deal;
