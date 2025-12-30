
'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Company } from "@/lib/types";
import { Building } from "lucide-react";
import { useState } from "react";
import { Loader2 } from 'lucide-react';


interface ConfirmPartnersDialogProps {
  isOpen: boolean;
  partners: Company[];
  onConfirm: (partners: Company[]) => void;
  onCancel: () => void;
}

export function ConfirmPartnersDialog({
  isOpen,
  partners,
  onConfirm,
  onCancel,
}: ConfirmPartnersDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = () => {
    setIsConfirming(true);
    onConfirm(partners);
    // isConfirming will remain true as the parent component will take over the loading state
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Parceiros Encontrados</AlertDialogTitle>
          <AlertDialogDescription>
            Encontramos {partners.length} empresa(s) compatível(is) com seu perfil. Deseja que a IA analise o potencial de parceria com elas?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <ScrollArea className="max-h-60 w-full rounded-md border p-4">
            <div className="space-y-4">
            {partners.map((partner) => (
                <div key={partner.id} className="flex items-center gap-3 text-sm">
                    <Building className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                        <p className="font-semibold text-foreground">{partner.nomeFantasia || partner.razaoSocial}</p>
                        <p className="text-xs text-muted-foreground">{partner.cnaePrincipal.description}</p>
                    </div>
                </div>
            ))}
            </div>
        </ScrollArea>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={isConfirming}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isConfirming}>
            {isConfirming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Analisar com IA
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
