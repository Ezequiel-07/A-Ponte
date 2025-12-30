'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getEstablishedConnections } from '@/lib/data/connections';
import { Connection, Company } from '@/lib/types';
import { Loader2, Handshake, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ConnectionCard } from './ConnectionCard';
import { motion, AnimatePresence } from 'framer-motion';

export default function ConnectionsPage() {
  const { userProfile } = useAuth();
  const [connections, setConnections] = useState<({ connection: Connection; company: Company })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConnections = async () => {
      if (!userProfile?.companyId) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        setError(null);
        const establishedConnections = await getEstablishedConnections(userProfile.companyId);
        setConnections(establishedConnections);
      } catch (err: any) {
        console.error("Error fetching connections: ", err);
        setError('Não foi possível carregar as conexões.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchConnections();
  }, [userProfile?.companyId]);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2">
              <Handshake className="h-6 w-6" />
              Conexões Estabelecidas
            </CardTitle>
            <CardDescription>
              Aqui estão as empresas que também demonstraram interesse em se conectar com você.
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.div>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}

      {!isLoading && error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && connections.length === 0 && (
         <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <Alert className="text-center flex flex-col items-center justify-center p-8">
                <AlertCircle className="h-8 w-8 mb-4 text-muted-foreground" />
                <AlertTitle className="text-lg font-semibold">Nenhuma conexão por enquanto!</AlertTitle>
                <AlertDescription className="text-muted-foreground">
                    Quando uma empresa que você se interessou também se interessar por você, ela aparecerá aqui.
                </AlertDescription>
            </Alert>
         </motion.div>
      )}

      {!isLoading && connections.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {connections.map(({ company }, index) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ConnectionCard company={company} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
