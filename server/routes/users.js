const express = require('express');
const router = express.Router();
const pool = require('../config/supa');
const bcrypt = require('bcrypt');

// UPDATE PROFIL & PASSWORD
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { full_name, password } = req.body;

    try {
        // 1. Update Nama Lengkap
        if (full_name) {
            await pool.query(
                "UPDATE users SET full_name = $1 WHERE user_id = $2",
                [full_name, id]
            );
        }

        // 2. Update Password (jika diisi)
        if (password && password.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await pool.query(
                "UPDATE users SET password_hash = $1 WHERE user_id = $2",
                [hashedPassword, id]
            );
        }

        res.json({ message: "Profil berhasil diperbarui" });
    } catch (err) {
        console.error("❌ UPDATE USER ERROR:", err.message);
        res.status(500).json({ error: "Gagal memperbarui profil" });
    }
});

module.exports = router;