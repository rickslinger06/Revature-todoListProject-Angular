import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SubTaskResponse } from '../../data/sub-task-response';
import { SubTaskService } from '../../services/sub-task.service';

@Component({
  selector: 'app-sub-task-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sub-task.component.html',
  styleUrls: ['./sub-task.component.css']
})
export class SubTaskComponent {

  @Input({ required: true }) todoId?: number;
  @Output() saved = new EventEmitter<SubTaskResponse>();
  @Output() closed = new EventEmitter<void>();


  form: FormGroup;
  loading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private subTaskService: SubTaskService
  ) {
    this.form = this.fb.group({
      description: ['', Validators.required]
    });
  }

  save() {
    if (this.form.invalid || !this.todoId) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    const description = this.form.value.description as string;

    this.subTaskService.addSubTaskByTodoId(this.todoId, { description }).subscribe(
      {
        next: (res) => {
          this.loading = false;
          this.saved.emit(res);
          this.form.reset();
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err?.error?.message || 'Failed to add sub-task. Please try again.';
        }
      }
    )
  }

  cancel() {
    this.closed.emit();
  }
}