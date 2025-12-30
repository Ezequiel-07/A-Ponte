"use client";

import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  type Auth,
} from "firebase/auth";

import { useToast } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useAuth } from './AuthProvider';


const formSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
});

type FormValues = z.infer<typeof formSchema>;


export function AuthForm() {
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const { toast } = useToast();
  const { auth } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  const handleAuthError = (error: any, context: string) => {
    console.error(`Error during ${context}:`, error);
    let description = "Ocorreu um erro inesperado. Tente novamente.";
    if (error.code) {
        switch (error.code) {
            case 'auth/wrong-password':
                description = "Senha incorreta. Por favor, tente novamente.";
                break;
            case 'auth/user-not-found':
                description = "Nenhuma conta encontrada com este email.";
                break;
            case 'auth/email-already-in-use':
                description = "Este email já está em uso por outra conta.";
                break;
            case 'auth/invalid-credential':
                 description = "Credenciais inválidas. Verifique seu email e senha.";
                 break;
            default:
                description = `Erro: ${error.message}`;
        }
    }
    toast({
        variant: "destructive",
        title: `Erro no ${context}`,
        description: description,
    });
  }

  const handleLogin = async (values: FormValues) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({ title: "Login bem-sucedido!", description: "Redirecionando para a plataforma..." });
    } catch (error: any) {
      handleAuthError(error, 'login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: FormValues) => {
    setLoading(true);
    try {
      // The user profile will be created by the onAuthStateChanged listener in AuthProvider
      await createUserWithEmailAndPassword(auth, values.email, values.password);
      toast({ title: "Cadastro realizado com sucesso!", description: "Você será redirecionado para completar seu perfil." });
    } catch (error: any) {
      handleAuthError(error, 'cadastro');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoadingGoogle(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // Profile creation for Google Sign-In is handled by the AuthProvider's onAuthStateChanged listener
      toast({ title: "Login com Google bem-sucedido!" });
    } catch (error: any) => {
      handleAuthError(error, 'login com Google');
    } finally {
      setLoadingGoogle(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <Tabs defaultValue="login" className="w-full">
        <CardHeader>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Cadastrar</TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent>
          <TabsContent value="login">
            <CardHeader className="px-0">
              <CardTitle className="font-headline">Bem-vindo de volta</CardTitle>
              <CardDescription>Acesse sua conta para encontrar novas parcerias.</CardDescription>
            </CardHeader>
            <div className="space-y-4">
              <Button onClick={handleGoogleSignIn} variant="outline" className="w-full" disabled={loadingGoogle || loading}>
                {loadingGoogle ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 62.3l-66.5 64.6C305.5 102.7 274.6 92 248 92c-88.8 0-160.1 71.1-160.1 164s71.3 164 160.1 164c98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.8z"></path></svg>}
                Entrar com Google
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Ou continue com</span>
                </div>
              </div>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-6 mt-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="seu@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="********" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={loading || loadingGoogle}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Entrar
                </Button>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="register">
            <CardHeader className="px-0">
              <CardTitle className="font-headline">Crie sua conta</CardTitle>
              <CardDescription>Comece a construir conexões inteligentes hoje mesmo.</CardDescription>
            </CardHeader>
             <div className="space-y-4">
              <Button onClick={handleGoogleSignIn} variant="outline" className="w-full" disabled={loadingGoogle || loading}>
                {loadingGoogle ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 62.3l-66.5 64.6C305.5 102.7 274.6 92 248 92c-88.8 0-160.1 71.1-160.1 164s71.3 164 160.1 164c98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.8z"></path></svg>}
                Cadastrar com Google
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Ou cadastre com email</span>
                </div>
              </div>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleRegister)} className="space-y-6 mt-4">
                 <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="seu@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="********" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={loading || loadingGoogle}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Cadastrar
                </Button>
              </form>
            </Form>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
