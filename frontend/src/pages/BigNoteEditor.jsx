import { useEffect, useState, useRef } from "react";
import Editor from "../Components/Editor";
import FileDrop from "../Components/FileDrop";
import api from "../services/api";

let saveTimeout;

const BigNoteEditor = ({ note, onUpdate }) => {
  const [title, setTitle] = useState(note.title || "");
  const [content, setContent] = useState(note.content || "");
  const [tags, setTags] = useState(note.tags || []);
  const [folder, setFolder] = useState(note.folder || "General");
  const [sourceFiles, setSourceFiles] = useState([]);
  const mounted = useRef(true);

  useEffect(() => {
    setTitle(note.title || "");
    setContent(note.content || "");
    setTags(note.tags || []);
    setFolder(note.folder || "General");
    setSourceFiles(note.sourceFiles || []);
  }, [note]);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  // Autosave with debounce
  useEffect(() => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
      try {
        if (!note || !note._id) return;
        const res = await api.put(`/notes/${note._id}`, {
          title,
          content,
          tags,
          folder,
        });
        if (mounted.current) onUpdate(res.data);
      } catch (err) {
        console.error("Autosave failed", err);
      }
    }, 800);

    return () => clearTimeout(saveTimeout);
  }, [title, content, tags, folder, note, onUpdate]);

const saveNote = async () => {
  const res = await api.put(`/notes/${note._id}`, {
    title,
    content,
    tags,
    folder,
  });
  onUpdate(res.data);
};

const deleteNote = async () => {
  await api.delete(`/notes/${note._id}`);
  window.location.reload();
};


  return (
    <main className="flex-1 p-8 overflow-auto bg-gray-50 dark:bg-gray-900">
      <input
        className="text-4xl font-bold w-full outline-none mb-6 bg-transparent text-gray-900 dark:text-white"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note Title"
      />

      <div className="flex gap-3 mb-6">
        <button onClick={saveNote} className="btn-primary">💾 Save</button>
        <button onClick={deleteNote} className="btn-danger">🗑 Delete</button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <input
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          placeholder="Folder (e.g., General)"
          className="input"
        />
        <input
          value={tags.join(", ")}
          onChange={(e) => setTags(e.target.value.split(",").map(t => t.trim()))}
          placeholder="Tags (comma separated)"
          className="input"
        />
      </div>

      {note.type === "BIG" && (
        <div className="mb-6">
          <FileDrop
            onContentMerged={(text, sourceFiles) => {
              setContent((prev) => prev + `<p>${text}</p>`);
              if (sourceFiles && sourceFiles.length) {
                setSourceFiles((prev) => [...prev, ...sourceFiles]);
              }
            }}
          />

          {sourceFiles.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <strong className="text-blue-900 dark:text-blue-200">📎 Uploaded files:</strong>
              <ul className="list-disc ml-6 mt-2 text-sm text-blue-800 dark:text-blue-300">
                {sourceFiles.map((s, i) => (
                  <li key={i}>{s.name} <span className="text-xs text-blue-600 dark:text-blue-400">({s.fileType})</span></li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <Editor content={content} onChange={setContent} />
      </div>
    </main>
  );
};

export default BigNoteEditor;
