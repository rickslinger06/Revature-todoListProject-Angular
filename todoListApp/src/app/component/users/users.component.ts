import { NgClass } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserResponse } from '../../data/user-response';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [NgClass, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  users = signal<UserResponse[]>([]);

  // pagination
  currentPage = signal(0);
  pageSize = signal(5);

  isLastPage = signal(false);
  isFirstPage = signal(true);

  totalPages = signal(0);
  totalElement = signal(0);


  constructor(private us: UserService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.us.getAllUsers(this.currentPage(), this.pageSize()).subscribe({
      next: (res: any) => {
        this.users.set(res.content);
        this.isFirstPage.set(res.first);
        this.isLastPage.set(res.last);
        this.totalPages.set(res.totalPages);
        this.totalElement.set(res.totalElements);

        console.log('Loaded users for page', this.currentPage, res);
      },
      error: (err) => console.error('Error loading users', err)
    });
  }

  previousPage() {
    if (!this.isFirstPage()) {
      this.currentPage.update(v => v - 1);
      this.loadUsers();
    }
  }

  nextPage() {
    if (!this.isLastPage()) {
      this.currentPage.update(v => v + 1);
      this.loadUsers();
    }
  }

  toggleRole(userId: string, role: string | undefined) {
    const toRole = role === 'USER' ? 'admin' : 'user';
    const ok = confirm("change user role to " + toRole + "?")

    if (ok) {
      this.us.changeUserRole(userId).subscribe({
        next: () => {
          console.log('Role toggled successfully');
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error toggling role', err);
        }
      });
    }

  }


}