import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';


@Injectable()
export class DataService {

  constructor(private http: HttpClient ) { }

  profs(): Observable<Prof[]> {
    return this.http.get<Prof[]>('assets/data/profs.json');
  }

  profParCourriel(courriel: string): Observable<Prof> {
    // @ts-ignore
    return this.profs().pipe(
      map(ps => ps.find(p => p.courriel === courriel)));
  }

  videos(): Observable<Prof[]> {
    return this.profs().pipe(map(profs => profs.filter(prof => prof.lienVideo)));
  }

  photos(): Observable<Prof[]> {
    return this.profs().pipe(map(profs => profs.filter(prof => prof.image)));
  }

  cours(): Observable<Cours[]> {
    return this.http.get<Cours[]>('assets/data/cours.json');
  }

  questions(s: string): Observable<Question[]> {
    return this.qs().pipe(
      map(
        qs => qs.filter(q => q.q.indexOf(s) > 0 || q.r.indexOf(s) > 0)
      )
    );
  }

  qs(): Observable<Question[]> {
    return this.http.get<Question[]>('assets/data/faq.json');
  }
}

export class Prof {
  nom = '';
  image = '';
  courriel: any;
  lienVideo = '';
  bureau = '';
}

export class Question {
  q = '';
  r = '';
  cats: string[] = [];
  liens: string[] = [];
}


export class Cours {
  no = '';
  nom = '';
  v = 'c';
  url = '';
  icons: string[] = [];
  s = 0;
}

