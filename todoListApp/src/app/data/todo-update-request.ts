export interface TodoUpdateRequest {
    id: number,
    title: string,
    description: string,
    completed: boolean,
    dueDate: string
}