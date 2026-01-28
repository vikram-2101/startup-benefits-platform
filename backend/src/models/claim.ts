import mongoose, { Document, Schema } from "mongoose";

export type ClaimStatus = "pending" | "approved" | "rejected";

export interface IClaim extends Document {
  userId: mongoose.Types.ObjectId;
  dealId: mongoose.Types.ObjectId;
  status: ClaimStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const claimSchema = new Schema<IClaim>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    dealId: {
      type: Schema.Types.ObjectId,
      ref: "Deal",
      required: [true, "Deal ID is required"],
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    notes: {
      type: String,
      default: null,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
  },
);

// Compound unique index to prevent duplicate claims
claimSchema.index({ userId: 1, dealId: 1 }, { unique: true });

// Compound index for querying user's claims by status
claimSchema.index({ userId: 1, status: 1 });

const Claim = mongoose.model<IClaim>("Claim", claimSchema);

export default Claim;
