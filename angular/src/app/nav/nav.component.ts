import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { MatToolbar } from '@angular/material/toolbar';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatNavList, MatListItem } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { MatMiniFabButton } from '@angular/material/button';
import { NgIf, AsyncPipe } from '@angular/common';
import {
  MatSidenavContainer,
  MatSidenav,
  MatSidenavContent,
} from '@angular/material/sidenav';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
  standalone: true,
  imports: [
    MatSidenavContainer,
    MatSidenav,
    NgIf,
    MatMiniFabButton,
    MatIcon,
    MatNavList,
    MatListItem,
    RouterLink,
    MatSidenavContent,
    MatToolbar,
    RouterOutlet,
    AsyncPipe,
  ],
})
export class NavComponent {
  isExpanded = false;

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay(),
    );

  constructor(private breakpointObserver: BreakpointObserver) {}
}
