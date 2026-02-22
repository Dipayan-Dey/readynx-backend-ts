import { Schema } from "mongoose";

export const feedbackSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      enum: [1, 2, 3, 4, 5],
    },
    mood: {
      label: {
        type: String,
        enum: ["Frustrated", "Neutral", "Good", "Loving it"],
      },
      emoji: {
        type: String,
      },
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["new", "reviewed", "resolved"],
      default: "new",
    },
  },
  {
    timestamps: true,
  },
);
