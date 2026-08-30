import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
});

export default async function handler(req, res) {
  if (req.method == "POST") {
    await pool.query("BEGIN");

    await pool.query(
      `INSERT INTO akun
      (id_karyawan, username, password, role)
     VALUES ($1, $1, $2, $3)`,
      [req.body.id, req.body.birth, "mandor"],
    );

    await pool.query(
      `INSERT INTO mandor
      (id_mandor, id_divisi, nama, tanggal_lahir, no_hp)
     VALUES ($1, $2, $3, $4, $5)`,
      [
        req.body.id,
        req.body.divisi,
        req.body.nama,
        req.body.birth,
        req.body.phone,
      ],
    );

    await pool.query("COMMIT");

    return res.json({
      success: true,
      msg: "Data Berhasil Ditambahkan",
    });
  }

  if (req.method == "GET") {
    const result = await pool.query("SELECT * FROM mandor");
    return res.json(result.rows);
  }

  if (req.method == "DELETE") {
    await pool.query("DELETE FROM mandor WHERE id_mandor = $1", [req.body.id]);

    await pool.query("DELETE FROM akun WHERE id_karyawan = $1", [req.body.id]);
    return res.json({
      success: true,
    });
  }

  if (req.method === "PUT") {
    await pool.query(
      `
  INSERT INTO mandor (
    id_mandor,
    id_divisi,
    nama,
    tanggal_lahir,
    no_hp
  )
  VALUES ($1, $2, $3, $4, $5)
  ON CONFLICT (id_mandor)
  DO UPDATE SET
    id_divisi = EXCLUDED.id_divisi,
    nama = EXCLUDED.nama,
    tanggal_lahir = EXCLUDED.tanggal_lahir,
    no_hp = EXCLUDED.no_hp;
  `,
      [
        req.body.id,
        req.body.divisi,
        req.body.nama,
        req.body.tanggal_lahir,
        req.body.no_hp,
      ],
    );

    await pool.query(
      `
  UPDATE akun
  SET password = $1
  WHERE id_karyawan = $2;
  `,
      [req.body.tanggal_lahir, req.body.id],
    );
    return res.json({
      success: true,
      msg: "Data berhasil diupdate",
    });
  }
}
