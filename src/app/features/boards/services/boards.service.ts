import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { KanbanApiService } from './kanban-api.service';
import { map } from 'rxjs';

export interface Task {
  id: number;
  title: string;
  description: string;
  columnId: number;
}

export interface Column {
  id: number;
  title: string;
  board: {
    id: number;
    name: string;
  };
  tasks: Task[];
}

export interface Board {
  id: number;
  title: string;
  description: string;
  columns: Column[];
}

@Injectable({
  providedIn: 'root'
})
export class BoardsService {
  private readonly api = inject(KanbanApiService);
  private readonly _boards = signal<Board[]>([]);
  private readonly _currentBoard = signal<Board | null>(null);
  private readonly _columns = signal<Column[]>([]);
  private readonly _tasks = signal<Task[]>([]);

  readonly boards = computed(() => this._boards());
  readonly currentBoard = computed(() => this._currentBoard());
  readonly columns = computed(() => this._columns());
  readonly tasks = computed(() => this._tasks());

  constructor() {
    this.loadBoards();
  }

  private loadBoards(): void {
    this.api.getBoards().subscribe(boards => {
      this._boards.set(boards.map(board => ({
        id: board.id,
        title: board.title ?? '',
        description: board.description ?? '',
        columns: []
      })));
    });
  }

  loadBoard(id: number): void {
    this.api.getBoardById(id).subscribe(board => {
      this._currentBoard.set({
        id: board.id,
        title: board.title,
        description: board.description,
        columns: []
      });
      this.loadColumns();
    });
  }

  private loadColumns(): void {
    this.api.getColumns().subscribe(columns => {
      this._columns.set(columns.map(column => ({ ...column, tasks: [] })));
    });
  }

  private loadTasks(): void {
    this.api.getCards().subscribe(cards => {
      this._tasks.set(cards);
      this.updateColumnsWithTasks();
    });
  }

  private updateColumnsWithTasks(): void {
    const tasks = this._tasks();
    this._columns.update(columns =>
      columns.map(column => ({
        ...column,
        tasks: tasks.filter(task => task.columnId === column.id)
      }))
    );
  }

  createBoard(title: string, description:string): void {
    this.api.createBoard(title, description).subscribe(newBoard => {
      this._boards.update(boards => [...boards, {
        id: newBoard.id,
        title: newBoard.title ?? '',
        description: newBoard.description ?? '',
        columns: []
      }]);
    });
  }

  updateBoard(id: number, title: string): void {
    this.api.updateBoard(id, title).subscribe(updatedBoard => {
      this._boards.update(boards =>
        boards.map(b => b.id === id ? {
          id: updatedBoard.id,
          title: updatedBoard.title ?? '',
          description: updatedBoard.description ?? '',
          columns: b.columns
        } : b)
      );
      if (this._currentBoard()?.id === id) {
        this._currentBoard.set({
          id: updatedBoard.id,
          title: updatedBoard.title ?? '',
          description: updatedBoard.description ?? '',
          columns: []
        });
      }
    });
  }

  deleteBoard(id: number): void {
    this.api.deleteBoard(id).subscribe(() => {
      this._boards.update(boards => boards.filter(b => b.id !== id));
      if (this._currentBoard()?.id === id) {
        this._currentBoard.set(null);
      }
    });
  }

  createColumn(boardId: number, title: string, description: string): void {
    this.api.createColumn(boardId, title, description).subscribe(newColumn => {
      this._columns.update(columns => [...columns, { ...newColumn, tasks: [] }]);
    });
  }

  updateColumn(boardId: number, id: number, title: string): void {
    this.api.updateColumn(boardId, id, title).subscribe(updatedColumn => {
      this._columns.update(columns =>
        columns.map(c => c.id === id ? { ...updatedColumn, tasks: c.tasks } : c)
      );
    });
  }

  deleteColumn(boardId: number, id: number): void {
    this.api.deleteColumn(boardId, id).subscribe(() => {
      this._columns.update(columns => columns.filter(c => c.id !== id));
      this._tasks.update(tasks => tasks.filter(t => t.columnId !== id));
    });
  }

  addTask(columnId: number, task: Omit<Task, 'id' | 'columnId'>): void {
    const newCard = {
      title: task.title,
      description: task.description || '',
      columnId
    };

    this.api.createCard(newCard).subscribe(card => {
      this._tasks.update(tasks => [...tasks, card]);
      this.updateColumnsWithTasks();
    });
  }

  moveTask(task: Task, toColumnId: number): void {
    const request = {
      cardId: task.id,
      fromColumnId: task.columnId,
      toColumnId
    };

    this.api.moveCard(request).subscribe(() => {
      this._tasks.update(tasks =>
        tasks.map(t =>
          t.id === task.id
            ? { ...t, columnId: toColumnId }
            : t
        )
      );
      this.updateColumnsWithTasks();
    });
  }

  deleteTask(columnId: number, taskId: number): void {
    this.api.deleteCard(taskId).subscribe(() => {
      this._tasks.update(tasks => tasks.filter(t => t.id !== taskId));
      this.updateColumnsWithTasks();
    });
  }

  updateTask(taskId: number, task: Partial<Task>): void {
    this.api.updateCard(taskId, task).subscribe(updatedCard => {
      this._tasks.update(tasks =>
        tasks.map(t => t.id === taskId ? { ...t, ...updatedCard } : t)
      );
      this.updateColumnsWithTasks();
    });
  }
}
