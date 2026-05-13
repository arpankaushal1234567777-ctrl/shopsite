import express from "express";
import Gallery from "../models/Gallery.js";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

// Lazy Supabase client - created on first use, not at module load time
// This avoids the ESM hoisting issue where env vars aren't loaded yet
function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL or SUPABASE_SERVICE_KEY not set in environment");
  }
  return createClient(url, key);
}

/**
 * GET /api/gallery
 * Fetch all active gallery images
 */
router.get("/", async (req, res) => {
  try {
    console.log("[Gallery GET] Fetching all gallery images");

    const images = await Gallery.find({ status: "active" })
      .select("_id fileName url uploadedBy createdAt")
      .sort({ createdAt: -1 })
      .lean();

    console.log(`[Gallery GET] Found ${images.length} images`);

    res.json({
      success: true,
      data: images,
      count: images.length,
    });
  } catch (error) {
    console.error("[Gallery GET] Error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch gallery images",
      details: error.message,
    });
  }
});

/**
 * POST /api/gallery
 * Create gallery image record (called after upload)
 */
router.post("/", async (req, res) => {
  try {
    const { fileName, url, storagePath, size, mimeType } = req.body;

    if (!fileName || !url || !storagePath) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: fileName, url, storagePath",
      });
    }

    console.log("[Gallery POST] Creating record for:", fileName);

    let gallery = await Gallery.findOne({ fileName });

    if (gallery) {
      // Reactivate if previously deleted
      gallery.status = "active";
      gallery.url = url;
      gallery.storagePath = storagePath;
      gallery.size = size;
      gallery.mimeType = mimeType;
      await gallery.save();
      console.log("[Gallery POST] Reactivated existing record:", fileName);
    } else {
      gallery = await Gallery.create({
        fileName,
        url,
        storagePath,
        size,
        mimeType,
        status: "active",
      });
      console.log("[Gallery POST] Created new record:", fileName);
    }

    res.status(201).json({
      success: true,
      message: "Gallery image recorded successfully",
      data: gallery,
    });
  } catch (error) {
    console.error("[Gallery POST] Error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to create gallery record",
      details: error.message,
    });
  }
});

/**
 * DELETE /api/gallery/:id
 * Delete gallery image by MongoDB ID
 * Removes from both MongoDB and Supabase Storage
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: "Invalid gallery ID format",
      });
    }

    console.log("[Gallery DELETE] Processing deletion for ID:", id);

    const gallery = await Gallery.findById(id);

    if (!gallery) {
      console.error("[Gallery DELETE] Image not found:", id);
      return res.status(404).json({
        success: false,
        error: "Gallery image not found",
      });
    }

    const fileName = gallery.fileName;
    const storagePath = gallery.storagePath;

    console.log("[Gallery DELETE] Found image:", fileName);

    // Delete from Supabase Storage
    try {
      const supabase = getSupabaseClient();
      const { error: storageError } = await supabase.storage
        .from("gallery")
        .remove([storagePath]);

      if (storageError) {
        console.warn("[Gallery DELETE] Storage deletion warning:", storageError.message);
      } else {
        console.log("[Gallery DELETE] Removed from Supabase Storage:", storagePath);
      }
    } catch (storageErr) {
      console.warn("[Gallery DELETE] Storage deletion error:", storageErr.message);
      // Continue with DB deletion even if storage fails
    }

    // Soft delete in MongoDB
    await Gallery.findByIdAndUpdate(id, { status: "deleted" }, { new: true });

    console.log("[Gallery DELETE] Marked as deleted in MongoDB:", id);

    res.json({
      success: true,
      message: "Image deleted successfully",
      deletedImage: fileName,
    });
  } catch (error) {
    console.error("[Gallery DELETE] Error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to delete gallery image",
      details: error.message,
    });
  }
});

/**
 * DELETE /api/gallery/batch/remove
 * Delete multiple images (for bulk operations)
 */
router.post("/batch/remove", async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Please provide an array of image IDs",
      });
    }

    console.log("[Gallery BATCH] Deleting", ids.length, "images");

    const galleries = await Gallery.find({ _id: { $in: ids } });

    if (galleries.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No gallery images found with provided IDs",
      });
    }

    // Delete from Supabase Storage
    try {
      const supabase = getSupabaseClient();
      const storagePathsToDelete = galleries.map((g) => g.storagePath);
      await supabase.storage.from("gallery").remove(storagePathsToDelete);
      console.log("[Gallery BATCH] Removed from storage:", storagePathsToDelete.length, "files");
    } catch (storageErr) {
      console.warn("[Gallery BATCH] Storage deletion warning:", storageErr.message);
    }

    // Soft delete in MongoDB
    await Gallery.updateMany({ _id: { $in: ids } }, { status: "deleted" });

    console.log("[Gallery BATCH] Deleted", ids.length, "images from MongoDB");

    res.json({
      success: true,
      message: `${ids.length} images deleted successfully`,
      deletedCount: ids.length,
    });
  } catch (error) {
    console.error("[Gallery BATCH] Error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to delete gallery images",
      details: error.message,
    });
  }
});

export default router;