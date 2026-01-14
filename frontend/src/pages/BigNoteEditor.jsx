import { useEffect, useState, useRef } from "react";
import Editor from "../Components/Editor";
import FileDrop from "../Components/FileDrop";
import api from "../services/api";

const BigNoteEditor = ({ note, onUpdate }) => {
  const saveTimeoutRef = useRef();

  const [title, setTitle] = useState(note.title || "");
  const [content, setContent] = useState(note.content || "");
  const [tags, setTags] = useState(note.tags || []);
  const [folder, setFolder] = useState(note.folder || "General");
  const [sourceFiles, setSourceFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
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
    if (!note || !note._id) {
      setAutoSaving(false);
      return;
    }

    clearTimeout(saveTimeoutRef.current);
    setAutoSaving(true);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await api.put(`/notes/${note._id}`, {
          title,
          content,
          tags,
          folder,
        });
        if (mounted.current) {
          onUpdate(res.data);
          setAutoSaving(false);
        }
      } catch (err) {
        console.error("Autosave failed", err);
        if (mounted.current) setAutoSaving(false);
      }
    }, 800);

    return () => clearTimeout(saveTimeoutRef.current);
  }, [title, content, tags, folder, note, onUpdate]);

  const saveNote = async () => {
    try {
      setSaving(true);
      const res = await api.put(`/notes/${note._id}`, {
        title,
        content,
        tags,
        folder,
      });
      onUpdate(res.data);
      setTimeout(() => setSaving(false), 500);
    } catch (err) {
      console.error("Save failed", err);
      setSaving(false);
    }
  };

  const deleteNote = async () => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    
    try {
      setDeleting(true);
      await api.delete(`/notes/${note._id}`);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      console.error("Delete failed", err);
      setDeleting(false);
    }
  };

  return (
    <main className="flex-1 p-8 overflow-auto bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <input
            className="text-4xl font-bold w-full outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-700 transition-all duration-200 focus:placeholder-gray-400 dark:focus:placeholder-gray-600"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="✍️ Note Title"
          />
          {autoSaving && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 animate-fade-in">
              <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
              Saving...
            </div>
          )}
        </div>

        <div className="flex gap-3 mb-8">
          <button 
            onClick={saveNote} 
            disabled={saving}
            className="btn-primary shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Saving...
              </span>
            ) : (
              <span>💾 Save</span>
            )}
          </button>
          <button 
            onClick={deleteNote} 
            disabled={deleting}
            className="btn-danger shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {deleting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Deleting...
              </span>
            ) : (
              <span>🗑 Delete</span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="relative">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
              📁 Folder
            </label>
            <input
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              placeholder="e.g., General, Work, Personal"
              className="input"
            />
          </div>
          <div className="relative">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
              🏷️ Tags
            </label>
            <input
              value={tags.join(", ")}
              onChange={(e) => setTags(e.target.value.split(",").map(t => t.trim()))}
              placeholder="e.g., important, ideas, todo"
              className="input"
            />
          </div>
        </div>

        {note.type === "BIG" && (
          <div className="mb-8 animate-fade-in">
            <FileDrop
              onContentMerged={(text, sourceFiles) => {
                setContent((prev) => prev + `<p>${text}</p>`);
                if (sourceFiles && sourceFiles.length) {
                  setSourceFiles((prev) => [...prev, ...sourceFiles]);
                }
              }}
            />

            {sourceFiles.length > 0 && (
              <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl shadow-sm animate-fade-in">
                <strong className="text-blue-900 dark:text-blue-200 flex items-center gap-2 mb-3">
                  <span className="text-xl">📎</span> Uploaded Files
                </strong>
                <ul className="space-y-2">
                  {sourceFiles.map((s, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-300 bg-white/50 dark:bg-gray-900/30 p-2 rounded-lg">
                      <span className="text-base">📄</span>
                      <span className="font-medium">{s.name}</span>
                      <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-full">
                        {s.fileType}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl">
          <Editor content={content} onChange={setContent} />
        </div>
      </div>
    </main>
  );
};

export default BigNoteEditor;