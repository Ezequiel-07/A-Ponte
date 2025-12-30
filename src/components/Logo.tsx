import { cn } from "@/lib/utils";
import { Handshake } from "lucide-react";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 text-primary", className)}>
      <Handshake className="h-6 w-6" />
      <span className="font-headline text-xl font-bold">A Ponte</span>
    </div>
  );
}
