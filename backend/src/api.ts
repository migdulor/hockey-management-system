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
  console.log('🟦 Handler started');
  
  setCorsHeaders(res);

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🟦 OPTIONS request handled');
    return res.status(200).end();
  }

  console.log('🟦 Parsing URL...');
  const { url, method } = req;
  console.log('🟦 URL and method extracted:', { url, method });
  
  // Extract pathname without query parameters
  const urlObj = new URL(url || '', 'http://localhost');
  console.log('🟦 URL object created');
  
  const path = urlObj.pathname.replace('/api', '') || '';
  console.log('🟦 Path processed:', path);
  
  // DEBUG: Log all requests temporarily
  console.log(`📍 API Request: ${method} ${path}`);
  
  // Log más detallado para requests PATCH
  if (method === 'PATCH') {
    console.log('🔧 PATCH Request details:', {
      originalUrl: req.url,
      pathname: urlObj.pathname,
      pathAfterReplace: path,
      headers: Object.keys(req.headers)
    });
  }

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

    // DEBUG: Endpoint temporal para verificar usuarios en DB
    if (path === '/debug/users' && method === 'GET') {
      try {
        const usersResult = await sql`
          SELECT id, email, first_name, last_name, role, is_active, created_at
          FROM users 
          ORDER BY created_at DESC
          LIMIT 10
        `;
        
        return res.status(200).json({
          success: true,
          message: 'Usuarios encontrados en la base de datos',
          count: usersResult.rows.length,
          users: usersResult.rows
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'Error consultando usuarios: ' + (error as Error).message
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
          return res.status(503).json({
            success: false,
            message: 'Sistema no configurado correctamente'
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

    // Profile endpoint
    if (path === '/profile' && method === 'GET') {
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
        
        // Get user info from database
        const userResult = await sql`
          SELECT id, email, first_name, last_name, role, plan, club_name, is_active, created_at
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
          data: {
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
        return res.status(401).json({
          success: false,
          message: 'Token inválido'
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

    // Divisions endpoint
    if (path === '/divisions' && method === 'GET') {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Token de autorización requerido'
        });
      }

      try {
        const token = authHeader.substring(7);
        const jwtSecret = process.env.JWT_SECRET || 'test_secret_key_for_demo';
        const decoded = jwt.verify(token, jwtSecret) as any;
        
        // Get gender parameter from query string
        const urlObj = new URL(req.url || '', 'http://localhost');
        const gender = urlObj.searchParams.get('gender');

        if (!process.env.POSTGRES_URL) {
          const demoDivisions = [
            { id: 'demo1', name: 'Sub 14', gender: 'female' },
            { id: 'demo2', name: 'Sub 16', gender: 'female' },
            { id: 'demo3', name: 'Primera', gender: 'female' },
            { id: 'demo4', name: 'Sub 14', gender: 'male' },
            { id: 'demo5', name: 'Sub 16', gender: 'male' },
            { id: 'demo6', name: 'Primera', gender: 'male' }
          ];

          const filteredDivisions = gender 
            ? demoDivisions.filter(d => d.gender === gender)
            : demoDivisions;

          return res.status(200).json({
            success: true,
            divisions: filteredDivisions,
            message: 'Datos demo'
          });
        }

        let divisionsQuery;
        if (gender) {
          // Filter by gender and get distinct divisions to avoid duplicates
          divisionsQuery = await sql`
            SELECT DISTINCT ON (name) id, name, gender
            FROM divisions 
            WHERE gender = ${gender}
            ORDER BY name, created_at DESC
          `;
        } else {
          // Get all divisions
          divisionsQuery = await sql`
            SELECT DISTINCT ON (name, gender) id, name, gender
            FROM divisions 
            ORDER BY name, gender, created_at DESC
          `;
        }

        return res.status(200).json({
          success: true,
          divisions: divisionsQuery.rows
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
        const jwtSecret = process.env.JWT_SECRET || 'test_secret_key_for_demo';
        const decoded = jwt.verify(token, jwtSecret) as any;
        
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
              SELECT t.*, u.first_name as coach_first_name, u.last_name as coach_last_name, d.gender as team_gender
              FROM teams t
              LEFT JOIN users u ON t.user_id = u.id
              LEFT JOIN divisions d ON t.division_id = d.id
              WHERE t.is_active = true
              ORDER BY t.created_at DESC
            `;
          } else {
            // Coaches can only see their teams
            teamsQuery = await sql`
              SELECT t.*, u.first_name as coach_first_name, u.last_name as coach_last_name, d.gender as team_gender
              FROM teams t
              LEFT JOIN users u ON t.user_id = u.id
              LEFT JOIN divisions d ON t.division_id = d.id
              WHERE t.user_id = ${decoded.userId} AND t.is_active = true
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
          const { name, club_name, division_id, max_players } = body;

          if (!name || !club_name) {
            return res.status(400).json({
              success: false,
              message: 'El nombre del equipo y nombre del club son requeridos'
            });
          }

          if (!process.env.POSTGRES_URL) {
            return res.status(200).json({
              success: true,
              message: 'Equipo creado (demo)',
              team: { id: Date.now(), name, club_name, division_id, max_players }
            });
          }

          // Si no se proporciona division_id, usar un UUID temporal o NULL
          const divisionValue = division_id || null;
          
          const newTeam = await sql`
            INSERT INTO teams (name, club_name, division_id, user_id, max_players, is_active, created_at, updated_at)
            VALUES (${name}, ${club_name}, ${divisionValue}, ${decoded.userId}, ${max_players || 25}, true, NOW(), NOW())
            RETURNING *
          `;

          return res.status(201).json({
            success: true,
            message: 'Equipo creado exitosamente',
            team: newTeam.rows[0]
          });
        }

      } catch (error) {
        console.error('JWT verification failed for teams:', error);
        return res.status(401).json({
          success: false,
          message: 'Token inválido o expirado'
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
                { id: 1, name: 'Demo Player', nickname: 'Demo', position: 'forward', jersey_number: 10 }
              ],
              message: 'Datos demo'
            });
          }

          // Usar la tabla team_players para obtener jugadores del equipo
          const playersQuery = await sql`
            SELECT 
              p.id, 
              p.name, 
              p.nickname, 
              p.birth_date, 
              p.position, 
              p.photo_url, 
              tp.jersey_number, 
              tp.is_active as team_active
            FROM players p
            INNER JOIN team_players tp ON p.id = tp.player_id
            WHERE tp.team_id = ${teamId} AND tp.is_active = true AND p.is_active = true
            ORDER BY p.name ASC
          `;

          return res.status(200).json({
            success: true,
            players: playersQuery.rows
          });
        }

        // POST /api/players - Create new player
        if (path === '/players' && method === 'POST') {
          const body = await parseBody(req);
          const { teamId, name, nickname, position, birth_date, jersey_number } = body;

          if (!teamId || !name || !birth_date) {
            return res.status(400).json({
              success: false,
              message: 'Team ID, nombre y fecha de nacimiento son requeridos'
            });
          }

          if (!process.env.POSTGRES_URL) {
            return res.status(200).json({
              success: true,
              message: 'Jugador creado (demo)',
              player: { id: Date.now(), name, nickname, jersey_number }
            });
          }

          try {
            // Verificar que el número de camiseta no esté ocupado en el equipo
            if (jersey_number) {
              const existingJerseyQuery = await sql`
                SELECT id FROM team_players 
                WHERE team_id = ${teamId} AND jersey_number = ${jersey_number} AND is_active = true
              `;
              
              if (existingJerseyQuery.rows.length > 0) {
                return res.status(400).json({
                  success: false,
                  message: `El número de camiseta ${jersey_number} ya está ocupado en este equipo`
                });
              }
            }

            // Crear el jugador en la tabla players
            const newPlayerQuery = await sql`
              INSERT INTO players (name, nickname, birth_date, position, is_active, created_at, updated_at)
              VALUES (${name}, ${nickname || null}, ${birth_date}, ${position || null}, true, NOW(), NOW())
              RETURNING *
            `;

            const newPlayer = newPlayerQuery.rows[0];

            // Agregar la relación en team_players
            const teamPlayerQuery = await sql`
              INSERT INTO team_players (team_id, player_id, jersey_number, is_active, joined_at)
              VALUES (${teamId}, ${newPlayer.id}, ${jersey_number || null}, true, NOW())
              RETURNING *
            `;

            return res.status(201).json({
              success: true,
              message: 'Jugador creado exitosamente',
              player: {
                ...newPlayer,
                jersey_number: teamPlayerQuery.rows[0].jersey_number
              }
            });

          } catch (error) {
            console.error('Error creating player:', error);
            return res.status(500).json({
              success: false,
              message: 'Error interno del servidor al crear jugador'
            });
          }
        }

        // PUT /api/players/{playerId} - Update existing player
        if (path.match(/^\/players\/[^\/]+$/) && method === 'PUT') {
          const playerId = path.split('/')[2];
          const body = await parseBody(req);
          const { teamId, name, nickname, position, birth_date, jersey_number } = body;

          if (!playerId || !teamId || !name || !birth_date) {
            return res.status(400).json({
              success: false,
              message: 'Player ID, Team ID, nombre y fecha de nacimiento son requeridos'
            });
          }

          if (!process.env.POSTGRES_URL) {
            return res.status(200).json({
              success: true,
              message: 'Jugador actualizado (demo)',
              player: { id: playerId, name, nickname, jersey_number }
            });
          }

          try {
            // Verificar que el jugador existe en el equipo
            const existingPlayerQuery = await sql`
              SELECT tp.id, tp.jersey_number 
              FROM team_players tp
              WHERE tp.player_id = ${playerId} AND tp.team_id = ${teamId} AND tp.is_active = true
            `;

            if (existingPlayerQuery.rows.length === 0) {
              return res.status(404).json({
                success: false,
                message: 'Jugador no encontrado en este equipo'
              });
            }

            const currentJerseyNumber = existingPlayerQuery.rows[0].jersey_number;

            // Verificar que el número de camiseta no esté ocupado (si cambió)
            if (jersey_number && jersey_number != currentJerseyNumber) {
              const existingJerseyQuery = await sql`
                SELECT id FROM team_players 
                WHERE team_id = ${teamId} AND jersey_number = ${jersey_number} AND is_active = true AND player_id != ${playerId}
              `;
              
              if (existingJerseyQuery.rows.length > 0) {
                return res.status(400).json({
                  success: false,
                  message: `El número de camiseta ${jersey_number} ya está ocupado por otro jugador en este equipo`
                });
              }
            }

            // Actualizar datos del jugador en la tabla players
            const updatePlayerQuery = await sql`
              UPDATE players 
              SET 
                name = ${name}, 
                nickname = ${nickname || null}, 
                birth_date = ${birth_date}, 
                position = ${position || null}, 
                updated_at = NOW()
              WHERE id = ${playerId}
              RETURNING *
            `;

            if (updatePlayerQuery.rows.length === 0) {
              return res.status(404).json({
                success: false,
                message: 'Jugador no encontrado'
              });
            }

            // Actualizar datos específicos del equipo en team_players
            const updateTeamPlayerQuery = await sql`
              UPDATE team_players 
              SET 
                jersey_number = ${jersey_number || null}, 
                updated_at = NOW()
              WHERE player_id = ${playerId} AND team_id = ${teamId}
              RETURNING *
            `;

            return res.status(200).json({
              success: true,
              message: 'Jugador actualizado exitosamente',
              player: {
                ...updatePlayerQuery.rows[0],
                jersey_number: updateTeamPlayerQuery.rows[0].jersey_number
              }
            });

          } catch (error) {
            console.error('Error updating player:', error);
            return res.status(500).json({
              success: false,
              message: 'Error interno del servidor al actualizar jugador'
            });
          }
        }

        // DELETE /api/players/{playerId}?team_id=xxx - Remove player from team
        if (path.match(/^\/players\/[^\/]+$/) && method === 'DELETE') {
          const playerId = path.split('/')[2];
          const teamId = req.url?.split('team_id=')[1]?.split('&')[0];

          if (!playerId || !teamId) {
            return res.status(400).json({
              success: false,
              message: 'Player ID y team_id son requeridos'
            });
          }

          if (!process.env.POSTGRES_URL) {
            return res.status(200).json({
              success: true,
              message: 'Jugador eliminado (demo)'
            });
          }

          try {
            // Marcar como inactivo en team_players (no eliminar completamente)
            const removePlayerQuery = await sql`
              UPDATE team_players 
              SET is_active = false, updated_at = NOW()
              WHERE player_id = ${playerId} AND team_id = ${teamId}
              RETURNING *
            `;

            if (removePlayerQuery.rows.length === 0) {
              return res.status(404).json({
                success: false,
                message: 'Jugador no encontrado en este equipo'
              });
            }

            return res.status(200).json({
              success: true,
              message: 'Jugador eliminado del equipo exitosamente'
            });

          } catch (error) {
            console.error('Error removing player:', error);
            return res.status(500).json({
              success: false,
              message: 'Error interno del servidor al eliminar jugador'
            });
          }
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
            SELECT 
              id,
              team_id,
              name,
              date as training_date,
              time as start_time,
              location,
              type,
              notes,
              is_cancelled,
              created_at
            FROM training_sessions 
            WHERE team_id = ${teamId} AND is_cancelled = false
            ORDER BY date DESC, time DESC
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
            INSERT INTO training_sessions (team_id, name, date, time, location, notes, type, created_at, updated_at)
            VALUES (${teamId}, ${name}, ${trainingDate}, ${startTime}, ${location || null}, ${notes || null}, 'regular', NOW(), NOW())
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

    // Training Attendances management endpoints
    if (path.startsWith('/training-attendances')) {
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

        // GET /api/training-attendances?training_session_id=xxx - Get attendance for a training session
        if (path.startsWith('/training-attendances') && method === 'GET') {
          const trainingSessionId = req.url?.split('training_session_id=')[1]?.split('&')[0];
          
          if (!trainingSessionId) {
            return res.status(400).json({
              success: false,
              message: 'training_session_id es requerido'
            });
          }

          if (!process.env.POSTGRES_URL) {
            return res.status(200).json({
              success: true,
              attendances: [],
              message: 'Datos demo'
            });
          }

          const attendancesQuery = await sql`
            SELECT 
              ta.id,
              ta.player_id,
              p.name as player_name,
              ta.status,
              ta.arrival_time,
              ta.excuse_reason,
              ta.participation_level,
              ta.performance_notes,
              ta.marked_at
            FROM training_attendances ta
            JOIN players p ON ta.player_id = p.id
            WHERE ta.training_session_id = ${trainingSessionId}
            ORDER BY p.name ASC
          `;

          return res.status(200).json({
            success: true,
            attendances: attendancesQuery.rows
          });
        }

        // POST /api/training-attendances - Create or update attendance
        if (path === '/training-attendances' && method === 'POST') {
          const body = await parseBody(req);
          const { training_session_id, player_id, status, arrival_time, excuse_reason, participation_level, performance_notes } = body;

          if (!training_session_id || !player_id || !status) {
            return res.status(400).json({
              success: false,
              message: 'training_session_id, player_id y status son requeridos'
            });
          }

          if (!process.env.POSTGRES_URL) {
            return res.status(200).json({
              success: true,
              message: 'Asistencia registrada (demo)',
              attendance: { id: Date.now(), status, player_name: 'Demo Player' }
            });
          }

          // Insert or update attendance (UPSERT)
          const attendanceQuery = await sql`
            INSERT INTO training_attendances 
              (training_session_id, player_id, status, arrival_time, excuse_reason, participation_level, performance_notes, marked_at, created_at, updated_at)
            VALUES 
              (${training_session_id}, ${player_id}, ${status}, ${arrival_time || null}, ${excuse_reason || null}, ${participation_level || null}, ${performance_notes || null}, NOW(), NOW(), NOW())
            ON CONFLICT (player_id, training_session_id) 
            DO UPDATE SET 
              status = ${status},
              arrival_time = ${arrival_time || null},
              excuse_reason = ${excuse_reason || null},
              participation_level = ${participation_level || null},
              performance_notes = ${performance_notes || null},
              marked_at = NOW(),
              updated_at = NOW()
            RETURNING *
          `;

          return res.status(201).json({
            success: true,
            message: 'Asistencia registrada exitosamente',
            attendance: attendanceQuery.rows[0]
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
          SELECT id, email, first_name, last_name, role, plan, club_name, is_active, created_at, last_login, max_teams
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
            lastLogin: user.last_login,
            maxTeams: user.max_teams !== null && user.max_teams !== undefined ? user.max_teams : 2 // Usar el nuevo campo numérico, permitiendo 0
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
        const { email, password, first_name, last_name, role, max_teams } = body;

        if (!email || !password || !first_name || !last_name || !role) {
          return res.status(400).json({
            success: false,
            message: 'Todos los campos son requeridos'
          });
        }

        // Validar max_teams
        const teamsLimit = max_teams ? parseInt(max_teams) : 2;
        if (isNaN(teamsLimit) || teamsLimit < 0) {
          return res.status(400).json({
            success: false,
            message: 'El número de equipos permitidos debe ser un número válido (0 o mayor)'
          });
        }

        if (!process.env.POSTGRES_URL) {
          return res.status(200).json({
            success: true,
            message: 'Usuario creado (demo)',
            data: { id: Date.now(), email, first_name, last_name, role, max_teams: teamsLimit }
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
          INSERT INTO users (id, email, password_hash, first_name, last_name, role, max_teams, is_active, created_at, updated_at)
          VALUES (gen_random_uuid(), ${email}, ${passwordHash}, ${first_name}, ${last_name}, ${role}, ${teamsLimit}, true, NOW(), NOW())
          RETURNING id, email, first_name, last_name, role, max_teams, created_at
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

    // Admin users endpoint - Toggle user active status
    console.log('🔧 Checking toggle match for path:', path, 'method:', method);
    console.log('🔧 Toggle regex test:', /^\/admin\/users\/[^\/]+\/toggle$/.test(path));
    if (path.match(/^\/admin\/users\/[^\/]+\/toggle$/) && method === 'PATCH') {
      console.log('🔧 Toggle endpoint called with path:', path, 'method:', method);
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

        // Extract user ID from path
        const userIdMatch = path.match(/^\/admin\/users\/([^\/]+)\/toggle$/);
        const userId = userIdMatch ? userIdMatch[1] : null;

        if (!userId) {
          return res.status(400).json({
            success: false,
            message: 'ID de usuario requerido'
          });
        }

        if (!process.env.POSTGRES_URL) {
          return res.status(200).json({
            success: true,
            message: 'Usuario actualizado (demo)',
            data: { id: userId, is_active: true }
          });
        }

        // Get current user status
        const currentUser = await sql`
          SELECT id, is_active, email, first_name, last_name
          FROM users 
          WHERE id = ${userId}
        `;

        if (currentUser.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Usuario no encontrado'
          });
        }

        const newStatus = !currentUser.rows[0].is_active;

        // Update user status
        const updatedUser = await sql`
          UPDATE users 
          SET is_active = ${newStatus}
          WHERE id = ${userId}
          RETURNING id, email, first_name, last_name, is_active, role, plan, club_name, created_at, last_login
        `;

        if (updatedUser.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Usuario no encontrado para actualizar'
          });
        }

        const user = updatedUser.rows[0];

        return res.status(200).json({
          success: true,
          message: `Usuario ${newStatus ? 'activado' : 'desactivado'} exitosamente`,
          data: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            fullName: `${user.first_name} ${user.last_name}`,
            role: user.role,
            plan: user.plan,
            clubName: user.club_name || '', // Valor por defecto si es NULL
            status: user.is_active ? 'active' : 'inactive',
            createdAt: user.created_at,
            lastLogin: user.last_login || null
          }
        });

      } catch (error) {
        console.error('Error toggling user:', error);
        return res.status(500).json({
          success: false,
          message: 'Error interno del servidor'
        });
      }
    }

    // Admin users endpoint - Reset user password
    if (path.match(/^\/admin\/users\/[^\/]+\/password$/) && method === 'PUT') {
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

        // Extract user ID from path
        const userIdMatch = path.match(/^\/admin\/users\/([^\/]+)\/password$/);
        const userId = userIdMatch ? userIdMatch[1] : null;

        if (!userId) {
          return res.status(400).json({
            success: false,
            message: 'ID de usuario requerido'
          });
        }

        const body = await parseBody(req);
        const { new_password } = body;

        if (!new_password || new_password.length < 6) {
          return res.status(400).json({
            success: false,
            message: 'Nueva contraseña debe tener al menos 6 caracteres'
          });
        }

        if (!process.env.POSTGRES_URL) {
          return res.status(200).json({
            success: true,
            message: 'Contraseña actualizada (demo)',
            data: { id: userId }
          });
        }

        // Check if user exists
        const userExists = await sql`
          SELECT id, email, first_name, last_name
          FROM users 
          WHERE id = ${userId}
        `;

        if (userExists.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Usuario no encontrado'
          });
        }

        // Hash new password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(new_password, saltRounds);

        // Update password
        await sql`
          UPDATE users 
          SET password_hash = ${passwordHash}, updated_at = NOW()
          WHERE id = ${userId}
        `;

        return res.status(200).json({
          success: true,
          message: 'Contraseña actualizada exitosamente'
        });

      } catch (error) {
        console.error('Error updating password:', error);
        return res.status(500).json({
          success: false,
          message: 'Error interno del servidor'
        });
      }
    }

    // Admin users endpoint - Update max teams
    if (path.match(/^\/admin\/users\/[^\/]+\/teams$/) && method === 'PUT') {
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

        // Extract user ID from path
        const userIdMatch = path.match(/^\/admin\/users\/([^\/]+)\/teams$/);
        const userId = userIdMatch ? userIdMatch[1] : null;

        if (!userId) {
          return res.status(400).json({
            success: false,
            message: 'ID de usuario requerido'
          });
        }

        const body = await parseBody(req);
        const { max_teams } = body;

        console.log('🔧 TEAMS: Received max_teams:', max_teams, 'type:', typeof max_teams);

        // Validar que max_teams sea un número válido
        const teamsNumber = parseInt(max_teams);
        console.log('🔧 TEAMS: Parsed teamsNumber:', teamsNumber, 'isNaN:', isNaN(teamsNumber));
        
        if (isNaN(teamsNumber) || teamsNumber < 0 || teamsNumber > 10) {
          console.log('🔧 TEAMS: Validation failed');
          return res.status(400).json({
            success: false,
            message: 'El número de equipos debe estar entre 0 y 10'
          });
        }

        if (!process.env.POSTGRES_URL) {
          return res.status(200).json({
            success: true,
            message: 'Número máximo de equipos actualizado (demo)',
            data: { id: userId, max_teams: teamsNumber }
          });
        }

        // Check if user exists
        const userExists = await sql`
          SELECT id FROM users WHERE id = ${userId}
        `;

        if (userExists.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Usuario no encontrado'
          });
        }

        // Update max_teams field directly (no more mapping to plan constraints)
        console.log('🔧 TEAMS: Updating max_teams to:', teamsNumber);
        
        await sql`
          UPDATE users 
          SET max_teams = ${teamsNumber}
          WHERE id = ${userId}
        `;

        console.log('🔧 TEAMS: Update successful');
        return res.status(200).json({
          success: true,
          message: `Número máximo de equipos actualizado a ${teamsNumber}`
        });

      } catch (error) {
        console.error('Error updating max teams:', error);
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
    console.error('❌ Error en API:', error);
    console.error('❌ Error details:', {
      message: (error as Error).message,
      stack: (error as Error).stack,
      path: urlObj.pathname,
      method: req.method
    });
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}
