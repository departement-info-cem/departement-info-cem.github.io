import { Component } from '@angular/core';
import {
  MatCard,
  MatCardHeader,
  MatCardTitle,
  MatCardSubtitle,
  MatCardContent,
} from '@angular/material/card';

@Component({
  selector: 'app-goodies',
  templateUrl: './goodies.component.html',
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
  ],
})
export class GoodiesComponent {
  constructor() {}
}
