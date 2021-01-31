import { Component } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Prof, DataService} from '../service/service.prof';
import {Observable} from 'rxjs';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-prof',
  templateUrl: './prof.component.html',
})
export class ProfComponent {

  courriel: any;
  prof: Prof | null = null;

  constructor(private route: ActivatedRoute,
              private sanitizer: DomSanitizer,
              private service: DataService) {
    this.courriel = this.route.snapshot.paramMap.get('courriel');
    this.service.profParCourriel(this.courriel).subscribe(
      (res) => {
        this.prof = res;
      },
      (error) => {}
    );
  }

  // tslint:disable-next-line:typedef
  urlFor(prof: Prof) {
    return this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + prof.lienVideo + '?rel=0')
  }
}
