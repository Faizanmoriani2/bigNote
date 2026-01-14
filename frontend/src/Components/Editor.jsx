import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  const btnClass = (active) =>
    `px-3 py-1 rounded transition text-sm flex items-center gap-2 ${
      active ? "bg-blue-600 text-white" : "bg-transparent text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
    }`; 

  return (
    <div className="mb-3 p-2 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex gap-2 flex-wrap">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold (Ctrl/Cmd+B)"
        className={btnClass(editor.isActive("bold"))}
      >
        <strong>B</strong>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic (Ctrl/Cmd+I)"
        className={btnClass(editor.isActive("italic"))}
      >
        <em>I</em>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        title="Strike"
        className={btnClass(editor.isActive("strike"))}
      >
        <s>S</s>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        title="Inline code"
        className={btnClass(editor.isActive("code"))}
      >
        {'</>'}
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        title="Heading 1"
        className={btnClass(editor.isActive("heading", { level: 1 }))}
      >
        H1
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="Heading 2"
        className={btnClass(editor.isActive("heading", { level: 2 }))}
      >
        H2
      </button>

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Bulleted list"
        className={btnClass(editor.isActive("bulletList"))}
      >
        • List
      </button>

      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Numbered list"
        className={btnClass(editor.isActive("orderedList"))}
      >
        1. List
      </button>

      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        title="Blockquote"
        className={btnClass(editor.isActive("blockquote"))}
      >
        ❝ ❞
      </button>

      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        title="Code block"
        className={btnClass(editor.isActive("codeBlock"))}
      >
        Code
      </button>

      <button
        onClick={() => editor.chain().focus().undo().run()}
        title="Undo"
        className="px-3 py-1 rounded transition text-sm bg-transparent text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        ↶
      </button>

      <button
        onClick={() => editor.chain().focus().redo().run()}
        title="Redo"
        className="px-3 py-1 rounded transition text-sm bg-transparent text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        ↷
      </button>

      <div className="ml-auto text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 px-2">Formatting</div>
    </div>
  );
};

const Editor = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => onChange && onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "outline-none min-h-[220px] p-4 prose dark:prose-invert",
      },
    },
  });

  // sync external content changes into editor (e.g., when switching notes)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if ((content || "") !== (current || "")) {
      editor.commands.setContent(content || "", false);
    }
  }, [content, editor]);

  return (
    <div className="max-w-none rounded-lg transition-all duration-200">
      <MenuBar editor={editor} />
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default Editor;