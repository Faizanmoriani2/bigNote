import { useEffect, useState } from "react";

const Sidebar = ({ notes, onSelect, onCreate, activeNote, dark, setDark }) => {
  return (
    <aside className="w-72 p-5 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📝 Notes</h1>
        <button 
          onClick={() => setDark(!dark)} 
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Toggle dark mode"
        >
          {dark ? "☀️" : "🌙"}
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => onCreate("BIG")} className="btn-primary flex-1 text-sm">
          + Big Note
        </button>
        <button onClick={() => onCreate("NORMAL")} className="btn-secondary text-sm">
          + Normal
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {notes.map((n) => (
            <li
              key={n._id}
              onClick={() => onSelect(n)}
              className={`p-3 rounded-lg cursor-pointer transition-all duration-150 border-l-4 ${
                activeNote && activeNote._id === n._id
                  ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 shadow-sm"
                  : "hover:bg-gray-50 dark:hover:bg-gray-700 border-transparent"
              }`}
            >
              <div className="font-semibold text-gray-900 dark:text-white truncate">{n.title || "Untitled"}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                {n.content ? n.content.replace(/<[^>]+>/g, "").slice(0, 60) : "—"}
              </div>
              {n.updatedAt && (
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {new Date(n.updatedAt).toLocaleDateString()}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
