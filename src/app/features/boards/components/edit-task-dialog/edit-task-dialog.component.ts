import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Task } from '../../services/boards.service';

export interface EditTaskDialogData {
  task?: Task;
  title?: string;
  isColumn?: boolean;
}

@Component({
  selector: 'app-edit-task-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ getDialogTitle() }}</h2>

    <form [formGroup]="taskForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Título</mat-label>
          <input matInput formControlName="title" required />
          @if (taskForm.get('title')?.hasError('required') &&
          taskForm.get('title')?.touched) {
          <mat-error>Título é obrigatório</mat-error>
          }
        </mat-form-field>

        @if (this.data.isColumn) {
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Descrição</mat-label>
          <textarea matInput formControlName="description" rows="3" required></textarea>
          @if (taskForm.get('description')?.hasError('required') &&
          taskForm.get('description')?.touched) {
          <mat-error>Descrição é obrigatória</mat-error>
          }
        </mat-form-field>
        } @else {
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Descrição</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea>
        </mat-form-field>
        }
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" [mat-dialog-close]>Cancelar</button>
        <button
          mat-flat-button
          color="primary"
          type="submit"
          [disabled]="taskForm.invalid"
        >
          {{ getButtonText() }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        max-width: 500px;
      }

      .full-width {
        width: 100%;
      }

      mat-form-field {
        margin-bottom: 1rem;
      }

      mat-dialog-content {
        padding-top: 1rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditTaskDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<EditTaskDialogComponent>);
  public readonly data = inject<EditTaskDialogData>(MAT_DIALOG_DATA) || {};

  getDialogTitle(): string {
    if (this.data.isColumn) {
      return this.data.title ? 'Editar Coluna' : 'Nova Coluna';
    }
    return this.isNewTask ? 'Nova Tarefa' : 'Editar Tarefa';
  }

  getButtonText(): string {
    if (this.data.isColumn) {
      return this.data.title ? 'Salvar' : 'Criar';
    }
    return this.isNewTask ? 'Criar' : 'Salvar';
  }
  private readonly fb = inject(FormBuilder);

  readonly isNewTask = !this.data.task;
  readonly taskForm = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    labels: [<string[]>[]],
  });

  get labels(): string[] {
    return this.taskForm.get('labels')?.value ?? [];
  }

  constructor() {
    if (this.data.isColumn && this.data.title) {
      this.taskForm.patchValue({ title: this.data.title });
    } else if (!this.isNewTask && this.data.task) {
      this.taskForm.patchValue(this.data.task);
    }
    // Se for coluna, torna description obrigatório
    if (this.data.isColumn) {
      this.taskForm.get('description')?.setValidators(Validators.required);
      this.taskForm.get('description')?.updateValueAndValidity();
    }
  }

  addLabel(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      const currentLabels = this.labels;
      this.taskForm.get('labels')?.setValue([...currentLabels, value]);
      event.chipInput!.clear();
    }
  }

  removeLabel(label: string): void {
    const currentLabels = this.labels;
    this.taskForm
      .get('labels')
      ?.setValue(currentLabels.filter((l) => l !== label));
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      this.dialogRef.close(this.taskForm.value);
    }
  }
}
