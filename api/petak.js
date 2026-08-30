import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
});

export default async function handler(req, res) {
  if (req.method == "POST" && req.body.type == "send") {
    const result = await pool.query(
      "INSERT INTO petak(id_petak, kode_petak, id_divisi) VALUES ($2, $3, $1)",
      [req.body.id, req.body.kodePetak, req.body.petak],
    );
    return res.json({
      success: true,
      msg: "Data Berhasil Ditambahkan",
    });
  }

  if (req.method == "POST" && req.body.type == "list") {
    const result = await pool.query(
      "SELECT * FROM petak WHERE id_divisi = $1",
      [req.body.divisi],
    );
    return res.json(result.rows);
  }

  if (req.method == "DELETE") {
    const result = await pool.query("DELETE FROM petak WHERE id_petak = $1", [
      req.body.id,
    ]);
    return res.json({
      success: true,
    });
  }

  if (req.method === "PUT") {
    await pool.query(
      `
UPDATE petak
SET
    kode_petak = $1::varchar(20),
    id_petak = id_divisi || '-' || $1::text
WHERE id_petak = $2::text;
    `,
      [req.body.petak, req.body.id],
    );
    return res.json({
      success: true,
      msg: "Data berhasil diupdate",
    });
  }
}
