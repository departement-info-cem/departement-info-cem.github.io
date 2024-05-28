import { Injectable } from '@angular/core';
import profs from '../../../../data/profs.json';
import cours from '../../../../data/cours.json';
import bot from '../../../../data/bot.json';
import faq from '../../../../data/faq.json';

@Injectable()
export class DataService {
  profs(): Prof[] {
    return profs as Prof[];
  }

  profParCourriel(courriel: string): Prof {
    // @ts-ignore
    return this.profs().find((p) => p.courriel === courriel);
  }

  filtrerProfs(s: string): Prof[] {
    return this.profs().filter((prof) => {
      return prof.nom.toLowerCase().indexOf(s) > -1;
    });
  }

  videos(): Prof[] {
    return this.profs().filter((prof) => prof.lienVideo);
  }

  photos(): Prof[] {
    return this.profs().filter((prof) => prof.image);
  }

  cours(): Cours[] {
    return cours as Cours[];
  }

  questions(s: string): Question[] {
    return this.qs().filter((q) => {
      if (q.q.indexOf(s) > -1) return true;
      if (q.r.indexOf(s) > -1) return true;
      if (q.cats) {
        for (let cat of q.cats) {
          if (cat.indexOf(s) > -1) return true;
        }
      }
      return false;
    });
  }

  qs(): Question[] {
    return faq as Question[];
  }

  botRules(): BotRule[] {
    return bot as BotRule[];
  }
}

export class BotRule {
  id = -1;
  q: string | undefined;
  reponses: string[] = [];
  triggers: BotTrigger[] = [];
}

export class BotTrigger {
  id = -1;
  r: string | undefined;
}

export class Prof {
  nom = '';
  image = '';
  courriel: any;
  lienVideo = '';
  bureau = '';
}

export class Question {
  q = '';
  r = '';
  cats: string[] = [];
  liens: string[] = [];
}

export class Cours {
  no = '';
  nom = '';
  v = 'c';
  url = '';
  icons: string[] = [];
  s = 0;
}
