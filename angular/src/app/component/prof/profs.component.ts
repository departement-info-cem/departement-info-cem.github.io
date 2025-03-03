import { Component } from '@angular/core';
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
  standalone: true,
  imports: [
    MatCardModule,
    RouterLink,
    MatButtonModule,
    TriProfPipe,
    MatFormField,
    FormsModule,
    MatInputModule
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
