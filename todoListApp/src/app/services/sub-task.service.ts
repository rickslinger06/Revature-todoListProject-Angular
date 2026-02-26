import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SubTaskResponse } from '../data/sub-task-response';
import { SubTaskRequest } from '../data/subtask-request';


@Injectable({
  providedIn: 'root'
})
export class SubTaskService {
  constructor(private http: HttpClient) { }

  baseUrl = 'http://localhost:8080/api/v1';

  getSubTaskByTodoId(todoId: number) {
    return this.http.get<SubTaskResponse[]>(`${this.baseUrl}/user/task/${todoId}/items`
      , { withCredentials: true }
    );
  }

  addSubTaskByTodoId(todoId: number, subTask: SubTaskRequest) {
    return this.http.post<SubTaskResponse>(`${this.baseUrl}/user/task/add/${todoId}`, subTask, {
      withCredentials: true
    })
  }

  closeSubTask(subTaskId: number) {
    return this.http.put<SubTaskResponse>(`${this.baseUrl}/user/task/update/${subTaskId}`,
      { withCredentials: true })
  }

  editSubTask(subTaskId: number, subTaskReq: SubTaskRequest) {
    return this.http.patch<SubTaskResponse>(`${this.baseUrl}/user/task/edit/${subTaskId}`, subTaskReq,
      { withCredentials: true }
    )
  }

  deleteSubtask(subtaskId: number) {
    return this.http.delete<string>(`${this.baseUrl}/user/task/delete/${subtaskId}`, {
      withCredentials: true,
      responseType: 'text' as 'json'
    });
  }


}