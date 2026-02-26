import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SubTaskResponse } from '../../data/sub-task-response';
import { SubTaskService } from '../../services/sub-task.service';

@Component({
  selector: 'app-edit-sub-task',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-sub-task.component.html',
  styleUrls: ['./edit-sub-task.component.css']
})
export class EditSubTaskComponent {

  @Input() subTask!: SubTaskResponse;
  @Output() updated = new EventEmitter<SubTaskResponse>();
  @Output() closed = new EventEmitter<void>();

  form: FormGroup;
  loading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private subTaskService: SubTaskService
  ) {
    this.form = this.fb.group({
      description: ['', [Validators.required, Validators.maxLength(120)]]
    });
  }

  ngOnInit() {
    // prefill the form with the current description
    this.form.patchValue({
      description: this.subTask.description
    });
  }

  save() {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    const description = this.form.value.description as string;
    console.log("Description value" + description)

    this.subTaskService.editSubTask(this.subTask.subTaskId, { description }).subscribe({

      next: (res) => {
        this.loading = false;
        console.log("Description res" + res)
        // send updated subtask to parent
        this.updated.emit(res);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Failed to edit sub-task. Please try again.';
      }
    });
  }

  cancel() {
    this.closed.emit();
  }
}