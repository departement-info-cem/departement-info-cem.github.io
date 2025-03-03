import { Component } from '@angular/core';
import { DataService } from '../service/data.service';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Cours } from '../model/cours';

@Component({
  selector: 'app-dec',
  templateUrl: './dec.component.html',
  styleUrls: ['./dec.component.scss'],
  standalone: true,
  imports: [MatIconModule],
})
export class DecComponent {
  cours: Cours[];
  programme = 'c';

  constructor(
    private service: DataService,
    private route: ActivatedRoute,
  ) {
    this.cours = this.service.cours();
    const profil = this.route.snapshot.paramMap.get('profil');
    if (profil) {
      this.programme = profil;
    }
  }

  sessionDe(item: Cours): number {
    if (item.s > 0) {
      return item.s;
    }
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
    if (!v) {
      return true;
    }
    return v === 'c' || v === this.programme;
  }
}
