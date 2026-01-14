import { useEffect, useState } from "react";
import Sidebar from "./Components/Sidebar";
import BigNoteEditor from "./pages/BigNoteEditor";
import api from "./services/api";

const App = () => {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [dark, setDark] = useState(false);
  const fetchNotes = async () => {
    const res = await api.get("/notes");
    setNotes(res.data);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // wire a simple dark-mode class on the <html>
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const createNote = async (type) => {
    const res = await api.post("/notes", {
      title: "Untitled Note",
      content: "",
      type,
    });
    setNotes([res.data, ...notes]);
    setActiveNote(res.data);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar
        notes={notes}
        onSelect={setActiveNote}
        onCreate={createNote}
        activeNote={activeNote}
        dark={dark}
        setDark={setDark}
      />

      {activeNote && (
        <BigNoteEditor
          note={activeNote}
          onUpdate={(updated) => {
            setNotes(
              notes.map((n) => (n._id === updated._id ? updated : n))
            );
            setActiveNote(updated);
          }}
        />
      )}
    </div>
  );
};

export default App;
