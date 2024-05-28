import { Component } from '@angular/core';
import { DataService, Question } from '../service/data.service';
import { ActivatedRoute } from '@angular/router';

import { FormsModule } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  standalone: true,
  imports: [MatFormField, MatLabel, MatInput, FormsModule],
})
export class FaqComponent {
  questions: Question[];
  recherche = '';

  constructor(
    private service: DataService,
    private route: ActivatedRoute,
  ) {
    this.questions = this.service.qs();
    const categorie = this.route.snapshot.paramMap.get('cat');
    if (categorie) {
      this.recherche = categorie;
      this.filter(this.recherche);
    }
  }

  filter(value: string): void {
    const filterValue = value.toLowerCase();
    if (filterValue.length === 0) {
      this.questions = this.service.qs();
    } else {
      this.questions = this.service.questions(filterValue);
    }
  }
}
