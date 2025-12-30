
'use client';

import type { Company } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, MapPin, MessageCircle } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface ConnectionCardProps {
  company: Company;
}

export function ConnectionCard({ company }: ConnectionCardProps) {
    const companyLogo = PlaceHolderImages.find(p => p.id === `company-logo-1`);

    const handleWhatsAppClick = () => {
        const phone = company.phoneNumber?.replace(/\D/g, '');
        if (!phone) {
            alert('Esta empresa não possui um número de telefone cadastrado.');
            return;
        }
        const message = encodeURIComponent('Olá, encontramos sua empresa através da plataforma A Ponte e gostaríamos de iniciar uma conversa.');
        window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
    };

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
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                <div className="space-y-1">
                    <h4 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>Setor Principal</h4>
                    <p className='text-sm leading-snug'>{company.cnaePrincipal.description}</p>
                </div>
                 <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                    Conexão estabelecida
                </Badge>
            </CardContent>
            <CardFooter>
                <Button onClick={handleWhatsAppClick} className="w-full bg-green-500 hover:bg-green-600 text-white">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Iniciar Conversa (WhatsApp)
                </Button>
            </CardFooter>
        </Card>
    );
}
