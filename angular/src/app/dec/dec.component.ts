import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs';
import {Cours, DataService, Prof} from '../service/service.prof';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-dec',
  templateUrl: './dec.component.html',
  styleUrls: ['./dec.component.scss']
})
export class DecComponent implements OnInit {
  cours: Observable<Cours[]>;
  programme = 'c';

  constructor(private service: DataService,
              private route: ActivatedRoute) {
    this.cours = this.service.cours();
    const profil = this.route.snapshot.paramMap.get('profil');
    if (profil) {
      this.programme = profil;
    }
  }

  ngOnInit(): void {
  }

  sessionDe(item: Cours): number {
    if (item.s > 0 ) { return item.s; }
    const c = item.no.substring(4, 5);
    const res = parseInt(c, 16);
    return res;
  }

  heuresDe(item: Cours): number {
    const c = item.no.substring(6, 7);
    const res = parseInt(c, 16);
    return res * 15;
  }

  changeProgramme(v: string): void {
    this.programme = v;
  }

  bon(v: string): boolean {
    if (!v) { return true; }
    return v === 'c' ||  v === this.programme ;
  }
}
