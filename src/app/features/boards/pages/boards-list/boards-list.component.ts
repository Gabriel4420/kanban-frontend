import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

import { BoardsService } from '../../services/boards.service';

@Component({
  selector: 'app-boards-list',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  template: `
    <div class="boards-container">
      <h1>My Boards</h1>

      <div class="boards-grid">
        @for (board of boards(); track board.id) {
          <mat-card class="board-card">
            <mat-card-header>
              <mat-card-title>{{ board.title }}</mat-card-title>
            </mat-card-header>

            <mat-card-actions>
              <a mat-button [routerLink]="['/boards', board.id]">
                <mat-icon>launch</mat-icon>
                Open Board
              </a>
            </mat-card-actions>
          </mat-card>
        }

        <mat-card class="board-card new-board" (click)="createBoard()">
          <mat-card-content class="new-board-content">
            <mat-icon>add</mat-icon>
            <span>Create New Board</span>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      padding: 2rem;
    }

    h1 {
      font-family: var(--font-family-heading);
      color: var(--gray-900);
      margin-bottom: 2rem;
    }

    .boards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .board-card {
      cursor: pointer;
      transition: transform 0.2s ease-in-out;

      &:hover {
        transform: translateY(-4px);
      }
    }

    .new-board {
      border: 2px dashed var(--gray-400);
      background-color: transparent;

      .new-board-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        color: var(--gray-700);
        gap: 0.5rem;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardsListComponent implements OnInit {
  private readonly boardsService = inject(BoardsService);
  private readonly dialog = inject(MatDialog);

  readonly boards = this.boardsService.boards;

  ngOnInit(): void {
    this.boardsService.loadBoard;
  }

  createBoard(): void {
    const dialogRef = this.dialog.open(CreateBoardDialogComponent);

    dialogRef.afterClosed().subscribe(({ title, description }: { title: string, description: string }) => {
      if (title && description) {
        this.boardsService.createBoard(title, description);
      }
    });
  }
}

@Component({
  selector: 'app-create-board-dialog',
  standalone: true,
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, FormsModule],
  template: `
    <h2 mat-dialog-title>Criar nova Lousa</h2>
    <mat-dialog-content>
      <mat-form-field>
        <mat-label>Nome da Lousa</mat-label>
        <input matInput [(ngModel)]="boardName" placeholder="Minha nova Lousa">
      </mat-form-field>
      <mat-form-field>
        <mat-label>Descrição</mat-label>
        <textarea matInput [(ngModel)]="boardDescription" placeholder="Descrição da Lousa"></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-button [mat-dialog-close]="{ title: boardName, description: boardDescription }" color="primary" [disabled]="!boardName">
        Criar
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-form-field {
      width: 100%;
      min-width: 300px;
    }

    mat-dialog-actions {
      padding: 1rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateBoardDialogComponent {
  boardName = '';
  boardDescription = '';
}

