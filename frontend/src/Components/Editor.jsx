import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const Editor = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  return (
    <div className="prose dark:prose-invert max-w-none min-h-[300px] focus-within:ring-2 focus-within:ring-blue-500/20 rounded-lg transition-all duration-200">
      <EditorContent editor={editor} className="outline-none" />
    </div>
  );
};

export default Editor;