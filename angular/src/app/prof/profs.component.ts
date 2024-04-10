import { Component } from '@angular/core';
import { Prof, DataService } from '../service/service.data';
import { TriProfPipe } from './tri.pipe';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import {
  MatCard,
  MatCardHeader,
  MatCardTitle,
  MatCardImage,
  MatCardActions,
} from '@angular/material/card';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-prof',
  templateUrl: './profs.component.html',
  styleUrls: ['./profs.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    MatCard,
    MatCardHeader,
    RouterLink,
    MatCardTitle,
    NgIf,
    MatCardImage,
    MatCardActions,
    MatButton,
    TriProfPipe,
  ],
})
export class ProfsComponent {
  profs: Prof[];

  constructor(private profService: DataService) {
    this.profs = profService.profs();
  }
}
