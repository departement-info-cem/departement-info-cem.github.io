import { Component, inject } from '@angular/core';
import { DataService } from '../../service/data.service';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Cours } from '../../model/cours';

@Component({
  selector: 'app-dec',
  templateUrl: './dec.component.html',
  styleUrls: ['./dec.component.scss'],
  imports: [MatIconModule],
})
export class DecComponent {
  private service = inject(DataService);
  private route = inject(ActivatedRoute);

  cours: Cours[];
  programme = 'c';

  constructor() {
    this.cours = this.service.cours();
    const profil = this.route.snapshot.paramMap.get('profil');
    if (profil) {
      this.programme = profil;
    }
  }

  sessionDe(item: Cours): number {
    if (item.session > 0) {
      return item.session;
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
