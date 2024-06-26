import { Component } from '@angular/core';
import {
  MatDialog,
  MatDialogTitle,
  MatDialogContent,
  MatDialogClose,
} from '@angular/material/dialog';
import { DataService, Prof } from '../service/data.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { MatButton, MatAnchor } from '@angular/material/button';
import {
  MatCard,
  MatCardHeader,
  MatCardTitle,
  MatCardSubtitle,
  MatCardContent,
} from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { TerminalComponent } from '../terminal/terminal.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [
    TerminalComponent,
    RouterLink,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    MatButton,
    MatAnchor,
  ],
})
export class HomeComponent {
  images = ['gang.jpg', 'tablo.jpg', 'blond.jpg', 'jo-jm.jpg', 'grimace.jpg'];

  videos: Prof[];

  constructor(
    private dialog: MatDialog,
    private service: DataService,
    private sanitizer: DomSanitizer,
  ) {
    this.videos = this.service.videos();
  }

  openAdept(): void {
    const dialogRef = this.dialog.open(DialogAdeptComponent);

    dialogRef.afterClosed().subscribe(() => {});
  }

  urlFor(prof: Prof): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://www.youtube.com/embed/' + prof.lienVideo + '?rel=0',
    );
  }
}

@Component({
  selector: 'app-dialog-adept',
  templateUrl: 'dialog-adept.html',
  standalone: true,
  imports: [MatDialogTitle, MatDialogContent, MatAnchor, MatDialogClose],
})
export class DialogAdeptComponent {}
