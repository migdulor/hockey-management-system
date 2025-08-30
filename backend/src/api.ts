import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sql } from '@vercel/postgres';

// Helper function para CORS
function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

// Helper function para parsear el cuerpo de la request
function parseBody(req: VercelRequest): Promise<any> {
  return new Promise((resolve) => {
    if (req.body) {
      resolve(req.body);
    } else {
      let body = '';
      req.on('data', (chunk: any) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch {
          resolve({});
        }
      });
    }
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, method } = req;
  // Extract pathname without query parameters
  const urlObj = new URL(url || '', 'http://localhost');
  const path = urlObj.pathname.replace('/api', '') || '';

  try {
    // Health check endpoint
    if (path === '/health' && method === 'GET') {
      return res.status(200).json({
        success: true,
        message: 'Hockey Management API funcionando',
        timestamp: new Date().toISOString()
      });
    }

    // Auth test endpoint
    if (path === '/auth/test' && method === 'GET') {
      return res.status(200).json({
        message: 'Auth router funcionando correctamente',
        timestamp: new Date().toISOString()
      });
    }

    // Debug endpoint - List users in database (temporary)
    if (path === '/debug/users' && method === 'GET') {
      try {
        // Check if database is configured
        if (!process.env.POSTGRES_URL && !process.env.hockeymanager_POSTGRES_URL) {
          return res.status(200).json({
            success: true,
            message: 'Base de datos no configurada - usando datos mock'
          });
        }

        const usersResult = await sql`
          SELECT id, email, first_name, last_name, role, plan, club_name, is_active, created_at, last_login
          FROM users 
          ORDER BY created_at DESC
        `;

        return res.status(200).json({
          success: true,
          message: 'Usuarios encontrados en la base de datos',
          total: usersResult.rows.length,
          users: usersResult.rows,
          config: {
            postgres_configured: !!process.env.POSTGRES_URL,
            jwt_secret_configured: !!process.env.JWT_SECRET
          }
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'Error al consultar la base de datos',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Login endpoint
    if (path === '/auth/login' && method === 'POST') {
      const body = await parseBody(req);
      const { email, password } = body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email y contraseña son requeridos'
        });
      }

      try {
        // Check if database is configured
        if (!process.env.POSTGRES_URL && !process.env.hockeymanager_POSTGRES_URL) {
          // Fallback to mock users for demo
          const mockUsers = [
            { id: 1, email: 'test@hockey.com', password: 'test123', role: 'coach' },
            { id: 2, email: 'admin@hockey.com', password: 'admin123', role: 'admin' }
          ];

          const user = mockUsers.find(u => u.email === email && u.password === password);

          if (!user) {
            return res.status(401).json({
              success: false,
              message: 'Credenciales inválidas'
            });
          }

          const token = jwt.sign(
            { 
              userId: user.id, 
              email: user.email, 
              role: user.role 
            },
            process.env.JWT_SECRET || 'test_secret_key_for_demo',
            { expiresIn: '24h' }
          );

          return res.status(200).json({
            success: true,
            message: 'Login exitoso (modo demo)',
            token,
            user: {
              id: user.id,
              email: user.email,
              role: user.role
            }
          });
        }

        // Real database implementation
        const userResult = await sql`
          SELECT id, email, password_hash, role, first_name, last_name, plan, club_name, is_active, created_at
          FROM users 
          WHERE email = ${email} AND is_active = true
        `;

        if (userResult.rows.length === 0) {
          return res.status(401).json({
            success: false,
            message: 'Credenciales inválidas o usuario inactivo'
          });
        }

        const user = userResult.rows[0];

        // Verify password with bcrypt
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
          return res.status(401).json({
            success: false,
            message: 'Credenciales inválidas'
          });
        }

        // Update last login
        await sql`
          UPDATE users 
          SET last_login = NOW(), updated_at = NOW() 
          WHERE id = ${user.id}
        `;

        // Generate JWT
        const token = jwt.sign(
          { 
            userId: user.id, 
            email: user.email, 
            role: user.role,
            firstName: user.first_name,
            lastName: user.last_name,
            plan: user.plan
          },
          process.env.JWT_SECRET!,
          { expiresIn: '24h' }
        );

        return res.status(200).json({
          success: true,
          message: 'Login exitoso',
          token,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.first_name,
            lastName: user.last_name,
            plan: user.plan,
            clubName: user.club_name,
            createdAt: user.created_at
          }
        });

      } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({
          success: false,
          message: 'Error interno del servidor'
        });
      }
    }

    // Register endpoint
    if (path === '/auth/register' && method === 'POST') {
      const body = await parseBody(req);
      const { email, password, firstName, lastName, role = 'coach' } = body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email y contraseña son requeridos'
        });
      }

      if (!firstName || !lastName) {
        return res.status(400).json({
          success: false,
          message: 'Nombre y apellido son requeridos'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'La contraseña debe tener al menos 6 caracteres'
        });
      }

      try {
        // Check if database is configured
        if (!process.env.POSTGRES_URL) {
          return res.status(200).json({
            success: true,
            message: 'Registro mock - Para usar registro real, configura Vercel Postgres',
            note: 'Esta es una respuesta de prueba. Para funcionalidad completa, configura las variables de entorno de base de datos en Vercel.'
          });
        }

        // Check if user already exists
        const existingUser = await sql`
          SELECT id FROM users WHERE email = ${email}
        `;

        if (existingUser.rows.length > 0) {
          return res.status(409).json({
            success: false,
            message: 'El usuario ya existe'
          });
        }

        // Hash password with bcrypt
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create user with UUID
        const newUser = await sql`
          INSERT INTO users (id, email, password_hash, first_name, last_name, role, plan, is_active, created_at, updated_at)
          VALUES (gen_random_uuid(), ${email}, ${passwordHash}, ${firstName}, ${lastName}, ${role}, '2_teams', true, NOW(), NOW())
          RETURNING id, email, first_name, last_name, role, plan, created_at
        `;

        const user = newUser.rows[0];

        // Generate JWT
        const token = jwt.sign(
          { 
            userId: user.id, 
            email: user.email, 
            role: user.role,
            firstName: user.first_name,
            lastName: user.last_name,
            plan: user.plan
          },
          process.env.JWT_SECRET!,
          { expiresIn: '24h' }
        );

        return res.status(201).json({
          success: true,
          message: 'Usuario creado exitosamente',
          token,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            plan: user.plan,
            createdAt: user.created_at
          }
        });

      } catch (error) {
        console.error('Error en registro:', error);
        return res.status(500).json({
          success: false,
          message: 'Error interno del servidor'
        });
      }
    }

    // Profile endpoint (requires authentication)
    if (path === '/auth/profile' && method === 'GET') {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Token de autorización requerido'
        });
      }

      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        
        // Check if database is configured
        if (!process.env.POSTGRES_URL) {
          return res.status(200).json({
            success: true,
            message: 'Perfil obtenido (modo demo)',
            user: {
              id: decoded.userId,
              email: decoded.email,
              role: decoded.role,
              firstName: decoded.firstName,
              lastName: decoded.lastName,
              createdAt: new Date().toISOString(),
              note: 'Datos desde JWT - Para datos reales de BD, configura Vercel Postgres'
            }
          });
        }

        // Get user from database
        const userResult = await sql`
          SELECT id, email, first_name, last_name, role, plan, club_name, is_active, created_at, last_login
          FROM users 
          WHERE id = ${decoded.userId} AND is_active = true
        `;

        if (userResult.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Usuario no encontrado'
          });
        }

        const user = userResult.rows[0];
        return res.status(200).json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            plan: user.plan,
            clubName: user.club_name,
            isActive: user.is_active,
            createdAt: user.created_at,
            lastLogin: user.last_login
          }
        });

      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido'
        });
      }
    }

    // Teams management endpoints
    if (path.startsWith('/teams')) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Token de autorización requerido'
        });
      }

      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

        // GET /api/teams - List teams for user
        if (path === '/teams' && method === 'GET') {
          if (!process.env.POSTGRES_URL) {
            return res.status(200).json({
              success: true,
              teams: [
                { id: 1, name: 'Demo Team', description: 'Equipo de demostración', category: 'Senior', division: 'Primera' }
              ],
              message: 'Datos demo - Configura Postgres para datos reales'
            });
          }

          let teamsQuery;
          if (decoded.role === 'admin') {
            // Admin can see all teams
            teamsQuery = await sql`
              SELECT t.*, u.first_name as coach_first_name, u.last_name as coach_last_name
              FROM teams t
              LEFT JOIN users u ON t.coach_id = u.id
              WHERE t.is_active = true
              ORDER BY t.created_at DESC
            `;
          } else {
            // Coaches can only see their teams
            teamsQuery = await sql`
              SELECT t.*, u.first_name as coach_first_name, u.last_name as coach_last_name
              FROM teams t
              LEFT JOIN users u ON t.coach_id = u.id
              WHERE t.coach_id = ${decoded.userId} AND t.is_active = true
              ORDER BY t.created_at DESC
            `;
          }

          return res.status(200).json({
            success: true,
            teams: teamsQuery.rows
          });
        }

        // POST /api/teams - Create new team
        if (path === '/teams' && method === 'POST') {
          const body = await parseBody(req);
          const { name, description, category, division } = body;

          if (!name) {
            return res.status(400).json({
              success: false,
              message: 'El nombre del equipo es requerido'
            });
          }

          if (!process.env.POSTGRES_URL) {
            return res.status(200).json({
              success: true,
              message: 'Equipo creado (demo)',
              team: { id: Date.now(), name, description, category, division }
            });
          }

          const newTeam = await sql`
            INSERT INTO teams (name, description, category, division, coach_id, created_at, updated_at)
            VALUES (${name}, ${description || ''}, ${category || 'Senior'}, ${division || ''}, ${decoded.userId}, NOW(), NOW())
            RETURNING *
          `;

          return res.status(201).json({
            success: true,
            message: 'Equipo creado exitosamente',
            team: newTeam.rows[0]
          });
        }

      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido'
        });
      }
    }

    // Players management endpoints
    if (path.startsWith('/players')) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Token de autorización requerido'
        });
      }

      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

        // GET /api/players?team_id=xxx - List players for team
        if (path.startsWith('/players') && method === 'GET') {
          const teamId = req.url?.split('team_id=')[1]?.split('&')[0];
          
          if (!teamId) {
            return res.status(400).json({
              success: false,
              message: 'team_id es requerido'
            });
          }

          if (!process.env.POSTGRES_URL) {
            return res.status(200).json({
              success: true,
              players: [
                { id: 1, firstName: 'Demo', lastName: 'Player', jerseyNumber: 10, position: 'forward' }
              ],
              message: 'Datos demo'
            });
          }

          const playersQuery = await sql`
            SELECT * FROM players 
            WHERE team_id = ${teamId} AND is_active = true
            ORDER BY jersey_number ASC
          `;

          return res.status(200).json({
            success: true,
            players: playersQuery.rows
          });
        }

        // POST /api/players - Create new player
        if (path === '/players' && method === 'POST') {
          const body = await parseBody(req);
          const { teamId, firstName, lastName, email, phone, jerseyNumber, position, dateOfBirth } = body;

          if (!teamId || !firstName || !lastName) {
            return res.status(400).json({
              success: false,
              message: 'Team ID, nombre y apellido son requeridos'
            });
          }

          if (!process.env.POSTGRES_URL) {
            return res.status(200).json({
              success: true,
              message: 'Jugador creado (demo)',
              player: { id: Date.now(), firstName, lastName, jerseyNumber }
            });
          }

          const newPlayer = await sql`
            INSERT INTO players (team_id, first_name, last_name, email, phone, jersey_number, position, date_of_birth, created_at, updated_at)
            VALUES (${teamId}, ${firstName}, ${lastName}, ${email || null}, ${phone || null}, ${jerseyNumber || null}, ${position || 'forward'}, ${dateOfBirth || null}, NOW(), NOW())
            RETURNING *
          `;

          return res.status(201).json({
            success: true,
            message: 'Jugador creado exitosamente',
            player: newPlayer.rows[0]
          });
        }

      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido'
        });
      }
    }

    // Trainings management endpoints
    if (path.startsWith('/trainings')) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Token de autorización requerido'
        });
      }

      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

        // GET /api/trainings?team_id=xxx - List trainings for team
        if (path.startsWith('/trainings') && method === 'GET') {
          const teamId = req.url?.split('team_id=')[1]?.split('&')[0];
          
          if (!teamId) {
            return res.status(400).json({
              success: false,
              message: 'team_id es requerido'
            });
          }

          if (!process.env.POSTGRES_URL) {
            return res.status(200).json({
              success: true,
              trainings: [
                { id: 1, name: 'Demo Training', trainingDate: '2025-08-30', startTime: '19:00' }
              ],
              message: 'Datos demo'
            });
          }

          const trainingsQuery = await sql`
            SELECT * FROM trainings 
            WHERE team_id = ${teamId}
            ORDER BY training_date DESC, start_time DESC
          `;

          return res.status(200).json({
            success: true,
            trainings: trainingsQuery.rows
          });
        }

        // POST /api/trainings - Create new training
        if (path === '/trainings' && method === 'POST') {
          const body = await parseBody(req);
          const { teamId, name, trainingDate, startTime, endTime, location, notes } = body;

          if (!teamId || !name || !trainingDate || !startTime) {
            return res.status(400).json({
              success: false,
              message: 'Team ID, nombre, fecha y hora de inicio son requeridos'
            });
          }

          if (!process.env.POSTGRES_URL) {
            return res.status(200).json({
              success: true,
              message: 'Entrenamiento creado (demo)',
              training: { id: Date.now(), name, trainingDate, startTime }
            });
          }

          const newTraining = await sql`
            INSERT INTO trainings (team_id, name, training_date, start_time, end_time, location, notes, created_by, created_at, updated_at)
            VALUES (${teamId}, ${name}, ${trainingDate}, ${startTime}, ${endTime || null}, ${location || ''}, ${notes || ''}, ${decoded.userId}, NOW(), NOW())
            RETURNING *
          `;

          return res.status(201).json({
            success: true,
            message: 'Entrenamiento creado exitosamente',
            training: newTraining.rows[0]
          });
        }

      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido'
        });
      }
    }

    // Admin users endpoint - List users
    if (path.startsWith('/admin/users') && method === 'GET') {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Token de autorización requerido'
        });
      }

      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        
        if (decoded.role !== 'admin') {
          return res.status(403).json({
            success: false,
            message: 'Acceso denegado. Solo administradores.'
          });
        }

        if (!process.env.POSTGRES_URL) {
          return res.status(200).json({
            success: true,
            message: 'Lista de usuarios (modo demo)',
            data: [
              { id: 1, email: 'test@hockey.com', role: 'coach', status: 'active', created_at: '2025-08-30T00:00:00Z' },
              { id: 2, email: 'admin@hockey.com', role: 'admin', status: 'active', created_at: '2025-08-30T00:00:00Z' },
              { id: 3, email: 'demo@hockey.com', role: 'coach', status: 'inactive', created_at: '2025-08-30T00:00:00Z' }
            ],
            note: 'Datos de demostración - Para datos reales, configura Vercel Postgres'
          });
        }

        // Get users from real database
        const usersResult = await sql`
          SELECT id, email, first_name, last_name, role, plan, club_name, is_active, created_at, last_login
          FROM users 
          ORDER BY created_at DESC
        `;

        return res.status(200).json({
          success: true,
          data: usersResult.rows.map(user => ({
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            fullName: `${user.first_name} ${user.last_name}`,
            role: user.role,
            plan: user.plan,
            clubName: user.club_name,
            status: user.is_active ? 'active' : 'inactive',
            createdAt: user.created_at,
            lastLogin: user.last_login
          })),
          total: usersResult.rows.length
        });

      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido'
        });
      }
    }

    // Admin users endpoint - Create user
    if (path.startsWith('/admin/users') && method === 'POST') {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Token de autorización requerido'
        });
      }

      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        
        if (decoded.role !== 'admin') {
          return res.status(403).json({
            success: false,
            message: 'Acceso denegado. Solo administradores.'
          });
        }

        const body = await parseBody(req);
        const { email, password, first_name, last_name, role, plan } = body;

        if (!email || !password || !first_name || !last_name || !role) {
          return res.status(400).json({
            success: false,
            message: 'Todos los campos son requeridos'
          });
        }

        if (!process.env.POSTGRES_URL) {
          return res.status(200).json({
            success: true,
            message: 'Usuario creado (demo)',
            data: { id: Date.now(), email, first_name, last_name, role, plan }
          });
        }

        // Check if user already exists
        const existingUser = await sql`
          SELECT id FROM users WHERE email = ${email}
        `;

        if (existingUser.rows.length > 0) {
          return res.status(409).json({
            success: false,
            message: 'El usuario ya existe'
          });
        }

        // Hash password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create user
        const newUser = await sql`
          INSERT INTO users (id, email, password_hash, first_name, last_name, role, plan, is_active, created_at, updated_at)
          VALUES (gen_random_uuid(), ${email}, ${passwordHash}, ${first_name}, ${last_name}, ${role}, ${plan || '2_teams'}, true, NOW(), NOW())
          RETURNING id, email, first_name, last_name, role, plan, created_at
        `;

        return res.status(201).json({
          success: true,
          message: 'Usuario creado exitosamente',
          data: newUser.rows[0]
        });

      } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({
          success: false,
          message: 'Error interno del servidor'
        });
      }
    }

    // Route not found
    return res.status(404).json({
      success: false,
      message: `Ruta no encontrada: ${method} ${path}`
    });

  } catch (error) {
    console.error('Error en API:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}
