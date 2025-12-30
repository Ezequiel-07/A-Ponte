'use client';

import type { Connection } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, MapPin, Sparkles, Percent, Handshake, ThumbsDown, X } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface RecommendationCardProps {
  recommendation: Connection;
  onExplain: (recommendation: Connection) => void;
  index: number;
}

export function RecommendationCard({ recommendation, onExplain, index }: RecommendationCardProps) {
    const company = recommendation.targetCompany;
    const [isDismissed, setIsDismissed] = useState(false);
    
    if (!company) return null;

    const companyLogo = PlaceHolderImages.find(p => p.id === `company-logo-${(index % 3) + 1}`);

    const handleDismiss = () => {
        // Here you would typically call a function to update the backend
        // For now, we'll just handle the UI state
        setIsDismissed(true);
    };

    if (isDismissed) {
        return null;
    }

  return (
    <Card className="flex h-full flex-col transition-shadow hover:shadow-lg">
        <CardHeader className="flex-row items-start gap-4">
            <Avatar className="h-12 w-12 rounded-lg">
                {companyLogo && <AvatarImage src={companyLogo.imageUrl} alt={company.nomeFantasia || company.razaoSocial} data-ai-hint={companyLogo.imageHint} />}
            <AvatarFallback className='rounded-lg bg-secondary'>
                <Building className="h-6 w-6 text-muted-foreground" />
            </AvatarFallback>
            </Avatar>
            <div className='flex-1'>
            <CardTitle className="font-headline text-lg">{company.nomeFantasia || company.razaoSocial}</CardTitle>
            <CardDescription className='flex items-center gap-1.5 mt-1 text-xs'>
                <MapPin className="h-3 w-3" />
                {company.endereco.cidade}, {company.endereco.uf}
            </CardDescription>
            </div>
            {recommendation.compatibilityScore && (
                <Badge className={cn('flex gap-1.5 items-center text-sm font-bold', 
                    recommendation.compatibilityScore > 75 ? 'bg-green-100 text-green-800' : 
                    recommendation.compatibilityScore > 50 ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                )}>
                    <Sparkles className="h-3 w-3" />
                    {Math.round(recommendation.compatibilityScore)}%
                </Badge>
            )}
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
            <div className="space-y-1">
                <h4 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>Setor Principal</h4>
                <p className='text-sm leading-snug'>{company.cnaePrincipal.description}</p>
            </div>
            {company.tagsOperacionais && company.tagsOperacionais.length > 0 && (
                <div className="space-y-2">
                    <h4 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>Tags Operacionais</h4>
                    <div className='flex flex-wrap gap-2'>
                        {company.tagsOperacionais.map((tag, i) => (
                            <Badge key={i} variant="secondary">{tag}</Badge>
                        ))}
                    </div>
                </div>
            )}
            <div className="space-y-1 pt-2">
                 <h4 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>Racional da IA</h4>
                 <p className='text-sm text-muted-foreground line-clamp-3'>
                    {recommendation.compatibilityReason}
                 </p>
            </div>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-2">
            <Button onClick={() => onExplain(recommendation)} className="w-full">
                <Sparkles className="mr-2 h-4 w-4" />
                Análise Completa da IA
            </Button>
            <div className='grid grid-cols-2 gap-2'>
                 <Button variant="outline" className='w-full'>
                    <Handshake className="mr-2 h-4 w-4" />
                    Conectar
                </Button>
                <Button variant="ghost" className='w-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive' onClick={handleDismiss}>
                    <X className="mr-2 h-4 w-4" />
                    Descartar
                </Button>
            </div>
        </CardFooter>
    </Card>
  );
}
