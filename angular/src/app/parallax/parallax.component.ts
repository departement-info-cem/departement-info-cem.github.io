import { Component, OnInit } from '@angular/core';
import {DataService, Prof} from '../service/service.data';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-parallax',
  templateUrl: './parallax.component.html',
  styleUrls: ['./parallax.component.scss']
})
export class ParallaxComponent implements OnInit {

  photos: Observable<Prof[]>;

  constructor(private service: DataService) {
    this.photos = this.service.photos();
  }

  ngOnInit(): void {
  }

}
