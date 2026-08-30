import { Pool } from "pg";
import jwt from "jsonwebtoken";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method tidak diizinkan",
    });
  }

  try {
    const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET);

    // =========================
    // DAFTAR DIVISI
    // =========================

    if (req.body.refer === "divisions") {
      const result = await pool.query(`
        SELECT DISTINCT id_divisi
        FROM mandor
        ORDER BY id_divisi
      `);

      return res.json(result.rows);
    }

    // =========================
    // DASHBOARD SUMMARY
    // =========================

    if (req.body.refer === "dashboard_summary") {
      try {
        const { mode, bulan, tanggal, divisi } = req.body;

        let where = [];
        let params = [];
        let i = 1;

        if (divisi) {
          where.push(`m.id_divisi = $${i++}`);
          params.push(divisi);
        }

        if (mode === "month" && bulan) {
          where.push(`TO_CHAR(a.tanggal,'YYYY-MM') = $${i++}`);
          params.push(bulan);
        }

        if (mode === "day" && tanggal) {
          where.push(`DATE(a.tanggal) = $${i++}`);
          params.push(tanggal);
        }

        const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";

        const result = await pool.query(
          `
      SELECT
        COUNT(DISTINCT m.id_mandor) AS total_mandor,
        COUNT(DISTINCT p.id_pemanen) AS total_pemanen,
        COALESCE(SUM(d.jumlah_buah),0) AS total_buah,
        COALESCE(SUM(d.jumlah_brondol),0) AS total_brondol
      FROM aktivitas a
      JOIN pemanen p
        ON a.id_pemanen = p.id_pemanen
      JOIN mandor m
        ON p.id_mandor = m.id_mandor
      LEFT JOIN detail_aktivitas d
        ON a.id_aktivitas = d.id_aktivitas
      ${whereSQL}
      `,
          params,
        );

        return res.status(200).json(result.rows[0]);
      } catch (err) {
        console.error(err);
        return res.status(500).json({
          total_mandor: 0,
          total_pemanen: 0,
          total_buah: 0,
          total_brondol: 0,
          error: err.message,
        });
      }
    }

    if (req.body.refer === "workers") {
      const result = await pool.query(`
    SELECT id_pemanen,nama
    FROM pemanen
    ORDER BY nama
  `);

      return res.json(result.rows);
    }

    if (req.body.refer === "performance") {
      const { mode, bulan, tanggal, pemanen, divisi } = req.body;

      let where = [];
      let params = [];
      let i = 1;

      if (divisi) {
        where.push(`m.id_divisi=$${i++}`);
        params.push(divisi);
      }

      if (pemanen) {
        where.push(`p.id_pemanen=$${i++}`);
        params.push(pemanen);
      }

      if (mode === "month") {
        where.push(`TO_CHAR(a.tanggal,'YYYY-MM')=$${i++}`);
        params.push(bulan);
      }

      if (mode === "day") {
        where.push(`DATE(a.tanggal)=$${i++}`);
        params.push(tanggal);
      }

      const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";

      const result = await pool.query(
        `
    SELECT
      p.id_pemanen,
      p.nama,
      m.nama AS nama_mandor,
      d.nama_divisi,
      COALESCE(SUM(da.jumlah_buah),0) AS total_buah,
      COALESCE(SUM(da.jumlah_brondol),0) AS total_brondol,
      COUNT(DISTINCT a.tanggal) AS hari_kerja
    FROM aktivitas a
    JOIN pemanen p
      ON a.id_pemanen=p.id_pemanen
    JOIN mandor m
      ON p.id_mandor=m.id_mandor
    JOIN divisi d
      ON m.id_divisi=d.id_divisi
    LEFT JOIN detail_aktivitas da
      ON a.id_aktivitas=da.id_aktivitas
    ${whereSQL}
    GROUP BY
      p.id_pemanen,
      p.nama,
      m.nama,
      d.nama_divisi
    ORDER BY total_buah DESC,total_brondol DESC
    `,
        params,
      );

      return res.json(result.rows);
    }

    return res.status(400).json({
      success: false,
      message: "Refer tidak dikenali",
    });
  } catch (error) {
    console.error(error);

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Token tidak valid",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
}
