import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs';
import {FormControl} from '@angular/forms';
import {filter, map, startWith} from 'rxjs/operators';
import {DataService, Question} from '../service/service.data';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html'
})
export class FaqComponent implements OnInit {
  questions: Observable<Question[]>;
  recherche = '';

  constructor(private service: DataService,
              private route: ActivatedRoute) {
    this.questions = this.service.qs();
    const categorie = this.route.snapshot.paramMap.get('cat');
    if (categorie) {
      this.recherche = categorie;
      this.filter(this.recherche);
    }
  }

  ngOnInit(): void {}

  filter(value: string): void {
    const filterValue = value.toLowerCase();
    console.log(filterValue);
    if (filterValue.length === 0 ) {
      this.questions = this.service.qs();
    } else {
      this.questions = this.service.questions(filterValue);
    }
  }
}
