import { Pool } from "pg";
import jwt from "jsonwebtoken";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    if (req.body.refer === "LOGIN") {
      const result = await pool.query(
        "SELECT * FROM akun WHERE username = $1 AND password = $2",
        [req.body.username, req.body.password],
      );

      if (result.rows.length === 0) {
        return res.json({
          success: false,
          msg: "User tidak ditemukan atau password salah!",
        });
      }
      const user = result.rows[0];

      const token = jwt.sign(
        {
          id: user.id_karyawan,
          role: user.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d",
        },
      );

      const roleLogin = await pool.query(
        "SELECT role from akun WHERE id_karyawan = $1",
        [req.body.username],
      );
      return res.json({
        success: true,
        msg: "Login Berhasil",
        role: roleLogin.rows[0].role,
        token,
      });
    } else if (req.body.refer === "AUTH") {
      const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET);

      return res.status(200).json({
        success: true,
        role: decoded.role,
      });
    }
  }
}
