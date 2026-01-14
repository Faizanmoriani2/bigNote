import { useEffect, useState } from "react";

const Search = ({ onSearch, placeholder = "Search notes...", debounce = 300 }) => {
  const [value, setValue] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      onSearch && onSearch(value.trim());
    }, debounce);
    return () => clearTimeout(t);
  }, [value, debounce, onSearch]);

  return (
    <div className="mb-4">
      <div className="relative">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full border-2 border-gray-300 dark:border-gray-600 p-2.5 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
        />
        {value && (
          <button
            onClick={() => setValue("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-300"
            title="Clear"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default Search;
