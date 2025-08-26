import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Question } from 'src/app/model/question';
import { DataService } from 'src/app/service/data.service';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  imports: [MatFormFieldModule, FormsModule],
})
export class FaqComponent {
  private service = inject(DataService);
  private route = inject(ActivatedRoute);

  questions: Question[];
  recherche = '';

  constructor() {
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
