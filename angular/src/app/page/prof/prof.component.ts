import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import {
  MatCardModule,
} from '@angular/material/card';
import { Prof } from 'src/app/model/prof';
import { DataService } from 'src/app/service/data.service';

@Component({
  selector: 'app-prof',
  templateUrl: './prof.component.html',
  styleUrls: ['./prof.component.scss'],
  standalone: true,
  imports: [
    MatCardModule
  ],
})
export class ProfComponent {
  courriel: any;
  prof: Prof | null = null;

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private service: DataService,
  ) {
    this.courriel = this.route.snapshot.paramMap.get('courriel');
    this.prof = this.service.profParCourriel(this.courriel);
  }

  urlFor(prof: Prof) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://www.youtube.com/embed/' + prof.lienVideo + '?rel=0',
    );
  }
}
