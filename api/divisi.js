import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
});
export default async function handler(req, res) {
  if (req.method == "POST") {
    const result = await pool.query(
      "INSERT INTO divisi(id_divisi, nama_divisi) VALUES ($1, $2)",
      [req.body.id, req.body.divisi],
    );
    return res.json({
      success: true,
      msg: "Data Berhasil Ditambahkan",
    });
  }

  if (req.method == "GET") {
    const result = await pool.query("SELECT * FROM divisi");
    return res.json(result.rows);
  }

  if (req.method == "DELETE") {
    const result = await pool.query("DELETE FROM divisi WHERE id_divisi = $1", [
      req.body.id,
    ]);
    return res.json({
      success: true,
    });
  }

  if (req.method === "PUT") {
    await pool.query(
      `
  INSERT INTO divisi (id_divisi, nama_divisi)
  VALUES ($1, $2)
  ON CONFLICT (id_divisi)
  DO UPDATE SET
    nama_divisi = EXCLUDED.nama_divisi;
  `,
      [req.body.id, req.body.divisi],
    );
    return res.json({
      success: true,
      msg: "Data berhasil diupdate",
    });
  }
}
