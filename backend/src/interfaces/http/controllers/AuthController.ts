import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sql } from '@vercel/postgres';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email y contraseña son requeridos'
        });
      }

      // Buscar usuario en la base de datos
      const result = await sql`
        SELECT id, email, first_name, last_name, role, plan, password_hash, is_active 
        FROM users 
        WHERE email = ${email} AND is_active = true
      `;

      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          error: 'Credenciales inválidas'
        });
      }

      const user = result.rows[0];

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Credenciales inválidas'
        });
      }

      // Actualizar último login
      await sql`
        UPDATE users 
        SET last_login = NOW(), updated_at = NOW()
        WHERE id = ${user.id}
      `;

      // Generar JWT token
      const token = jwt.sign(
        { 
          userId: user.id,
          email: user.email,
          role: user.role,
          plan: user.plan
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          plan: user.plan
        }
      });

    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async logout(req: Request, res: Response) {
    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
  }
}
