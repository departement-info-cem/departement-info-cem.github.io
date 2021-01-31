import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs';
import {FormControl} from '@angular/forms';
import {filter, map, startWith} from 'rxjs/operators';
import {DataService, Question} from '../service/service.prof';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit {
  questions: Observable<Question[]>;
  recherche = '';

  constructor(private service: DataService) {
    this.questions = this.service.qs();
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
