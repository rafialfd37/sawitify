import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    if (req.body.type === "list") {
      const result = await pool.query(
        "SELECT * FROM ancak WHERE id_petak = $1",
        [req.body.petak],
      );
      return res.json(result.rows);
    }

    await pool.query(
      "INSERT INTO ancak(id_ancak, id_petak, kode_ancak) VALUES ($1, $2, $3)",
      [req.body.idAncak, req.body.idPetak, req.body.kodePetak],
    );

    return res.json({
      success: true,
      msg: "Data Berhasil Ditambahkan",
    });
  }

  if (req.method === "PUT") {
    await pool.query(
      `UPDATE ancak
     SET
       kode_ancak = $1,
       id_ancak = id_petak || '-' || $2
     WHERE id_ancak = $3`,
      [req.body.ancak, req.body.ancak, req.body.id],
    );

    return res.json({
      success: true,
      msg: "Data berhasil diupdate",
    });
  }
  if (req.method == "DELETE") {
    const result = await pool.query("DELETE FROM ancak WHERE id_ancak = $1", [
      req.body.id,
    ]);
    return res.json({
      success: true,
    });
  }
}
