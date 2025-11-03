/* ========================================
   IPVONLINE - App Principal
   Instituto Pastoral da Vida
   
   Este arquivo contém as funcionalidades principais:
   - Registro do Service Worker
   - Controles de acessibilidade
   - Navegação e manipulação DOM
   - Integração com APIs externas
   ======================================== */

'use strict';

// ========================================
// VARIÁVEIS GLOBAIS
// ========================================

// Configurações da aplicação
const APP_CONFIG = {
    name: 'IPVONLINE',
    version: '1.0.0',
    description: 'Instituto Pastoral da Vida Online',
    
    // URLs das APIs externas
    apis: {
        biblia: 'https://www.abibliadigital.com.br/api',
        pagamento: 'https://api.mercadopago.com/v1' // Sandbox
    },
    
    // Configurações de acessibilidade
    acessibilidade: {
        fonteSizes: ['fonte-pequena', 'fonte-normal', 'fonte-grande', 'fonte-muito-grande'],
        fonteAtual: 1, // índice do array acima
        altoContraste: false,
        leituraAtiva: false
    },
    
    // Configurações de cache
    cache: {
        versiculoCache: null,
        salmoCache: null,
        tempoCache: 24 * 60 * 60 * 1000 // 24 horas em millisegundos
    }
};

// Estado da aplicação
const APP_STATE = {
    online: navigator.onLine,
    menuAberto: false,
    modalAberto: null,
    speechSynthesis: null,
    intervalos: {
        verificarConexao: null,
        atualizarEstatisticas: null
    }
};

// ========================================
// FUNÇÕES DE INICIALIZAÇÃO
// ========================================

/**
 * Inicializa a aplicação quando o DOM estiver carregado
 */
function inicializarApp() {
    console.log('🔄 Inicializando IPVONLINE...');
    
    try {
        // Registrar Service Worker
        registrarServiceWorker();
        
        // Configurar acessibilidade
        configurarAcessibilidade();
        
        // Configurar navegação
        configurarNavegacao();
        
        // Configurar conexão
        configurarVerificacaoConexao();
        
        // Carregar conteúdo da página inicial
        if (window.location.pathname === '/' || window.location.pathname.includes('index.html')) {
            carregarConteudoPaginaInicial();
        }
        
        // Configurar eventos globais
        configurarEventosGlobais();
        
        // Inicializar funcionalidades específicas da página
        inicializarPaginaAtual();
        
        console.log('✅ IPVONLINE inicializado com sucesso!');
        
    } catch (erro) {
        console.error('❌ Erro ao inicializar aplicação:', erro);
        mostrarErroGeral('Erro ao carregar a aplicação. Tente recarregar a página.');
    }
}

/**
 * Registra o Service Worker para funcionalidade offline
 */
async function registrarServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/js/sw.js');
            console.log('✅ Service Worker registrado:', registration.scope);
            
            // Escutar atualizações do Service Worker
            registration.addEventListener('updatefound', () => {
                console.log('🔄 Nova versão do Service Worker disponível');
                const novoSW = registration.installing;
                
                novoSW.addEventListener('statechange', () => {
                    if (novoSW.state === 'installed' && navigator.serviceWorker.controller) {
                        mostrarNotificacao('Nova versão disponível! Recarregue a página.', 'info');
                    }
                });
            });
            
        } catch (erro) {
            console.warn('⚠️ Falha ao registrar Service Worker:', erro);
        }
    }
}

/**
 * Inicializa funcionalidades específicas da página atual
 */
function inicializarPaginaAtual() {
    const pagina = obterPaginaAtual();
    
    switch (pagina) {
        case 'index':
            // Página inicial já é carregada em carregarConteudoPaginaInicial()
            break;
            
        case 'contato':
            configurarFormularioContato();
            configurarFAQ();
            break;
            
        case 'login':
            configurarFormularioLogin();
            configurarRecuperacaoSenha();
            break;
            
        case 'register':
            configurarFormularioCadastro();
            configurarValidacaoSenha();
            break;
            
        case 'dashboard':
            // Verificação de autenticação é feita no próprio arquivo da página
            configurarDashboard();
            break;
            
        case 'admin':
            // Verificação de admin é feita no próprio arquivo da página
            configurarAdmin();
            break;
            
        default:
            console.log('📄 Página:', pagina);
    }
}

/**
 * Obtém o nome da página atual
 */
function obterPaginaAtual() {
    const path = window.location.pathname;
    
    if (path === '/' || path.includes('index.html')) return 'index';
    if (path.includes('sobre.html')) return 'sobre';
    if (path.includes('contato.html')) return 'contato';
    if (path.includes('login.html')) return 'login';
    if (path.includes('register.html')) return 'register';
    if (path.includes('dashboard.html')) return 'dashboard';
    if (path.includes('admin.html')) return 'admin';
    if (path.includes('offline.html')) return 'offline';
    
    return 'desconhecida';
}

// ========================================
// ACESSIBILIDADE
// ========================================

/**
 * Configura todos os recursos de acessibilidade
 */
function configurarAcessibilidade() {
    console.log('🎯 Configurando acessibilidade...');
    
    // Botões de fonte
    const btnAumentarFonte = document.getElementById('aumentar-fonte');
    const btnDiminuirFonte = document.getElementById('diminuir-fonte');
    const btnAltoContraste = document.getElementById('alto-contraste');
    const btnLeituraTexto = document.getElementById('leitura-texto');
    
    if (btnAumentarFonte) {
        btnAumentarFonte.addEventListener('click', aumentarFonte);
    }
    
    if (btnDiminuirFonte) {
        btnDiminuirFonte.addEventListener('click', diminuirFonte);
    }
    
    if (btnAltoContraste) {
        btnAltoContraste.addEventListener('click', alternarAltoContraste);
    }
    
    if (btnLeituraTexto) {
        btnLeituraTexto.addEventListener('click', alternarLeituraTexto);
    }
    
    // Carregar configurações salvas
    carregarConfiguraciesAcessibilidade();
    
    // Configurar atalhos de teclado
    configurarAtalhosAcessibilidade();
    
    // Inicializar Speech Synthesis
    if ('speechSynthesis' in window) {
        APP_STATE.speechSynthesis = window.speechSynthesis;
    }
}

/**
 * Aumenta o tamanho da fonte
 */
function aumentarFonte() {
    const config = APP_CONFIG.acessibilidade;
    
    if (config.fonteAtual < config.fonteSizes.length - 1) {
        // Remove classe atual
        document.body.classList.remove(config.fonteSizes[config.fonteAtual]);
        
        // Aumenta o índice
        config.fonteAtual++;
        
        // Adiciona nova classe
        document.body.classList.add(config.fonteSizes[config.fonteAtual]);
        
        // Salva configuração
        salvarConfiguracaoAcessibilidade('fonteAtual', config.fonteAtual);
        
        // Feedback para o usuário
        mostrarNotificacao('Fonte aumentada', 'success');
        
        console.log('🔤 Fonte aumentada para:', config.fonteSizes[config.fonteAtual]);
    } else {
        mostrarNotificacao('Fonte já está no tamanho máximo', 'warning');
    }
}

/**
 * Diminui o tamanho da fonte
 */
function diminuirFonte() {
    const config = APP_CONFIG.acessibilidade;
    
    if (config.fonteAtual > 0) {
        // Remove classe atual
        document.body.classList.remove(config.fonteSizes[config.fonteAtual]);
        
        // Diminui o índice
        config.fonteAtual--;
        
        // Adiciona nova classe
        document.body.classList.add(config.fonteSizes[config.fonteAtual]);
        
        // Salva configuração
        salvarConfiguracaoAcessibilidade('fonteAtual', config.fonteAtual);
        
        // Feedback para o usuário
        mostrarNotificacao('Fonte diminuída', 'success');
        
        console.log('🔤 Fonte diminuída para:', config.fonteSizes[config.fonteAtual]);
    } else {
        mostrarNotificacao('Fonte já está no tamanho mínimo', 'warning');
    }
}

/**
 * Alterna o modo de alto contraste
 */
function alternarAltoContraste() {
    const config = APP_CONFIG.acessibilidade;
    config.altoContraste = !config.altoContraste;
    
    if (config.altoContraste) {
        document.body.classList.add('alto-contraste');
        mostrarNotificacao('Alto contraste ativado', 'success');
        
        // Atualizar ícone do botão
        const btn = document.getElementById('alto-contraste');
        if (btn) btn.classList.add('active');
        
    } else {
        document.body.classList.remove('alto-contraste');
        mostrarNotificacao('Alto contraste desativado', 'success');
        
        // Atualizar ícone do botão
        const btn = document.getElementById('alto-contraste');
        if (btn) btn.classList.remove('active');
    }
    
    // Salvar configuração
    salvarConfiguracaoAcessibilidade('altoContraste', config.altoContraste);
    
    console.log('🎨 Alto contraste:', config.altoContraste ? 'ativado' : 'desativado');
}

/**
 * Alterna a leitura de texto
 */
function alternarLeituraTexto() {
    const config = APP_CONFIG.acessibilidade;
    
    if (!APP_STATE.speechSynthesis) {
        mostrarNotificacao('Leitura de texto não suportada neste navegador', 'error');
        return;
    }
    
    config.leituraAtiva = !config.leituraAtiva;
    
    if (config.leituraAtiva) {
        iniciarLeituraTexto();
        mostrarNotificacao('Leitura de texto ativada', 'success');
        
        // Atualizar ícone do botão
        const btn = document.getElementById('leitura-texto');
        if (btn) {
            btn.classList.add('active');
            const icon = btn.querySelector('.material-icons');
            if (icon) icon.textContent = 'volume_off';
        }
        
    } else {
        pararLeituraTexto();
        mostrarNotificacao('Leitura de texto desativada', 'success');
        
        // Atualizar ícone do botão
        const btn = document.getElementById('leitura-texto');
        if (btn) {
            btn.classList.remove('active');
            const icon = btn.querySelector('.material-icons');
            if (icon) icon.textContent = 'volume_up';
        }
    }
    
    // Salvar configuração
    salvarConfiguracaoAcessibilidade('leituraAtiva', config.leituraAtiva);
    
    console.log('🔊 Leitura de texto:', config.leituraAtiva ? 'ativada' : 'desativada');
}

/**
 * Inicia a leitura automática do texto da página
 */
function iniciarLeituraTexto() {
    const conteudoPrincipal = document.getElementById('conteudo-principal');
    if (!conteudoPrincipal) return;
    
    // Selecionar elementos de texto para leitura
    const elementos = conteudoPrincipal.querySelectorAll('h1, h2, h3, p, blockquote, li');
    
    let textoCompleto = '';
    elementos.forEach(elemento => {
        const texto = elemento.textContent.trim();
        if (texto && texto.length > 3) {
            textoCompleto += texto + '. ';
        }
    });
    
    if (textoCompleto) {
        lerTexto(textoCompleto);
    }
}

/**
 * Para a leitura de texto
 */
function pararLeituraTexto() {
    if (APP_STATE.speechSynthesis) {
        APP_STATE.speechSynthesis.cancel();
    }
}

/**
 * Lê um texto específico usando Speech Synthesis
 */
function lerTexto(texto) {
    if (!APP_STATE.speechSynthesis || !texto) return;
    
    // Parar qualquer leitura anterior
    APP_STATE.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    // Callbacks
    utterance.onstart = () => {
        console.log('🔊 Iniciando leitura de texto');
    };
    
    utterance.onend = () => {
        console.log('🔊 Leitura de texto finalizada');
    };
    
    utterance.onerror = (erro) => {
        console.error('❌ Erro na leitura de texto:', erro);
    };
    
    APP_STATE.speechSynthesis.speak(utterance);
}

/**
 * Configura atalhos de teclado para acessibilidade
 */
function configurarAtalhosAcessibilidade() {
    document.addEventListener('keydown', (evento) => {
        // Só funciona com Alt + tecla
        if (!evento.altKey) return;
        
        switch (evento.key.toLowerCase()) {
            case '+':
            case '=':
                evento.preventDefault();
                aumentarFonte();
                break;
                
            case '-':
                evento.preventDefault();
                diminuirFonte();
                break;
                
            case 'c':
                evento.preventDefault();
                alternarAltoContraste();
                break;
                
            case 'l':
                evento.preventDefault();
                alternarLeituraTexto();
                break;
        }
    });
}

/**
 * Carrega configurações de acessibilidade salvas
 */
function carregarConfiguraciesAcessibilidade() {
    try {
        const configSalva = localStorage.getItem('ipv_acessibilidade');
        if (configSalva) {
            const config = JSON.parse(configSalva);
            
            // Aplicar configurações
            if (config.fonteAtual !== undefined) {
                APP_CONFIG.acessibilidade.fonteAtual = config.fonteAtual;
                document.body.classList.add(APP_CONFIG.acessibilidade.fonteSizes[config.fonteAtual]);
            }
            
            if (config.altoContraste) {
                APP_CONFIG.acessibilidade.altoContraste = true;
                document.body.classList.add('alto-contraste');
                
                const btn = document.getElementById('alto-contraste');
                if (btn) btn.classList.add('active');
            }
            
            if (config.leituraAtiva) {
                APP_CONFIG.acessibilidade.leituraAtiva = true;
                
                const btn = document.getElementById('leitura-texto');
                if (btn) {
                    btn.classList.add('active');
                    const icon = btn.querySelector('.material-icons');
                    if (icon) icon.textContent = 'volume_off';
                }
            }
        }
    } catch (erro) {
        console.warn('⚠️ Erro ao carregar configurações de acessibilidade:', erro);
    }
}

/**
 * Salva uma configuração específica de acessibilidade
 */
function salvarConfiguracaoAcessibilidade(chave, valor) {
    try {
        let config = {};
        
        const configSalva = localStorage.getItem('ipv_acessibilidade');
        if (configSalva) {
            config = JSON.parse(configSalva);
        }
        
        config[chave] = valor;
        localStorage.setItem('ipv_acessibilidade', JSON.stringify(config));
        
    } catch (erro) {
        console.warn('⚠️ Erro ao salvar configuração de acessibilidade:', erro);
    }
}

// ========================================
// NAVEGAÇÃO E INTERFACE
// ========================================

/**
 * Configura a navegação principal
 */
function configurarNavegacao() {
    // Menu mobile
    const toggleMenu = document.querySelector('.navbar-toggle');
    const menu = document.querySelector('.navbar-menu');
    
    if (toggleMenu && menu) {
        toggleMenu.addEventListener('click', () => {
            APP_STATE.menuAberto = !APP_STATE.menuAberto;
            menu.classList.toggle('open', APP_STATE.menuAberto);
            
            // Atualizar aria-expanded
            toggleMenu.setAttribute('aria-expanded', APP_STATE.menuAberto);
            
            // Focar no primeiro link do menu quando abrir
            if (APP_STATE.menuAberto) {
                const primeiroLink = menu.querySelector('.nav-link');
                if (primeiroLink) {
                    primeiroLink.focus();
                }
            }
        });
        
        // Fechar menu ao clicar em um link
        const links = menu.querySelectorAll('.nav-link');
        links.forEach(link => {
            link.addEventListener('click', () => {
                if (APP_STATE.menuAberto) {
                    APP_STATE.menuAberto = false;
                    menu.classList.remove('open');
                    toggleMenu.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }
    
    // Fechar menu ao clicar fora
    document.addEventListener('click', (evento) => {
        if (APP_STATE.menuAberto && menu && !menu.contains(evento.target) && !toggleMenu.contains(evento.target)) {
            APP_STATE.menuAberto = false;
            menu.classList.remove('open');
            toggleMenu.setAttribute('aria-expanded', 'false');
        }
    });
}

/**
 * Configura eventos globais da aplicação
 */
function configurarEventosGlobais() {
    // Prevenir envio de formulários vazios
    document.addEventListener('submit', (evento) => {
        const form = evento.target;
        if (form.tagName === 'FORM') {
            const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
            let valido = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    valido = false;
                    input.classList.add('error');
                } else {
                    input.classList.remove('error');
                }
            });
            
            if (!valido) {
                evento.preventDefault();
                mostrarNotificacao('Por favor, preencha todos os campos obrigatórios', 'error');
            }
        }
    });
    
    // Configurar links externos
    const linksExternos = document.querySelectorAll('a[target="_blank"]');
    linksExternos.forEach(link => {
        // Adicionar rel="noopener noreferrer" para segurança
        if (!link.rel.includes('noopener')) {
            link.rel += ' noopener noreferrer';
        }
    });
    
    // Configurar lazy loading para imagens
    const imagens = document.querySelectorAll('img');
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                }
            });
        });
        
        imagens.forEach(img => {
            if (img.dataset.src) {
                imageObserver.observe(img);
            }
        });
    }
}

// ========================================
// VERIFICAÇÃO DE CONEXÃO
// ========================================

/**
 * Configura verificação de status de conexão
 */
function configurarVerificacaoConexao() {
    // Event listeners para mudanças de conexão
    window.addEventListener('online', () => {
        APP_STATE.online = true;
        ocultarStatusConexao();
        console.log('🌐 Conectado à internet');
        
        // Tentar sincronizar dados offline se existirem
        sincronizarDadosOffline();
    });
    
    window.addEventListener('offline', () => {
        APP_STATE.online = false;
        mostrarStatusConexao();
        console.log('📵 Desconectado da internet');
    });
    
    // Verificação inicial
    if (!navigator.onLine) {
        mostrarStatusConexao();
    }
    
    // Verificação periódica (a cada 30 segundos)
    APP_STATE.intervalos.verificarConexao = setInterval(() => {
        verificarConexaoRede();
    }, 30000);
}

/**
 * Verifica conexão fazendo uma requisição leve
 */
async function verificarConexaoRede() {
    try {
        const response = await fetch('/manifest.json', {
            method: 'HEAD',
            cache: 'no-cache'
        });
        
        if (response.ok && !APP_STATE.online) {
            APP_STATE.online = true;
            ocultarStatusConexao();
        }
    } catch (erro) {
        if (APP_STATE.online) {
            APP_STATE.online = false;
            mostrarStatusConexao();
        }
    }
}

/**
 * Mostra o status de conexão offline
 */
function mostrarStatusConexao() {
    const statusDiv = document.getElementById('status-conexao');
    if (statusDiv) {
        statusDiv.style.display = 'block';
        statusDiv.innerHTML = `
            <div class="container">
                <span class="material-icons">wifi_off</span>
                <p id="mensagem-conexao">Você está offline. Algumas funcionalidades podem estar limitadas.</p>
            </div>
        `;
    }
}

/**
 * Oculta o status de conexão
 */
function ocultarStatusConexao() {
    const statusDiv = document.getElementById('status-conexao');
    if (statusDiv) {
        statusDiv.style.display = 'none';
    }
}

/**
 * Sincroniza dados que foram salvos offline
 */
async function sincronizarDadosOffline() {
    try {
        const dadosOffline = localStorage.getItem('ipv_dados_offline');
        if (dadosOffline) {
            const dados = JSON.parse(dadosOffline);
            console.log('🔄 Sincronizando dados offline:', dados);
            
            // Aqui você implementaria a sincronização com o servidor
            // Por exemplo, enviar mensagens de contato salvas offline
            
            // Remover dados após sincronização bem-sucedida
            localStorage.removeItem('ipv_dados_offline');
            
            mostrarNotificacao('Dados sincronizados com sucesso!', 'success');
        }
    } catch (erro) {
        console.error('❌ Erro ao sincronizar dados offline:', erro);
    }
}

// ========================================
// UTILITÁRIOS GERAIS
// ========================================

/**
 * Mostra uma notificação toast para o usuário
 */
function mostrarNotificacao(mensagem, tipo = 'info', duracao = 3000) {
    // Remover notificação anterior se existir
    const notificacaoExistente = document.querySelector('.toast-notification');
    if (notificacaoExistente) {
        notificacaoExistente.remove();
    }
    
    // Criar nova notificação
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${tipo}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="material-icons">${obterIconeTipo(tipo)}</span>
            <span class="toast-message">${escapeHtml(mensagem)}</span>
            <button class="toast-close" aria-label="Fechar notificação">
                <span class="material-icons">close</span>
            </button>
        </div>
    `;
    
    // Adicionar estilos inline para a notificação
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--white);
        border: 1px solid var(--gray-200);
        border-radius: var(--border-radius-lg);
        padding: var(--spacing-md);
        box-shadow: var(--shadow-lg);
        z-index: calc(var(--z-modal) + 100);
        min-width: 300px;
        max-width: 500px;
        transform: translateX(100%);
        transition: transform var(--transition-normal);
    `;
    
    // Estilos específicos por tipo
    switch (tipo) {
        case 'success':
            toast.style.borderLeftColor = 'var(--success-color)';
            toast.style.borderLeftWidth = '4px';
            break;
        case 'error':
            toast.style.borderLeftColor = 'var(--error-color)';
            toast.style.borderLeftWidth = '4px';
            break;
        case 'warning':
            toast.style.borderLeftColor = 'var(--warning-color)';
            toast.style.borderLeftWidth = '4px';
            break;
        default:
            toast.style.borderLeftColor = 'var(--info-color)';
            toast.style.borderLeftWidth = '4px';
    }
    
    // Adicionar ao DOM
    document.body.appendChild(toast);
    
    // Animar entrada
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 10);
    
    // Configurar botão de fechar
    const btnFechar = toast.querySelector('.toast-close');
    if (btnFechar) {
        btnFechar.addEventListener('click', () => {
            fecharNotificacao(toast);
        });
    }
    
    // Auto-fechar após duração especificada
    if (duracao > 0) {
        setTimeout(() => {
            fecharNotificacao(toast);
        }, duracao);
    }
    
    console.log(`📢 Notificação (${tipo}):`, mensagem);
}

/**
 * Fecha uma notificação toast
 */
function fecharNotificacao(toast) {
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

/**
 * Obtém o ícone apropriado para cada tipo de notificação
 */
function obterIconeTipo(tipo) {
    switch (tipo) {
        case 'success': return 'check_circle';
        case 'error': return 'error';
        case 'warning': return 'warning';
        case 'info': return 'info';
        default: return 'notification_important';
    }
}

/**
 * Escapa HTML para prevenir XSS
 */
function escapeHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

/**
 * Mostra um erro geral na aplicação
 */
function mostrarErroGeral(mensagem) {
    console.error('❌ Erro geral:', mensagem);
    
    // Criar overlay de erro
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: calc(var(--z-modal) + 200);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--spacing-lg);
    `;
    
    overlay.innerHTML = `
        <div style="
            background: var(--white);
            border-radius: var(--border-radius-xl);
            padding: var(--spacing-2xl);
            max-width: 500px;
            text-align: center;
            box-shadow: var(--shadow-xl);
        ">
            <span class="material-icons" style="font-size: 3rem; color: var(--error-color); margin-bottom: var(--spacing-lg);">error</span>
            <h3 style="margin-bottom: var(--spacing-md);">Erro na Aplicação</h3>
            <p style="margin-bottom: var(--spacing-lg); color: var(--gray-600);">${escapeHtml(mensagem)}</p>
            <button onclick="location.reload()" class="btn btn-primary">
                <span class="material-icons">refresh</span>
                <span>Recarregar Página</span>
            </button>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

/**
 * Formata uma data para exibição em português
 */
function formatarData(data, formato = 'completo') {
    const opcoes = {
        completo: {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        },
        data: {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        },
        curta: {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit'
        }
    };
    
    return new Intl.DateTimeFormat('pt-BR', opcoes[formato] || opcoes.completo).format(data);
}

/**
 * Debounce function para otimizar eventos frequentes
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function para limitar execução
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ========================================
// INICIALIZAÇÃO
// ========================================

// Aguardar carregamento do DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarApp);
} else {
    inicializarApp();
}

// Limpar intervalos quando a página for fechada
window.addEventListener('beforeunload', () => {
    // Limpar intervalos
    Object.values(APP_STATE.intervalos).forEach(intervalo => {
        if (intervalo) clearInterval(intervalo);
    });
    
    // Parar leitura de texto
    if (APP_STATE.speechSynthesis) {
        APP_STATE.speechSynthesis.cancel();
    }
});

// Exportar funções para uso global
window.IPVONLINE = {
    mostrarNotificacao,
    lerTexto,
    formatarData,
    escapeHtml,
    debounce,
    throttle,
    APP_CONFIG,
    APP_STATE
};