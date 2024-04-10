import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProfsComponent } from './prof/profs.component';
import { HomeComponent } from './home/home.component';
import { GoodiesComponent } from './goodies/goodies.component';
import { ProfComponent } from './prof/prof.component';
import { DecComponent } from './dec/dec.component';
import { DecbacComponent } from './decbac/decbac.component';
import { FaqComponent } from './faq/faq.component';
import { ContactComponent } from './contact/contact.component';
import { NouveauComponent } from './nouveau/nouveau.component';
import { PlagiatComponent } from './plagiat/plagiat.component';
import { TerminalComponent } from './terminal/terminal.component';
import { ParallaxComponent } from './parallax/parallax.component';
import { GitComponent } from './git/git.component';

const routes: Routes = [
  { path: 'profs', component: ProfsComponent, data: { title: 'Prof' } },
  { path: 'prof/:courriel', component: ProfComponent, data: { title: 'Prof' } },
  { path: 'home', component: HomeComponent, data: { title: 'Prof' } },
  { path: 'contact', component: ContactComponent, data: { title: 'Prof' } },
  { path: 'faq', component: FaqComponent, data: { title: 'Dec' } },
  { path: 'faq/:cat', component: FaqComponent, data: { title: 'Dec' } },
  { path: 'nouveau', component: NouveauComponent, data: { title: 'Dec' } },
  { path: 'plagiat', component: PlagiatComponent, data: { title: 'Dec' } },
  { path: 'git', component: GitComponent, data: { title: 'Dec' } },

  { path: 'dec', component: DecComponent, data: { title: 'Dec' } },
  { path: 'dec/:profil', component: DecComponent, data: { title: 'Dec' } },
  { path: 'decbac', component: DecbacComponent, data: { title: 'Dec Bac' } },
  { path: 'goodies', component: GoodiesComponent, data: { title: 'Etudiant' } },
  {
    path: 'terminal',
    component: TerminalComponent,
    data: { title: 'Etudiant' },
  },
  { path: 'accueil', component: ParallaxComponent, data: { title: 'Accueil' } },
  { path: '', redirectTo: '/accueil', pathMatch: 'full' },
  { path: '**', component: HomeComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
