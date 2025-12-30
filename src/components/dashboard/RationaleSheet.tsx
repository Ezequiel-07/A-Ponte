'use client';

import type { PartnershipRecommendation } from '@/lib/types';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Loader2, Sparkles } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

interface RationaleSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  recommendation: PartnershipRecommendation | null;
  rationale: string | null;
  isLoading: boolean;
}

export function RationaleSheet({
  isOpen,
  onOpenChange,
  recommendation,
  rationale,
  isLoading,
}: RationaleSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl w-full">
        <SheetHeader>
          <SheetTitle className="font-headline text-2xl flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-accent" />
            Racional da IA
          </SheetTitle>
          <SheetDescription>
            Análise da sinergia entre sua empresa e{' '}
            <strong>{recommendation?.company.nome_fantasia || recommendation?.company.razao_social}</strong>.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-12rem)] mt-4 pr-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center gap-4 py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-muted-foreground">Analisando sinergias...</p>
                    </div>
                )}
                {rationale && !isLoading && (
                    <div
                        className="space-y-4 text-foreground"
                        dangerouslySetInnerHTML={{ __html: rationale.replace(/\n/g, '<br />') }}
                    />
                )}
            </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
