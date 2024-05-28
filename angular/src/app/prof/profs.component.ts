import { Component } from '@angular/core';
import { Prof, DataService } from '../service/data.service';
import { TriProfPipe } from './tri.pipe';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import {
  MatCard,
  MatCardHeader,
  MatCardTitle,
  MatCardImage,
  MatCardActions,
} from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-prof',
  templateUrl: './profs.component.html',
  styleUrls: ['./profs.component.scss'],
  standalone: true,
  imports: [
    MatCard,
    MatCardHeader,
    RouterLink,
    MatCardTitle,
    MatCardImage,
    MatCardActions,
    MatButton,
    TriProfPipe,
    MatFormField,
    FormsModule,
    MatInput,
    MatLabel,
  ],
})
export class ProfsComponent {
  profs: Prof[];
  recherche = '';

  constructor(private service: DataService) {
    this.profs = service.profs();
  }

  filter(value: string): void {
    const filterValue = value.toLowerCase();
    if (filterValue.length === 0) {
      this.profs = this.service.profs();
    } else {
      this.profs = this.service.filtrerProfs(filterValue);
    }
  }
}
