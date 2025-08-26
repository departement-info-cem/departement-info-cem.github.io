import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProfsComponent } from './page/profs/profs.component';
import { TerminalComponent } from './component/terminal/terminal.component';
import { HomeComponent } from './page/home/home.component';
import { ContactComponent } from './page/contact/contact.component';
import { DecComponent } from './page/dec/dec.component';
import { DecbacComponent } from './page/decbac/decbac.component';
import { FaqComponent } from './page/faq/faq.component';
import { GitComponent } from './page/git/git.component';
import { GoodiesComponent } from './page/goodies/goodies.component';
import { NouveauComponent } from './page/nouveau/nouveau.component';
import { PlagiatComponent } from './page/plagiat/plagiat.component';
import { ProfComponent } from './component/prof/prof.component';
import { ParallaxComponent } from './page/parallax/parallax.component';

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
