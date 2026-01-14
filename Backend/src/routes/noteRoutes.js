import express from "express";
import {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote,
  uploadFilesAndMerge,
  searchNotes
} from "../controller/noteController.js";

import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post("/", createNote);
router.get("/", getAllNotes);
// Keep specific routes before dynamic params to avoid conflicts
router.get("/search", searchNotes);
router.get("/:id", getNoteById);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

// File upload for Big Notes
router.post(
  "/upload",
  upload.array("files"),
  uploadFilesAndMerge
);

export default router;
