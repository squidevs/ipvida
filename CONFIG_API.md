# Configuração de APIs - IPV Online

Este documento explica como configurar as integrações de APIs do site.

## 🎥 YouTube Data API

### 1. Obter API Key do YouTube

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a **YouTube Data API v3**
4. Vá em **Credenciais** e crie uma **Chave de API**
5. Copie a chave gerada

### 2. Obter ID do Canal

1. Acesse seu canal do YouTube
2. Clique no ícone do seu canal
3. Clique em "Configurações"
4. Vá em "Configurações avançadas"
5. Copie o **ID do Canal** (começa com UC...)

**OU** use este método:
- Acesse: `https://www.youtube.com/@ipbvida`
- Clique com botão direito > Exibir código-fonte
- Procure por `"channelId":"` e copie o ID

### 3. Configurar no Código

Edite o arquivo `js/api-integracao.js`:

```javascript
const YOUTUBE_API_KEY = 'SUA_CHAVE_AQUI'; // Cole sua API Key
const CANAL_ID = 'UC-XXXXXXXXX'; // Cole o ID do canal
```

### Recursos da API YouTube Implementados:

✅ **Buscar vídeos do canal** - Mostra os últimos 6 vídeos publicados
✅ **Verificar transmissão ao vivo** - Detecta se há live acontecendo agora
✅ **Botão de inscrição** - Redireciona para inscrever no canal
✅ **Botão de assistir ao vivo** - Fica vermelho quando há live

---

## 📖 Bible API (bible-api.com)

### Como Funciona

O site utiliza a **Bible API** (https://bible-api.com) para buscar versículos, salmos e provérbios em Português (tradução Almeida).

### Vantagens:

✅ **Totalmente Gratuita** - Sem necessidade de API Key  
✅ **Sem Limites** - Requisições ilimitadas  
✅ **Simples de Usar** - URL amigável e intuitiva  
✅ **Tradução Almeida** - Versão tradicional em português  

### Formato da API:

```
https://bible-api.com/{livro}+{capitulo}:{versiculo}?translation=almeida
```

**Exemplos:**
```
https://bible-api.com/john+3:16?translation=almeida
https://bible-api.com/psalms+23:1?translation=almeida
https://bible-api.com/proverbs+3:5?translation=almeida
```

### Recursos Implementados:

✅ **Versículo do Dia** - 10 versículos inspiradores rotacionando aleatoriamente  
✅ **Salmo do Dia** - Primeiro versículo de um salmo aleatório (1-150)  
✅ **Provérbio do Dia** - Primeiro versículo de um provérbio aleatório (1-31)  
✅ **Fallback Automático** - Versículos padrão caso a API falhe  

### Observações:

- ✅ **Não requer configuração** - Funciona imediatamente
- ✅ **API pública e gratuita** - Mantida pela comunidade
- ✅ **Resposta em JSON** - Fácil de integrar
- ✅ **Documentação:** [https://bible-api.com](https://bible-api.com)

---

## �📰 Notícias da IPB

### Como Funciona

Como a IPB não possui uma API pública oficial, implementamos duas soluções:

### Opção 1: Dados Mockados (Atual)
Os dados estão hardcoded no arquivo `js/api-integracao.js` na função `buscarNoticiasIPB()`.

**Para atualizar as notícias manualmente:**
1. Abra `js/api-integracao.js`
2. Localize a função `buscarNoticiasIPB()`
3. Edite o array de notícias com novos dados

### Opção 2: RSS Feed (Recomendado)
Para buscar notícias automaticamente do site da IPB:

1. Use um serviço RSS-to-JSON como:
   - [RSS2JSON](https://rss2json.com/)
   - [FeedOcean](https://feedocean.com/)

2. Atualize a função `buscarNoticiasIPB()`:

```javascript
async function buscarNoticiasIPB() {
  try {
    const response = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://ipb.org.br/feed/rss');
    const data = await response.json();
    
    return data.items.map(item => ({
      id: item.guid,
      titulo: item.title,
      descricao: item.description,
      dataPublicacao: item.pubDate,
      categoria: item.categories[0] || 'Notícias',
      link: item.link,
      imagem: item.thumbnail || 'assets/images/default-noticia.jpg'
    }));
  } catch (erro) {
    console.error('Erro ao buscar notícias:', erro);
    return [];
  }
}
```

### Opção 3: Backend Próprio (Avançado)
Crie um backend (Node.js, Python, PHP) que:
1. Faz scraping do site da IPB
2. Armazena notícias em banco de dados
3. Expõe API REST para o frontend consumir

---

## 🎨 Personalização de Imagens

### Imagens das Notícias
Adicione imagens reais na pasta `assets/images/`:
- `noticia-ipb-1.jpg`
- `noticia-ipb-2.jpg`
- `noticia-ipb-3.jpg`
- `noticia-ipb-4.jpg`

**Dimensões recomendadas:** 800x600px (proporção 4:3)

---

## 🔄 Atualização Automática

### Verificação de Live
O sistema verifica automaticamente se há transmissão ao vivo a cada **2 minutos**.

Para alterar a frequência, edite em `js/aplicacao.js`:

```javascript
// Verificar live a cada X milissegundos (120000 = 2 minutos)
setInterval(() => this.verificarLive(), 120000);
```

---

## 🐛 Troubleshooting

### YouTube API não funciona
- ✅ Verifique se a API Key está correta
- ✅ Confirme que a YouTube Data API v3 está ativada no Google Cloud
- ✅ Verifique o console do navegador para erros
- ✅ Certifique-se de que não ultrapassou a cota diária (10.000 unidades/dia grátis)

### Notícias não aparecem
- ✅ Verifique o console do navegador
- ✅ Confirme que as imagens existem na pasta assets
- ✅ Teste o RSS feed manualmente

### Botão "AO VIVO" não atualiza
- ✅ Verifique a API Key do YouTube
- ✅ Confirme que há uma live ativa no canal
- ✅ Aguarde até 2 minutos para atualização automática

---

## 📊 Custos e Limites

### YouTube Data API v3
- **Gratuito:** 10.000 unidades/dia
- **Custo por requisição:**
  - Buscar vídeos: ~100 unidades
  - Verificar live: ~100 unidades
- **Estimativa:** ~200 consultas/dia = 20.000 unidades (precisa conta paga)

**Recomendação:** Implemente cache para reduzir requisições.

---

## 📝 Próximos Passos

1. ✅ Configurar YouTube API
2. ✅ Testar detecção de live
3. ⬜ Decidir estratégia para notícias IPB
4. ⬜ Adicionar imagens reais das notícias
5. ⬜ Implementar cache de API
6. ⬜ Configurar EmailJS para formulário de contato

---

## 🆘 Suporte

Para dúvidas sobre APIs:
- YouTube API: https://developers.google.com/youtube/v3
- RSS2JSON: https://rss2json.com/docs

