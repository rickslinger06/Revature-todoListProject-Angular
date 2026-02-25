import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { UserResponse } from '../../data/user-response';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NgIf, RouterLink,
    RouterLinkActive, ReactiveFormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isOpen = false;

  constructor(private auth: AuthService, private router: Router, private userService: UserService) { }
  user?: UserResponse;

  ngOnInit(): void {
    const userId = this.auth.getUserId();
    if (userId) {
      this.userService.getCurrentUser(userId).subscribe({
        next: (res) => this.user = res as UserResponse,
        error: (err) => console.log(err)
      });
    }
  }


  get loggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  toggle() { this.isOpen = !this.isOpen; }
  close() { this.isOpen = false; }

  logout() {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => {
        // even if backend fails, clear local state and go to login
        this.auth.clearToken();
        window.location.href = '/logout';
      }
    });
  }

  bellClick() {
    alert("Go back to work!")
  }


}
