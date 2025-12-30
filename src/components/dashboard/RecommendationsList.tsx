'use client';

import type { Connection } from '@/lib/types';
import { RecommendationCard } from './RecommendationCard';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatePresence, motion } from 'framer-motion';

interface RecommendationsListProps {
  recommendations: Connection[];
  isLoading: boolean;
  onExplain: (recommendation: Connection) => void;
}

function RecommendationSkeleton() {
    return (
        <div className="flex flex-col space-y-3 rounded-lg border bg-card p-6">
            <div className='flex items-start space-x-4'>
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-6 w-14 rounded-full" />
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
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
            {recommendations.map((rec, index) => (
                <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    layout
                >
                    <RecommendationCard recommendation={rec} onExplain={onExplain} index={index} />
                </motion.div>
            ))}
      </AnimatePresence>
    </div>
  );
}
