import { Component, inject } from '@angular/core';
import { TriProfPipe } from '../../pipe/tri-prof.pipe';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { Prof } from 'src/app/model/prof';
import { DataService } from 'src/app/service/data.service';

@Component({
  selector: 'app-prof',
  templateUrl: './profs.component.html',
  styleUrls: ['./profs.component.scss'],
  imports: [
    MatCardModule,
    RouterLink,
    MatButtonModule,
    TriProfPipe,
    MatFormField,
    FormsModule,
    MatInputModule,
  ],
})
export class ProfsComponent {
  private service = inject(DataService);

  profs: Prof[];
  recherche = '';

  constructor() {
    const service = this.service;

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
