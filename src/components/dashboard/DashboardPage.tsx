
"use client";

import { useState } from 'react';
import { useToast } from '@/components/ui/toaster';
import { Company, Connection } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search, Sparkles } from 'lucide-react';
import { RecommendationsList } from './RecommendationsList';
import { RationaleSheet } from './RationaleSheet';
import { useAuth } from '../auth/AuthProvider';
import { findPotentialPartners, analyzePartners } from '@/lib/data/connections';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { ConfirmPartnersDialog } from './ConfirmPartnersDialog';

// Helper function to convert Firestore Timestamps to ISO strings
const convertTimestamps = (obj: any): any => {
    if (obj instanceof Timestamp) {
        return obj.toDate().toISOString();
    }
    if (Array.isArray(obj)) {
        return obj.map(convertTimestamps);
    }
    if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
            acc[key] = convertTimestamps(obj[key]);
            return acc;
        }, {} as { [key: string]: any });
    }
    return obj;
};

export default function DashboardPage() {
  const { user, userProfile, db } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [potentialPartners, setPotentialPartners] = useState<Company[]>([]);
  const [recommendations, setRecommendations] = useState<Connection[]>([]);
  
  const [selectedForRationale, setSelectedForRationale] = useState<Connection | null>(null);

  const { toast } = useToast();

  const handleFindPartners = async () => {
    if (!user || !userProfile?.companyId || !db) {
      toast({
        variant: 'destructive',
        title: 'Perfil incompleto ou erro de conexão',
        description: 'Você precisa ter uma empresa associada para buscar parceiros.',
      });
      return;
    };

    setIsLoading(true);
    setRecommendations([]);
    setPotentialPartners([]);

    try {
        const companyRef = doc(db, "companies", userProfile.companyId);
        const companySnap = await getDoc(companyRef);

        if (!companySnap.exists()) {
            throw new Error("Não foi possível encontrar sua empresa.");
        }
        
        const userCompany = companySnap.data() as Company;
        const plainUserCompany = convertTimestamps(userCompany);

        const results = await findPotentialPartners(user.uid, userProfile, plainUserCompany);
        
        if (results.length > 0) {
            setPotentialPartners(results);
        } else {
            toast({ title: 'Nenhum parceiro encontrado', description: 'Nenhuma empresa compatível foi encontrada com seus filtros atuais. Tente ajustar seu raio de busca.' });
        }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao buscar parceiros',
        description: error.message || 'Não conseguimos processar a solicitação. Tente novamente mais tarde.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAndAnalyze = async (partnersToAnalyze: Company[]) => {
    if (!user || !userProfile?.companyId || !db) return;

    setPotentialPartners([]); // Fecha o modal
    setIsAnalyzing(true);

    try {
        const companyRef = doc(db, "companies", userProfile.companyId);
        const companySnap = await getDoc(companyRef);

        if (!companySnap.exists()) {
            throw new Error("Não foi possível encontrar sua empresa.");
        }
        
        const userCompany = companySnap.data() as Company;
        const plainUserCompany = convertTimestamps(userCompany);

        const analysisResults = await analyzePartners(plainUserCompany, partnersToAnalyze);

        setRecommendations(analysisResults);
        
        toast({ title: 'Recomendações geradas!', description: `Encontramos ${analysisResults.length} parceiros em potencial.` });
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Erro ao analisar parceiros',
            description: error.message || 'A análise da IA falhou. Tente novamente.',
        });
    } finally {
        setIsAnalyzing(false);
    }
  }

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
            <Button onClick={handleFindPartners} disabled={isLoading || isAnalyzing} size="lg" className="w-full sm:w-auto">
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Encontrar Parceiros Potenciais
                </Button>
            </CardContent>
        </Card>
      </motion.div>
      
      {(isAnalyzing || recommendations.length > 0) && (
        <div>
            <motion.h2 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className='font-headline text-2xl mb-4'>Recomendações de Parceria</motion.h2>
            <RecommendationsList 
              recommendations={recommendations} 
              isLoading={isAnalyzing} 
              onExplain={handleExplain}
            />
        </div>
      )}

      {recommendations.length === 0 && !isAnalyzing && !isLoading && (
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

      <ConfirmPartnersDialog
        isOpen={potentialPartners.length > 0}
        partners={potentialPartners}
        onConfirm={handleConfirmAndAnalyze}
        onCancel={() => setPotentialPartners([])}
      />
    </div>
  );
}
