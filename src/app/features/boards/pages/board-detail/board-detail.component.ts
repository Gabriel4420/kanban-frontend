import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

import { BoardsService, Task, Column } from '../../services/boards.service';
import { EditTaskDialogComponent } from '../../components/edit-task-dialog/edit-task-dialog.component';
import { DeleteTaskDialogComponent } from '../../components/delete-task-dialog/delete-task-dialog.component';

@Component({
  selector: 'app-board-detail',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatMenuModule,
    MatDialogModule,
    DragDropModule
  ],
  template: `
    <div class="board-container">
      <header class="board-header">
        <a mat-button routerLink="/boards">
          <mat-icon>arrow_back</mat-icon>
          Voltar aos quadros
        </a>

        @if (currentBoard(); as board) {
          <h1>{{ board.title }}</h1>
        }
      </header>

      <div class="board-actions">
        <button mat-raised-button color="primary" (click)="addColumn()">
          <mat-icon>add</mat-icon>
          Adicionar Coluna
        </button>
      </div>

      <div class="columns-container" cdkDropListGroup>
        @for (column of columns(); track column.id) {
            <div class="column">
              <div class="column-header">
                <h2>{{ column.title }}</h2>
                <div class="column-actions">
                  <button
                    mat-icon-button
                    [matMenuTriggerFor]="columnMenu"
                  >
                    <mat-icon>more_vert</mat-icon>
                  </button>

                  <mat-menu #columnMenu="matMenu">
                    <button mat-menu-item (click)="editColumn(column)">
                      <mat-icon>edit</mat-icon>
                      <span>Editar</span>
                    </button>
                    <button mat-menu-item class="delete-button" (click)="deleteColumn(column)">
                      <mat-icon>delete</mat-icon>
                      <span>Excluir</span>
                    </button>
                  </mat-menu>
                </div>
              </div>

              <div
                class="tasks-list"
                cdkDropList
                [cdkDropListData]="column.id"
                (cdkDropListDropped)="onTaskDrop($event)"
              >
                @for (task of column.tasks; track task.id) {
                  <mat-card
                    class="task-card"
                    cdkDrag
                    [cdkDragData]="task"
                  >
                    <mat-card-header>
                      <mat-card-title>{{ task.title }}</mat-card-title>

                      <button
                        mat-icon-button
                        [matMenuTriggerFor]="taskMenu"
                        (click)="$event.stopPropagation()"
                      >
                        <mat-icon>more_vert</mat-icon>
                      </button>

                      <mat-menu #taskMenu="matMenu">
                        <button mat-menu-item (click)="editTask(column.id, task)">
                          <mat-icon>edit</mat-icon>
                          <span>Editar</span>
                        </button>
                        <button mat-menu-item class="delete-button" (click)="deleteTask(column.id, task)">
                          <mat-icon>delete</mat-icon>
                          <span>Excluir</span>
                        </button>
                      </mat-menu>
                    </mat-card-header>

                    @if (task.description) {
                      <mat-card-content>
                        {{ task.description }}
                      </mat-card-content>
                    }


                  </mat-card>
                }

                @if (!column.tasks.length) {
                  <div class="empty-column">No tasks yet</div>
                }
              </div>

              <button
                mat-button
                class="add-task-button"
                (click)="addTask(column.id)"
              >
                <mat-icon>add</mat-icon>
                Adicionar Tarefa
              </button>
            </div>
          }
        </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      padding: 2rem;
    }

    .board-header {
      margin-bottom: 1rem;

      h1 {
        font-family: var(--font-family-heading);
        color: var(--gray-900);
        margin: 1rem 0;
      }
    }

    .board-actions {
      margin-bottom: 1.5rem;
      display: flex;
      justify-content: flex-end;
    }

    .columns-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
      align-items: start;
    }

    .column {
      background-color: #f5f5f5;
      border-radius: 8px;
      padding: 1rem;

      .column-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;

        h2 {
          font-family: var(--font-family-heading);
          color: #121212;
          font-size: 1.25rem;
          margin: 0;
        }

        .column-actions {
          display: flex;
          gap: 0.5rem;
        }
      }
    }

    .tasks-list {
      min-height: 100px;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .task-card {
      cursor: move;

      &:hover {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
    }



    .empty-column {
      text-align: center;
      padding: 1rem;
      color: var(--gray-700);
      font-style: italic;
    }

    .add-task-button {
      width: 100%;
      margin-top: 1rem;
    }

    .delete-button {
      color: #dc2626;
    }

    .cdk-drag-preview {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .cdk-drag-placeholder {
      opacity: 0.3;
    }

    .cdk-drag-animating {
      transition: transform 250ms ease;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardDetailComponent implements OnInit {
  private readonly editColumnDialog = inject(MatDialog);
  private readonly deleteColumnDialog = inject(MatDialog);
  private readonly boardsService = inject(BoardsService);
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);

  readonly columns = this.boardsService.columns;
  readonly currentBoard = this.boardsService.currentBoard;
  boardId: number = 0;

  ngOnInit(): void {
    this.boardId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.boardId) {
      this.boardsService.loadBoard(this.boardId);
    }
  }

  onTaskDrop(event: CdkDragDrop<number>): void {
    if (event.previousContainer === event.container) return;

    const task = event.item.data as Task;
    this.boardsService.moveTask(task, event.container.data);
  }

  addTask(columnId: number): void {
    const dialogRef = this.dialog.open(EditTaskDialogComponent, {
      data: {} // Passa um objeto vazio para indicar que é uma nova tarefa
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.boardsService.addTask(columnId, result);
      }
    });
  }

  editTask(columnId: number, task: Task): void {
    const dialogRef = this.dialog.open(EditTaskDialogComponent, {
      data: { task }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const updatedTask = {
          title: result.title,
          description: result.description,
          columnId: columnId
        };
        this.boardsService.updateTask(task.id, updatedTask);
      }
    });
  }

  deleteTask(columnId: number, task: Task): void {
    const dialogRef = this.dialog.open(DeleteTaskDialogComponent, {
      data: { title: task.title, type: 'tarefa' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.boardsService.deleteTask(columnId, task.id);
      }
    });
  }

  editColumn(column: Column): void {
    const dialogRef = this.editColumnDialog.open(EditTaskDialogComponent, {
      data: { title: column.title, isColumn: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.boardsService.updateColumn(this.boardId, column.id, result.title);
      }
    });
  }

  addColumn(): void {
    const dialogRef = this.dialog.open(EditTaskDialogComponent, {
      data: { isColumn:true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.title && result.description) {
        this.boardsService.createColumn(this.boardId, result.title, result.description);
      }
    });
  }

  deleteColumn(column: Column): void {
    const dialogRef = this.deleteColumnDialog.open(DeleteTaskDialogComponent, {
      data: { title: column.title, type: 'coluna' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.boardsService.deleteColumn(this.boardId, column.id);
      }
    });
  }
}
