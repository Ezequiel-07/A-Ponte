'use client';

import type { Company } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, MapPin, Sparkles } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface RecommendationCardProps {
  recommendation: Company;
  onExplain: (recommendation: Company) => void;
  index: number;
}

export function RecommendationCard({ recommendation, onExplain, index }: RecommendationCardProps) {
    const companyLogo = PlaceHolderImages.find(p => p.id === `company-logo-${(index % 3) + 1}`);

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-start gap-4">
        <Avatar className="h-12 w-12">
            {companyLogo && <AvatarImage src={companyLogo.imageUrl} alt={recommendation.nomeFantasia || recommendation.razaoSocial} data-ai-hint={companyLogo.imageHint} />}
          <AvatarFallback>
            <Building className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
        <div className='flex-1'>
          <CardTitle className="font-headline text-lg">{recommendation.nomeFantasia || recommendation.razaoSocial}</CardTitle>
          <CardDescription className='flex items-center gap-2 mt-1'>
            <MapPin className="h-4 w-4" />
            {recommendation.endereco.cidade}, {recommendation.endereco.uf}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="space-y-2">
            <h4 className='text-sm font-medium text-muted-foreground'>CNAE Principal</h4>
            <p className='text-sm'>{recommendation.cnaePrincipal.description}</p>
        </div>
        <div className="space-y-2">
             <h4 className='text-sm font-medium text-muted-foreground'>Tags Operacionais</h4>
            {recommendation.tagsOperacionais.length > 0 ? (
                 <div className='flex flex-wrap gap-2'>
                    {recommendation.tagsOperacionais.map((tag, i) => (
                        <Badge key={i} variant="secondary">{tag}</Badge>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">Nenhuma tag informada.</p>
            )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => onExplain(recommendation)} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          <Sparkles className="mr-2 h-4 w-4" />
          Explicar Racional
        </Button>
      </CardFooter>
    </Card>
  );
}
