"use client";

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Company, Connection, UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search, Sparkles } from 'lucide-react';
import { RecommendationsList } from './RecommendationsList';
import { RationaleSheet } from './RationaleSheet';
import { useAuth } from '../auth/AuthProvider';
import { findConnections } from '@/lib/connections';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { user, userProfile } = useAuth();
  const [recommendations, setRecommendations] = useState<Connection[]>([]);
  const [isGeneratingRecs, setIsGeneratingRecs] = useState(false);
  const [selectedForRationale, setSelectedForRationale] = useState<Connection | null>(null);

  const { toast } = useToast();

  const handleFindPartners = async () => {
    if (!user || !userProfile?.companyId) {
      toast({
        variant: 'destructive',
        title: 'Perfil incompleto',
        description: 'Você precisa ter uma empresa associada para buscar parceiros.',
      });
      return;
    };

    setIsGeneratingRecs(true);
    setRecommendations([]);

    try {
        const companyRef = doc(db, "companies", userProfile.companyId);
        const companySnap = await getDoc(companyRef);

        if (!companySnap.exists()) {
            throw new Error("Não foi possível encontrar sua empresa.");
        }
        
        const userCompany = companySnap.data() as Company;

        const results = await findConnections(user.uid, userProfile, userCompany);
        
        // Sort results by compatibilityScore
        results.sort((a, b) => (b.compatibilityScore || 0) - (a.compatibilityScore || 0));

        setRecommendations(results);
        
        toast({ title: 'Recomendações geradas!', description: `Encontramos ${results.length} parceiros em potencial.` });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erro ao gerar recomendações',
        description: error.message || 'Não conseguimos processar a solicitação. Tente novamente mais tarde.',
      });
    } finally {
      setIsGeneratingRecs(false);
    }
  };

  const handleExplain = (recommendation: Connection) => {
    setSelectedForRationale(recommendation);
  };


  return (
    <div className="space-y-8">
       <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
            <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2">
                <Search className="h-6 w-6" />
                Encontrar Conexões
            </CardTitle>
            <CardDescription>
                Clique no botão abaixo para que nossa IA possa encontrar os melhores parceiros para sua empresa.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <Button onClick={handleFindPartners} disabled={isGeneratingRecs} size="lg" className="w-full sm:w-auto">
                    {isGeneratingRecs ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Encontrar Parceiros Potenciais
                </Button>
            </CardContent>
        </Card>
      </motion.div>
      
      {(isGeneratingRecs || recommendations.length > 0) && (
        <div>
            <motion.h2 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className='font-headline text-2xl mb-4'>Recomendações de Parceria</motion.h2>
            <RecommendationsList 
              recommendations={recommendations} 
              isLoading={isGeneratingRecs} 
              onExplain={handleExplain}
            />
        </div>
      )}

      {recommendations.length === 0 && !isGeneratingRecs && (
         <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
         >
            <Alert className="text-center flex flex-col items-center justify-center p-8">
                <AlertCircle className="h-8 w-8 mb-4 text-muted-foreground" />
                <AlertTitle className="text-lg font-semibold">Nenhuma recomendação por enquanto!</AlertTitle>
                <AlertDescription className="text-muted-foreground">
                    Clique no botão acima para buscar novas conexões para sua empresa.
                </AlertDescription>
            </Alert>
         </motion.div>
      )}


      <RationaleSheet
        isOpen={!!selectedForRationale}
        onOpenChange={(open) => {
            if(!open) {
                setSelectedForRationale(null);
            }
        }}
        recommendation={selectedForRationale}
      />
    </div>
  );
}
