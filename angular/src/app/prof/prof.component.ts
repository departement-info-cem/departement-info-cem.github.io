import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../service/data.service';
import { DomSanitizer } from '@angular/platform-browser';
import {
  MatCardModule,
} from '@angular/material/card';
import { Prof } from '../model/prof';

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

  // tslint:disable-next-line:typedef
  urlFor(prof: Prof) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://www.youtube.com/embed/' + prof.lienVideo + '?rel=0',
    );
  }
}
