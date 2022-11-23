import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ProfsComponent } from './prof/profs.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { LayoutModule } from '@angular/cdk/layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatBadgeModule } from '@angular/material/badge';
import { NavComponent } from './nav/nav.component';
import { DialogAdeptComponent, HomeComponent } from './home/home.component';
import { MatMenuModule } from '@angular/material/menu';
import { DataService } from './service/service.data';
import { HttpClientModule } from '@angular/common/http';
import { SafePipe, TriProfPipe } from './prof/tri.pipe';
import { GoodiesComponent } from './goodies/goodies.component';
import { ProfComponent } from './prof/prof.component';
import { DecComponent } from './dec/dec.component';
import { DecbacComponent } from './decbac/decbac.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FaqComponent } from './faq/faq.component';
import { MatOptionModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialogModule } from '@angular/material/dialog';
import { ContactComponent } from './contact/contact.component';
import { FormsModule } from '@angular/forms';
import { PlagiatComponent } from './plagiat/plagiat.component';
import { NouveauComponent } from './nouveau/nouveau.component';
import { TerminalComponent } from './terminal/terminal.component';
import { ParallaxComponent } from './parallax/parallax.component';
import { GitComponent } from './git/git.component';
import { EngagementComponent } from './engagements/engagement.component';

// TODO regarder snap scroll effects pour la page des profs ou pour le dec bac
// TODO remplacer les photos par du plus récent
// TODO faire un bandeau en bas avec des infos "news ticker" ou une version plus geek où on tape une nouvellw
// https://codepen.io/lewismcarey/pen/GJZVoG

@NgModule({
  declarations: [
    TriProfPipe,
    SafePipe,
    AppComponent,
    ProfsComponent,
    ProfComponent,
    NavComponent,
    HomeComponent,
    GoodiesComponent,
    DialogAdeptComponent,
    DecComponent,
    DecbacComponent,
    FaqComponent,
    ContactComponent,
    PlagiatComponent,
    NouveauComponent,
    EngagementComponent,
    TerminalComponent,
    ParallaxComponent,
    GitComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    MatButtonModule,
    MatDialogModule,
    MatDividerModule,
    MatButtonToggleModule,
    MatToolbarModule,
    MatOptionModule,
    MatAutocompleteModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatChipsModule,
    MatCardModule,
    MatGridListModule,
    MatFormFieldModule,
    MatInputModule,
    MatBadgeModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LayoutModule,
    MatMenuModule,
    FormsModule,
  ],
  providers: [DataService],
  bootstrap: [AppComponent],
})
export class AppModule {}
