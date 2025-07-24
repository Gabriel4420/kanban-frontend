import { Routes } from '@angular/router';

export const BOARDS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/boards-list/boards-list.component')
      .then(m => m.BoardsListComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/board-detail/board-detail.component')
      .then(m => m.BoardDetailComponent)
  }
];