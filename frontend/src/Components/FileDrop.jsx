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
      className={`border-2 border-dashed p-8 rounded-xl text-center transition-all duration-300 transform ${
        isDragActive
          ? "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-500 scale-[1.02] shadow-lg"
          : uploading
          ? "bg-gray-100 dark:bg-gray-800 border-gray-400 cursor-wait"
          : "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:shadow-md cursor-pointer hover:scale-[1.01]"
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        {uploading ? (
          <>
            <div className="w-10 h-10 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
            <div className="text-gray-700 dark:text-gray-300 font-medium">
              Uploading files...
            </div>
          </>
        ) : (
          <>
            <div className="text-5xl mb-2 animate-bounce-subtle">📎</div>
            <div className="text-gray-700 dark:text-gray-300 font-semibold text-lg">
              {isDragActive ? "Drop files here" : "Drag & drop Word or TXT files"}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              or click to browse
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FileDrop;