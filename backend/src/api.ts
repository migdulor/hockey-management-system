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
  
  const urlObj = new URL(url || '', 'http://localhost');
  console.log('🟦 URL object created');
  
  const path = urlObj.pathname.replace('/api', '') || '';
  console.log('🟦 Path processed:', path);

  // DEBUG: Log all requests temporarily
  console.log(`📍 API Request: ${method} ${path}`);

  // Admin endpoint for database migrations (temporary)
  if (path === '/admin/migrate-images' && method === 'POST') {
    try {
      await sql`ALTER TABLE teams ADD COLUMN IF NOT EXISTS team_jersey_photo TEXT`;
      await sql`ALTER TABLE players ADD COLUMN IF NOT EXISTS player_photo TEXT`;
      return res.status(200).json({ success: true, message: 'Migration completed' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Migration failed' });
    }
  }
  
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

    // TEMP: Migration endpoint to fix team limits and make division_id optional
    if (path === '/admin/migrate' && method === 'POST') {
      try {
        // Make division_id optional
        await sql`ALTER TABLE teams ALTER COLUMN division_id DROP NOT NULL`;
        
        // Drop old trigger and function
        await sql`DROP TRIGGER IF EXISTS validate_team_limit_trigger ON teams`;
        await sql`DROP FUNCTION IF EXISTS validate_team_limit_by_plan()`;
        
        // Create new function
        await sql`
          CREATE OR REPLACE FUNCTION validate_team_limit_by_max_teams()
          RETURNS TRIGGER AS $$
          DECLARE
              user_max_teams INTEGER;
              current_team_count INTEGER;
          BEGIN
              SELECT max_teams INTO user_max_teams FROM users WHERE id = NEW.user_id;
              
              IF NOT FOUND THEN
                  RAISE EXCEPTION 'User not found with id: %', NEW.user_id;
              END IF;
              
              IF user_max_teams IS NULL THEN
                  user_max_teams := 2;
              END IF;
              
              SELECT COUNT(*) INTO current_team_count 
              FROM teams 
              WHERE user_id = NEW.user_id AND is_active = true;
              
              IF TG_OP = 'INSERT' THEN
                  IF current_team_count >= user_max_teams THEN
                      RAISE EXCEPTION 'User allows maximum % teams. Current active teams: %', 
                          user_max_teams, current_team_count;
                  END IF;
              ELSIF TG_OP = 'UPDATE' THEN
                  IF OLD.is_active = false AND NEW.is_active = true THEN
                      IF current_team_count >= user_max_teams THEN
                          RAISE EXCEPTION 'User allows maximum % teams. Current active teams: %', 
                              user_max_teams, current_team_count;
                      END IF;
                  END IF;
              END IF;
              
              RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;
        `;
        
        // Create new trigger
        await sql`
          CREATE TRIGGER validate_team_limit_max_teams_trigger
              BEFORE INSERT OR UPDATE ON teams
              FOR EACH ROW 
              EXECUTE FUNCTION validate_team_limit_by_max_teams();
        `;
        
        return res.status(200).json({
          success: true,
          message: 'Migration completed: Removed plan system, using max_teams, made division_id optional'
        });
      } catch (error) {
        console.error('Migration error:', error);
        return res.status(500).json({
          success: false,
          message: 'Migration failed',
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
          SELECT id, email, first_name, last_name, role, max_teams, club_name, is_active, created_at
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
            maxTeams: user.max_teams,
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
          SELECT id, email, first_name, last_name, role, max_teams, club_name, is_active, created_at, last_login
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
            maxTeams: user.max_teams,
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
            // Admin can see all teams with player count
            teamsQuery = await sql`
              SELECT 
                t.*, 
                u.first_name as coach_first_name, 
                u.last_name as coach_last_name, 
                d.gender as team_gender,
                COALESCE(COUNT(tp.player_id), 0)::int as player_count
              FROM teams t
              LEFT JOIN users u ON t.user_id = u.id
              LEFT JOIN divisions d ON t.division_id = d.id
              LEFT JOIN team_players tp ON t.id = tp.team_id AND tp.is_active = true
              WHERE t.is_active = true
              GROUP BY t.id, u.first_name, u.last_name, d.gender
              ORDER BY t.created_at DESC
            `;
          } else {
            // Coaches can only see their teams with player count
            teamsQuery = await sql`
              SELECT 
                t.*, 
                u.first_name as coach_first_name, 
                u.last_name as coach_last_name, 
                d.gender as team_gender,
                COALESCE(COUNT(tp.player_id), 0)::int as player_count
              FROM teams t
              LEFT JOIN users u ON t.user_id = u.id
              LEFT JOIN divisions d ON t.division_id = d.id
              LEFT JOIN team_players tp ON t.id = tp.team_id AND tp.is_active = true
              WHERE t.user_id = ${decoded.userId} AND t.is_active = true
              GROUP BY t.id, u.first_name, u.last_name, d.gender
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
          const { name, club_name, division_id, division, max_players, team_jersey_photo } = body;

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
              team: { id: Date.now(), name, club_name, division_id: division_id || division, max_players, team_jersey_photo }
            });
          }

          // Verificar límite de equipos del usuario
          console.log('🔧 TEAMS: Checking team limits for user:', decoded.userId);
          
          // Obtener información del usuario
          const userInfo = await sql`
            SELECT max_teams FROM users WHERE id = ${decoded.userId}
          `;

          if (userInfo.rows.length === 0) {
            return res.status(404).json({
              success: false,
              message: 'Usuario no encontrado'
            });
          }

          const maxTeams = userInfo.rows[0].max_teams || 0;
          console.log('🔧 TEAMS: User max teams allowed:', maxTeams);

          // Si el usuario tiene 0 equipos permitidos, no puede crear ningún equipo
          if (maxTeams === 0) {
            return res.status(403).json({
              success: false,
              message: 'No tienes permisos para crear equipos. Contacta al administrador para solicitar acceso.'
            });
          }

          // Contar equipos actuales del usuario
          const currentTeams = await sql`
            SELECT COUNT(*) as count FROM teams WHERE user_id = ${decoded.userId} AND is_active = true
          `;

          const currentTeamsCount = parseInt(currentTeams.rows[0].count);
          console.log('🔧 TEAMS: Current teams count:', currentTeamsCount);

          // Verificar si ya alcanzó el límite
          if (currentTeamsCount >= maxTeams) {
            return res.status(403).json({
              success: false,
              message: `Has alcanzado el límite máximo de ${maxTeams} equipos. Para crear más equipos, solicita al administrador que amplíe tu límite de equipos.`
            });
          }

          // Handle division - support both division_id and division (string)
          let finalDivisionId = division_id;
          if (!finalDivisionId && division) {
            // If division is a string, try to find the division ID
            if (typeof division === 'string') {
              const divisionResult = await sql`
                SELECT id FROM divisions WHERE LOWER(name) = LOWER(${division}) LIMIT 1
              `;
              if (divisionResult.rows.length > 0) {
                finalDivisionId = divisionResult.rows[0].id;
              }
            }
          }

          const newTeam = await sql`
            INSERT INTO teams (name, club_name, division_id, user_id, max_players, team_jersey_photo, is_active, created_at, updated_at)
            VALUES (${name}, ${club_name}, ${finalDivisionId || null}, ${decoded.userId}, ${max_players || 20}, ${team_jersey_photo || null}, true, NOW(), NOW())
            RETURNING *
          `;

          console.log('🔧 TEAMS: Team created successfully for user:', decoded.userId);
          console.log('🔧 TEAMS: New team count:', currentTeamsCount + 1, 'of', maxTeams, 'allowed');

          return res.status(201).json({
            success: true,
            message: 'Equipo creado exitosamente',
            team: newTeam.rows[0]
          });
        }

        // PUT /api/teams/:id - Update team
        if (path.startsWith('/teams/') && method === 'PUT') {
          const teamId = path.split('/teams/')[1];
          const body = await parseBody(req);
          const { name, club_name, division_id, division, max_players, team_jersey_photo } = body;

          console.log('🔧 PUT Team - Data received:', {
            teamId,
            name,
            club_name,
            division_id,
            division,
            max_players,
            hasTeamJerseyPhoto: !!team_jersey_photo
          });

          if (!teamId) {
            return res.status(400).json({
              success: false,
              message: 'ID del equipo es requerido'
            });
          }

          // Intentar crear las columnas de imágenes si no existen (auto-migración)
          console.log('✅ Database columns already exist - proceeding with team update');

          // Verificar que el equipo pertenezca al usuario
          const existingTeam = await sql`
            SELECT * FROM teams WHERE id = ${teamId} AND user_id = ${decoded.userId} AND is_active = true
          `;

          if (existingTeam.rows.length === 0) {
            return res.status(404).json({
              success: false,
              message: 'Equipo no encontrado o no tienes permisos para editarlo'
            });
          }

          // Handle division - support both division_id and division (string)
          let finalDivisionId = division_id || existingTeam.rows[0].division_id;
          if (!finalDivisionId && division) {
            if (typeof division === 'string') {
              const divisionResult = await sql`
                SELECT id FROM divisions WHERE LOWER(name) = LOWER(${division}) LIMIT 1
              `;
              if (divisionResult.rows.length > 0) {
                finalDivisionId = divisionResult.rows[0].id;
              }
            }
          }

          let updatedTeam;
          
          if (team_jersey_photo !== undefined) {
            updatedTeam = await sql`
              UPDATE teams 
              SET 
                name = ${name || existingTeam.rows[0].name},
                club_name = ${club_name || existingTeam.rows[0].club_name},
                division_id = ${finalDivisionId},
                max_players = ${max_players || existingTeam.rows[0].max_players},
                team_jersey_photo = ${team_jersey_photo},
                updated_at = NOW()
              WHERE id = ${teamId} AND user_id = ${decoded.userId}
              RETURNING *
            `;
          } else {
            updatedTeam = await sql`
              UPDATE teams 
              SET 
                name = ${name || existingTeam.rows[0].name},
                club_name = ${club_name || existingTeam.rows[0].club_name},
                division_id = ${finalDivisionId},
                max_players = ${max_players || existingTeam.rows[0].max_players},
                updated_at = NOW()
              WHERE id = ${teamId} AND user_id = ${decoded.userId}
              RETURNING *
            `;
          }

          return res.status(200).json({
            success: true,
            message: 'Equipo actualizado exitosamente',
            team: updatedTeam.rows[0]
          });
        }

        // GET /api/teams/:id - Get specific team
        if (path.startsWith('/teams/') && method === 'GET') {
          const teamId = path.split('/teams/')[1];

          if (!teamId) {
            return res.status(400).json({
              success: false,
              message: 'ID del equipo es requerido'
            });
          }

          // Verificar que el equipo pertenezca al usuario
          const team = await sql`
            SELECT t.*, d.name as division_name
            FROM teams t
            LEFT JOIN divisions d ON t.division_id = d.id
            WHERE t.id = ${teamId} AND t.user_id = ${decoded.userId} AND t.is_active = true
          `;

          if (team.rows.length === 0) {
            return res.status(404).json({
              success: false,
              message: 'Equipo no encontrado o no tienes permisos para acceder a él'
            });
          }

          return res.status(200).json({
            success: true,
            team: team.rows[0]
          });
        }

        // DELETE /api/teams/:id - Delete team (only if no players)
        if (path.startsWith('/teams/') && method === 'DELETE') {
          const teamId = path.split('/teams/')[1];

          if (!teamId) {
            return res.status(400).json({
              success: false,
              message: 'ID del equipo es requerido'
            });
          }

          // Verificar que el equipo pertenezca al usuario
          const existingTeam = await sql`
            SELECT * FROM teams WHERE id = ${teamId} AND user_id = ${decoded.userId} AND is_active = true
          `;

          if (existingTeam.rows.length === 0) {
            return res.status(404).json({
              success: false,
              message: 'Equipo no encontrado o no tienes permisos para eliminarlo'
            });
          }

          // Verificar que no tenga jugadores
          const playersCount = await sql`
            SELECT COUNT(*) as count FROM team_players WHERE team_id = ${teamId} AND is_active = true
          `;

          const playerCount = parseInt(playersCount.rows[0].count);
          if (playerCount > 0) {
            return res.status(409).json({
              success: false,
              message: `No puedes eliminar el equipo porque tiene ${playerCount} jugador(es). Primero elimina o transfiere todos los jugadores.`
            });
          }

          // Marcar equipo como inactivo (soft delete)
          await sql`
            UPDATE teams 
            SET is_active = false, updated_at = NOW()
            WHERE id = ${teamId} AND user_id = ${decoded.userId}
          `;

          return res.status(200).json({
            success: true,
            message: 'Equipo eliminado exitosamente'
          });
        }

        // GET /api/teams/:id/players - Get players for a specific team
        if (path.match(/^\/teams\/[^\/]+\/players$/) && method === 'GET') {
          console.log('🔍 DEBUG: teams/{id}/players endpoint hit');
          console.log('🔍 DEBUG: path:', path);
          
          const teamId = path.split('/teams/')[1].split('/players')[0];
          console.log('🔍 DEBUG: extracted teamId:', teamId);

          if (!teamId) {
            console.log('❌ DEBUG: No teamId found');
            return res.status(400).json({
              success: false,
              message: 'ID del equipo es requerido'
            });
          }

          console.log('🔍 DEBUG: decoded user role:', decoded.role);
          console.log('🔍 DEBUG: decoded userId:', decoded.userId);

          try {
            // Verificar que el equipo pertenezca al usuario (excepto admin)
            if (decoded.role !== 'admin') {
              console.log('🔍 DEBUG: Checking team ownership for non-admin user');
              const teamOwnership = await sql`
                SELECT id FROM teams WHERE id = ${teamId} AND user_id = ${decoded.userId} AND is_active = true
              `;
              console.log('🔍 DEBUG: team ownership query result:', teamOwnership.rows);

              if (teamOwnership.rows.length === 0) {
                console.log('❌ DEBUG: Team not found or no permissions');
                return res.status(404).json({
                  success: false,
                  message: 'Equipo no encontrado o no tienes permisos para acceder a él'
                });
              }
            }

            console.log('🔍 DEBUG: Fetching players for team');
            // Obtener jugadores del equipo usando la misma lógica que /api/players?team_id=xxx
            const playersQuery = await sql`
              SELECT 
                p.id, 
                p.name, 
                p.nickname, 
                p.birth_date, 
                p.position, 
                p.player_photo, 
                tp.jersey_number, 
                tp.is_active as team_active
              FROM players p
              INNER JOIN team_players tp ON p.id = tp.player_id
              WHERE tp.team_id = ${teamId} AND tp.is_active = true AND p.is_active = true
              ORDER BY p.name ASC
            `;
            
            console.log('🔍 DEBUG: players query result count:', playersQuery.rows.length);

            return res.status(200).json({
              success: true,
              players: playersQuery.rows
            });
            
          } catch (playersError) {
            console.error('❌ DEBUG: Error in players query:', playersError);
            return res.status(500).json({
              success: false,
              message: 'Error al obtener jugadores del equipo',
              error: playersError.message
            });
          }
        }

      } catch (error: any) {
        console.error('Error in teams endpoint:', error);
        
        // Check if it's a JWT verification error
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            message: 'Token inválido o expirado'
          });
        }
        
        // Check if it's a team limit validation error (from database function)
        if (error.code === 'P0001' && error.message?.includes('allows maximum')) {
          return res.status(403).json({
            success: false,
            message: error.message
          });
        }
        
        // Check if it's a not-null constraint violation
        if (error.code === '23502') {
          if (error.column === 'division_id') {
            return res.status(400).json({
              success: false,
              message: 'Debes seleccionar una división válida para el equipo'
            });
          }
          return res.status(400).json({
            success: false,
            message: 'Faltan campos obligatorios'
          });
        }
        
        // Check if it's a database constraint error
        if (error.code === '23514') { // Check constraint violation
          return res.status(400).json({
            success: false,
            message: 'Error de validación: El número de jugadores debe estar entre 10 y 22'
          });
        }
        
        if (error.code === '23505') { // Unique constraint violation
          return res.status(409).json({
            success: false,
            message: 'Ya existe un equipo con ese nombre'
          });
        }
        
        // Generic database error
        return res.status(500).json({
          success: false,
          message: 'Error interno del servidor'
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
              p.player_photo, 
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
          const { teamId, name, nickname, position, birth_date, jersey_number, player_photo } = body;

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
              player: { id: Date.now(), name, nickname, jersey_number, player_photo }
            });
          }

          try {
            console.log('✅ Database columns already exist - proceeding with creation');

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
            let newPlayerQuery;
            
            // Solo incluir player_photo si realmente se envió una imagen válida
            const hasValidPhoto = player_photo && 
                                  typeof player_photo === 'string' && 
                                  player_photo.trim().length > 0 && 
                                  player_photo.startsWith('data:image');
                                  
            if (hasValidPhoto) {
              newPlayerQuery = await sql`
                INSERT INTO players (name, nickname, birth_date, position, player_photo, is_active, created_at, updated_at)
                VALUES (${name}, ${nickname || null}, ${birth_date}, ${position || null}, ${player_photo}, true, NOW(), NOW())
                RETURNING *
              `;
            } else {
              newPlayerQuery = await sql`
                INSERT INTO players (name, nickname, birth_date, position, is_active, created_at, updated_at)
                VALUES (${name}, ${nickname || null}, ${birth_date}, ${position || null}, true, NOW(), NOW())
                RETURNING *
              `;
            }

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
            console.error('Error details:', {
              message: (error as Error).message,
              stack: (error as Error).stack
            });
            
            return res.status(500).json({
              success: false,
              message: `Error interno del servidor: ${(error as Error).message}`
            });
          }
        }

        // PUT /api/players/{playerId} - Update existing player
        if (path.match(/^\/players\/[^\/]+$/) && method === 'PUT') {
          const playerId = path.split('/')[2];
          const body = await parseBody(req);
          const { teamId, name, nickname, position, birth_date, jersey_number, player_photo } = body;

          console.log('🔧 PUT Player - Data received:', {
            playerId,
            teamId,
            name,
            nickname,
            position,
            birth_date,
            jersey_number,
            hasPlayerPhoto: !!player_photo
          });

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
            console.log('✅ Database columns already exist - proceeding with update');

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
            let updateQuery;
            let updateValues = {
              name,
              nickname: nickname || null,
              birth_date,
              position: position || null,
              updated_at: 'NOW()'
            };

            // Solo incluir player_photo si realmente se envió una imagen válida
            const hasValidPhoto = player_photo && 
                                  typeof player_photo === 'string' && 
                                  player_photo.trim().length > 0 && 
                                  player_photo.startsWith('data:image');
                                  
            if (hasValidPhoto) {
              updateQuery = sql`
                UPDATE players 
                SET 
                  name = ${name}, 
                  nickname = ${nickname || null}, 
                  birth_date = ${birth_date}, 
                  position = ${position || null},
                  player_photo = ${player_photo}, 
                  updated_at = NOW()
                WHERE id = ${playerId}
                RETURNING *
              `;
            } else {
              updateQuery = sql`
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
            }
            
            const updatePlayerQuery = await updateQuery;

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
                jersey_number = ${jersey_number || null}
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
            console.error('Error details:', {
              message: (error as Error).message,
              stack: (error as Error).stack,
              playerPhoto: !!player_photo,
              playerPhotoType: typeof player_photo
            });
            
            return res.status(500).json({
              success: false,
              message: `Error interno del servidor: ${(error as Error).message}`
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

          // Ensure the date is properly formatted as local date
          const localDate = new Date(trainingDate + 'T12:00:00').toISOString().split('T')[0];

          const newTraining = await sql`
            INSERT INTO training_sessions (team_id, name, date, time, location, notes, type, created_at, updated_at)
            VALUES (${teamId}, ${name}, ${localDate}, ${startTime}, ${location || null}, ${notes || null}, 'regular', NOW(), NOW())
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

    // === FORMACIONES ENDPOINTS ===
    
    // GET /api/formations - List formations
    if (path === '/formations' && method === 'GET') {
      try {
        if (!process.env.POSTGRES_URL) {
          return res.status(200).json({
            success: true,
            formations: [],
            message: 'Demo mode - no formations'
          });
        }

        const formationsQuery = await sql`
          SELECT 
            f.id,
            f.name,
            f.strategy,
            f.team_id,
            f.match_id,
            f.description,
            f.created_at,
            f.updated_at
          FROM formations f
          ORDER BY f.created_at DESC
        `;

        return res.status(200).json({
          success: true,
          formations: formationsQuery.rows
        });

      } catch (error) {
        console.error('Error fetching formations:', error);
        return res.status(500).json({
          success: false,
          message: 'Error al obtener formaciones'
        });
      }
    }

    // POST /api/formations - Create formation
    if (path === '/formations' && method === 'POST') {
      const body = await parseBody(req);
      const { name, strategy, teamId, matchId, description } = body;

      if (!name || !strategy) {
        return res.status(400).json({
          success: false,
          message: 'Nombre y estrategia son requeridos'
        });
      }

      try {
        if (!process.env.POSTGRES_URL) {
          return res.status(200).json({
            success: true,
            message: 'Formación creada (demo)',
            formation: { 
              id: `formation_${Date.now()}`, 
              name, 
              strategy, 
              teamId, 
              matchId, 
              description,
              created_at: new Date().toISOString()
            }
          });
        }

        const newFormationQuery = await sql`
          INSERT INTO formations (id, name, strategy, team_id, match_id, description, created_at, updated_at)
          VALUES (${`formation_${Date.now()}`}, ${name}, ${strategy}, ${teamId || null}, ${matchId || null}, ${description || null}, NOW(), NOW())
          RETURNING *
        `;

        return res.status(201).json({
          success: true,
          formation: newFormationQuery.rows[0]
        });

      } catch (error) {
        console.error('Error creating formation:', error);
        return res.status(500).json({
          success: false,
          message: 'Error al crear formación'
        });
      }
    }

    // POST /api/formation-players - Add players to formation
    if (path === '/formation-players' && method === 'POST') {
      const body = await parseBody(req);
      const { formationId, players } = body;

      if (!formationId || !players || !Array.isArray(players)) {
        return res.status(400).json({
          success: false,
          message: 'Formation ID y lista de jugadores son requeridos'
        });
      }

      try {
        if (!process.env.POSTGRES_URL) {
          return res.status(200).json({
            success: true,
            message: 'Jugadores agregados a formación (demo)',
            formationPlayers: players.map((p: any, i: number) => ({
              id: `fp_${Date.now()}_${i}`,
              formation_id: formationId,
              player_id: p.playerId,
              position_x: p.positionX,
              position_y: p.positionY,
              created_at: new Date().toISOString()
            }))
          });
        }

        // Delete existing formation players first
        await sql`DELETE FROM formation_players WHERE formation_id = ${formationId}`;

        // Insert new formation players
        const formationPlayers = [];
        for (const player of players) {
          const fpQuery = await sql`
            INSERT INTO formation_players (id, formation_id, player_id, position_x, position_y, created_at, updated_at)
            VALUES (${`fp_${Date.now()}_${Math.random()}`}, ${formationId}, ${player.playerId}, ${player.positionX}, ${player.positionY}, NOW(), NOW())
            RETURNING *
          `;
          formationPlayers.push(fpQuery.rows[0]);
        }

        return res.status(201).json({
          success: true,
          formationPlayers
        });

      } catch (error) {
        console.error('Error adding players to formation:', error);
        return res.status(500).json({
          success: false,
          message: 'Error al agregar jugadores a formación'
        });
      }
    }

    // GET /api/formation-players/:formationId - Get formation players
    if (path.startsWith('/formation-players/') && method === 'GET') {
      const formationId = path.split('/')[2];

      try {
        if (!process.env.POSTGRES_URL) {
          return res.status(200).json({
            success: true,
            formationPlayers: [],
            message: 'Demo mode - no formation players'
          });
        }

        const formationPlayersQuery = await sql`
          SELECT 
            fp.id,
            fp.formation_id,
            fp.player_id,
            fp.position_x,
            fp.position_y,
            p.name as player_name,
            p.nickname,
            p.position as player_position,
            tp.jersey_number
          FROM formation_players fp
          JOIN players p ON fp.player_id = p.id
          JOIN team_players tp ON p.id = tp.player_id
          WHERE fp.formation_id = ${formationId}
          ORDER BY fp.created_at ASC
        `;

        return res.status(200).json({
          success: true,
          formationPlayers: formationPlayersQuery.rows
        });

      } catch (error) {
        console.error('Error fetching formation players:', error);
        return res.status(500).json({
          success: false,
          message: 'Error al obtener jugadores de formación'
        });
      }
    }

    // === HEATMAP ENDPOINTS === //

    // GET /api/heatmap/zones - Obtener datos de zonas para mapas de calor
    if (path === '/api/heatmap/zones' && method === 'GET') {
      try {
        const matchId = urlObj.searchParams.get('match_id');
        const teamId = urlObj.searchParams.get('team_id');
        const actionType = urlObj.searchParams.get('action_type');

        if (!matchId || !teamId) {
          return res.status(400).json({
            success: false,
            message: 'match_id y team_id son requeridos'
          });
        }

        let query = `
          SELECT 
            tz.zone_number,
            tz.zone_name,
            at.action_name,
            COUNT(ma.id) as action_count,
            COALESCE(AVG(ma.quarter), 0) as avg_quarter
          FROM tactical_zones tz
          LEFT JOIN match_actions ma ON tz.zone_number = ma.zone AND ma.match_id = $1 AND ma.team_id = $2
          LEFT JOIN action_types at ON ma.action_type_id = at.id
        `;
        
        const params = [matchId, teamId];
        
        if (actionType) {
          query += ` AND at.action_name = $3`;
          params.push(actionType);
        }
        
        query += `
          GROUP BY tz.zone_number, tz.zone_name, at.action_name
          ORDER BY tz.zone_number ASC
        `;

        const result = await sql.query(query, params);

        return res.status(200).json({
          success: true,
          heatmapData: result.rows
        });

      } catch (error) {
        console.error('Error fetching heatmap data:', error);
        return res.status(500).json({
          success: false,
          message: 'Error al obtener datos de mapa de calor'
        });
      }
    }

    // GET /api/heatmap/actions - Obtener tipos de acciones disponibles para mapas de calor
    if (path === '/api/heatmap/actions' && method === 'GET') {
      try {
        const result = await sql`
          SELECT 
            action_name,
            requires_zone,
            color,
            icon
          FROM action_types 
          WHERE requires_zone = true
          ORDER BY action_name ASC
        `;

        return res.status(200).json({
          success: true,
          actionTypes: result.rows
        });

      } catch (error) {
        console.error('Error fetching action types:', error);
        return res.status(500).json({
          success: false,
          message: 'Error al obtener tipos de acciones'
        });
      }
    }

    // GET /api/heatmap/summary - Resumen estadístico por jugadora y zona
    if (path === '/api/heatmap/summary' && method === 'GET') {
      try {
        const matchId = urlObj.searchParams.get('match_id');
        const teamId = urlObj.searchParams.get('team_id');

        if (!matchId || !teamId) {
          return res.status(400).json({
            success: false,
            message: 'match_id y team_id son requeridos'
          });
        }

        const result = await sql`
          SELECT 
            p.name as player_name,
            p.nickname,
            tz.zone_number,
            tz.zone_name,
            at.action_name,
            COUNT(ma.id) as action_count
          FROM match_actions ma
          JOIN players p ON ma.player_id = p.id
          JOIN tactical_zones tz ON ma.zone = tz.zone_number
          JOIN action_types at ON ma.action_type_id = at.id
          WHERE ma.match_id = ${matchId} AND ma.team_id = ${teamId}
            AND ma.zone IS NOT NULL
          GROUP BY p.id, p.name, p.nickname, tz.zone_number, tz.zone_name, at.action_name
          ORDER BY p.name ASC, tz.zone_number ASC
        `;

        return res.status(200).json({
          success: true,
          playerStats: result.rows
        });

      } catch (error) {
        console.error('Error fetching player stats:', error);
        return res.status(500).json({
          success: false,
          message: 'Error al obtener estadísticas de jugadoras'
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
