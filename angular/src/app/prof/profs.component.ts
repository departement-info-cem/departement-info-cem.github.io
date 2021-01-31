import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs';
import {Prof, DataService} from '../service/service.prof';

@Component({
  selector: 'app-prof',
  templateUrl: './profs.component.html',
  styleUrls: ['./profs.component.scss']
})
export class ProfsComponent implements OnInit {

  profs: Observable<Prof[]>;

  constructor(private profService: DataService) {
    this.profs = profService.profs();
  }

  ngOnInit(): void {
  }

}
