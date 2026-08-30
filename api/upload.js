import formidable from "formidable";
import fs from "fs/promises";
import { put } from "@vercel/blob";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: err.message,
      });
    }

    try {
      const file = Array.isArray(files.file) ? files.file[0] : files.file;

      const buffer = await fs.readFile(file.filepath);
      const filename = `${Date.now()}-${file.originalFilename}`;

      const blob = await put(filename, buffer, {
        access: "public",
      });

      return res.json({
        success: true,
        url: blob.url,
      });
    } catch (e) {
      console.error(e);

      return res.status(500).json({
        success: false,
        error: e.message,
      });
    }
  });
}
