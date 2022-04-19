import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { SessionComponent } from './pages/session/session.component';

const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
  },
  {
    path: 'session/:userId',
    component: SessionComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
