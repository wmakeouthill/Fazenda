import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';

export const routes: Routes = [
  { path: '', component: Dashboard },
  { path: 'dashboard', redirectTo: '', pathMatch: 'full' },
  // Rotas serão adicionadas conforme os componentes forem criados
  // { path: 'players', component: PlayersComponent },
  // { path: 'leaderboards', component: LeaderboardsComponent },
  // { path: 'matches', component: MatchesComponent },
  // { path: 'events', component: EventsComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
