import axios, { AxiosInstance } from 'axios';
import { AuthService } from './auth';

export class ApiService {
  private static instance: ApiService;
  private api: AxiosInstance;

  private constructor() {
    this.api = axios.create({
      baseURL: process.env.API_URL || 'http://localhost:3000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.api.interceptors.request.use(async (config) => {
      const token = await AuthService.getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // Prompts
  async getPrompts() {
    const response = await this.api.get('/prompts');
    return response.data;
  }

  async getPrompt(id: string) {
    const response = await this.api.get(`/prompts/${id}`);
    return response.data;
  }

  async createPrompt(data: { name: string; content: string; description?: string }) {
    const response = await this.api.post('/prompts', data);
    return response.data;
  }

  async updatePrompt(id: string, data: { name?: string; content?: string; description?: string }) {
    const response = await this.api.put(`/prompts/${id}`, data);
    return response.data;
  }

  async deletePrompt(id: string) {
    const response = await this.api.delete(`/prompts/${id}`);
    return response.data;
  }

  // Evaluations
  async getEvaluations() {
    const response = await this.api.get('/evaluations');
    return response.data;
  }

  async getEvaluation(id: string) {
    const response = await this.api.get(`/evaluations/${id}`);
    return response.data;
  }

  async createEvaluation(data: { promptId: string; modelId: string; parameters?: Record<string, any> }) {
    const response = await this.api.post('/evaluations', data);
    return response.data;
  }

  async getEvaluationResults(id: string) {
    const response = await this.api.get(`/evaluations/${id}/results`);
    return response.data;
  }
} 