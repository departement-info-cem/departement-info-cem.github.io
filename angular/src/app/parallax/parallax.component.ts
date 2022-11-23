import { Component } from '@angular/core';
import { DataService, Prof } from '../service/service.data';

@Component({
  selector: 'app-parallax',
  templateUrl: './parallax.component.html',
  styleUrls: ['./parallax.component.scss'],
})
export class ParallaxComponent {
  photos: Prof[];

  constructor(private service: DataService) {
    this.photos = this.service.photos();
  }
}
