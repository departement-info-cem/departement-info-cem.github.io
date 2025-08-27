import { Component, inject } from '@angular/core';
import { DataService } from '../../service/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Cours } from '../../model/cours';

@Component({
  selector: 'app-dec',
  templateUrl: './dec.component.html',
  styleUrls: ['./dec.component.scss'],
  imports: [MatIconModule],
})
export class DecComponent {
  public dataService = inject(DataService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  profil?: string;

  constructor() {
    this.profil = this.route.snapshot.queryParamMap.get('profil');
  }

  sessionDe(item: Cours): number {
    if (item.session != null) {
      return item.session;
    }
    const c = item.no.substring(4, 5);
    const res = parseInt(c, 16);
    return res;
  }

  changeProfile(profil: string): void {
    if (this.profil == profil) {
      this.profil = undefined
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
      });
    } else {
      this.profil = profil;
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { profil: profil },
      });
    }
  }

  bonProfil(profil: string): boolean {
    return profil === undefined || profil === this.profil;
  }
}
