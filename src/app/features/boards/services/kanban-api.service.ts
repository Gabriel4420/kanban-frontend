import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Board {
  id: number;
  title: string;
  description: string;
  columns: Column[];
}

export interface Column {
  id: number;
  title: string;
  board: {
    id: number;
    name: string;
  };
}

export interface Card {
  id: number;
  title: string;
  description: string;
  columnId: number;
}

export interface MoveCardRequest {
  cardId: number;
  fromColumnId: number;
  toColumnId: number;
}

@Injectable({
  providedIn: 'root'
})
export class KanbanApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000';

  // Endpoints de Board
  getBoards(): Observable<Board[]> {
    return this.http.get<Board[]>(`${this.apiUrl}/board`);
  }

  getBoardById(id: number): Observable<Board> {
    return this.http.get<Board>(`${this.apiUrl}/board/${id}`);
  }

  createBoard(title: string, description:string): Observable<Board> {
    return this.http.post<Board>(`${this.apiUrl}/board`, { title , description});
  }

  updateBoard(id: number, title: string): Observable<Board> {
    return this.http.put<Board>(`${this.apiUrl}/board/editBoard/${id}`, { title });
  }

  deleteBoard(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/board/removeBoard/${id}`);
  }

  // Endpoints de Colunas
  getColumns(): Observable<Column[]> {
    return this.http.get<Column[]>(`${this.apiUrl}/columns`);
  }

  getColumnById(id: number): Observable<Column> {
    return this.http.get<Column>(`${this.apiUrl}/columns/${id}`);
  }

  createColumn(boardId: number, title: string, description: string): Observable<Column> {
    return this.http.post<Column>(`${this.apiUrl}/columns`, { boardId, title, description });
  }

  updateColumn(boardId: number, id: number, title: string): Observable<Column> {
    return this.http.put<Column>(`${this.apiUrl}/boards/${boardId}/columns/editColumn/${id}`, { title });
  }

  deleteColumn(boardId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/columns/removeColumn/${id}`);
  }

  // Endpoints de Cartões
  getCards(): Observable<Card[]> {
    return this.http.get<Card[]>(`${this.apiUrl}/cards`);
  }

  getCardById(id: number): Observable<Card> {
    return this.http.get<Card>(`${this.apiUrl}/cards/${id}`);
  }

  createCard(card: Omit<Card, 'id'>): Observable<Card> {
    return this.http.post<Card>(`${this.apiUrl}/cards`, card);
  }

  moveCard(request: MoveCardRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/cards/move`, request);
  }

  deleteCard(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/cards/${id}`);
  }

  updateCard(id: number, card: Partial<Card>): Observable<Card> {
    return this.http.put<Card>(`${this.apiUrl}/cards/${id}`, card);
  }
}
