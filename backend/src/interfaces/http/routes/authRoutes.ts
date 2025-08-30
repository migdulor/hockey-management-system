import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sql } from '@vercel/postgres';

const router = express.Router();

// Test endpoint para verificar que el router funciona
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Auth router funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/auth/login
 * Iniciar sesión
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    // Buscar usuario por email
    const result = await sql`
      SELECT * FROM users 
      WHERE email = ${email.toLowerCase().trim()} 
      AND is_active = true
    `;

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const user = result.rows[0];

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        plan: user.plan
      },
      process.env.JWT_SECRET || 'hockey-secret-key',
      { expiresIn: '24h' }
    );

    // Actualizar último login
    await sql`
      UPDATE users 
      SET last_login_at = CURRENT_TIMESTAMP 
      WHERE id = ${user.id}
    `;

    // Respuesta exitosa
    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          plan: user.plan,
          first_name: user.first_name,
          last_name: user.last_name,
          is_active: user.is_active
        },
        tokens: {
          accessToken: token,
          refreshToken: token
        }
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

export default router;
