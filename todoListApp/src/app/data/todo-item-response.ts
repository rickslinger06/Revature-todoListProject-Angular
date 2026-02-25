import { SubTaskResponse } from "./sub-task-response"

export interface TodoItemResponse {
    todoId: number,
    title: string,
    description: string,
    dueDate: string
    completed: boolean
    closed: boolean
    createdAt: string
    updatedAt: string
    userId: string
    subTasks: SubTaskResponse[]

}
