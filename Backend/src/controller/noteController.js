import Note from "../models/Note.js";
import { parseFile } from "../utils/fileParser.js";

/**
 * Create normal note
 */
export const createNote = async (req, res) => {
  try {
    const note = await Note.create(req.body);
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get all notes
 */
export const getAllNotes = async (_, res) => {
  try {
    const notes = await Note.find().sort({ updatedAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get single note
 */
export const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note)
      return res.status(404).json({ message: "Note not found" });

    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Update note
 */
export const updateNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Delete note
 */
export const deleteNote = async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: "Note deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Upload files & merge content (Big Note helper)
 */
export const uploadFilesAndMerge = async (req, res) => {
  try {
    let mergedContent = "";
    let sourceFiles = [];

    for (const file of req.files) {
      const text = await parseFile(file);
      mergedContent += `\n\n${text}`;

      sourceFiles.push({
        name: file.originalname,
        fileType: file.mimetype,
      });
    }

    res.json({
      content: mergedContent,
      sourceFiles,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const searchNotes = async (req, res) => {
  try {
    const { q } = req.query;
    const notes = await Note.find({
      $text: { $search: q },
    }).sort({ updatedAt: -1 });

    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};