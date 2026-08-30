import { Pool } from "pg";
import jwt from "jsonwebtoken";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      // =========================
      // AUTH TOKEN
      // =========================

      const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET);

      // =========================
      // NAMA PEMANEN
      // =========================

      if (req.body.refer === "name") {
        const result = await pool.query(
          "SELECT nama FROM pemanen WHERE id_pemanen=$1",
          [decoded.id],
        );

        return res.json({
          name: result.rows[0].nama,
        });
      }

      // =========================
      // PENUGASAN HARI INI
      // =========================

      if (req.body.refer === "assignment") {
        const result = await pool.query(
          `
        SELECT
          d.id_detail,
          a.id_aktivitas,
          a.tanggal,
          a.status,
          ac.kode_ancak,
          d.jumlah_buah,
          d.jumlah_brondol

        FROM aktivitas a

        JOIN detail_aktivitas d
        ON a.id_aktivitas=d.id_aktivitas

        JOIN ancak ac
        ON ac.id_ancak=d.id_ancak

        WHERE
          a.id_pemanen=$1
          AND a.tanggal=CURRENT_DATE

        ORDER BY ac.kode_ancak
        `,
          [decoded.id],
        );

        return res.json({
          success: true,
          data: result.rows,
        });
      }

      // =========================
      // SIMPAN HASIL PANEN
      // =========================

      if (req.body.refer === "save-result") {
        const {
          id_detail,
          jumlah_buah,
          jumlah_brondol,
          photos = [],
        } = req.body;

        if (!id_detail) {
          return res.status(400).json({
            success: false,
            message: "ID detail tidak ditemukan",
          });
        }

        const client = await pool.connect();

        try {
          await client.query("BEGIN");

          const check = await client.query(
            `
          SELECT
            d.id_detail,
            d.id_aktivitas

          FROM detail_aktivitas d

          JOIN aktivitas a
          ON a.id_aktivitas=d.id_aktivitas

          WHERE
            d.id_detail=$1
            AND a.id_pemanen=$2
          `,
            [id_detail, decoded.id],
          );

          if (check.rowCount === 0) {
            await client.query("ROLLBACK");

            return res.status(403).json({
              success: false,
              message: "Tidak memiliki akses",
            });
          }

          const id_aktivitas = check.rows[0].id_aktivitas;

          await client.query(
            `
          UPDATE detail_aktivitas
          SET
            jumlah_buah=$1,
            jumlah_brondol=$2
          WHERE id_detail=$3
          `,
            [jumlah_buah, jumlah_brondol, id_detail],
          );

          // Simpan semua foto

          if (photos.length > 0) {
            for (const url of photos) {
              await client.query(
                `
              INSERT INTO foto_detail_aktivitas
              (id_detail,url_foto)
              VALUES($1,$2)
              `,
                [id_detail, url],
              );
            }
          }

          // Hitung progres seluruh ancak

          const progress = await client.query(
            `
          SELECT
            COUNT(*) total,
            COUNT(*) FILTER(
              WHERE jumlah_buah>0
                 OR jumlah_brondol>0
            ) selesai

          FROM detail_aktivitas

          WHERE id_aktivitas=$1
          `,
            [id_aktivitas],
          );

          const total = Number(progress.rows[0].total);
          const selesai = Number(progress.rows[0].selesai);

          let status = "Belum";

          if (selesai > 0 && selesai < total) status = "Berlangsung";
          if (selesai === total) status = "Selesai";

          await client.query(
            `
          UPDATE aktivitas
          SET status=$1
          WHERE id_aktivitas=$2
          `,
            [status, id_aktivitas],
          );

          await client.query("COMMIT");

          return res.json({
            success: true,
            message: "Hasil panen berhasil disimpan",
          });
        } catch (err) {
          await client.query("ROLLBACK");

          console.error(err);

          return res.status(500).json({
            success: false,
            message: "Gagal menyimpan hasil panen",
          });
        } finally {
          client.release();
        }
      }

      // =========================
      // RIWAYAT PANEN
      // =========================

      if (req.body.refer === "assignment-history") {
        const result = await pool.query(
          `
        SELECT
          a.tanggal,

          COUNT(DISTINCT a.id_aktivitas)
          jumlah_penugasan,

          COUNT(d.id_detail)
          jumlah_ancak,

          COALESCE(SUM(d.jumlah_buah),0)
          total_buah,

          COALESCE(SUM(d.jumlah_brondol),0)
          total_brondol

        FROM aktivitas a

        LEFT JOIN detail_aktivitas d
        ON a.id_aktivitas=d.id_aktivitas

        WHERE a.id_pemanen=$1

        GROUP BY a.tanggal

        ORDER BY a.tanggal DESC
        `,
          [decoded.id],
        );

        return res.json({
          success: true,
          data: result.rows,
        });
      }

      // =========================
      // DETAIL RIWAYAT + FOTO
      // =========================
      if (req.body.refer === "assignment-detail") {
        try {
          const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET);
          const { tanggal } = req.body;

          const result = await pool.query(
            `
      SELECT
          d.id_detail,
          a.id_aktivitas,
          a.tanggal,
          ac.kode_ancak,
          d.jumlah_buah,
          d.jumlah_brondol,
          d.catatan,

          COALESCE(
            json_agg(
              json_build_object(
                'id', f.id_foto,
                'url', f.url_foto
              )
            ) FILTER (WHERE f.id_foto IS NOT NULL),
            '[]'
          ) AS foto

      FROM aktivitas a

      JOIN detail_aktivitas d
        ON d.id_aktivitas = a.id_aktivitas

      JOIN ancak ac
        ON ac.id_ancak = d.id_ancak

      LEFT JOIN foto_detail_aktivitas f
        ON f.id_detail = d.id_detail

      WHERE
        a.id_pemanen = $1
        AND a.tanggal = $2

      GROUP BY
        d.id_detail,
        a.id_aktivitas,
        a.tanggal,
        ac.kode_ancak,
        d.jumlah_buah,
        d.jumlah_brondol,
        d.catatan

      ORDER BY ac.kode_ancak
      `,
            [decoded.id, tanggal],
          );

          return res.json({
            success: true,
            data: result.rows,
          });
        } catch (error) {
          console.error(error);

          return res.status(500).json({
            success: false,
            message: "Gagal mengambil detail",
          });
        }
      }

      // =========================
      // DASHBOARD ANALYTICS
      // =========================

      if (req.body.refer === "analytics") {
        const bulan = req.body.bulan + "-01";

        const result = await pool.query(
          `
        SELECT

          COALESCE(SUM(d.jumlah_buah),0)
          total_buah,

          COALESCE(SUM(d.jumlah_brondol),0)
          total_brondol,

          COUNT(DISTINCT a.tanggal)
          hari_kerja

        FROM aktivitas a

        JOIN detail_aktivitas d
        ON a.id_aktivitas=d.id_aktivitas

        WHERE
          a.id_pemanen=$1
          AND DATE_TRUNC('month',a.tanggal)=DATE_TRUNC('month',$2::date)
          AND a.status='Selesai'
        `,
          [decoded.id, bulan],
        );

        return res.json(result.rows[0]);
      }

      return res.status(400).json({
        success: false,
        message: "Refer tidak dikenali",
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan server",
      });
    }
  }

  if (req.method === "PUT") {
    try {
      const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET);

      const { id_detail, jumlah_buah, jumlah_brondol } = req.body;

      const check = await pool.query(
        `
      SELECT d.id_detail
      FROM detail_aktivitas d
      JOIN aktivitas a
        ON a.id_aktivitas = d.id_aktivitas
      WHERE d.id_detail = $1
        AND a.id_pemanen = $2
      `,
        [id_detail, decoded.id],
      );

      if (check.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: "Akses ditolak",
        });
      }

      await pool.query(
        `
      UPDATE detail_aktivitas
      SET
        jumlah_buah = $1,
        jumlah_brondol = $2
      WHERE id_detail = $3
      `,
        [jumlah_buah, jumlah_brondol, id_detail],
      );

      return res.json({
        success: true,
        message: "Data berhasil diperbarui",
      });
    } catch (err) {
      console.error(err);

      return res.status(500).json({
        success: false,
        message: "Gagal memperbarui data",
      });
    }
  }
}
