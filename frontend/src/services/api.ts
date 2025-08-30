import axios from 'axios';

// Create axios instance with default configuration
const API = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials: { username: string; password: string }) => {
    const response = await API.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData: { username: string; email: string; password: string }) => {
    const response = await API.post('/auth/register', userData);
    return response.data;
  },
  logout: async () => {
    const response = await API.post('/auth/logout');
    return response.data;
  },
};

// Teams API
export const teamsAPI = {
  getAll: async () => {
    const response = await API.get('/teams');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await API.get(`/teams/${id}`);
    return response.data;
  },
  create: async (teamData: any) => {
    const response = await API.post('/teams', teamData);
    return response.data;
  },
  update: async (id: number, teamData: any) => {
    const response = await API.put(`/teams/${id}`, teamData);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await API.delete(`/teams/${id}`);
    return response.data;
  },
};

// Players API
export const playersAPI = {
  getAll: async () => {
    const response = await API.get('/players');
    return response.data;
  },
  getByTeam: async (teamId: number) => {
    const response = await API.get(`/players/team/${teamId}`);
    return response.data;
  },
  create: async (playerData: any) => {
    const response = await API.post('/players', playerData);
    return response.data;
  },
  update: async (id: number, playerData: any) => {
    const response = await API.put(`/players/${id}`, playerData);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await API.delete(`/players/${id}`);
    return response.data;
  },
};

// Matches API
export const matchesAPI = {
  getAll: async () => {
    const response = await API.get('/matches');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await API.get(`/matches/${id}`);
    return response.data;
  },
  create: async (matchData: any) => {
    const response = await API.post('/matches', matchData);
    return response.data;
  },
  update: async (id: number, matchData: any) => {
    const response = await API.put(`/matches/${id}`, matchData);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await API.delete(`/matches/${id}`);
    return response.data;
  },
};

// Tournaments API
export const tournamentsAPI = {
  getAll: async () => {
    const response = await API.get('/tournaments');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await API.get(`/tournaments/${id}`);
    return response.data;
  },
  create: async (tournamentData: any) => {
    const response = await API.post('/tournaments', tournamentData);
    return response.data;
  },
  update: async (id: number, tournamentData: any) => {
    const response = await API.put(`/tournaments/${id}`, tournamentData);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await API.delete(`/tournaments/${id}`);
    return response.data;
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await API.get('/health');
    return response.data;
  },
};

export default API;
