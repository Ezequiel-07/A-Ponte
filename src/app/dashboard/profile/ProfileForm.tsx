'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useToast } from '@/lib/hooks/use-toast';
import { UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

const profileSchema = z.object({
  searchRadiusKm: z.number().min(5).max(100),
  businessMode: z.enum(['buy', 'sell']),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  userProfile: UserProfile;
}

export function ProfileForm({ userProfile }: ProfileFormProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const isProfessional = userProfile.subscriptionTier === 'professional';

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      searchRadiusKm: userProfile.preferences?.searchRadiusKm || (isProfessional ? 50 : 10),
      businessMode: userProfile.preferences?.businessMode || 'sell',
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', userProfile.uid);
      await updateDoc(userRef, {
        preferences: data,
      });
      toast({
        title: 'Preferências salvas!',
        description: 'Suas novas preferências de busca foram salvas com sucesso.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar suas preferências. Tente novamente.',
      });
    } finally {
        setIsSaving(false);
    }
  };
  
  const maxRadius = isProfessional ? 100 : 15;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="searchRadiusKm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Raio de Busca</FormLabel>
              <FormControl>
                <Controller
                  name="searchRadiusKm"
                  control={form.control}
                  render={({ field: { onChange, value } }) => (
                     <div>
                        <Slider
                            value={[value]}
                            onValueChange={(vals) => onChange(vals[0])}
                            min={5}
                            max={maxRadius}
                            step={5}
                        />
                         <p className="text-center text-sm text-muted-foreground mt-2">{value} km</p>
                     </div>
                  )}
                />
              </FormControl>
               <FormDescription>
                Defina a distância máxima para encontrar empresas parceiras. {!isProfessional && "Assine o plano PRO para um raio de até 100km."}
              </FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="businessMode"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Modo de Operação Principal</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="sell" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Quero encontrar CLIENTES
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="buy" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Quero encontrar FORNECEDORES
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormDescription>
                Isso nos ajuda a refinar as recomendações para você.
              </FormDescription>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Preferências
        </Button>
      </form>
    </Form>
  );
}
