'use client';
import { useAuth } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import { ProfileForm } from './ProfileForm';
import { motion } from 'framer-motion';

export default function ProfilePage() {
    const { userProfile } = useAuth();
    
    return (
        <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl flex items-center gap-2">
                           <User className="h-6 w-6" />
                           Perfil e Preferências
                        </CardTitle>
                        <CardDescription>
                            Ajuste suas preferências de busca para encontrar os parceiros ideais.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                <Card>
                    <CardHeader>
                        <CardTitle>Preferências de Busca</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {userProfile && <ProfileForm userProfile={userProfile} />}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
