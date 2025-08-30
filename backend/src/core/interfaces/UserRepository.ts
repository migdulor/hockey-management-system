export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'coach';
  plan: '2_teams' | '3_teams' | '5_teams';
  first_name: string;
  last_name: string;
  is_active: boolean;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDTO {
  email: string;
  password_hash: string;
  role: 'admin' | 'coach';
  plan: '2_teams' | '3_teams' | '5_teams';
  first_name: string;
  last_name: string;
}

export interface UpdateUserDTO {
  first_name?: string;
  last_name?: string;
  plan?: '2_teams' | '3_teams' | '5_teams';
  is_active?: boolean;
}

export interface UserRepository {
  create(user: CreateUserDTO): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  updateLastLogin(id: string): Promise<void>;
  update(id: string, data: UpdateUserDTO): Promise<User | null>;
  findAll(): Promise<User[]>;
  deactivate(id: string): Promise<void>;
  activate(id: string): Promise<void>;
  emailExists(email: string): Promise<boolean>;
  countActiveTeams(userId: string): Promise<number>;
}
