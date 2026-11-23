import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Style de bouton pour un lien : bouton({ variant: "outline" }, "mt-4").
// cn() fusionne les classes en conflit (ce que buttonVariants seul ne fait pas).
export function bouton(options?: Parameters<typeof buttonVariants>[0], classes?: string): string {
  return cn(buttonVariants(options), classes);
}
