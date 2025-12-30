'use client';

import type { PartnershipRecommendation } from '@/lib/types';
import { RecommendationCard } from './RecommendationCard';
import { Skeleton } from '@/components/ui/skeleton';

interface RecommendationsListProps {
  recommendations: PartnershipRecommendation[];
  isLoading: boolean;
  onExplain: (recommendation: PartnershipRecommendation) => void;
}

function RecommendationSkeleton() {
    return (
        <div className="flex flex-col space-y-3">
            <div className='flex items-center space-x-4'>
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>
            <div className='space-y-2 pt-4'>
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-full" />
            </div>
             <div className='space-y-2 pt-4'>
                <Skeleton className="h-4 w-[150px]" />
                <div className='flex gap-2'>
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                </div>
            </div>
            <div className='pt-4'>
                <Skeleton className="h-10 w-full rounded-md" />
            </div>
        </div>
    )
}

export function RecommendationsList({ recommendations, isLoading, onExplain }: RecommendationsListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => <RecommendationSkeleton key={i} />)}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h3 className="text-lg font-semibold text-muted-foreground">Nenhuma recomendação encontrada</h3>
            <p className="text-sm text-muted-foreground mt-1">Ajuste seus critérios de busca e tente novamente.</p>
        </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recommendations.map((rec, index) => (
        <RecommendationCard key={rec.company.cnpj} recommendation={rec} onExplain={onExplain} index={index} />
      ))}
    </div>
  );
}
