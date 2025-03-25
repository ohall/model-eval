import axios from 'axios';
import open from 'open';
import http from 'http';
import { URL } from 'url';
import Conf from 'conf';

const config = new Conf({
  projectName: 'model-eval-cli'
});

interface AuthToken {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
    picture?: string;
    provider: 'google';
  };
}

export class AuthService {
  private static readonly GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
  private static readonly API_URL = process.env.API_URL || 'http://localhost:3000';
  private static readonly REDIRECT_PORT = 3333;
  private static readonly REDIRECT_URI = `http://localhost:${AuthService.REDIRECT_PORT}/callback`;

  private static getStoredToken(): string | null {
    return config.get('auth.token') as string | null;
  }

  private static setStoredToken(token: string): void {
    config.set('auth.token', token);
  }

  private static clearStoredToken(): void {
    config.delete('auth.token');
  }

  static async getAuthToken(): Promise<string> {
    const token = this.getStoredToken();
    if (token) {
      try {
        // Validate token
        await axios.get(`${this.API_URL}/api/auth/validate`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return token;
      } catch (error) {
        this.clearStoredToken();
      }
    }
    return this.login();
  }

  private static async login(): Promise<string> {
    return new Promise((resolve, reject) => {
      // Create local server to handle OAuth callback
      const server = http.createServer(async (req, res) => {
        try {
          const url = new URL(req.url!, `http://localhost:${this.REDIRECT_PORT}`);
          
          if (url.pathname === '/callback') {
            const credential = url.searchParams.get('credential');
            
            if (!credential) {
              throw new Error('No credential received');
            }

            // Exchange credential for token
            const response = await axios.post<AuthToken>(`${this.API_URL}/api/auth/google`, {
              credential
            });

            const { token } = response.data;
            this.setStoredToken(token);

            // Send success response and close server
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end('<h1>Authentication successful!</h1><p>You can close this window and return to the CLI.</p>');
            server.close();
            resolve(token);
          }
        } catch (error) {
          console.error('Authentication error:', error);
          res.writeHead(500, { 'Content-Type': 'text/html' });
          res.end('<h1>Authentication failed!</h1><p>Please try again.</p>');
          server.close();
          reject(error);
        }
      });

      // Start server
      server.listen(this.REDIRECT_PORT, () => {
        // Open browser for Google OAuth
        const authUrl = `https://accounts.google.com/gsi/select?client_id=${this.GOOGLE_CLIENT_ID}&ux_mode=redirect&redirect_uri=${this.REDIRECT_URI}&scope=email+profile`;
        open(authUrl);
      });

      // Handle server errors
      server.on('error', (error) => {
        console.error('Server error:', error);
        reject(error);
      });
    });
  }

  static async logout(): Promise<void> {
    this.clearStoredToken();
  }
} 