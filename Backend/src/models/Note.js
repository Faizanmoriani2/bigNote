import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    type: {
      type: String,
      enum: ["NORMAL", "BIG"],
      default: "NORMAL",
    },
    tags: [String],
    folder: {
      type: String,
      default: "General",
    },
    sourceFiles: [
      {
        name: String,
        fileType: String,
      },
    ],
  },
  { timestamps: true }
);

// 🔍 Full-text search index
noteSchema.index({
  title: "text",
  content: "text",
  tags: "text",
});

export default mongoose.model("Note", noteSchema);
