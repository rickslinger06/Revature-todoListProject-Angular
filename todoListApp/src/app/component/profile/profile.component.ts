import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { UserResponse } from '../../data/user-response';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLinkActive, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {

  constructor(private auth: AuthService, private userService: UserService) {

  }

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

}
