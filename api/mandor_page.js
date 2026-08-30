import { Pool } from "pg";
import jwt from "jsonwebtoken";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    if (req.body.refer === "name") {
      const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET);

      const result = await pool.query(
        "SELECT nama FROM mandor WHERE id_mandor = $1",
        [decoded.id],
      );
      return res.json({
        name: result.rows[0].nama,
      });
    }

    if (req.body.refer === "pemanen") {
      const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET);

      const result = await pool.query(
        "SELECT * FROM pemanen WHERE id_mandor = $1",
        [decoded.id],
      );
      return res.json(result.rows);
    }

    if (req.body.refer === "ancak") {
      const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET);

      const result = await pool.query(
        `SELECT 
    a.kode_ancak
FROM mandor m
JOIN petak p
    ON m.id_divisi = p.id_divisi
JOIN ancak a
    ON p.id_petak = a.id_petak
WHERE m.id_mandor = $1
ORDER BY a.kode_ancak;`,
        [decoded.id],
      );
      return res.json(result.rows);
    }

    if (req.body.refer === "assignment") {
      const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET);

      const { tanggal, pemanen } = req.body.data;

      if (!tanggal || !Array.isArray(pemanen)) {
        return res.status(400).json({
          success: false,
          message: "Data penugasan tidak valid",
        });
      }

      try {
        await pool.query("BEGIN");

        for (const worker of pemanen) {
          const { id_pemanen, ancak } = worker;

          if (!id_pemanen || !Array.isArray(ancak) || ancak.length === 0) {
            continue;
          }

          // 1. Buat aktivitas untuk pemanen
          const aktivitas = await pool.query(
            `
        INSERT INTO aktivitas (
          id_pemanen,
          id_mandor,
          tanggal,
          jenis_aktivitas
        )
        VALUES ($1, $2, $3, $4)
        RETURNING id_aktivitas
        `,
            [id_pemanen, decoded.id, tanggal, "Panen"],
          );

          const id_aktivitas = aktivitas.rows[0].id_aktivitas;

          // 2. Masukkan semua ancak ke detail aktivitas
          for (const kode_ancak of ancak) {
            const ancakResult = await pool.query(
              `
          SELECT a.id_ancak
          FROM mandor m
          JOIN petak p
            ON m.id_divisi = p.id_divisi
          JOIN ancak a
            ON p.id_petak = a.id_petak
          WHERE m.id_mandor = $1
            AND a.kode_ancak = $2
          `,
              [decoded.id, kode_ancak],
            );

            if (ancakResult.rows.length === 0) {
              throw new Error(
                `Ancak ${kode_ancak} tidak boleh digunakan oleh mandor ini`,
              );
            }

            const id_ancak = ancakResult.rows[0].id_ancak;

            await pool.query(
              `
          INSERT INTO detail_aktivitas (
            id_aktivitas,
            id_ancak
          )
          VALUES ($1, $2)
          `,
              [id_aktivitas, id_ancak],
            );
          }
        }

        await pool.query("COMMIT");

        return res.json({
          success: true,
          message: "Penugasan berhasil disimpan",
        });
      } catch (error) {
        await pool.query("ROLLBACK");

        console.error(error);

        return res.status(500).json({
          success: false,
          message: error.message || "Gagal menyimpan penugasan",
        });
      }
    }

    if (req.body.refer === "assignment-list") {
      const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET);

      const result = await pool.query(
        `
    SELECT
      a.tanggal,
      COUNT(DISTINCT a.id_pemanen) AS jumlah_pemanen,
      COALESCE(SUM(d.jumlah_buah), 0) AS total_buah,
      COALESCE(SUM(d.jumlah_brondol), 0) AS total_brondol
    FROM aktivitas a
    LEFT JOIN detail_aktivitas d
      ON a.id_aktivitas = d.id_aktivitas
    WHERE a.id_mandor = $1
    GROUP BY a.tanggal
    ORDER BY a.tanggal DESC
    `,
        [decoded.id],
      );

      return res.json(result.rows);
    }

    if (req.body.refer === "assignment-detail") {
      const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET);

      const { tanggal } = req.body;

      const result = await pool.query(
        `
    SELECT
      a.id_aktivitas,
      a.id_pemanen,
      p.nama AS nama_pemanen,
      a.status,

      COALESCE(SUM(d.jumlah_buah),0) AS jumlah_buah,
      COALESCE(SUM(d.jumlah_brondol),0) AS jumlah_brondol,

      COALESCE(
        json_agg(
          json_build_object(
            'id_detail', d.id_detail,
            'id_ancak', d.id_ancak,
            'kode_ancak', ac.kode_ancak,
            'jumlah_buah', d.jumlah_buah,
            'jumlah_brondol', d.jumlah_brondol,
            'catatan', d.catatan,

            'foto',
            COALESCE((
              SELECT json_agg(
                json_build_object(
                  'id', f.id_foto,
                  'url', f.url_foto
                )
              )
              FROM foto_detail_aktivitas f
              WHERE f.id_detail = d.id_detail
            ), '[]'::json)

          )
          ORDER BY ac.kode_ancak
        ) FILTER (WHERE d.id_detail IS NOT NULL),
        '[]'::json
      ) AS ancak

    FROM aktivitas a

    JOIN pemanen p
      ON a.id_pemanen = p.id_pemanen

    LEFT JOIN detail_aktivitas d
      ON a.id_aktivitas = d.id_aktivitas

    LEFT JOIN ancak ac
      ON d.id_ancak = ac.id_ancak

    WHERE
      a.id_mandor = $1
      AND a.tanggal = $2

    GROUP BY
      a.id_aktivitas,
      a.id_pemanen,
      p.nama,
      a.status

    ORDER BY
      a.id_aktivitas;
    `,
        [decoded.id, tanggal],
      );

      return res.json(result.rows);
    }
    if (req.body.refer === "performance") {
      const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET);

      const bulan = `${req.body.bulan}-01`;
      const idPemanen = req.body.id_pemanen || null;

      try {
        const params = [decoded.id, bulan];
        let filter = "";

        if (idPemanen) {
          filter = "AND p.id_pemanen = $3";
          params.push(idPemanen);
        }

        // Ringkasan
        const summaryResult = await pool.query(
          `
      SELECT
        COALESCE(SUM(d.jumlah_buah),0) AS total_buah,
        COALESCE(SUM(d.jumlah_brondol),0) AS total_brondol,
        COUNT(DISTINCT a.tanggal) AS total_hari
      FROM aktivitas a
      JOIN pemanen p
        ON p.id_pemanen = a.id_pemanen
      JOIN detail_aktivitas d
        ON d.id_aktivitas = a.id_aktivitas
      WHERE a.id_mandor = $1
        AND DATE_TRUNC('month', a.tanggal) = DATE_TRUNC('month', $2::date)
        AND a.status = 'Selesai'
        ${filter}
      `,
          params,
        );

        // Ranking pemanen
        const workerResult = await pool.query(
          `
      SELECT
        p.id_pemanen,
        p.nama,
        COALESCE(SUM(d.jumlah_buah),0) AS total_buah,
        COALESCE(SUM(d.jumlah_brondol),0) AS total_brondol,
        COUNT(DISTINCT a.tanggal) AS hari_kerja
      FROM aktivitas a
      JOIN pemanen p
        ON p.id_pemanen = a.id_pemanen
      JOIN detail_aktivitas d
        ON d.id_aktivitas = a.id_aktivitas
      WHERE a.id_mandor = $1
        AND DATE_TRUNC('month', a.tanggal) = DATE_TRUNC('month', $2::date)
        AND a.status = 'Selesai'
        ${filter}
      GROUP BY p.id_pemanen, p.nama
      ORDER BY total_buah DESC, total_brondol DESC
      `,
          params,
        );

        return res.json({
          success: true,
          summary: summaryResult.rows[0],
          workers: workerResult.rows,
        });
      } catch (error) {
        console.error(error);

        return res.status(500).json({
          success: false,
          message: "Gagal mengambil data performa",
        });
      }
    }

    if (req.body.refer === "assignment-by-id") {
      const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET);

      const result = await pool.query(
        `
    SELECT
      a.id_aktivitas,
      a.tanggal,
      a.id_pemanen,
      p.nama nama_pemanen,
      array_agg(ac.kode_ancak ORDER BY ac.kode_ancak) ancak
    FROM aktivitas a
    JOIN pemanen p
      ON p.id_pemanen=a.id_pemanen
    JOIN detail_aktivitas d
      ON d.id_aktivitas=a.id_aktivitas
    JOIN ancak ac
      ON ac.id_ancak=d.id_ancak
    WHERE a.id_aktivitas=$1
      AND a.id_mandor=$2
    GROUP BY
      a.id_aktivitas,
      p.nama
  `,
        [req.body.id_aktivitas, decoded.id],
      );

      return res.json({
        success: true,
        data: result.rows[0],
      });
      if (req.body.refer === "assignment-by-id") {
        const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET);

        const result = await pool.query(
          `
    SELECT
      a.id_aktivitas,
      a.tanggal,
      a.id_pemanen,
      p.nama nama_pemanen,
      array_agg(ac.kode_ancak ORDER BY ac.kode_ancak) ancak
    FROM aktivitas a
    JOIN pemanen p
      ON p.id_pemanen=a.id_pemanen
    JOIN detail_aktivitas d
      ON d.id_aktivitas=a.id_aktivitas
    JOIN ancak ac
      ON ac.id_ancak=d.id_ancak
    WHERE a.id_aktivitas=$1
      AND a.id_mandor=$2
    GROUP BY
      a.id_aktivitas,
      p.nama
  `,
          [req.body.id_aktivitas, decoded.id],
        );

        return res.json({
          success: true,
          data: result.rows[0],
        });
      }
    }

    if (req.body.refer === "monthly-report") {
      const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET);
      const { bulan } = req.body;
      const id_mandor = decoded.id;

      const summary = await pool.query(
        `
SELECT
COALESCE(SUM(d.jumlah_buah),0) total_buah,
COALESCE(SUM(d.jumlah_brondol),0) total_brondol,
COUNT(DISTINCT a.id_pemanen) total_pemanen,
COUNT(DISTINCT d.id_ancak) total_ancak,
MAX(md.nama) nama_mandor,
MAX(md.id_divisi) divisi
FROM aktivitas a
JOIN detail_aktivitas d
ON a.id_aktivitas=d.id_aktivitas
JOIN pemanen p
ON p.id_pemanen=a.id_pemanen
JOIN mandor md
ON md.id_mandor=p.id_mandor
WHERE p.id_mandor=$1
AND TO_CHAR(a.tanggal,'YYYY-MM')=$2
`,
        [id_mandor, bulan],
      );

      const topWorkers = await pool.query(
        `
SELECT
p.nama,
SUM(d.jumlah_buah) total_buah,
SUM(d.jumlah_brondol) total_brondol,
COUNT(DISTINCT a.tanggal) hari_kerja
FROM aktivitas a
JOIN detail_aktivitas d
ON a.id_aktivitas=d.id_aktivitas
JOIN pemanen p
ON p.id_pemanen=a.id_pemanen
WHERE p.id_mandor=$1
AND TO_CHAR(a.tanggal,'YYYY-MM')=$2
GROUP BY p.nama
ORDER BY total_buah DESC
LIMIT 5
`,
        [id_mandor, bulan],
      );

      const days = await pool.query(
        `
SELECT
TO_CHAR(a.tanggal,'DD Mon YYYY') tanggal,
COUNT(DISTINCT a.id_pemanen) jumlah_pemanen,
SUM(d.jumlah_buah) total_buah,
SUM(d.jumlah_brondol) total_brondol
FROM aktivitas a
JOIN detail_aktivitas d
ON a.id_aktivitas=d.id_aktivitas
JOIN pemanen p
ON p.id_pemanen=a.id_pemanen
WHERE p.id_mandor=$1
AND TO_CHAR(a.tanggal,'YYYY-MM')=$2
GROUP BY a.tanggal
ORDER BY a.tanggal
`,
        [id_mandor, bulan],
      );

      return res.json({
        summary: summary.rows[0],
        topWorkers: topWorkers.rows,
        days: days.rows,
      });
    }
  }

  if (req.method === "PUT") {
    const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET);

    const { id_aktivitas, ancak } = req.body;

    try {
      await pool.query("BEGIN");

      await pool.query("DELETE FROM detail_aktivitas WHERE id_aktivitas=$1", [
        id_aktivitas,
      ]);

      for (const kode of ancak) {
        const r = await pool.query(
          `
        SELECT a.id_ancak
        FROM ancak a
        WHERE a.kode_ancak=$1
      `,
          [kode],
        );

        await pool.query(
          `
        INSERT INTO detail_aktivitas(
          id_aktivitas,
          id_ancak
        )
        VALUES($1,$2)
      `,
          [id_aktivitas, r.rows[0].id_ancak],
        );
      }

      await pool.query("COMMIT");

      return res.json({
        success: true,
      });
    } catch (err) {
      await pool.query("ROLLBACK");

      console.error(err);

      return res.status(500).json({
        success: false,
        message: "Gagal update penugasan",
      });
    }
  }

  if (req.method === "DELETE") {
    const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET);

    const { id_aktivitas } = req.body;

    try {
      await pool.query("BEGIN");

      await pool.query("DELETE FROM detail_aktivitas WHERE id_aktivitas=$1", [
        id_aktivitas,
      ]);

      await pool.query(
        `
      DELETE FROM aktivitas
      WHERE id_aktivitas=$1
        AND id_mandor=$2
    `,
        [id_aktivitas, decoded.id],
      );

      await pool.query("COMMIT");

      return res.json({
        success: true,
      });
    } catch (err) {
      await pool.query("ROLLBACK");

      console.error(err);

      return res.status(500).json({
        success: false,
        message: "Gagal menghapus penugasan",
      });
    }
  }
}
