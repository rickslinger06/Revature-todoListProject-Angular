import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { jwtDecode } from "jwt-decode";
import { Observable, tap } from 'rxjs';
import { AuthResponse } from '../data/auth-response';
import { RegisterRequest } from '../data/register-request';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private accessToken: string | null = null;
  private readonly storageKey = 'accessToken';
  baseUrl = 'http://localhost:8080/api/v1';

  constructor(private http: HttpClient) {
    this.accessToken = localStorage.getItem(this.storageKey);
  }

  login(username: string, password: string) {
    return this.http
      .post<AuthResponse>(
        `${this.baseUrl}/auth/authenticate`,
        { username, password },
        { withCredentials: true }
      )
      .pipe(
        tap((res) => {
          this.setToken(res.accessToken);
        })
      );
  }

  refresh() {
    return this.http
      .post<AuthResponse>(
        `${this.baseUrl}/auth/refresh`,
        {},
        { withCredentials: true }
      )
      .pipe(
        tap((res) => {
          this.setToken(res.accessToken);
        })
      );
  }

  logout() {
    return this.http
      .post<void>(`${this.baseUrl}/auth/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.clearToken();
        })
      );


  }

  getToken(): string | null {
    if (this.accessToken == null) {
      return localStorage.getItem(this.storageKey);
    }
    return this.accessToken;
  }

  setToken(token: string | null) {
    this.accessToken = token;
    if (token) localStorage.setItem(this.storageKey, token);
    else localStorage.removeItem(this.storageKey);
  }

  clearToken() {
    this.accessToken = null;
    localStorage.removeItem(this.storageKey);
  }

  isLoggedIn(): boolean {
    // use in-memory first, fallback to storage
    return !!this.accessToken || !!localStorage.getItem(this.storageKey);
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;

    const decoded: any = jwtDecode(token);

    // Adjust this depending on your token structure
    return decoded.role || decoded.roles?.[0] || null;
  }


  getUserId() {
    const token = this.getToken();
    if (!token) return null;

    const decoded: any = jwtDecode(token);
    return decoded.sub || null;
  }


  register(request: RegisterRequest): Observable<any> {
    return this.http.post(`http://localhost:8080/api/v1/auth/register`, request);

  }

}
