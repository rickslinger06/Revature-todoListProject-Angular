import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { SubTaskResponse } from '../../data/sub-task-response';
import { TodoItemResponse } from '../../data/todo-item-response';
import { UserResponse } from '../../data/user-response';
import { TodoItemService } from '../../services/todo-item.service';
import { UserService } from '../../services/user.service';
import { TodoItemComponent } from '../todo-item/todo-item.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TodoItemComponent, RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']  // <- styleUrls (plural)
})
export class DashboardComponent implements OnInit {

  todoItems: TodoItemResponse[] = [];       // user-specific items
  allTodoItems: TodoItemResponse[] = [];    // admin view
  subTasks: SubTaskResponse[] = [];
  todoItem?: TodoItemResponse;
  currentUser: UserResponse | null = null;


  constructor(
    private auth: AuthService,
    private route: Router,
    private todoService: TodoItemService,
    private us: UserService
  ) { }

  ngOnInit(): void {
    this.getCurrentUser();
  }

  private getCurrentUser() {
    const userId = this.auth.getUserId();
    if (!userId) {
      // no userId → force logout
      this.onLogOut();
      return;
    }

    this.us.getCurrentUser(userId).subscribe({
      next: (res) => {
        this.currentUser = res as UserResponse;

        // ✅ Only call the right endpoint based on role
        if (this.currentUser.role === 'ADMIN') {
          this.getAllTodoItems();
        } else {
          this.loadItems();
        }
      },
      error: (err) => {
        console.error('Error loading current user', err);
        this.onLogOut();
      }
    });
  }

  // user-specific items (by username)
  private loadItems() {
    this.todoService.getTodoItemsByUsername().subscribe({
      next: (res) => {
        this.todoItems = res;

      },
      error: (err) => console.error('Error loading user items', err)
    });
  }

  // admin: all items
  private getAllTodoItems() {
    this.todoService.getAllTodoItems().subscribe({
      next: (res) => {
        this.allTodoItems = res;
      },
      error: (err) => console.error('Error loading all items', err)
    });
  }

  // what the child component sees
  get itemsForView(): TodoItemResponse[] {
    if (!this.currentUser) return [];
    return this.currentUser.role === 'ADMIN'
      ? this.allTodoItems
      : this.todoItems;
  }

  onLogOut(): void {
    this.auth.logout();
    this.route.navigate(['/login']);
  }

  // appears instantly (for logged-in user)
  onItemAdded(item: TodoItemResponse) {
    // user created a new item → add to user list
    this.todoItems.push(item);

    // if admin is viewing all items, also push into allTodoItems
    if (this.currentUser?.role === 'ADMIN') {
      this.allTodoItems.push(item);
    }
  }

  onItemDeleted(toDoId: number) {
    this.todoItems = this.todoItems.filter(item => item.todoId !== toDoId);
    this.allTodoItems = this.allTodoItems.filter(item => item.todoId !== toDoId);
  }
}