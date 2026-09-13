# Database Schema: PZHub Ecosystem (Supabase PostgreSQL)

Este documento descreve a estrutura de dados persistida no banco de dados **PostgreSQL do Supabase (Free Tier)** para o ecossistema **PZHub Web & Desktop**.

---

## 1. Tabela: `public.profiles`
Armazena os dados cadastrais e públicos dos criadores de modpack autenticados.

| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PK, references `auth.users(id)` | Identificador único do usuário no Supabase Auth |
| `username` | `text` | `unique`, `not null` | Nome de exibição público do criador |
| `avatar_url` | `text` | `nullable` | URL da foto/avatar do perfil |
| `discord_tag` | `text` | `nullable` | Tag do Discord para contato comunitário |
| `bio` | `text` | `nullable` | Biografia do criador / facção |
| `created_at` | `timestamptz` | `default now()`, `not null` | Data de cadastro |

---

## 2. Tabela: `public.modpacks`
Armazena os modpacks publicados no catálogo comunitário.

| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PK, `default gen_random_uuid()` | Identificador único do modpack |
| `slug` | `text` | `unique`, `not null` | Identificador amigável para URLs e sincronização (ex: `viccs-tactical-b42`) |
| `name` | `text` | `not null` | Título do modpack |
| `description` | `text` | `not null` | Descrição detalhada do conteúdo e regras |
| `banner_url` | `text` | `not null` | URL da imagem de capa/banner em alta resolução |
| `author_id` | `uuid` | FK `profiles(id)`, `on delete set null` | ID do criador |
| `author_name` | `text` | `not null` | Nome do criador ou facção responsável |
| `version` | `text` | `default '1.0.0'`, `not null` | Versão do modpack |
| `zomboid_version` | `text` | `default '42.0+'`, `not null` | Compatibilidade (Build 42.0+, Build 41, etc.) |
| `category` | `text` | `default 'Militar'`, `not null` | Categoria (`Militar`, `Hardcore`, `Veículos`, `Roleplay`, `Vanilla+`) |
| `is_public` | `boolean` | `default true`, `not null` | Visibilidade no catálogo público |
| `downloads_count` | `integer` | `default 0`, `not null` | Contador de instalações |
| `likes_count` | `integer` | `default 0`, `not null` | Contador de curtidas / votos |
| `mods` | `jsonb` | `default '[]'::jsonb`, `not null` | Array estruturado com os mods inclusos no pacote |
| `created_at` | `timestamptz` | `default now()`, `not null` | Data de publicação |
| `updated_at` | `timestamptz` | `default now()`, `not null` | Data da última atualização |

---

## 3. Tabela: `public.direct_messages`
Armazena as mensagens diretas e privadas trocadas entre operadores via Painel Social Desktop / DM Pop-up, garantindo isolamento total em relação ao mural comunitário do website.

| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PK, `default gen_random_uuid()` | Identificador único da mensagem |
| `sender_id` | `uuid` | FK `profiles(id)`, `not null` | ID do operador remetente |
| `receiver_id` | `uuid` | FK `profiles(id)`, `not null` | ID do operador destinatário |
| `sender_name` | `text` | `not null` | Nome do operador remetente |
| `sender_avatar` | `text` | `nullable` | Foto de perfil / avatar do remetente |
| `message` | `text` | `not null` | Conteúdo da mensagem de texto |
| `created_at` | `timestamptz` | `default now()`, `not null` | Carimbo de data e hora do envio |

---

## 4. Estrutura do Campo `mods` (JSONB em `modpacks`)

```json
[
  {
    "id": "VICCSRadarBridge",
    "name": "VICCS Radar Bridge (B42 Native)",
    "mod_type": "builtin",
    "required": true,
    "description": "Transmissor de telemetria ao vivo para o Radar PZHub"
  },
  {
    "id": "1510950729",
    "name": "Filibuster Rhymes' Used Cars! B42",
    "mod_type": "workshop",
    "workshop_id": "1510950729",
    "required": true,
    "description": "Veículos militares e civis autênticos da era 1993"
  },
  {
    "id": "CustomMilitaryGear",
    "name": "VICCS Custom Military Gear Pack",
    "mod_type": "direct_download",
    "download_url": "https://example.com/military_gear.zip",
    "folder_name": "CustomMilitaryGear",
    "required": false,
    "description": "Uniformes e equipamentos táticos"
  }
]
```

---

## 5. Políticas de Segurança (Row Level Security - RLS)

### `public.modpacks`
- **Leitura Pública:** Aberta para qualquer cliente (`is_public = true`). Consumida diretamente pelo aplicativo desktop PZHub e pela vitrine web.
- **Inserção / Atualização:** Restrita a usuários autenticados via Supabase Auth (`auth.uid() = author_id`).

### `public.profiles`
- **Leitura Pública:** Aberta para usuários autenticados e clientes públicos para exibição de operadores e criadores.
- **Atualização:** Restrita ao próprio operador dono do perfil (`auth.uid() = id`).

### `public.direct_messages`
- **Leitura Privada:** Exclusiva para participantes da conversa: `(auth.uid() = sender_id OR auth.uid() = receiver_id)`. Nenhum usuário de fora ou visitante anônimo tem acesso de leitura.
- **Inserção:** Permitida somente para usuários autenticados enviando como eles mesmos: `auth.uid() = sender_id`.

