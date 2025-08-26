import { Component } from '@angular/core';
import {
  MatDialog,
  MatDialogTitle,
  MatDialogContent,
  MatDialogClose,
} from '@angular/material/dialog';
import { DataService } from '../../service/data.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatAnchor, MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { Prof } from '../../model/prof';
import { TerminalComponent } from 'src/app/component/terminal/terminal.component';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    imports: [
        TerminalComponent,
        RouterLink,
        MatCardModule,
        MatButtonModule
    ]
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

    dialogRef.afterClosed().subscribe(() => { });
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
    imports: [MatDialogTitle, MatDialogContent, MatAnchor, MatDialogClose]
})
export class DialogAdeptComponent { }
