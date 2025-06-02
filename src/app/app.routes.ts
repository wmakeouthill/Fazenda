import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Players } from './pages/players/players';
import { Rankings } from './pages/rankings/rankings';
import { Matches } from './pages/matches/matches';
import { Events } from './pages/events/events';

export const routes: Routes = [
  { path: '', component: Dashboard },
  { path: 'dashboard', redirectTo: '', pathMatch: 'full' },
  { path: 'fazendeiros', component: Players },
  { path: 'rankings', component: Rankings },
  { path: 'partidas', component: Matches },
  { path: 'eventos', component: Events },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
