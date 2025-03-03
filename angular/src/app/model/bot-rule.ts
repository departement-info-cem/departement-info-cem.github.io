import { BotTrigger } from "./bot-trigger";

export class BotRule {
    id = -1;
    q: string | undefined;
    reponses: string[] = [];
    triggers: BotTrigger[] = [];
}