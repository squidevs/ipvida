# 📱 IPVONLINE - Instituto Pastoral da Vida

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![PWA](https://img.shields.io/badge/PWA-Ready-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=flat&logo=javascript&logoColor=%23F7DF1E)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)

## 📋 Sobre o Projeto

O **IPVONLINE** é um Progressive Web App (PWA) desenvolvido para o Instituto Pastoral da Vida, oferecendo uma plataforma digital completa para a comunidade religiosa. O aplicativo combina tecnologia moderna com valores espirituais, proporcionando acesso fácil a conteúdos bíblicos, funcionalidades de oração, e ferramentas para fortalecimento da fé.

### ✨ Funcionalidades Principais

- 📖 **Versículo do Dia**: Versículo bíblico diário com integração à API da Bíblia
- 🎵 **Salmo do Dia**: Salmo selecionado diariamente para reflexão
- 🙏 **Seção de Orações**: Coleção de orações organizadas por categoria
- 💝 **Sistema de Doações**: Integração com MercadoPago para doações online
- 👤 **Sistema de Usuários**: Autenticação e perfis personalizados via Supabase
- 📝 **Notas Pessoais**: Sistema para salvar reflexões e estudos bíblicos
- 📞 **Contato**: Formulário de contato com integração ao banco de dados
- ♿ **Acessibilidade**: Controles de fonte, alto contraste, leitor de tela
- 📱 **PWA Completo**: Funciona offline, instalável, notificações push
- 🌙 **Modo Escuro**: Interface adaptável com temas claro e escuro

### 🎯 Diferenciais

- **100% Vanilla JavaScript**: Sem frameworks, máxima performance
- **Design Responsivo**: Otimizado para mobile, tablet e desktop
- **Offline First**: Funciona mesmo sem internet
- **Acessibilidade Completa**: WCAG 2.1 AA, VLibras integrado
- **Progressive Enhancement**: Funciona em qualquer navegador
- **Material Design**: Interface moderna e intuitiva

## 🚀 Tecnologias Utilizadas

### Frontend
- **HTML5**: Estrutura semântica e acessível
- **CSS3**: Design moderno com Grid, Flexbox e animações
- **JavaScript ES6+**: Lógica da aplicação com módulos nativos
- **Material Icons**: Iconografia consistente e acessível
- **Web APIs**: Service Worker, Web Share, Notifications, etc.

### Backend e Integração
- **Supabase**: Backend-as-a-Service para autenticação e banco de dados
- **API da Bíblia Digital**: Conteúdo bíblico atualizado
- **MercadoPago**: Gateway de pagamento para doações
- **Web Push**: Notificações em tempo real

### Ferramentas e Padrões
- **PWA**: Progressive Web App com Service Worker
- **Responsive Design**: Mobile-first approach
- **WCAG 2.1**: Padrões de acessibilidade
- **SEO**: Otimização para motores de busca
- **Performance**: Otimizações de carregamento e cache

## 📦 Estrutura do Projeto

```
ipvida/
├── css/                    # Estilos CSS
│   ├── globals.css         # Estilos globais e sistema de design
│   ├── mobile.css          # Estilos específicos para mobile
│   └── desktop.css         # Estilos específicos para desktop
├── js/                     # Scripts JavaScript
│   ├── app.js              # Aplicação principal e PWA
│   ├── auth.js             # Sistema de autenticação
│   └── api.js              # Integrações com APIs externas
├── pages/                  # Páginas HTML
│   ├── sobre.html          # Página sobre o instituto
│   ├── contato.html        # Formulário de contato
│   ├── login.html          # Página de login
│   ├── register.html       # Página de cadastro
│   ├── dashboard.html      # Dashboard do usuário
│   ├── admin.html          # Painel administrativo
│   └── offline.html        # Página offline
├── icons/                  # Ícones do PWA (criar)
├── screenshots/            # Screenshots para app stores (criar)
├── index.html              # Página principal
├── manifest.json           # Manifesto do PWA
├── sw.js                   # Service Worker
├── .env.example            # Exemplo de variáveis de ambiente
├── README.md               # Este arquivo
└── LICENSE                 # Licença MIT
```

## 🛠️ Instalação e Configuração

### Pré-requisitos

- Navegador web moderno (Chrome 90+, Firefox 88+, Safari 14+)
- Servidor web local (Live Server, Python HTTP Server, etc.)
- Conta no Supabase (gratuita)
- Conta no MercadoPago (para doações)

### 1. Clone o Repositório

```bash
git clone https://github.com/seuusuario/ipvida.git
cd ipvida
```

### 2. Configuração das Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env com suas credenciais
# Principais variáveis obrigatórias:
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
```

### 3. Configuração do Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto
3. Configure as tabelas necessárias:

```sql
-- Tabela de usuários (já existe por padrão)
-- Adicione campos customizados se necessário

-- Tabela de mensagens de contato
CREATE TABLE mensagens_contato (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    assunto VARCHAR(255),
    mensagem TEXT NOT NULL,
    lida BOOLEAN DEFAULT FALSE,
    respondida BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Tabela de notas dos usuários
CREATE TABLE notas_usuario (
    id BIGSERIAL PRIMARY KEY,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    conteudo TEXT NOT NULL,
    categoria VARCHAR(50) DEFAULT 'reflexao',
    favorita BOOLEAN DEFAULT FALSE,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas de segurança (RLS)
ALTER TABLE mensagens_contato ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas_usuario ENABLE ROW LEVEL SECURITY;

-- Política para mensagens de contato (apenas inserção)
CREATE POLICY "Qualquer pessoa pode enviar mensagens" ON mensagens_contato
    FOR INSERT WITH CHECK (true);

-- Política para notas (usuário só vê suas próprias notas)
CREATE POLICY "Usuários só veem suas próprias notas" ON notas_usuario
    FOR ALL USING (auth.uid() = usuario_id);
```

4. Configure a autenticação:
   - Ative o provedor de e-mail
   - Configure redirecionamentos para sua URL
   - Defina políticas de senha

### 4. Configuração do MercadoPago (Opcional)

1. Acesse [developers.mercadopago.com](https://developers.mercadopago.com)
2. Crie uma aplicação
3. Obtenha as chaves de teste
4. Configure webhook (se necessário)

### 5. Servidor Local

```bash
# Opção 1: Live Server (VS Code Extension)
# Instale a extensão Live Server e clique em "Go Live"

# Opção 2: Python HTTP Server
python -m http.server 8000

# Opção 3: Node.js http-server
npx http-server -p 8000

# Opção 4: PHP Built-in Server
php -S localhost:8000
```

### 6. Acesse a Aplicação

Abra seu navegador e acesse:
- `http://localhost:8000` (ou porta configurada)

## 📱 Instalação como PWA

### Desktop (Chrome/Edge)
1. Abra a aplicação no navegador
2. Clique no ícone de instalação na barra de endereços
3. Confirme a instalação

### Mobile (Android/iOS)
1. Abra a aplicação no navegador
2. Acesse o menu do navegador
3. Selecione "Adicionar à tela inicial"
4. Confirme a instalação

## 🎨 Personalização

### Cores e Tema

Edite o arquivo `css/globals.css` para personalizar o sistema de cores:

```css
:root {
    /* Cores principais */
    --primary-50: #eff6ff;
    --primary-500: #3b82f6;
    --primary-900: #1e3a8a;
    
    /* Cores de status */
    --success: #10b981;
    --warning: #f59e0b;
    --error: #ef4444;
}
```

### Logo e Ícones

1. Substitua os ícones na pasta `icons/`
2. Use as seguintes dimensões:
   - 72x72, 96x96, 128x128, 144x144
   - 152x152, 192x192, 384x384, 512x512
3. Formato PNG com fundo transparente ou opaco

### Conteúdo

- **Versículos**: Edite `js/api.js` para personalizar a seleção
- **Orações**: Modifique `index.html` para adicionar/remover orações
- **Textos**: Todos os textos estão nos arquivos HTML

## 🔧 Funcionalidades Avançadas

### Notificações Push

```javascript
// Solicitar permissão para notificações
async function solicitarPermissaoNotificacao() {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
        console.log('Notificações ativadas');
    }
}
```

### Sincronização Offline

A aplicação automaticamente:
- Salva dados localmente quando offline
- Sincroniza com o servidor quando volta online
- Mostra status de conectividade

### Compartilhamento

```javascript
// API de compartilhamento nativo
if (navigator.share) {
    await navigator.share({
        title: 'IPVONLINE',
        text: 'Confira este versículo!',
        url: window.location.href
    });
}
```

## 🧪 Testes

### Testes Manuais

1. **Funcionalidade Offline**:
   - Desconecte a internet
   - Navegue pela aplicação
   - Teste formulários (devem salvar para sincronizar depois)

2. **Responsividade**:
   - Teste em diferentes tamanhos de tela
   - Verifique orientação portrait/landscape

3. **Acessibilidade**:
   - Teste com leitor de tela
   - Navegue apenas com teclado
   - Teste controles de acessibilidade

4. **Performance**:
   - Verifique carregamento inicial
   - Teste navegação entre páginas
   - Monitore uso de memória

### Ferramentas de Teste

- **Lighthouse**: Auditoria completa da PWA
- **Chrome DevTools**: Debug e performance
- **WAVE**: Teste de acessibilidade
- **BrowserStack**: Teste cross-browser

## 📊 Analytics e Monitoramento

### Google Analytics (Opcional)

1. Crie uma propriedade no Google Analytics
2. Adicione o código de tracking:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Monitoramento de Erros

Integração com Sentry para monitoramento de erros:

```javascript
import * as Sentry from "@sentry/browser";

Sentry.init({
    dsn: "YOUR_SENTRY_DSN"
});
```

## 🔒 Segurança

### Práticas Implementadas

- **HTTPS**: Obrigatório para PWA
- **CSP**: Content Security Policy
- **CORS**: Configuração restritiva
- **Sanitização**: Validação de entrada
- **Rate Limiting**: Proteção contra spam

### Configuração de Segurança

```html
<!-- Content Security Policy -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://unpkg.com;
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
               font-src 'self' https://fonts.gstatic.com;
               img-src 'self' data: https:;
               connect-src 'self' https://*.supabase.co https://api.mercadopago.com;">
```

## 🚀 Deploy

### Netlify (Recomendado)

1. Conecte seu repositório GitHub
2. Configure variáveis de ambiente
3. Deploy automático a cada commit

```bash
# netlify.toml
[build]
  publish = "."
  command = "echo 'Static site, no build needed'"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
```

### Vercel

```json
{
  "version": 2,
  "builds": [
    {
      "src": "**/*",
      "use": "@vercel/static"
    }
  ],
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

### GitHub Pages

1. Ative GitHub Pages nas configurações
2. Configure domínio customizado (opcional)
3. Adicione arquivo `.nojekyll`

## 📈 Performance

### Otimizações Implementadas

- **Service Worker**: Cache inteligente
- **Lazy Loading**: Carregamento sob demanda
- **Compressão**: Gzip/Brotli
- **Minificação**: CSS/JS otimizados
- **CDN**: Recursos externos otimizados

### Métricas Alvo

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **First Input Delay**: < 100ms
- **Cumulative Layout Shift**: < 0.1
- **Lighthouse Score**: > 90

## 🌐 Internacionalização

O projeto está preparado para múltiplos idiomas:

```javascript
// Estrutura para i18n
const i18n = {
    'pt-BR': {
        'welcome': 'Bem-vindo',
        'login': 'Entrar'
    },
    'en-US': {
        'welcome': 'Welcome',
        'login': 'Login'
    }
};
```

## 📞 Suporte e Documentação

### FAQ

**P: A aplicação funciona offline?**
R: Sim, todas as funcionalidades principais funcionam offline. Os dados são sincronizados quando a conexão é restaurada.

**P: É possível personalizar as orações?**
R: Sim, edite o arquivo `index.html` ou implemente um sistema de administração.

**P: Como configurar notificações push?**
R: Configure as VAPID keys no arquivo `.env` e solicite permissão do usuário.

### Documentação Adicional

- [Supabase Docs](https://supabase.com/docs)
- [PWA Guidelines](https://web.dev/progressive-web-apps/)
- [Material Design](https://material.io/design)
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)

## 🤝 Contribuição

### Como Contribuir

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

### Padrões de Código

- **JavaScript**: ES6+, sem transpilação
- **CSS**: Mobile-first, BEM methodology
- **HTML**: Semântico, acessível
- **Commits**: Conventional Commits

### Roadmap

- [ ] Sistema de administração completo
- [ ] Integração com mais APIs bíblicas
- [ ] Sistema de grupos e comunidades
- [ ] Agenda de eventos religiosos
- [ ] Transmissão ao vivo
- [ ] Aplicativo mobile nativo

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Equipe

- **Desenvolvimento**: GitHub Copilot
- **Design**: Material Design System
- **Conteúdo**: Instituto Pastoral da Vida

## 📞 Contato

- **Site**: [ipvonline.org.br](https://ipvonline.org.br)
- **E-mail**: contato@ipvonline.org.br
- **Telefone**: (11) 99999-9999

## 🙏 Agradecimentos

- Instituto Pastoral da Vida
- Comunidade open source
- Supabase team
- Material Design team
- Todos os colaboradores

---

**Feito com ❤️ e ✝️ para a gloria de Deus**

> "Toda a Escritura é inspirada por Deus e útil para o ensino, para a repreensão, para a correção e para a instrução na justiça" - 2 Timóteo 3:16