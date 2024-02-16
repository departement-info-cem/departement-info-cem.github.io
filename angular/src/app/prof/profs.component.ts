import { Component } from '@angular/core';
import { Prof, DataService } from '../service/service.data';

@Component({
  selector: 'app-prof',
  templateUrl: './profs.component.html',
  styleUrls: ['./profs.component.scss'],
})
export class ProfsComponent {
  profs: Prof[];

  constructor(private profService: DataService) {
    this.profs = profService.profs();
  }
}
