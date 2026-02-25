import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { ResetPassword } from '../../data/reset-password';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.css']
})
export class PasswordResetComponent {
  resetForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private us: UserService) {
    this.resetForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required]
      },
      { validators: [this.matchPasswords] }
    );
  }

  // Custom validator for matching passwords
  matchPasswords(control: AbstractControl): ValidationErrors | null {
    const newPass = control.get('newPassword')?.value;
    const confirmPass = control.get('confirmPassword')?.value;

    // if one of them is empty, let the required validator handle it
    if (!newPass || !confirmPass) {
      return null;
    }

    return newPass === confirmPass ? null : { passwordsMismatch: true };
  }

  get f() {
    return this.resetForm.controls;
  }

  submit() {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.us.resetPassword(this.resetForm.value as ResetPassword).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Password reset successful'; // set message on frontend
        this.resetForm.reset();
        alert(this.successMessage);
        window.location.href = '/login';
      },
      error: (err) => {
        this.loading = false;
        console.error('Password reset error', err);
        this.errorMessage = 'Password reset failed. Please try again.';
      }
    });
  }
}