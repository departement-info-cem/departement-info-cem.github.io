import { Pipe, PipeTransform } from '@angular/core';
import {Prof} from '../service/service.data';

import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

@Pipe({
  name: 'triProf'
})
export class TriProfPipe  implements PipeTransform {
  transform(array: any): Prof[] {
    if (!Array.isArray(array)) {
      return [];
    }
    array.sort((a: Prof, b: Prof) => {
      if (!a.image) { return 1; }
      if (!b.image) { return -1; }
      if (a.image.length > b.image.length) {
        return -1;
      } else if (a.image.length < b.image.length) {
        return 1;
      } else {
        return a.nom.localeCompare(b.nom);
      }
    });
    return array;
  }
}



@Pipe({ name: 'safe' })
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
