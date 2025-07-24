import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Task } from '../../services/boards.service';

export interface DeleteDialogData {
  title: string;
  type: 'tarefa' | 'coluna';
}

@Component({
  selector: 'app-delete-task-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Confirmar Exclusão</h2>
    
    <mat-dialog-content>
      <p>Tem certeza que deseja excluir {{ typeText() }} "{{ data.title }}"?</p>
      <p class="warning-text">Esta ação não pode ser desfeita.</p>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Cancelar</button>
      <button
        mat-flat-button
        color="warn"
        [mat-dialog-close]="true"
      >
        Excluir
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      max-width: 400px;
    }

    .warning-text {
      color: #dc2626;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeleteTaskDialogComponent {
  readonly data = inject<DeleteDialogData>(MAT_DIALOG_DATA);

  typeText(): 'a tarefa' | 'a coluna' {
    return this.data.type === 'tarefa' ? 'a tarefa' : 'a coluna';
  }
}