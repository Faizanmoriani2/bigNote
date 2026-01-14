import { useDropzone } from "react-dropzone";
import api from "../services/api";
import { useState } from "react";

const FileDrop = ({ onContentMerged }) => {
  const [uploading, setUploading] = useState(false);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "text/plain": [".txt"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
        ".docx",
      ],
    },
    onDrop: async (files) => {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));

      try {
        setUploading(true);
        const res = await api.post("/notes/upload", formData);
        onContentMerged(res.data.content, res.data.sourceFiles || []);
      } catch (err) {
        console.error("Upload failed", err);
        alert("File upload failed");
      } finally {
        setUploading(false);
      }
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed p-6 rounded-lg text-center transition-all ${
        isDragActive
          ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500"
          : uploading
          ? "bg-gray-100 dark:bg-gray-700 border-gray-400"
          : "bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-blue-500 cursor-pointer"
      }`}
    >
      <input {...getInputProps()} />
      <div className="text-gray-600 dark:text-gray-300 font-medium">
        {uploading ? "📤 Uploading..." : "📎 Drag & drop Word or TXT files here"}
      </div>
    </div>
  );
};

export default FileDrop;
