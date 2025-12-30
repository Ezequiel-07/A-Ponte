# A Ponte

## Propósito do Produto

A Ponte é uma plataforma B2B que conecta empresas com alto potencial de parceria, utilizando critérios objetivos (localização, CNAE, perfil operacional) combinados com Inteligência Artificial explicável.

Nosso diferencial é que a IA não decide sozinha. Ela atua como um analista de negócios sênior, justificando cada recomendação com clareza profissional, transformando dados brutos em insights de parceria estratégica.

## Arquitetura de "Conexão Inteligente"

A arquitetura da plataforma foi desenhada para combinar a precisão de filtros lógicos com o poder analítico da Inteligência Artificial, garantindo recomendações de parceria relevantes e transparentes.

### 1. Filtro Lógico

A primeira camada de conexão é baseada em dados estruturados e objetivos. Os usuários podem buscar e filtrar empresas utilizando critérios essenciais para qualquer parceria de negócios:

-   **Localização:** Encontre parceiros em regiões geográficas específicas para otimizar logística e sinergia local.
-   **CNAE (Classificação Nacional de Atividades Econômicas):** Identifique empresas que atuam em setores complementares ou estratégicos.
-   **Busca por CNPJ:** Através da integração com a [Brasil API](https://brasilapi.com.br/), a plataforma busca dados públicos de empresas, agilizando o cadastro e a verificação de informações.

Essa filtragem inicial cria um conjunto de potenciais parceiros que já atendem aos pré-requisitos básicos do usuário.

### 2. IA Explicável (Explainable AI - XAI)

Após a filtragem lógica, a segunda camada utiliza Inteligência Artificial para analisar os perfis das empresas e gerar recomendações aprofundadas.

-   **Análise de Perfil:** A IA avalia o perfil operacional, o porte, a maturidade e outros dados contextuais de cada empresa para identificar sinergias que não são óbvias apenas com filtros.
-   **Geração de Recomendações:** Utilizando o Gemini através do Firebase Genkit, a plataforma sugere as parcerias mais promissoras dentro do conjunto de empresas filtrado.
-   **Justificativa Profissional:** Este é o nosso principal diferencial. Para cada recomendação, a IA gera uma explicação clara e profissional (racional), detalhando *por que* a parceria é sugerida. Isso capacita os tomadores de decisão com insights acionáveis, em vez de apenas uma lista de contatos.

Essa abordagem de **Filtro Lógico + IA Explicável** garante que as conexões propostas pela "A Ponte" sejam não apenas inteligentes, mas também compreensíveis e confiáveis.

## Stack Tecnológica

-   **Frontend:** Next.js (React com App Router)
-   **Estilização:** TailwindCSS + Shadcn/ui
-   **Animações:** Framer Motion
-   **Backend & BaaS:** Firebase (Authentication, Firestore)
-   **IA:** Firebase Genkit (Gemini)
-   **Integração Externa:** Brasil API (para dados de CNPJ)
