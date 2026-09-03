INSERT INTO akun (
    id_karyawan,
    username,
    password,
    role
)
VALUES (
    'admin',
    'admin',
    'admin',
    'admin'
)
ON CONFLICT (id_karyawan) DO NOTHING;
