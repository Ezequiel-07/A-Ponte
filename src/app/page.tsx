import { MainHeader } from "@/components/layout/MainHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ArrowRight, BrainCircuit, Search, DatabaseZap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-background');
  const featureSearchImage = PlaceHolderImages.find(img => img.id === 'feature-search');
  const featureAiImage = PlaceHolderImages.find(img => img.id === 'feature-ai');
  const featureDataImage = PlaceHolderImages.find(img => img.id === 'feature-data');

  const features = [
    {
      icon: <Search className="h-10 w-10 text-primary" />,
      title: "Filtro Lógico",
      description: "Busque empresas por localização, CNAE e CNPJ para encontrar parceiros que atendem aos seus critérios objetivos.",
      image: featureSearchImage
    },
    {
      icon: <BrainCircuit className="h-10 w-10 text-primary" />,
      title: "IA Explicável",
      description: "Receba recomendações de parceria com justificativas claras, analisando perfis operacionais e sinergias.",
      image: featureAiImage
    },
    {
      icon: <DatabaseZap className="h-10 w-10 text-primary" />,
      title: "Integração de Dados",
      description: "Sincronize dados de empresas automaticamente via Brasil API, garantindo perfis sempre atualizados.",
      image: featureDataImage
    }
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <MainHeader />
      <main className="flex-1">
        <section className="relative h-[70vh] min-h-[500px] w-full pt-20">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              priority
              data-ai-hint={heroImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
          <div className="container relative z-10 mx-auto flex h-full flex-col items-start justify-center px-4 text-left">
            <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
              Construa Conexões
              <br />
              de Negócios Inteligentes.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              A Ponte é a plataforma B2B que utiliza IA explicável para conectar sua empresa a parceiros com alto potencial de sinergia.
            </p>
            <Button size="lg" className="mt-8" asChild>
              <Link href="/dashboard">
                Comece a Conectar
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        <section id="features" className="py-20 sm:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Uma nova forma de criar parcerias.
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Combine a precisão de filtros objetivos com a profundidade da análise de IA.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
              {features.map((feature, index) => (
                <Card key={index} className="overflow-hidden transition-transform hover:scale-105 hover:shadow-xl">
                  {feature.image && (
                     <div className="h-48 w-full overflow-hidden">
                        <Image
                            src={feature.image.imageUrl}
                            alt={feature.image.description}
                            width={600}
                            height={400}
                            className="h-full w-full object-cover"
                            data-ai-hint={feature.image.imageHint}
                        />
                     </div>
                  )}
                  <CardHeader>
                    <div className="mb-4 flex items-center gap-4">
                       {feature.icon}
                       <CardTitle className="font-headline text-2xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-24 bg-secondary">
          <div className="container mx-auto px-4 text-center">
             <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Pronto para construir sua próxima grande parceria?
            </h2>
            <p className="mt-4 mx-auto max-w-xl text-lg text-muted-foreground">
              Junte-se à A Ponte e descubra oportunidades de negócio que você nem imaginava existirem.
            </p>
            <Button size="lg" className="mt-8" asChild>
              <Link href="/dashboard">
                Acessar a Plataforma
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <footer className="py-8 bg-background border-t">
          <div className="container mx-auto px-4 text-center text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} A Ponte. Todos os direitos reservados.</p>
          </div>
      </footer>
    </div>
  );
}
