import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ResetPassword } from '../data/reset-password';

@Injectable({
  providedIn: 'root'
})
export class UserService implements OnInit {

  constructor(private auth: AuthService, private http: HttpClient) { }

  baseUrl = 'http://localhost:8080/api/v1';

  ngOnInit(): void {
  }

  getCurrentUser<UserResponse>(userId: number) {
    return this.http.get(`${this.baseUrl}/user/${userId}`,
      { withCredentials: true }
    );
  }

  getUserById(id: string) {
    return this.http.get(`${this.baseUrl}/user/${id}`,
      { withCredentials: true }
    );
  }

  updateUser(id: string, userData: any) {
    return this.http.put(`${this.baseUrl}/users/${id}`, userData, {
      withCredentials: true
    });
  }

  deleteUser(id: string) {
    return this.http.delete(`${this.baseUrl}/users/${id}`, {
      withCredentials: true
    }

    );
  }

  getAllUsers(page: number, size: number): Observable<any[]> {
    return this.http
      .get<any>(`${this.baseUrl}/admin/users`, {
        params: {
          page: page.toString(),
          size: size.toString()
        },
        withCredentials: true
      });

  }

  changeUserRole(userId: string) {
    return this.http.put(`${this.baseUrl}/admin/${userId}/change-role`,
      { withCredential: true });
  }

  resetPassword(resetPassword: ResetPassword) {
    return this.http.patch(`${this.baseUrl}/user/password-reset`, resetPassword, {
      withCredentials: true
    })

  }


}
