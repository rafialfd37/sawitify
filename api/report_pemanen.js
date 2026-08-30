import PDFDocument from "pdfkit";
import { Pool } from "pg";
import jwt from "jsonwebtoken";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  try {
    const { token, bulan } = req.body;

    if (!token || !bulan) {
      return res.status(400).json({
        success: false,
        error: "Token dan bulan wajib diisi.",
      });
    }

    // Decode JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ambil data pemanen berdasarkan ID pada JWT
    const pemanenResult = await pool.query(
      `SELECT id_pemanen, nama
       FROM pemanen
       WHERE id_pemanen = $1`,
      [decoded.id],
    );

    if (pemanenResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Data pemanen tidak ditemukan.",
      });
    }

    const pemanen = pemanenResult.rows[0];

    // Ambil seluruh hasil panen bulan tersebut
    const detailResult = await pool.query(
      `SELECT
          a.tanggal,
          an.kode_ancak,
          d.jumlah_buah,
          d.jumlah_brondol
       FROM aktivitas a
       JOIN detail_aktivitas d
         ON a.id_aktivitas = d.id_aktivitas
       JOIN ancak an
         ON d.id_ancak = an.id_ancak
       WHERE a.id_pemanen = $1
         AND a.status = 'Selesai'
         AND TO_CHAR(a.tanggal,'YYYY-MM') = $2
       ORDER BY a.tanggal ASC`,
      [pemanen.id_pemanen, bulan],
    );

    // Rekap bulan
    const summaryResult = await pool.query(
      `SELECT
          COALESCE(SUM(d.jumlah_buah),0) total_buah,
          COALESCE(SUM(d.jumlah_brondol),0) total_brondol,
          COUNT(DISTINCT a.tanggal) hari_kerja
       FROM aktivitas a
       JOIN detail_aktivitas d
         ON a.id_aktivitas = d.id_aktivitas
       WHERE a.id_pemanen = $1
         AND a.status = 'Selesai'
         AND TO_CHAR(a.tanggal,'YYYY-MM') = $2`,
      [pemanen.id_pemanen, bulan],
    );

    const summary = summaryResult.rows[0];

    // Header PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Laporan_Panen_${bulan}.pdf`,
    );

    const doc = new PDFDocument({
      margin: 40,
      size: "A4",
    });

    doc.pipe(res);

    // Judul
    doc.fontSize(22).text("SAWITIFY", {
      align: "center",
    });

    doc.fontSize(15).text("Laporan Hasil Panen", {
      align: "center",
    });

    doc.moveDown(2);

    // Informasi
    doc.fontSize(11);
    doc.text(`Pemanen : ${pemanen.nama}`);
    doc.text(`ID Pemanen : ${pemanen.id_pemanen}`);
    doc.text(`Periode : ${bulan}`);

    doc.moveDown();

    // Rekap
    doc.fontSize(13).text("Rekapitulasi");

    doc.moveDown(0.5);

    doc.fontSize(11);
    doc.text(`Hari Kerja : ${summary.hari_kerja} hari`);
    doc.text(
      `Total Buah : ${Number(summary.total_buah).toLocaleString("id-ID")} tandan`,
    );
    doc.text(
      `Total Brondol : ${Number(summary.total_brondol).toLocaleString(
        "id-ID",
      )} ember`,
    );

    doc.moveDown(2);

    // Header tabel
    const startY = doc.y;

    doc.fontSize(11).font("Helvetica-Bold");

    doc.text("Tanggal", 40, startY);
    doc.text("Ancak", 140, startY);
    doc.text("Buah", 330, startY);
    doc.text("Brondol", 430, startY);

    doc.moveDown();

    doc.font("Helvetica");

    let y = doc.y;

    detailResult.rows.forEach((row) => {
      if (y > 760) {
        doc.addPage();
        y = 40;
      }

      const tanggal = new Date(row.tanggal).toISOString().split("T")[0];

      doc.text(tanggal, 40, y);
      doc.text(row.kode_ancak, 140, y);
      doc.text(`${row.jumlah_buah} tandan`, 330, y);
      doc.text(`${row.jumlah_brondol} ember`, 430, y);

      y += 22;
    });

    doc.moveDown(2);

    doc.font("Helvetica-Bold");
    doc.text("Total Bulan Ini", 40, y + 10);

    doc.font("Helvetica");
    doc.text(
      `Buah: ${Number(summary.total_buah).toLocaleString("id-ID")} tandan`,
      40,
      y + 35,
    );
    doc.text(
      `Brondol: ${Number(summary.total_brondol).toLocaleString("id-ID")} ember`,
      40,
      y + 55,
    );
    doc.text(`Hari Kerja: ${summary.hari_kerja} hari`, 40, y + 75);

    doc.end();
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}
