import { Component } from '@angular/core';
import { DataService, Prof } from '../service/service.data';

import { RouterLink } from '@angular/router';
import { GoodiesComponent } from '../goodies/goodies.component';
import { TerminalComponent } from '../terminal/terminal.component';

@Component({
  selector: 'app-parallax',
  templateUrl: './parallax.component.html',
  styleUrls: ['./parallax.component.scss'],
  standalone: true,
  imports: [TerminalComponent, GoodiesComponent, RouterLink],
})
export class ParallaxComponent {
  photos: Prof[];
  currentYear = new Date().getFullYear();

  constructor(private service: DataService) {
    this.photos = this.service.photos();
  }
}
