'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { Loader2, Building, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/toaster';
import { geocodeAddress, generateGeohash } from '@/lib/geocoding';
import { db } from '@/lib/firebase/client';
import type { CompanyProfile, Company } from '@/lib/types';
import { Logo } from '@/components/Logo';

const onboardingSchema = z.object({
  cnpj: z.string().regex(/^\d{14}$/, 'Por favor, insira um CNPJ válido com 14 dígitos.'),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export default function OnboardingPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user && userProfile?.companyId) {
        router.replace('/dashboard');
    }
  }, [user, userProfile, authLoading, router]);

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      cnpj: '',
    },
  });

  const handleCnpjSubmit = async (values: OnboardingFormValues) => {
    setIsLoading(true);
    setError(null);
    setCompanyData(null);

    if (!user) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Usuário não autenticado.' });
        setIsLoading(false);
        return;
    }

    try {
      const response = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${values.cnpj}`);
      const data: CompanyProfile = response.data;
      
      if (!data.logradouro || !data.municipio || !data.uf) {
        throw new Error('Endereço inválido retornado pela API.');
      }

      setCompanyData(data);
      toast({ title: 'Empresa Encontrada!', description: data.razao_social });
    } catch (err) {
      setError('Não foi possível encontrar dados para este CNPJ. Verifique o número e tente novamente.');
      toast({ variant: 'destructive', title: 'Erro ao buscar CNPJ' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmCompany = async () => {
    if (!companyData || !user) return;
    
    setIsLoading(true);
    setError(null);

    try {
        const geo = await geocodeAddress({
            logradouro: companyData.logradouro,
            cidade: companyData.municipio,
            uf: companyData.uf,
            cep: companyData.cep,
        });

        if (!geo) {
            throw new Error('Não foi possível obter a geolocalização para o endereço da empresa.');
        }

        const geohash = generateGeohash(geo.lat, geo.lon);

        const companyId = uuidv4();
        const companyRef = doc(db, 'companies', companyId);
        
        const newCompanyData: Company = {
            id: companyId,
            cnpj: companyData.cnpj,
            razaoSocial: companyData.razao_social,
            nomeFantasia: companyData.nome_fantasia,
            phoneNumber: companyData.ddd_telefone_1,
            cnaePrincipal: {
                code: companyData.cnae_fiscal.toString(),
                description: companyData.cnae_fiscal_descricao,
            },
            cnaesSecundarios: companyData.cnaes_secundarios.map(c => ({code: c.codigo.toString(), description: c.descricao})),
            bioInstitucional: '', 
            endereco: {
                logradouro: companyData.logradouro,
                numero: companyData.numero,
                bairro: companyData.bairro,
                cidade: companyData.municipio,
                uf: companyData.uf,
                cep: companyData.cep.replace(/\D/g, ''),
                pais: 'Brasil',
            },
            latitude: geo.lat,
            longitude: geo.lon,
            geohash,
            tagsOperacionais: [],
            fotos: [],
            ownerId: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        const userRef = doc(db, 'users', user.uid);

        const batch = writeBatch(db);
        batch.set(companyRef, newCompanyData);
        batch.update(userRef, { companyId: companyId });

        await batch.commit();
        
        toast({ title: 'Perfil da empresa criado com sucesso!', description: 'Redirecionando para a plataforma.'});
        router.push('/dashboard');

    } catch (err: any) {
        setError(err.message || 'Ocorreu um erro ao salvar os dados. Tente novamente.');
        toast({ variant: 'destructive', title: 'Erro ao Confirmar Empresa' });
        setIsLoading(false);
    }
  }

  if (authLoading || !user) {
     return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
        <div className="absolute top-8 left-8">
           <Logo />
        </div>
        <Card className="w-full max-w-2xl shadow-2xl">
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2">
              <Building className="h-6 w-6" />
              Complete seu Perfil
            </CardTitle>
            <CardDescription>
              Para começar, precisamos saber qual empresa você representa.
              Por favor, informe o CNPJ.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!companyData ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCnpjSubmit)} className="flex items-start gap-4">
                  <FormField
                    control={form.control}
                    name="cnpj"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>CNPJ</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite o CNPJ (apenas números)" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading} className='self-end'>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buscar Empresa'}
                  </Button>
                </form>
              </Form>
            ) : (
                <div className='space-y-4'>
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>{companyData.razao_social}</AlertTitle>
                        <AlertDescription>
                           {companyData.logradouro}, {companyData.numero} - {companyData.bairro}, {companyData.municipio} - {companyData.uf}
                        </AlertDescription>
                    </Alert>
                    <p className='text-sm text-muted-foreground'>Esta é a sua empresa? Se sim, clique em confirmar para finalizar seu cadastro.</p>
                     <div className='flex gap-4'>
                        <Button variant="outline" onClick={() => {setCompanyData(null); form.reset();}} disabled={isLoading}>
                            Digitar outro CNPJ
                        </Button>
                        <Button onClick={handleConfirmCompany} disabled={isLoading}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmar e Continuar'}
                        </Button>
                     </div>
                </div>
            )}
            {error && (
              <p className="text-sm font-medium text-destructive">{error}</p>
            )}
          </CardContent>
        </Card>
      </div>
  );
}
