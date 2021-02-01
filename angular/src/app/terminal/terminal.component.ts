import {Component, HostListener, OnInit} from '@angular/core';

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.scss']
})
export class TerminalComponent implements OnInit {

  userLine = '';
  userName = '';
  questions: Question[] = [
    {id: 1, q: 'L\'informatique ça t\'intéresse?', reponses: ['oui', 'non'], triggers: []},
    {id: 2, q: 'Tu as envie de démonter des ordis, de souder?', reponses: ['oui', 'non'], triggers: []},
    {id: 3, q: 'Tu te sens plutôt logique/prog ou créatif/dessin?', reponses: ['logique', 'créatif'], triggers: []},
    {id: 4, q: 'Tu doutes ou tu es sûr de ce que tu veux faire?', reponses: ['sûr', 'doute'], triggers: []},
    {id: 22, q: 'Tu veux aller à l\'université?', reponses: ['oui', 'non'], triggers: []},

    {id: 18, q: 'Tu veux être un hackeur pirate?', reponses: ['oui', 'non'], triggers: [{id: 1, r: 'oui'}]},
    {id: 11, q: 'Tu rêves de datacenter et de salle de serveur?', reponses: ['oui', 'non'], triggers: [{id: 1, r: 'oui'}, {id: 3, r: 'logique'}]},
    {id: 10, q: 'Tu veux développer programmer?', reponses: ['oui', 'non'], triggers: [{id: 1, r: 'oui'}, {id: 3, r: 'logique'}]},
    {id: 12, q: 'Tu veux faire la prochaine app mobile?', reponses: ['oui', 'non'], triggers: [{id: 10, r: 'oui'}, {id: 1, r: 'oui'}, {id: 3, r: 'logique'}]},
    {id: 19, q: 'Tu veux faire du support informatique?', reponses: ['oui', 'non'], triggers: [{id: 1, r: 'oui'}, {id: 3, r: 'logique'}]},

    {id: 20, q: 'Toi c\'est l\'IA qui t\'allume?', reponses: ['oui', 'non'], triggers: [{id: 1, r: 'oui'}, {id: 3, r: 'logique'}]},
    {id: 21, q: 'Toi c\'est le jeu video qui t\'allume?', reponses: ['oui', 'non'], triggers: [{id: 1, r: 'oui'}, {id: 3, r: 'logique'}, {id: 10, r: 'oui'}]},






    {id: 100, q: 'Diagnostic terminé, 50-50: tu ne connais pas trop l\'informatique, ça vaut la peine d\'essayer. ' +
        'Tu peux regarder les cours pour te faire un avis.', reponses: [], triggers: [{id: 4, r: 'doute'}]},
    {id: 100, q: 'Diagnostic terminé, 0% compatibilité', reponses: [], triggers: [{id: 1, r: 'non'}]},
    {
      id: 100,
      q: 'Diagnostic terminé, 10% compatibilité. Je te conseille la technique intégration multimédia TIM au CEGEP',
      reponses: [], triggers: [{id: 1, r: 'oui'}, {id: 3, r: 'créatif'}]
    },
    {
      id: 100,
      q: 'Diagnostic terminé, 10% compatibilité. Je te conseille la technique en génie électrique, ' +
        'ils font de l\'électronique, des télécoms. En info, on n\'ouvre pas la boite',
      reponses: [], triggers: [{id: 1, r: 'oui'}, {id: 2, r: 'oui'}]
    },
    {
      id: 100,
      q: 'Diagnostic terminé, 100% compatibilité. Développer des apps, c\'est ici. ' +
        'La technique profil prog, c\'est pour toi.',
      reponses: [], triggers: [{id: 1, r: 'oui'}, {id: 12, r: 'oui'}, ]
    },
    {
      id: 100,
      q: 'Diagnostic terminé, 100% compatibilité. Le réseau c\'est ici. ' +
        'La technique profil réseau, c\'est pour toi.',
      reponses: [], triggers: [{id: 1, r: 'oui'}, {id: 11, r: 'oui'}, ]
    },
    {
      id: 100,
      q: 'Diagnostic terminé, 100% compatibilité. La technique en réseau ça t\'amène au support technique. ' +
        'C\'est souvent comme ça que commence les carrières en réseau.',
      reponses: [], triggers: [{id: 1, r: 'oui'}, {id: 19, r: 'oui'}, ]
    },

    {
      id: 100,
      q: 'Diagnostic terminé, 100% compatibilité. Cyber sécurité c\'est ici. ' +
        'On en fait dans les 2 voies de sorties, tu as la première session pour te faire une idée.',
      reponses: [], triggers: [{id: 1, r: 'oui'}, {id: 18, r: 'oui'}, ]
    },
    {
      id: 100,
      q: 'Diagnostic terminé, 100% compatibilité. Là tu as 2 options, avec nous. ' +
        'Tu peux continuer après la technique à l\'université. Tu peux aussi t\'inscrire au dec-bac en programmation et tout finir en 5 ans.',
      reponses: [], triggers: [{id: 10, r: 'oui'}, {id: 22, r: 'oui'}, ]
    },
    {
      id: 100,
      q: 'Diagnostic terminé, 70% compatibilité. Pour l\'IA, il faut aller à l\'université. ' +
        'Tu peux y aller après la technique et tu auras plus d\'expérience de programmation que si tu vas en pré-universitaire.',
      reponses: [], triggers: [{id: 20, r: 'oui'}, ]
    },
    {
      id: 100,
      q: 'Diagnostic terminé, 70% compatibilité. Pour le jeu video, il faut ' +
        'souvent aller à l\'université et programmer des jeux pendant tes études. ' +
        'Tu peux y aller après la technique et tu auras plus d\'expérience de programmation que si tu vas en pré-universitaire.',
      reponses: [], triggers: [{id: 21, r: 'oui'}, ]
    }
  ];
  triggers: Trigger[] = [];
  question: Question = this.questions[0];

  error: Question = {id: 999, q: 'ERROR ERROR, plus de question, kernel panic', reponses: [], triggers: []};

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.compute(this.userLine);
    } else {
      this.userLine += event.key;
    }
  }

  constructor() { }

  compute(line: string): void {
    if (!this.userName) {
      this.userName = this.userLine;
      this.userLine = '';
      return;
    }
    if (this.userLine === '0' || this.question.reponses.length === 0) {
      this.restart();
      return;
    }
    console.log('got an answer');
    // add current answer to triggers
    const newOne = new Trigger();
    newOne.id = this.question.id;
    newOne.r = this.trouveLaReponse(this.question, this.userLine);
    // find one that is triggered
    this.userLine = '';
    console.log('dfound answer  ' + newOne.r);
    if (!newOne.r) {
      console.log('ouch ');
    } else {
      this.triggers.push(newOne);
      // try to find a diagnostic
      const diagnostic = this.diagnostic(this.triggers);
      if (diagnostic) {
        this.question = diagnostic;
        this.playDiagnostic();
        return;
      }
      // find one that is the most triggered and not already asked.
      const nextQuestion = this.prochaineQuestion(this.triggers);
      if (!nextQuestion) {
        console.log('out of questions, time to find the best advice');
        this.question = this.error;
      } else {
        console.log('yeah ');
        this.question = nextQuestion;
        console.log('new question ' + this.question.q);
      }
    }
  }

  private restart(): void {
    this.userLine = '';
    this.triggers = [];
    this.question = this.questions[0];
  }

  private diagnostic(triggers: Trigger[]): Question {
    // @ts-ignore
    let res: Question = undefined;
    for ( const q of this.questions) {
      if (q.reponses.length === 0 ) {
        const numberOfTrigs = this.trigsCompletedFor(q, this.triggers);
        console.log(numberOfTrigs + ' for  ' + q.q);
        if (numberOfTrigs > 0) {
          if (!res) {
            res = q;
          } else {
            const numberOfTrigsBest = this.trigsCompletedFor(res, this.triggers);
            if (numberOfTrigs > numberOfTrigs) {
              res = q;
            }
          }
        }
      }
    }
    return res;
  }

  private prochaineQuestion(triggers: Trigger[]): Question {
    // @ts-ignore
    let res: Question = undefined;
    for ( const q of this.questions) {
      if (!this.alreadyAsked(q, this.triggers) && q.reponses.length > 0 ) {
        const numberOfTrigs = this.trigsBalance(q, this.triggers);
        console.log(numberOfTrigs + ' for  ' + q.q);
        if (!res) {
          res = q;
        } else {
          const numberOfTrigsBest = this.trigsBalance(res, this.triggers);
          if (numberOfTrigs > numberOfTrigsBest) {
            res = q;
          }
        }
      }
    }
    return res;
  }

  private trigsCompletedFor(q: Question, triggers: Trigger[]): number {
    const res = this.trigsCount(q, triggers);
    if (res === q.triggers.length) {
      return res;
    }
    return 0;
  }

  private trigsCount(q: Question, triggers: Trigger[]): number {
    let res = 0;
    for (const trig of q.triggers) {
      for (const trig2 of triggers) {
        if (trig2.id === trig.id ) {
          if (trig2.r === trig.r) {
            res++;
          }
        }
      }
    }
    return res;
  }

  private trigsBalance(q: Question, triggers: Trigger[]): number {
    let res = 0;
    for (const trig of q.triggers) {
      for (const trig2 of triggers) {
        if (trig2.id === trig.id ) {
          if (trig2.r === trig.r) {
            res++;
          } else {
            res--;
          }
        }
      }
    }
    return res;
  }

  private alreadyAsked(q: Question, triggers: Trigger[]): boolean {
    for (const trig of triggers) {
      if (trig.id === q.id) {
        return true;
      }
    }
    return false;
  }

  private trouveLaReponse(question: Question, userLine: string): string {
    for (const r of question.reponses) {
      console.log(r.substring(0, 1).toLowerCase() + ' = ' + userLine.substring(0, 1).toLowerCase());
      if (r.substring(0, 1).toLowerCase() === userLine.substring(0, 1).toLowerCase()) {
        return r;
      }
    }
    return '';
  }

  ngOnInit(): void {
  }

  isDiagnostic(question: Question): boolean {
    return question.reponses.length === 0;
  }

  playDiagnostic(): void{
    const audio = new Audio();
    audio.src = 'assets/diagno.wav';
    audio.load();
    audio.play();
  }

  reset(): void {
    this.restart();
    this.userName = '';
  }
}

export class Question {
  id = -1;
  q: string | undefined;
  reponses: string[] = [];
  triggers: Trigger[] = [];
}

export class Trigger {
  id = -1;
  r: string | undefined;
}
