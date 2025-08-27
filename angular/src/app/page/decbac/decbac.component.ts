import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DataService } from 'src/app/service/data.service';

@Component({
  selector: 'app-decbac',
  templateUrl: './decbac.component.html',
  styleUrls: ['./decbac.component.scss'],
  imports: [MatIconModule]
})
export class DecbacComponent {

  public dataService = inject(DataService);


  getSessionYear(session: number) {
    return Math.ceil(session / 3);
  }

  getSessionSeason(session: number) {
    const seasons = ['Automne', 'Hiver', 'Été'];
    return seasons[(session - 1) % 3];
  }
}
