import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, signal, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TodoItemResponse } from '../../data/todo-item-response';
import { TodoUpdateRequest } from '../../data/todo-update-request';
import { TodoItemService } from '../../services/todo-item.service';


@Component({
  selector: 'app-todo-edit-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './todo-edit-modal.component.html'
})
export class TodoEditModalComponent implements OnChanges {
  @Input({ required: true }) item!: TodoItemResponse;
  @Output() closed = new EventEmitter<void>();
  @Output() updated = new EventEmitter<TodoItemResponse>();

  form: FormGroup;
  errorMsg = signal("");

  constructor(private fb: FormBuilder, private ts: TodoItemService) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      dueDate: ['', Validators.required]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['item'] && this.item) {
      this.form.patchValue({
        title: this.item.title,
        description: this.item.description,
        dueDate: this.item.dueDate?.substring(0, 10) || ''
      });
    }
  }

  save(): void {
    if (this.form.invalid || !this.item) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;

    const req: TodoUpdateRequest = {
      id: this.item.todoId,
      title: value.title,
      description: value.description,
      dueDate: value.dueDate,
      completed: this.item.completed
    };

    this.ts.updateTodoItem(req).subscribe({
      next: (res) => {
        this.updated.emit(res);
      },
      error: (err) => {
        this.errorMsg =
          err.error?.message || this.errorMsg.set('Something went wrong while updating the item.');
      }
    });
  }

  cancel(): void {
    this.closed.emit();
  }
}