import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method == "POST") {
    await pool.query("BEGIN");

    await pool.query(
      `INSERT INTO akun
      (id_karyawan, username, password, role)
     VALUES ($1, $1, $2, $3)`,
      [req.body.id, req.body.birth, "pemanen"],
    );

    await pool.query(
      `INSERT INTO pemanen
      (id_pemanen, id_mandor, nama, tanggal_lahir, no_hp)
     VALUES ($1, $2, $3, $4, $5)`,
      [
        req.body.id,
        req.body.mandor,
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
    const result = await pool.query(`
    SELECT
      p.*,
      m.id_mandor, 
      m.nama AS nama_mandor,
      d.nama_divisi
    FROM pemanen p
    JOIN mandor m
      ON p.id_mandor = m.id_mandor
    JOIN divisi d
      ON m.id_divisi = d.id_divisi
  `);
    return res.json(result.rows);
  }

  if (req.method == "DELETE") {
    await pool.query("DELETE FROM pemanen WHERE id_pemanen = $1", [
      req.body.id,
    ]);

    await pool.query("DELETE FROM akun WHERE id_karyawan = $1", [req.body.id]);
    return res.json({
      success: true,
    });
  }

  if (req.method === "PUT") {
    await pool.query(
      `
    INSERT INTO pemanen (
      id_pemanen,
      id_mandor,
      nama,
      tanggal_lahir,
      no_hp
    )
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (id_pemanen)
    DO UPDATE SET
      id_mandor = EXCLUDED.id_mandor,
      nama = EXCLUDED.nama,
      tanggal_lahir = EXCLUDED.tanggal_lahir,
      no_hp = EXCLUDED.no_hp;
    `,
      [
        req.body.id,
        req.body.mandor,
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
