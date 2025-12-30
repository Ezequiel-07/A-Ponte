'use client';

import type { Connection } from '@/lib/types';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Sparkles } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

interface RationaleSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  recommendation: Connection | null;
}

export function RationaleSheet({
  isOpen,
  onOpenChange,
  recommendation,
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
            <strong>{recommendation?.targetCompany?.nomeFantasia || recommendation?.targetCompany?.razaoSocial}</strong>.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-12rem)] mt-4 pr-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
                {recommendation?.compatibilityReason && (
                    <div
                        className="space-y-4 text-foreground"
                        dangerouslySetInnerHTML={{ __html: recommendation.compatibilityReason.replace(/\n/g, '<br />') }}
                    />
                )}
            </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
