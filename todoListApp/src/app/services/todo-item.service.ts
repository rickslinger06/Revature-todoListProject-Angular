import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TodoItemRequest } from '../data/todo-item-request';
import { TodoItemResponse } from '../data/todo-item-response';
import { TodoUpdateRequest } from '../data/todo-update-request';

@Injectable({
  providedIn: 'root'
})
export class TodoItemService {

  constructor(private http: HttpClient) { }

  baseUrl = 'http://localhost:8080/api/v1';

  getTodoItemsByUsername() {
    return this.http.get<TodoItemResponse[]>(`${this.baseUrl}/user/items`
      , { withCredentials: true }
    );
  }
  addToDoItem(todoItemRequest: TodoItemRequest) {
    return this.http.post<TodoItemResponse>(`${this.baseUrl}/user/add-item`, todoItemRequest,
      { withCredentials: true });

  }

  updateTodoItem(todoUpdateRequest: TodoUpdateRequest) {
    return this.http.put<TodoItemResponse>(`${this.baseUrl}/user/item/update`, todoUpdateRequest,
      { withCredentials: true });
  }

  deletedTodoItem(todoId: number) {
    return this.http.delete<String>(`${this.baseUrl}/user/item/delete/${todoId}`, { withCredentials: true });
  }

  closeTodoItem(todoId: number) {
    return this.http.patch<TodoItemResponse>(`${this.baseUrl}/user/item/${todoId}/close`,
      { withCredentials: true });
  }


  openClosedTodoItem(todoId: number) {
    return this.http.patch<TodoItemResponse>(`${this.baseUrl}/user/item/${todoId}/reopen`,
      { withCredentials: true });
  }

  getAllTodoItems() {
    return this.http.get<TodoItemResponse[]>(`${this.baseUrl}/admin/items/all`, { withCredentials: true });
  }


}
