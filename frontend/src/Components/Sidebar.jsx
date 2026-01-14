import { useState, useMemo } from "react";
import Search from "./Search";

const Sidebar = ({ notes, onSelect, onCreate, activeNote, dark, setDark }) => {
  const [query, setQuery] = useState("");

  const filteredNotes = useMemo(() => {
    const q = (query || "").toLowerCase().trim();
    if (!q) return notes || [];
    return (notes || []).filter((n) => {
      const title = (n.title || "").toLowerCase();
      const content = (n.content || "").replace(/<[^>]+>/g, "").toLowerCase();
      const tags = (n.tags || []).join(" ").toLowerCase();
      return title.includes(q) || content.includes(q) || tags.includes(q);
    });
  }, [notes, query]);

  return (
    <aside className="fixed left-0 top-0 w-80 h-screen p-6 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden z-20 shadow-xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
          📝 Notes
        </h1>
        <button 
          onClick={() => setDark(!dark)} 
          className="p-2.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
          title="Toggle dark mode"
        >
          <span className="text-2xl">{dark ? "☀️" : "🌙"}</span>
        </button>
      </div>

      <Search onSearch={setQuery} />

      <div className="flex gap-3 mb-6">
        <button 
          onClick={() => onCreate("BIG")} 
          className="btn-primary flex-1 text-sm shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-95"
        >
          <span className="mr-1">✨</span> Big Note
        </button>
        <button 
          onClick={() => onCreate("NORMAL")} 
          className="btn-secondary text-sm shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-95"
        >
          + Normal
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
        <ul className="space-y-3">
          {filteredNotes.length === 0 ? (
            <li className="text-sm text-gray-500 dark:text-gray-400">No notes found.</li>
          ) : (
            filteredNotes.map((n) => (
              <li
                key={n._id}
                onClick={() => onSelect(n)}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border-l-4 transform hover:scale-[1.02] active:scale-[0.98] ${
                  activeNote && activeNote._id === n._id
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-500 shadow-lg scale-[1.02]"
                    : "hover:bg-white dark:hover:bg-gray-800 border-transparent hover:shadow-md bg-gray-50/50 dark:bg-gray-800/50"
                }`}
              >
                <div className="font-semibold text-gray-900 dark:text-white truncate mb-1.5">
                  {n.title || "Untitled"}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 truncate leading-relaxed">
                  {n.content ? n.content.replace(/<[^>]+>/g, "").slice(0, 80) : "No content yet..."}
                </div>
                {n.updatedAt && (
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-2 flex items-center gap-1">
                    <span>🕒</span>
                    {new Date(n.updatedAt).toLocaleDateString()}
                  </div>
                )}
              </li>
            ))
          )}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;