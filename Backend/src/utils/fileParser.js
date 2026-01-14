import fs from "fs";
import mammoth from "mammoth";

export const parseFile = async (file) => {
  const ext = file.originalname.split(".").pop();

  if (ext === "txt") {
    return fs.readFileSync(file.path, "utf-8");
  }

  if (ext === "docx") {
    const result = await mammoth.extractRawText({ path: file.path });
    return result.value;
  }

  return "";
};
