import { Component, inject } from '@angular/core';
import { DataService } from '../../service/data.service';

import { RouterLink } from '@angular/router';
import { GoodiesComponent } from '../goodies/goodies.component';
import { Prof } from '../../model/prof';
import { TerminalComponent } from 'src/app/component/terminal/terminal.component';

@Component({
  selector: 'app-parallax',
  templateUrl: './parallax.component.html',
  styleUrls: ['./parallax.component.scss'],
  imports: [TerminalComponent, GoodiesComponent, RouterLink],
})
export class ParallaxComponent {
  private service = inject(DataService);

  photos: Prof[];
  currentYear = new Date().getFullYear();

  constructor() {
    this.photos = this.service.photos();
  }
}
