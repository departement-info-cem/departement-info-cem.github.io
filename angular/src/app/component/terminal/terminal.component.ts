import { Component, HostListener, inject } from '@angular/core';
import { BotRule } from 'src/app/model/bot-rule';
import { BotTrigger } from 'src/app/model/bot-trigger';
import { DataService } from 'src/app/service/data.service';

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.scss'],
  imports: [],
})
export class TerminalComponent {
  private service = inject(DataService);

  userLine = '';
  userName = '';
  questions: BotRule[];
  triggers: BotTrigger[] = [];
  question: BotRule;

  error: BotRule = {
    id: 999,
    q: 'ERROR ERROR, plus de question, kernel panic',
    reponses: [],
    triggers: [],
  };

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.compute(this.userLine);
    } else {
      this.userLine += event.key;
    }
  }

  constructor() {
    this.questions = this.service.botRules();
    this.question = this.questions[0];
  }

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
    // add current answer to triggers
    const newOne = new BotTrigger();
    newOne.id = this.question.id;
    newOne.r = this.trouveLaReponse(this.question, this.userLine);
    // find one that is triggered
    this.userLine = '';
    if (newOne.r) {
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
        this.question = this.error;
      } else {
        this.question = nextQuestion;
      }
    }
  }

  private restart(): void {
    this.userLine = '';
    this.triggers = [];
    // @ts-ignore
    this.question = this.questions[0];
  }

  private diagnostic(triggers: BotTrigger[]): BotRule {
    let res: BotRule;
    for (const q of this.questions) {
      if (q.reponses.length === 0) {
        const numberOfTrigs = this.trigsCompletedFor(q, this.triggers);
        if (numberOfTrigs > 0) {
          if (res) {
            const numberOfTrigsBest = this.trigsCompletedFor(
              res,
              this.triggers,
            );
            if (numberOfTrigs > numberOfTrigs) {
              res = q;
            }
          } else {
            res = q;
          }
        }
      }
    }
    return res;
  }

  private prochaineQuestion(triggers: BotTrigger[]): BotRule {
    let res: BotRule;
    for (const q of this.questions) {
      if (!this.alreadyAsked(q, this.triggers) && q.reponses.length > 0) {
        const numberOfTrigs = this.trigsBalance(q, this.triggers);
        if (res) {
          const numberOfTrigsBest = this.trigsBalance(res, this.triggers);
          if (numberOfTrigs > numberOfTrigsBest) {
            res = q;
          }
        } else {
          res = q;
        }
      }
    }
    return res;
  }

  private trigsCompletedFor(q: BotRule, triggers: BotTrigger[]): number {
    const res = this.trigsCount(q, triggers);
    if (res === q.triggers.length) {
      return res;
    }
    return 0;
  }

  private trigsCount(q: BotRule, triggers: BotTrigger[]): number {
    let res = 0;
    for (const trig of q.triggers) {
      for (const trig2 of triggers) {
        if (trig2.id === trig.id) {
          if (trig2.r === trig.r) {
            res++;
          }
        }
      }
    }
    return res;
  }

  private trigsBalance(q: BotRule, triggers: BotTrigger[]): number {
    let res = 0;
    for (const trig of q.triggers) {
      for (const trig2 of triggers) {
        if (trig2.id === trig.id) {
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

  private alreadyAsked(q: BotRule, triggers: BotTrigger[]): boolean {
    for (const trig of triggers) {
      if (trig.id === q.id) {
        return true;
      }
    }
    return false;
  }

  private trouveLaReponse(question: BotRule, userLine: string): string {
    for (const r of question.reponses) {
      if (
        r.substring(0, 1).toLowerCase() ===
        userLine.substring(0, 1).toLowerCase()
      ) {
        return r;
      }
    }
    return '';
  }

  isDiagnostic(question: BotRule): boolean {
    return question.reponses.length === 0;
  }

  playDiagnostic(): void {
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
