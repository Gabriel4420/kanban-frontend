import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'boards'
  },
  {
    path: 'boards',
    loadChildren: () => import('./features/boards/boards.routes').then(m => m.BOARDS_ROUTES)
  },
  {
    path: '**',
    redirectTo: 'boards'
  }
];
