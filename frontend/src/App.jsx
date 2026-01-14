import { useEffect, useState, useCallback } from "react";
import Sidebar from "./Components/Sidebar";
import BigNoteEditor from "./pages/BigNoteEditor";
import api from "./services/api";

const App = () => {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [dark, setDark] = useState(() => {
    try {
      const ls = localStorage.getItem("dark");
      if (ls !== null) return ls === "true";
      return (
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    } catch (e) {
      return false;
    }
  });
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/notes");
      setNotes(res.data);
    } catch (err) {
      console.error("Failed to fetch notes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Persist theme and wire a simple dark-mode class on the <html>
  useEffect(() => {
    try {
      localStorage.setItem("dark", dark);
    } catch (e) {
      /* ignore */
    }
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const createNote = async (type) => {
    const res = await api.post("/notes", {
      title: "Untitled Note",
      content: "",
      type,
    });
    setNotes((prev) => [res.data, ...prev]);
    setActiveNote(res.data);
  };
  // stable update handler to avoid re-creating the function each render (helps child effects)
  const handleUpdate = useCallback((updated) => {
    setNotes((prev) => prev.map((n) => (n._id === updated._id ? updated : n)));
    setActiveNote(updated);
  }, []);
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600 dark:text-gray-400 font-medium text-lg">Loading your notes...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Sidebar
        notes={notes}
        onSelect={setActiveNote}
        onCreate={createNote}
        activeNote={activeNote}
        dark={dark}
        setDark={setDark}
      />

      {activeNote ? (
        <div className="flex-1 ml-80 overflow-auto animate-fade-in">
          <BigNoteEditor
            note={activeNote}
            onUpdate={handleUpdate}
          />
        </div>
      ) : (
        <div className="flex-1 ml-80 flex items-center justify-center overflow-auto bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
          <div className="text-center animate-fade-in">
            <div className="text-8xl mb-6 animate-bounce-subtle">📝</div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-3">
              Select a note to get started
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              or create a new one from the sidebar
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;