# Modelagem de Dados do Firestore - A Ponte

Este documento descreve a estrutura de coleções e os dados armazenados no Firestore para a plataforma "A Ponte". A modelagem foi pensada para otimizar as queries principais da aplicação e garantir escalabilidade.

## Estrutura das Coleções

-   `/users/{userId}`
-   `/companies/{companyId}`
-   `/connections/{connectionId}`
-   `/interactions/{interactionId}`

---

### 1. Coleção `users`

Armazena informações sobre os usuários autenticados na plataforma, suas preferências e a empresa que representam.

**Caminho:** `/users/{userId}`

-   `userId`: O UID do Firebase Authentication.

#### Estrutura do Documento

```json
{
  "uid": "string",
  "email": "string",
  "companyId": "string", // FK para a coleção `companies`
  "subscriptionTier": "string ('free' | 'professional')",
  "preferences": {
    "searchRadiusKm": "number",
    "businessMode": "string ('buy' | 'sell' | 'both')"
  },
  "createdAt": "timestamp"
}
```

#### Índices Recomendados

-   `companyId`: Para buscar todos os usuários de uma mesma empresa.

---

### 2. Coleção `companies`

Contém o perfil detalhado de cada empresa cadastrada na plataforma. É a coleção central para as buscas e recomendações.

**Caminho:** `/companies/{companyId}`

#### Estrutura do Documento

```json
{
  "id": "string",
  "cnpj": "string",
  "razaoSocial": "string",
  "nomeFantasia": "string",
  "cnaePrincipal": {
    "code": "string",
    "description": "string"
  },
  "cnaesSecundarios": ["array<object>"],
  "bioInstitucional": "string",
  "endereco": {
    "cidade": "string",
    "uf": "string",
    "cep": "string",
    "...": "..."
  },
  "latitude": "number",
  "longitude": "number",
  "geohash": "string",
  "tagsOperacionais": ["array<string>"],
  "fotos": ["array<string>"],
  "createdAt": "timestamp"
}
```

#### Índices Recomendados

-   **`geohash`**: Essencial para queries geoespaciais (buscar empresas em um raio).
-   **`cnaePrincipal.code`**: Para filtrar empresas por setor de atividade.
-   **`tagsOperacionais` (array-contains)**: Para buscar empresas com tags operacionais específicas.
-   **`endereco.uf`** e **`endereco.cidade`**: Para filtros de localização.
-   **Índices compostos** serão necessários para combinar os filtros acima. Por exemplo: `(geohash, cnaePrincipal.code)` ou `(endereco.uf, cnaePrincipal.code)`. O console do Firestore sugerirá a criação desses índices quando as queries forem executadas no código.

---

### 3. Coleção `connections`

Registra o estado de uma conexão entre duas empresas.

**Caminho:** `/connections/{connectionId}`

#### Estrutura do Documento

```json
{
  "id": "string",
  "requesterCompanyId": "string", // FK para `companies`
  "targetCompanyId": "string",    // FK para `companies`
  "status": "string ('requested' | 'connected' | 'dismissed')",
  "compatibilityScore": "number",
  "compatibilityReason": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### Índices Recomendados

-   **`(requesterCompanyId, status)`**: Para que uma empresa possa ver suas solicitações enviadas.
-   **`(targetCompanyId, status)`**: Para que uma empresa possa ver as solicitações recebidas.
-   Índice composto para identificar uma conexão única: **`(requesterCompanyId, targetCompanyId)`**.

---

### 4. Coleção `interactions`

Log de interações importantes do usuário, como solicitar conexão ou dispensar uma recomendação. Útil para analytics e para evitar mostrar empresas já dispensadas.

**Caminho:** `/interactions/{interactionId}`

#### Estrutura do Documento

```json
{
  "id": "string",
  "userId": "string", // FK para `users`
  "companyId": "string", // FK para `companies` (a empresa que sofreu a ação)
  "action": "string ('connection_request' | 'dismiss')",
  "timestamp": "timestamp"
}
```

#### Índices Recomendados

-   **`(userId, action)`**: Para buscar todas as interações de um tipo por um usuário (ex: todas as empresas que um usuário dispensou).
-   **`(userId, companyId)`**: Para verificar rapidamente se um usuário já interagiu com uma empresa específica.
```