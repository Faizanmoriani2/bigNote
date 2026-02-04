import { useEffect, useMemo, useState, useRef } from "react";
import Editor from "../Components/Editor";
import FileDrop from "../Components/FileDrop";
import api from "../services/api";
import html2pdf from "html2pdf.js";

const BigNoteEditor = ({ note, onUpdate }) => {
  const saveTimeoutRef = useRef();

  const [title, setTitle] = useState(note.title || "");
  const [content, setContent] = useState(note.content || "");
  const [tags, setTags] = useState(note.tags || []);
  const [folder, setFolder] = useState(note.folder || "General");
  const [sourceFiles, setSourceFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [focusMode, setFocusMode] = useState(false);
  const mounted = useRef(true);

  const downloadPDF = async () => {
    if (downloading) return;

    const source = document.getElementById("note-content");
    if (!source) return;

    setDownloading(true);

    try {
      const clone = source.cloneNode(true);
      clone.id = "pdf-note";

      // Remove Tailwind classes only
      const stripClasses = (el) => {
        el.removeAttribute("class");
        [...el.children].forEach(stripClasses);
      };
      stripClasses(clone);

      // PDF typography stylesheet
      const style = document.createElement("style");
      style.innerHTML = `
      * {
        box-sizing: border-box;
        color: #111827 !important;
      }

      body {
        background: white;
      }

      #pdf-note {
        font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        font-size: 14px;
        line-height: 1.7;
        padding: 24px;
        max-width: 800px;
      }

      h1 { font-size: 28px; margin: 24px 0 12px; }
      h2 { font-size: 22px; margin: 20px 0 10px; }
      h3 { font-size: 18px; margin: 16px 0 8px; }

      p {
        margin: 10px 0;
      }

      ul, ol {
        margin: 12px 0 12px 24px;
      }

      li {
        margin: 6px 0;
      }

      blockquote {
        border-left: 4px solid #e5e7eb;
        padding-left: 12px;
        margin: 14px 0;
        color: #374151;
      }

      code {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        background: #f3f4f6;
        padding: 2px 4px;
        border-radius: 4px;
        font-size: 13px;
      }

      pre {
        background: #f3f4f6;
        padding: 12px;
        border-radius: 6px;
        overflow-x: auto;
        margin: 16px 0;
        font-size: 13px;
      }

      hr {
        border: none;
        border-top: 1px solid #e5e7eb;
        margin: 24px 0;
      }

      img {
        max-width: 100%;
        border-radius: 6px;
        margin: 12px 0;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin: 16px 0;
      }

      th, td {
        border: 1px solid #e5e7eb;
        padding: 8px;
        text-align: left;
      }

      /* Kill Tailwind artifacts */
      *::before,
      *::after {
        content: none !important;
      }
    `;

      clone.prepend(style);

      const wrapper = document.createElement("div");
      wrapper.style.position = "fixed";
      wrapper.style.left = "-9999px";
      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      await html2pdf()
        .set({
          margin: [15, 15, 20, 15],
          filename: `${title || "note"}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            backgroundColor: "#ffffff",
            useCORS: true,
          },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait",
          },
        })
        .from(clone)
        .save();

      document.body.removeChild(wrapper);
    } catch (err) {
      console.error("Download PDF failed", err);
    } finally {
      setDownloading(false);
    }
  };

  const plainText = useMemo(() => {
    const noTags = (content || "").replace(/<[^>]+>/g, " ");
    return noTags.replace(/\s+/g, " ").trim();
  }, [content]);

  const wordCount = useMemo(() => {
    if (!plainText) return 0;
    return plainText.split(" ").filter(Boolean).length;
  }, [plainText]);

  const charCount = useMemo(() => plainText.length, [plainText]);

  const readMinutes = useMemo(() => {
    if (!wordCount) return 0;
    return Math.max(1, Math.ceil(wordCount / 200));
  }, [wordCount]);

  const insertTimestamp = () => {
    const stamp = new Date().toLocaleString();
    setContent((prev) => `${prev}<p>${stamp}</p>`);
  };

  const copyPlainText = async () => {
    try {
      await navigator.clipboard.writeText(plainText);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const downloadTxt = () => {
    const blob = new Blob([plainText || ""], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "note"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
          setLastSavedAt(new Date());
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
      setLastSavedAt(new Date());
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
    <main className={`flex-1 overflow-auto ${focusMode ? "bg-white dark:bg-gray-950" : "bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"}`}>
      <div className={`mx-auto ${focusMode ? "max-w-4xl" : "max-w-5xl"} px-6 py-8`}>
        <div className="rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white/80 dark:bg-gray-900/70 backdrop-blur shadow-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <input
                className="text-3xl md:text-4xl font-semibold w-full outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-700 transition-all duration-200 focus:placeholder-gray-400 dark:focus:placeholder-gray-600"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note title"
              />
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800">Words: {wordCount}</span>
                <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800">Chars: {charCount}</span>
                <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800">Read: {readMinutes} min</span>
                {lastSavedAt && (
                  <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    Saved {lastSavedAt.toLocaleTimeString()}
                  </span>
                )}
                {autoSaving && (
                  <span className="flex items-center gap-2 px-2 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    <span className="w-2.5 h-2.5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></span>
                    Autosaving
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFocusMode((v) => !v)}
                className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                {focusMode ? "Exit Focus" : "Focus Mode"}
              </button>
              <button
                onClick={insertTimestamp}
                className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Insert Time
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
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
              <span>Save</span>
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
              <span>Delete</span>
            )}
          </button>

          <button 
            onClick={downloadPDF} 
            disabled={downloading}
            className="btn-primary shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {downloading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Downloading...
              </span>
            ) : (
              <span>Download PDF</span>
            )}
          </button>

          <button
            onClick={copyPlainText}
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 bg-white/70 dark:bg-gray-800 hover:shadow-sm transition"
          >
            Copy Text
          </button>

          <button
            onClick={downloadTxt}
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 bg-white/70 dark:bg-gray-800 hover:shadow-sm transition"
          >
            Download TXT
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="relative">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
              Folder
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
              Tags
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
                  <span className="text-xl">Files</span> Uploaded
                </strong>
                <ul className="space-y-2">
                  {sourceFiles.map((s, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-300 bg-white/50 dark:bg-gray-900/30 p-2 rounded-lg">
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

        <div
          className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl focus-within:ring-2 focus-within:ring-blue-500/40"
          id="note-content"
        >
          <Editor content={content} onChange={setContent} />
          <div className="mt-6 pt-4 border-t border-gray-200/70 dark:border-gray-700/70 text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-3">
            <span>Autosave: {autoSaving ? "on" : "idle"}</span>
            <span>Content: {wordCount} words</span>
            <span>Reading time: {readMinutes} min</span>
          </div>
        </div>
      </div>
    </main>
  );
};

export default BigNoteEditor;
