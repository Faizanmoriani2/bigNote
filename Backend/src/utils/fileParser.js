import fs from "fs";
import mammoth from "mammoth";

export const parseFile = async (file) => {
  const ext = file.originalname.split(".").pop().toLowerCase();

  // TXT → wrap in paragraph
  if (ext === "txt") {
    const text = fs.readFileSync(file.path, "utf-8");
    return `<p>${text.replace(/\n/g, "<br/>")}</p>`;
  }

  // DOCX → preserve formatting
  if (ext === "docx") {
    const result = await mammoth.convertToHtml(
      { path: file.path },
      {
        styleMap: [
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
          "p[style-name='Heading 3'] => h3:fresh",
          "p[style-name='Title'] => h1.title:fresh",
        ],
      }
    );

    return result.value; // HTML
  }

  return "";
};
