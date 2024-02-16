import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ProfsComponent } from './prof/profs.component';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NavComponent } from './nav/nav.component';
import { DialogAdeptComponent, HomeComponent } from './home/home.component';
import { DataService } from './service/service.data';
import { HttpClientModule } from '@angular/common/http';
import { SafePipe, TriProfPipe } from './prof/tri.pipe';
import { GoodiesComponent } from './goodies/goodies.component';
import { ProfComponent } from './prof/prof.component';
import { DecComponent } from './dec/dec.component';
import { DecbacComponent } from './decbac/decbac.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FaqComponent } from './faq/faq.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ContactComponent } from './contact/contact.component';
import { FormsModule } from '@angular/forms';
import { PlagiatComponent } from './plagiat/plagiat.component';
import { NouveauComponent } from './nouveau/nouveau.component';
import { TerminalComponent } from './terminal/terminal.component';
import { ParallaxComponent } from './parallax/parallax.component';
import { GitComponent } from './git/git.component';
import { EngagementComponent } from './engagements/engagement.component';

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
    MatButtonToggleModule,
    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatCardModule,
    MatFormFieldModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
  ],
  providers: [DataService],
  bootstrap: [AppComponent],
})
export class AppModule { }
