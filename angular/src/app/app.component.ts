import { Component } from '@angular/core';
import { NavComponent } from './component/nav/nav.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [NavComponent],
})
export class AppComponent {
  title = 'depinfo';

  constructor() {}
}
