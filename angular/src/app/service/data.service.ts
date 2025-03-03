import { Injectable } from '@angular/core';
import profs from '../../../../data/profs.json';
import cours from '../../../../data/cours.json';
import bot from '../../../../data/bot.json';
import faq from '../../../../data/faq.json';
import { BotRule } from '../model/bot-rule';
import { Cours } from '../model/cours';
import { Prof } from '../model/prof';
import { Question } from '../model/question';

@Injectable()
export class DataService {
  profs(): Prof[] {
    return profs as Prof[];
  }

  profParCourriel(courriel: string): Prof {
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
