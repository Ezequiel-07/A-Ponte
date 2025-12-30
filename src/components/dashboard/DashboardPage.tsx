"use client";

import { useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { explainRecommendation, generatePartnershipRecommendations } from '@/ai/flows';
import type { CompanyProfile, PartnershipRecommendation } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Search, Sparkles, AlertCircle } from 'lucide-react';
import { RecommendationsList } from './RecommendationsList';
import { RationaleSheet } from './RationaleSheet';

const searchSchema = z.object({
  cnpj: z.string().regex(/^\d{14}$/, 'Por favor, insira um CNPJ válido com 14 dígitos.'),
});

type SearchFormValues = z.infer<typeof searchSchema>;

// Mocking the AI output for demonstration
const mockRecommendations: PartnershipRecommendation[] = [
    { company: { cnpj: "19131243000197", razao_social: "GOOGLE BRASIL INTERNET LTDA.", nome_fantasia: "GOOGLE", cnae_fiscal_descricao: "Portais, provedores de conteúdo e outros serviços de informação na internet", uf: "SP", municipio: "SAO PAULO", ddd_telefone_1: "1123958400", descricao_porte: 'DEMAIS', natureza_juridica: 'Sociedade Empresária Limitada' }, synergy_score: 92, key_factors: ["Tecnologia", "Inovação", "Mercado Global"] },
    { company: { cnpj: "03361252000104", razao_social: "MERCADOLIVRE.COM ATIVIDADES DE INTERNET LTDA", nome_fantasia: "MERCADO LIVRE", cnae_fiscal_descricao: "Atividades de intermediação e agenciamento de serviços e negócios em geral, exceto imobiliários", uf: "SP", municipio: "OSASCO", ddd_telefone_1: "1125434140", descricao_porte: 'DEMAIS', natureza_juridica: 'Sociedade Empresária Limitada' }, synergy_score: 88, key_factors: ["E-commerce", "Logística", "Marketplace"] },
    { company: { cnpj: "07207959000109", razao_social: "NU PAGAMENTOS S.A. - INSTITUICAO DE PAGAMENTO", nome_fantasia: "NUBANK", cnae_fiscal_descricao: "Outras atividades de serviços financeiros não especificadas anteriormente", uf: "SP", municipio: "SAO PAULO", ddd_telefone_1: "1120390650", descricao_porte: 'DEMAIS', natureza_juridica: 'Sociedade Anônima Fechada' }, synergy_score: 85, key_factors: ["Fintech", "Inovação Financeira", "Experiência do Usuário"] },
];


export default function DashboardPage() {
  const [targetCompany, setTargetCompany] = useState<CompanyProfile | null>(null);
  const [recommendations, setRecommendations] = useState<PartnershipRecommendation[]>([]);
  const [isSearchingCnpj, setIsSearchingCnpj] = useState(false);
  const [isGeneratingRecs, setIsGeneratingRecs] = useState(false);
  const [rationale, setRationale] = useState<string | null>(null);
  const [isGeneratingRationale, setIsGeneratingRationale] = useState(false);
  const [selectedForRationale, setSelectedForRationale] = useState<PartnershipRecommendation | null>(null);

  const { toast } = useToast();

  const searchForm = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: { cnpj: '' },
  });

  const handleCnpjSearch = async ({ cnpj }: SearchFormValues) => {
    setIsSearchingCnpj(true);
    setTargetCompany(null);
    setRecommendations([]);
    try {
      const response = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
      setTargetCompany(response.data);
      toast({ title: 'Empresa encontrada!', description: response.data.razao_social });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao buscar CNPJ',
        description: 'Não foi possível encontrar a empresa. Verifique o CNPJ e tente novamente.',
      });
    } finally {
      setIsSearchingCnpj(false);
    }
  };

  const handleFindPartners = async () => {
    if (!targetCompany) return;
    setIsGeneratingRecs(true);
    setRecommendations([]);
    try {
        // In a real scenario, you would use the AI flow:
        // const result = await generatePartnershipRecommendations({ companyProfile: JSON.stringify(targetCompany) });
        // For now, we use mock data.
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
        setRecommendations(mockRecommendations);
        toast({ title: 'Recomendações geradas!', description: `Encontramos ${mockRecommendations.length} parceiros em potencial.` });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao gerar recomendações',
        description: 'A IA não conseguiu processar a solicitação. Tente novamente mais tarde.',
      });
    } finally {
      setIsGeneratingRecs(false);
    }
  };

    const handleExplain = async (recommendation: PartnershipRecommendation) => {
        if (!targetCompany) return;
        setSelectedForRationale(recommendation);
        setIsGeneratingRationale(true);
        setRationale(null);
        try {
            const result = await explainRecommendation({
                companyProfile1: JSON.stringify(targetCompany),
                companyProfile2: JSON.stringify(recommendation.company),
                objectiveCriteria: `Localização, CNAE (${recommendation.company.cnae_fiscal_descricao}), e perfil operacional.`
            });
            setRationale(result.rationale);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Erro ao gerar explicação',
                description: 'A IA não conseguiu processar a solicitação. Tente novamente mais tarde.',
            });
             setIsGeneratingRationale(false);
             setSelectedForRationale(null);
        } finally {
             setIsGeneratingRationale(false);
        }
    };


  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Search className="h-6 w-6" />
            Encontrar Conexões
          </CardTitle>
          <CardDescription>
            Comece inserindo o CNPJ da sua empresa para que nossa IA possa encontrar os melhores parceiros.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...searchForm}>
            <form onSubmit={searchForm.handleSubmit(handleCnpjSearch)} className="flex items-start gap-4">
              <FormField
                control={searchForm.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="Digite o CNPJ da sua empresa (apenas números)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSearchingCnpj}>
                {isSearchingCnpj ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buscar Empresa'}
              </Button>
            </form>
          </Form>
          {targetCompany && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{targetCompany.razao_social}</AlertTitle>
              <AlertDescription>
                Empresa selecionada. Agora, clique em "Encontrar Parceiros" para iniciar a análise da IA.
              </AlertDescription>
              <Button onClick={handleFindPartners} disabled={isGeneratingRecs} className="mt-4 w-full">
                {isGeneratingRecs && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Sparkles className="mr-2 h-4 w-4" />
                Encontrar Parceiros
              </Button>
            </Alert>
          )}
        </CardContent>
      </Card>

      {(isGeneratingRecs || recommendations.length > 0) && (
        <div>
            <h2 className='font-headline text-2xl mb-4'>Recomendações de Parceria</h2>
            <RecommendationsList recommendations={recommendations} isLoading={isGeneratingRecs} onExplain={handleExplain}/>
        </div>
      )}

      <RationaleSheet
        isOpen={!!selectedForRationale}
        onOpenChange={(open) => !open && setSelectedForRationale(null)}
        recommendation={selectedForRationale}
        rationale={rationale}
        isLoading={isGeneratingRationale}
      />
    </div>
  );
}
