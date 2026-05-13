import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
    },
    storagePath: {
      type: String,
      required: true,
      description: "Path in Supabase Storage",
    },
    uploadedBy: {
      type: String,
      default: "admin",
    },
    size: Number,
    mimeType: String,
    status: {
      type: String,
      enum: ["active", "deleted"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
gallerySchema.index({ status: 1, createdAt: -1 });

const Gallery = mongoose.model("Gallery", gallerySchema);

export default Gallery;
