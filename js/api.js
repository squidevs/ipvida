/* ========================================
   IPVONLINE - API e Integrações
   Instituto Pastoral da Vida
   
   Este arquivo contém:
   - Integração com API da Bíblia
   - Integração com APIs de pagamento
   - Funções para Supabase
   - Cache e sincronização
   ======================================== */

'use strict';

// ========================================
// CONFIGURAÇÕES DAS APIs
// ========================================

const API_CONFIG = {
    // API da Bíblia Digital
    biblia: {
        baseUrl: 'https://www.abibliadigital.com.br/api',
        token: 'sua-chave-da-api-biblia', // Substituir pela chave real
        versao: 'nvi', // Nova Versão Internacional
        cache: {
            versiculoDia: 'api_versiculo_dia',
            salmoDia: 'api_salmo_dia',
            duracao: 24 * 60 * 60 * 1000 // 24 horas
        }
    },
    
    // MercadoPago (Sandbox)
    pagamento: {
        baseUrl: 'https://api.mercadopago.com/v1',
        publicKey: 'TEST-sua-chave-publica', // Chave pública de teste
        accessToken: 'TEST-seu-access-token', // Access token de teste
        currency: 'BRL'
    },
    
    // Configurações gerais
    timeout: 10000, // 10 segundos
    retryAttempts: 3,
    retryDelay: 1000 // 1 segundo
};

// ========================================
// CLIENTE HTTP
// ========================================

/**
 * Cliente HTTP com retry e timeout
 */
class HttpClient {
    static async request(url, options = {}) {
        const defaultOptions = {
            timeout: API_CONFIG.timeout,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };
        
        let lastError;
        
        for (let attempt = 1; attempt <= API_CONFIG.retryAttempts; attempt++) {
            try {
                console.log(`📡 Tentativa ${attempt} para ${url}`);
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), defaultOptions.timeout);
                
                const response = await fetch(url, {
                    ...defaultOptions,
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                console.log(`✅ Sucesso para ${url}`);
                
                return data;
                
            } catch (error) {
                lastError = error;
                console.warn(`⚠️ Tentativa ${attempt} falhou para ${url}:`, error.message);
                
                if (attempt < API_CONFIG.retryAttempts) {
                    await this.delay(API_CONFIG.retryDelay * attempt);
                }
            }
        }
        
        console.error(`❌ Todas as tentativas falharam para ${url}:`, lastError);
        throw lastError;
    }
    
    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ========================================
// API DA BÍBLIA
// ========================================

/**
 * Classe para interagir com a API da Bíblia
 */
class BibliaAPI {
    /**
     * Obtém o versículo do dia
     */
    static async obterVersiculoDia() {
        try {
            // Verificar cache primeiro
            const cache = this.obterCache(API_CONFIG.biblia.cache.versiculoDia);
            if (cache) {
                console.log('📖 Versículo do dia obtido do cache');
                return cache;
            }
            
            // Simulação de API da Bíblia (substituir pela API real)
            const versiculos = [
                {
                    texto: "Porque Deus tanto amou o mundo que deu o seu Filho Unigênito, para que todo o que nele crer não pereça, mas tenha a vida eterna.",
                    referencia: "João 3:16",
                    livro: "João",
                    capitulo: 3,
                    versiculo: 16,
                    versao: "NVI"
                },
                {
                    texto: "Confie no Senhor de todo o seu coração e não se apoie em seu próprio entendimento; reconheça o Senhor em todos os seus caminhos, e ele endireitará as suas veredas.",
                    referencia: "Provérbios 3:5-6",
                    livro: "Provérbios",
                    capitulo: 3,
                    versiculo: "5-6",
                    versao: "NVI"
                },
                {
                    texto: "Tudo posso naquele que me fortalece.",
                    referencia: "Filipenses 4:13",
                    livro: "Filipenses",
                    capitulo: 4,
                    versiculo: 13,
                    versao: "NVI"
                },
                {
                    texto: "O Senhor é o meu pastor; nada me faltará.",
                    referencia: "Salmos 23:1",
                    livro: "Salmos",
                    capitulo: 23,
                    versiculo: 1,
                    versao: "NVI"
                },
                {
                    texto: "Não se inquietem com nada, mas em todas as situações, pela oração e súplicas, e com ação de graças, apresentem seus pedidos a Deus.",
                    referencia: "Filipenses 4:6",
                    livro: "Filipenses",
                    capitulo: 4,
                    versiculo: 6,
                    versao: "NVI"
                }
            ];
            
            // Selecionar versículo baseado no dia
            const hoje = new Date();
            const indice = hoje.getDate() % versiculos.length;
            const versiculoSelecionado = versiculos[indice];
            
            // Simular delay da API
            await HttpClient.delay(800);
            
            // Salvar no cache
            this.salvarCache(API_CONFIG.biblia.cache.versiculoDia, versiculoSelecionado);
            
            console.log('📖 Versículo do dia obtido da API simulada');
            return versiculoSelecionado;
            
        } catch (error) {
            console.error('❌ Erro ao obter versículo do dia:', error);
            
            // Retornar versículo padrão em caso de erro
            return {
                texto: "O Senhor é a minha luz e a minha salvação; a quem temerei? O Senhor é o meu forte refúgio; de quem terei medo?",
                referencia: "Salmos 27:1",
                livro: "Salmos",
                capitulo: 27,
                versiculo: 1,
                versao: "NVI"
            };
        }
    }
    
    /**
     * Obtém o salmo do dia
     */
    static async obterSalmoDia() {
        try {
            // Verificar cache primeiro
            const cache = this.obterCache(API_CONFIG.biblia.cache.salmoDia);
            if (cache) {
                console.log('🎵 Salmo do dia obtido do cache');
                return cache;
            }
            
            // Simulação de salmos (substituir pela API real)
            const salmos = [
                {
                    numero: 23,
                    titulo: "O Senhor é o meu pastor",
                    texto: "O Senhor é o meu pastor; nada me faltará. Em verdes pastagens me faz repousar. Leva-me junto às águas de descanso; restaura-me a alma. Guia-me pelas veredas da justiça por amor do seu nome.",
                    textoCompleto: "O Senhor é o meu pastor; nada me faltará. Em verdes pastagens me faz repousar. Leva-me junto às águas de descanso; restaura-me a alma. Guia-me pelas veredas da justiça por amor do seu nome. Mesmo quando eu andar pelo vale da sombra da morte, não temerei mal algum, pois tu estás comigo; a tua vara e o teu cajado me consolam. Preparas um banquete para mim à vista dos meus inimigos. Tu me honras, ungindo a minha cabeça com óleo e fazendo transbordar o meu cálice. Bondade e amor me seguirão todos os dias da minha vida, e voltarei à casa do Senhor enquanto eu viver.",
                    versao: "NVI",
                    url: "https://www.bibliaonline.com.br/nvi/sl/23"
                },
                {
                    numero: 91,
                    titulo: "Proteção do Altíssimo",
                    texto: "Aquele que habita no abrigo do Altíssimo e descansa à sombra do Todo-poderoso pode dizer ao Senhor: 'Tu és o meu refúgio e a minha fortaleza, o meu Deus, em quem confio.'",
                    textoCompleto: "Aquele que habita no abrigo do Altíssimo e descansa à sombra do Todo-poderoso pode dizer ao Senhor: 'Tu és o meu refúgio e a minha fortaleza, o meu Deus, em quem confio.' Ele o livrará do laço do caçador e do veneno mortal. Ele o cobrirá com as suas penas, e sob as suas asas você encontrará refúgio; a fidelidade dele será o seu escudo protetor...",
                    versao: "NVI",
                    url: "https://www.bibliaonline.com.br/nvi/sl/91"
                },
                {
                    numero: 121,
                    titulo: "O Senhor é o nosso protetor",
                    texto: "Elevo os olhos para os montes; de onde me vem o socorro? O meu socorro vem do Senhor, que fez os céus e a terra. Ele não permitirá que você tropece; aquele que o protege não cochila.",
                    textoCompleto: "Elevo os olhos para os montes; de onde me vem o socorro? O meu socorro vem do Senhor, que fez os céus e a terra. Ele não permitirá que você tropece; aquele que o protege não cochila. Aquele que protege Israel jamais cochila ou dorme. O Senhor é quem o protege; como sombra à sua direita, o Senhor o protege...",
                    versao: "NVI",
                    url: "https://www.bibliaonline.com.br/nvi/sl/121"
                }
            ];
            
            // Selecionar salmo baseado no dia
            const hoje = new Date();
            const indice = hoje.getDate() % salmos.length;
            const salmoSelecionado = salmos[indice];
            
            // Simular delay da API
            await HttpClient.delay(600);
            
            // Salvar no cache
            this.salvarCache(API_CONFIG.biblia.cache.salmoDia, salmoSelecionado);
            
            console.log('🎵 Salmo do dia obtido da API simulada');
            return salmoSelecionado;
            
        } catch (error) {
            console.error('❌ Erro ao obter salmo do dia:', error);
            
            // Retornar salmo padrão em caso de erro
            return {
                numero: 23,
                titulo: "O Senhor é o meu pastor",
                texto: "O Senhor é o meu pastor; nada me faltará.",
                textoCompleto: "O Senhor é o meu pastor; nada me faltará. Em verdes pastagens me faz repousar...",
                versao: "NVI",
                url: "https://www.bibliaonline.com.br/nvi/sl/23"
            };
        }
    }
    
    /**
     * Busca versículos por palavra-chave
     */
    static async buscarVersiculos(palavraChave, limite = 10) {
        try {
            console.log(`🔍 Buscando versículos para: ${palavraChave}`);
            
            // Em uma implementação real, você faria uma requisição para a API
            // Aqui estamos simulando resultados
            const resultadosSimulados = [
                {
                    texto: "Porque Deus tanto amou o mundo que deu o seu Filho Unigênito...",
                    referencia: "João 3:16",
                    relevancia: 0.95
                },
                {
                    texto: "O amor é paciente, o amor é bondoso...",
                    referencia: "1 Coríntios 13:4",
                    relevancia: 0.87
                }
            ];
            
            await HttpClient.delay(500);
            
            return resultadosSimulados.slice(0, limite);
            
        } catch (error) {
            console.error('❌ Erro ao buscar versículos:', error);
            return [];
        }
    }
    
    /**
     * Obtém link para a Bíblia online
     */
    static obterLinkBibliaOnline() {
        return 'https://www.bibliaonline.com.br/nvi';
    }
    
    /**
     * Gerenciamento de cache
     */
    static salvarCache(chave, dados) {
        try {
            const item = {
                dados,
                timestamp: Date.now(),
                expires: Date.now() + API_CONFIG.biblia.cache.duracao
            };
            
            localStorage.setItem(chave, JSON.stringify(item));
            
        } catch (error) {
            console.warn('⚠️ Erro ao salvar cache:', error);
        }
    }
    
    static obterCache(chave) {
        try {
            const item = localStorage.getItem(chave);
            if (!item) return null;
            
            const parsed = JSON.parse(item);
            
            if (parsed.expires < Date.now()) {
                localStorage.removeItem(chave);
                return null;
            }
            
            return parsed.dados;
            
        } catch (error) {
            console.warn('⚠️ Erro ao obter cache:', error);
            localStorage.removeItem(chave);
            return null;
        }
    }
}

// ========================================
// API DE PAGAMENTOS
// ========================================

/**
 * Classe para integração com MercadoPago (modo sandbox)
 */
class PagamentoAPI {
    /**
     * Simula criação de preferência de pagamento
     */
    static async criarPreferenciaPagamento(dados) {
        try {
            console.log('💳 Criando preferência de pagamento (SIMULAÇÃO)');
            
            // Validar dados de entrada
            if (!dados.valor || dados.valor <= 0) {
                throw new Error('Valor inválido para pagamento');
            }
            
            // Simular chamada para API do MercadoPago
            await HttpClient.delay(1500);
            
            // Resposta simulada
            const preferencia = {
                id: 'pref_' + Date.now(),
                sandbox_init_point: `https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=pref_${Date.now()}`,
                init_point: `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=pref_${Date.now()}`,
                items: [
                    {
                        title: dados.titulo || 'Doação - IPVONLINE',
                        quantity: 1,
                        unit_price: dados.valor,
                        currency_id: 'BRL'
                    }
                ],
                payer: {
                    name: dados.doador?.nome || '',
                    email: dados.doador?.email || ''
                },
                back_urls: {
                    success: window.location.origin + '/success.html',
                    failure: window.location.origin + '/failure.html',
                    pending: window.location.origin + '/pending.html'
                },
                auto_return: 'approved',
                external_reference: 'donation_' + Date.now()
            };
            
            console.log('✅ Preferência de pagamento criada (SIMULAÇÃO)');
            return preferencia;
            
        } catch (error) {
            console.error('❌ Erro ao criar preferência de pagamento:', error);
            throw error;
        }
    }
    
    /**
     * Simula processamento de doação
     */
    static async processarDoacao(valor, dadosDoador = {}) {
        try {
            console.log('💝 Processando doação (SIMULAÇÃO)');
            
            const preferencia = await this.criarPreferenciaPagamento({
                valor: parseFloat(valor),
                titulo: 'Doação para Instituto Pastoral da Vida',
                doador: dadosDoador
            });
            
            // Em produção, você redirecionaria para o checkout
            console.log('🔗 Link de pagamento gerado:', preferencia.sandbox_init_point);
            
            return {
                sucesso: true,
                linkPagamento: preferencia.sandbox_init_point,
                preferenciaId: preferencia.id
            };
            
        } catch (error) {
            console.error('❌ Erro ao processar doação:', error);
            return {
                sucesso: false,
                erro: error.message
            };
        }
    }
    
    /**
     * Simula verificação de status de pagamento
     */
    static async verificarStatusPagamento(paymentId) {
        try {
            console.log(`🔍 Verificando status do pagamento: ${paymentId}`);
            
            // Simular consulta à API
            await HttpClient.delay(800);
            
            // Status simulado (em produção, viria da API real)
            const statusPossíveis = ['approved', 'pending', 'rejected', 'cancelled'];
            const status = statusPossíveis[Math.floor(Math.random() * statusPossíveis.length)];
            
            const pagamento = {
                id: paymentId,
                status: status,
                status_detail: status === 'approved' ? 'accredited' : 'pending_waiting_payment',
                transaction_amount: 50.00,
                currency_id: 'BRL',
                date_created: new Date().toISOString(),
                date_approved: status === 'approved' ? new Date().toISOString() : null
            };
            
            console.log(`✅ Status do pagamento: ${status}`);
            return pagamento;
            
        } catch (error) {
            console.error('❌ Erro ao verificar status do pagamento:', error);
            throw error;
        }
    }
}

// ========================================
// SUPABASE OPERATIONS
// ========================================

/**
 * Operações com o banco de dados Supabase
 */
class SupabaseOperations {
    /**
     * Salva mensagem de contato
     */
    static async salvarMensagemContato(dadosMensagem) {
        try {
            console.log('💌 Salvando mensagem de contato...');
            
            // Validar dados
            if (!dadosMensagem.nome || !dadosMensagem.email || !dadosMensagem.mensagem) {
                throw new Error('Dados obrigatórios não fornecidos');
            }
            
            // Simular salvamento no Supabase
            await HttpClient.delay(1000);
            
            const mensagem = {
                id: Date.now(),
                nome: dadosMensagem.nome,
                email: dadosMensagem.email,
                telefone: dadosMensagem.telefone || null,
                assunto: dadosMensagem.assunto || 'Não especificado',
                mensagem: dadosMensagem.mensagem,
                lida: false,
                respondida: false,
                created_at: new Date().toISOString(),
                ip_address: '127.0.0.1', // Em produção, capturar IP real
                user_agent: navigator.userAgent
            };
            
            // Se estiver offline, salvar para sincronizar depois
            if (!navigator.onLine) {
                this.salvarParaSincronizacao('mensagens_contato', mensagem);
                console.log('📱 Mensagem salva para sincronização offline');
                return { sucesso: true, offline: true };
            }
            
            console.log('✅ Mensagem de contato salva com sucesso');
            return { sucesso: true, id: mensagem.id };
            
        } catch (error) {
            console.error('❌ Erro ao salvar mensagem de contato:', error);
            throw error;
        }
    }
    
    /**
     * Salva nota do usuário
     */
    static async salvarNotaUsuario(dadosNota, usuarioId) {
        try {
            console.log('📝 Salvando nota do usuário...');
            
            // Validar dados
            if (!dadosNota.titulo || !dadosNota.conteudo) {
                throw new Error('Título e conteúdo são obrigatórios');
            }
            
            // Simular salvamento
            await HttpClient.delay(800);
            
            const nota = {
                id: Date.now(),
                usuario_id: usuarioId,
                titulo: dadosNota.titulo,
                conteudo: dadosNota.conteudo,
                categoria: dadosNota.categoria || 'reflexao',
                favorita: dadosNota.favorita || false,
                tags: dadosNota.tags || [],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            // Se estiver offline, salvar para sincronizar depois
            if (!navigator.onLine) {
                this.salvarParaSincronizacao('notas_usuario', nota);
                return { sucesso: true, offline: true };
            }
            
            console.log('✅ Nota salva com sucesso');
            return { sucesso: true, id: nota.id };
            
        } catch (error) {
            console.error('❌ Erro ao salvar nota:', error);
            throw error;
        }
    }
    
    /**
     * Carrega notas do usuário
     */
    static async carregarNotasUsuario(usuarioId, filtros = {}) {
        try {
            console.log('📖 Carregando notas do usuário...');
            
            // Simular carregamento
            await HttpClient.delay(600);
            
            // Dados simulados (em produção, viria do Supabase)
            const notasSimuladas = [
                {
                    id: 1,
                    titulo: 'Reflexão sobre João 3:16',
                    conteudo: 'Hoje meditei sobre o amor incondicional de Deus...',
                    categoria: 'reflexao',
                    favorita: true,
                    created_at: '2024-01-15T10:30:00Z'
                },
                {
                    id: 2,
                    titulo: 'Estudo do Salmo 23',
                    conteudo: 'O Senhor é o meu pastor, análise versículo por versículo...',
                    categoria: 'estudo',
                    favorita: false,
                    created_at: '2024-01-10T14:20:00Z'
                }
            ];
            
            // Aplicar filtros (simulado)
            let notasFiltradas = notasSimuladas;
            
            if (filtros.categoria) {
                notasFiltradas = notasFiltradas.filter(nota => 
                    nota.categoria === filtros.categoria
                );
            }
            
            if (filtros.favoritas) {
                notasFiltradas = notasFiltradas.filter(nota => nota.favorita);
            }
            
            if (filtros.busca) {
                const termo = filtros.busca.toLowerCase();
                notasFiltradas = notasFiltradas.filter(nota => 
                    nota.titulo.toLowerCase().includes(termo) ||
                    nota.conteudo.toLowerCase().includes(termo)
                );
            }
            
            console.log(`✅ ${notasFiltradas.length} notas carregadas`);
            return notasFiltradas;
            
        } catch (error) {
            console.error('❌ Erro ao carregar notas:', error);
            return [];
        }
    }
    
    /**
     * Salva dados para sincronização offline
     */
    static salvarParaSincronizacao(tabela, dados) {
        try {
            const dadosOffline = JSON.parse(localStorage.getItem('dados_offline') || '{}');
            
            if (!dadosOffline[tabela]) {
                dadosOffline[tabela] = [];
            }
            
            dadosOffline[tabela].push({
                ...dados,
                _offline_timestamp: Date.now()
            });
            
            localStorage.setItem('dados_offline', JSON.stringify(dadosOffline));
            
        } catch (error) {
            console.error('❌ Erro ao salvar para sincronização:', error);
        }
    }
    
    /**
     * Sincroniza dados offline quando voltar online
     */
    static async sincronizarDadosOffline() {
        try {
            const dadosOffline = JSON.parse(localStorage.getItem('dados_offline') || '{}');
            
            if (Object.keys(dadosOffline).length === 0) {
                return { sucesso: true, sincronizados: 0 };
            }
            
            console.log('🔄 Sincronizando dados offline...');
            
            let totalSincronizado = 0;
            
            for (const [tabela, registros] of Object.entries(dadosOffline)) {
                for (const registro of registros) {
                    try {
                        // Remover metadata offline
                        const { _offline_timestamp, ...dadosLimpos } = registro;
                        
                        // Simular envio para servidor
                        await HttpClient.delay(200);
                        
                        totalSincronizado++;
                        
                    } catch (error) {
                        console.error(`❌ Erro ao sincronizar registro da tabela ${tabela}:`, error);
                    }
                }
            }
            
            // Limpar dados offline após sincronização bem-sucedida
            localStorage.removeItem('dados_offline');
            
            console.log(`✅ ${totalSincronizado} registros sincronizados`);
            return { sucesso: true, sincronizados: totalSincronizado };
            
        } catch (error) {
            console.error('❌ Erro na sincronização offline:', error);
            return { sucesso: false, erro: error.message };
        }
    }
}

// ========================================
// FUNÇÕES ESPECÍFICAS PARA PÁGINAS
// ========================================

/**
 * Carrega conteúdo para a página inicial
 */
async function carregarConteudoPaginaInicial() {
    console.log('🏠 Carregando conteúdo da página inicial...');
    
    // Carregar versículo do dia
    carregarVersiculoDia();
    
    // Carregar salmo do dia
    carregarSalmoDia();
    
    // Configurar botões de ação
    configurarBotoesInicial();
}

/**
 * Carrega e exibe o versículo do dia
 */
async function carregarVersiculoDia() {
    const cardVersiculo = document.getElementById('card-versiculo');
    const loading = document.getElementById('loading-versiculo');
    const conteudo = document.getElementById('conteudo-versiculo');
    const erro = document.getElementById('erro-versiculo');
    
    if (!cardVersiculo) return;
    
    try {
        // Mostrar loading
        loading.style.display = 'block';
        conteudo.style.display = 'none';
        erro.style.display = 'none';
        
        const versiculo = await BibliaAPI.obterVersiculoDia();
        
        // Preencher conteúdo
        const textoElement = document.getElementById('texto-versiculo');
        const referenciaElement = document.getElementById('referencia-versiculo');
        
        if (textoElement) textoElement.textContent = versiculo.texto;
        if (referenciaElement) referenciaElement.textContent = versiculo.referencia;
        
        // Configurar botão de compartilhar
        const btnCompartilhar = document.getElementById('compartilhar-versiculo');
        if (btnCompartilhar) {
            btnCompartilhar.addEventListener('click', () => {
                compartilharVersiculo(versiculo);
            });
        }
        
        // Mostrar conteúdo
        loading.style.display = 'none';
        conteudo.style.display = 'block';
        
    } catch (error) {
        console.error('❌ Erro ao carregar versículo do dia:', error);
        
        // Mostrar erro
        loading.style.display = 'none';
        erro.style.display = 'block';
    }
}

/**
 * Carrega e exibe o salmo do dia
 */
async function carregarSalmoDia() {
    const cardSalmo = document.getElementById('card-salmo');
    const loading = document.getElementById('loading-salmo');
    const conteudo = document.getElementById('conteudo-salmo');
    const erro = document.getElementById('erro-salmo');
    
    if (!cardSalmo) return;
    
    try {
        // Mostrar loading
        loading.style.display = 'block';
        conteudo.style.display = 'none';
        erro.style.display = 'none';
        
        const salmo = await BibliaAPI.obterSalmoDia();
        
        // Preencher conteúdo
        const tituloElement = document.getElementById('titulo-salmo');
        const textoElement = document.getElementById('texto-salmo');
        const linkElement = document.getElementById('link-salmo-completo');
        
        if (tituloElement) tituloElement.textContent = `Salmo ${salmo.numero} - ${salmo.titulo}`;
        if (textoElement) textoElement.textContent = salmo.texto;
        if (linkElement) linkElement.href = salmo.url;
        
        // Mostrar conteúdo
        loading.style.display = 'none';
        conteudo.style.display = 'block';
        
    } catch (error) {
        console.error('❌ Erro ao carregar salmo do dia:', error);
        
        // Mostrar erro
        loading.style.display = 'none';
        erro.style.display = 'block';
    }
}

/**
 * Configura botões da página inicial
 */
function configurarBotoesInicial() {
    // Botão de doação
    const btnDoacao = document.getElementById('simular-doacao');
    if (btnDoacao) {
        btnDoacao.addEventListener('click', () => {
            simularDoacao();
        });
    }
    
    // Link para Bíblia online
    const linkBiblia = document.getElementById('link-biblia-online');
    if (linkBiblia) {
        linkBiblia.href = BibliaAPI.obterLinkBibliaOnline();
        linkBiblia.target = '_blank';
        linkBiblia.rel = 'noopener noreferrer';
    }
}

/**
 * Compartilha versículo usando Web Share API ou fallback
 */
async function compartilharVersiculo(versiculo) {
    const textoCompartilhar = `"${versiculo.texto}" - ${versiculo.referencia}\n\nVia IPVONLINE - Instituto Pastoral da Vida`;
    
    try {
        if (navigator.share) {
            await navigator.share({
                title: 'Versículo do Dia - IPVONLINE',
                text: textoCompartilhar,
                url: window.location.href
            });
            
            console.log('✅ Versículo compartilhado via Web Share API');
            
        } else {
            // Fallback: copiar para clipboard
            await navigator.clipboard.writeText(textoCompartilhar);
            mostrarNotificacao('Versículo copiado para a área de transferência!', 'success');
            
            console.log('✅ Versículo copiado para clipboard');
        }
        
    } catch (error) {
        console.error('❌ Erro ao compartilhar versículo:', error);
        
        // Fallback final: criar elemento temporário
        try {
            const textarea = document.createElement('textarea');
            textarea.value = textoCompartilhar;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            
            mostrarNotificacao('Versículo copiado para a área de transferência!', 'success');
            
        } catch (fallbackError) {
            mostrarNotificacao('Não foi possível compartilhar o versículo', 'error');
        }
    }
}

/**
 * Simula processo de doação
 */
async function simularDoacao() {
    try {
        // Mostrar modal de doação (simulado)
        const valor = prompt('Digite o valor da doação (R$):');
        
        if (!valor || isNaN(valor) || parseFloat(valor) <= 0) {
            mostrarNotificacao('Valor inválido para doação', 'error');
            return;
        }
        
        mostrarNotificacao('Processando doação...', 'info');
        
        const resultado = await PagamentoAPI.processarDoacao(valor);
        
        if (resultado.sucesso) {
            // Em produção, você redirecionaria para o link de pagamento
            console.log('🔗 Link de pagamento:', resultado.linkPagamento);
            
            mostrarNotificacao(
                'Doação processada! Em um ambiente real, você seria redirecionado para o pagamento.',
                'success',
                5000
            );
        } else {
            mostrarNotificacao(`Erro ao processar doação: ${resultado.erro}`, 'error');
        }
        
    } catch (error) {
        console.error('❌ Erro na simulação de doação:', error);
        mostrarNotificacao('Erro inesperado ao processar doação', 'error');
    }
}

/**
 * Configura formulário de contato
 */
function configurarFormularioContato() {
    const form = document.getElementById('form-contato');
    if (!form) return;
    
    form.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        
        const dadosMensagem = {
            nome: form.nome.value.trim(),
            email: form.email.value.trim(),
            telefone: form.telefone.value.trim(),
            assunto: form.assunto.value,
            mensagem: form.mensagem.value.trim(),
            aceitaTermos: form['aceita-termos'].checked
        };
        
        // Validações básicas
        if (!dadosMensagem.nome || !dadosMensagem.email || !dadosMensagem.mensagem) {
            mostrarNotificacao('Por favor, preencha todos os campos obrigatórios', 'error');
            return;
        }
        
        if (!dadosMensagem.aceitaTermos) {
            mostrarNotificacao('Você deve aceitar os termos de uso', 'error');
            return;
        }
        
        // Mostrar loading
        const btnEnviar = form.querySelector('#btn-enviar');
        const btnText = btnEnviar.querySelector('.btn-text');
        const btnLoading = btnEnviar.querySelector('.btn-loading');
        
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
        btnEnviar.disabled = true;
        
        try {
            const resultado = await SupabaseOperations.salvarMensagemContato(dadosMensagem);
            
            if (resultado.sucesso) {
                // Mostrar mensagem de sucesso
                const msgSucesso = document.getElementById('mensagem-sucesso');
                const msgErro = document.getElementById('mensagem-erro-geral');
                
                if (msgSucesso) msgSucesso.style.display = 'block';
                if (msgErro) msgErro.style.display = 'none';
                
                // Limpar formulário
                form.reset();
                
                if (resultado.offline) {
                    mostrarNotificacao('Mensagem salva! Será enviada quando você voltar online.', 'info');
                } else {
                    mostrarNotificacao('Mensagem enviada com sucesso!', 'success');
                }
                
            } else {
                throw new Error('Erro ao salvar mensagem');
            }
            
        } catch (error) {
            console.error('❌ Erro ao enviar mensagem:', error);
            
            const msgSucesso = document.getElementById('mensagem-sucesso');
            const msgErro = document.getElementById('mensagem-erro-geral');
            const textoErro = document.getElementById('texto-erro-geral');
            
            if (msgSucesso) msgSucesso.style.display = 'none';
            if (msgErro) msgErro.style.display = 'block';
            if (textoErro) textoErro.textContent = 'Erro ao enviar mensagem. Tente novamente.';
            
            mostrarNotificacao('Erro ao enviar mensagem', 'error');
            
        } finally {
            // Restaurar botão
            btnText.style.display = 'flex';
            btnLoading.style.display = 'none';
            btnEnviar.disabled = false;
        }
    });
}

/**
 * Configura FAQ interativo
 */
function configurarFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.closest('.faq-item');
            const answer = faqItem.querySelector('.faq-answer');
            const icon = question.querySelector('.material-icons');
            const isOpen = question.getAttribute('aria-expanded') === 'true';
            
            // Fechar todas as outras
            faqQuestions.forEach(q => {
                if (q !== question) {
                    q.setAttribute('aria-expanded', 'false');
                    const otherAnswer = q.closest('.faq-item').querySelector('.faq-answer');
                    const otherIcon = q.querySelector('.material-icons');
                    
                    if (otherAnswer) otherAnswer.style.display = 'none';
                    if (otherIcon) otherIcon.textContent = 'expand_more';
                }
            });
            
            // Toggle atual
            if (isOpen) {
                question.setAttribute('aria-expanded', 'false');
                answer.style.display = 'none';
                icon.textContent = 'expand_more';
            } else {
                question.setAttribute('aria-expanded', 'true');
                answer.style.display = 'block';
                icon.textContent = 'expand_less';
            }
        });
    });
}

// ========================================
// EXPORTAÇÕES GLOBAIS
// ========================================

// Exportar APIs para uso global
window.API = {
    BibliaAPI,
    PagamentoAPI,
    SupabaseOperations,
    carregarConteudoPaginaInicial,
    carregarVersiculoDia,
    carregarSalmoDia,
    configurarFormularioContato,
    configurarFAQ,
    compartilharVersiculo,
    simularDoacao
};

// Sincronizar dados offline quando voltar online
window.addEventListener('online', () => {
    console.log('🌐 Conexão restaurada, sincronizando dados...');
    SupabaseOperations.sincronizarDadosOffline();
});