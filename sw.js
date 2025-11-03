/* ========================================
   IPVONLINE - Service Worker
   Instituto Pastoral da Vida
   
   Este service worker implementa:
   - Cache de recursos estáticos
   - Cache de páginas principais
   - Estratégias de cache personalizadas
   - Funcionalidade offline
   - Sincronização em background
   ======================================== */

'use strict';

// ========================================
// CONFIGURAÇÕES DO CACHE
// ========================================

const CACHE_NAME = 'ipvonline-v1.0.0';
const CACHE_STATIC = 'ipvonline-static-v1.0.0';
const CACHE_DYNAMIC = 'ipvonline-dynamic-v1.0.0';
const CACHE_API = 'ipvonline-api-v1.0.0';

// Recursos que devem sempre estar disponíveis offline
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/globals.css',
    '/css/mobile.css',
    '/css/desktop.css',
    '/js/app.js',
    '/js/auth.js',
    '/js/api.js',
    '/pages/offline.html',
    '/pages/sobre.html',
    '/pages/contato.html',
    '/manifest.json',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://unpkg.com/@supabase/supabase-js@2'
];

// Páginas que devem ser cacheadas após primeira visita
const CACHE_PAGES = [
    '/pages/login.html',
    '/pages/register.html',
    '/pages/dashboard.html'
];

// URLs de APIs que devem ser cacheadas
const CACHE_API_PATTERNS = [
    /api\.abibliadigital\.com\.br/,
    /supabase\.co.*\/rest/
];

// Tempo de vida do cache em milissegundos
const CACHE_LIFETIME = {
    static: 7 * 24 * 60 * 60 * 1000,    // 7 dias
    dynamic: 24 * 60 * 60 * 1000,       // 1 dia
    api: 60 * 60 * 1000                 // 1 hora
};

// ========================================
// INSTALAÇÃO DO SERVICE WORKER
// ========================================

self.addEventListener('install', (evento) => {
    console.log('🔧 Service Worker instalando...');
    
    evento.waitUntil(
        cacheStaticAssets()
            .then(() => {
                console.log('✅ Service Worker instalado com sucesso');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Erro na instalação do Service Worker:', error);
            })
    );
});

/**
 * Cacheia recursos estáticos essenciais
 */
async function cacheStaticAssets() {
    try {
        const cache = await caches.open(CACHE_STATIC);
        
        console.log('📦 Cacheando recursos estáticos...');
        
        // Adicionar recursos essenciais ao cache
        await Promise.allSettled(
            STATIC_ASSETS.map(async (url) => {
                try {
                    const response = await fetch(url);
                    if (response.ok) {
                        await cache.put(url, response);
                        console.log(`✅ Cacheado: ${url}`);
                    } else {
                        console.warn(`⚠️ Falha ao cachear: ${url} (${response.status})`);
                    }
                } catch (error) {
                    console.warn(`⚠️ Erro ao cachear: ${url}`, error.message);
                }
            })
        );
        
        // Adicionar timestamp do cache
        await cache.put('__cache_timestamp', new Response(JSON.stringify({
            timestamp: Date.now(),
            version: CACHE_NAME
        })));
        
        console.log('📦 Cache de recursos estáticos concluído');
        
    } catch (error) {
        console.error('❌ Erro ao cachear recursos estáticos:', error);
        throw error;
    }
}

// ========================================
// ATIVAÇÃO DO SERVICE WORKER
// ========================================

self.addEventListener('activate', (evento) => {
    console.log('⚡ Service Worker ativando...');
    
    evento.waitUntil(
        Promise.all([
            cleanOldCaches(),
            self.clients.claim()
        ]).then(() => {
            console.log('✅ Service Worker ativado com sucesso');
        })
    );
});

/**
 * Remove caches antigos para liberar espaço
 */
async function cleanOldCaches() {
    try {
        const cacheNames = await caches.keys();
        const cachesToDelete = cacheNames.filter(cacheName => {
            return cacheName.startsWith('ipvonline-') && 
                   cacheName !== CACHE_NAME && 
                   cacheName !== CACHE_STATIC && 
                   cacheName !== CACHE_DYNAMIC && 
                   cacheName !== CACHE_API;
        });
        
        if (cachesToDelete.length > 0) {
            console.log('🧹 Removendo caches antigos:', cachesToDelete);
            
            await Promise.all(
                cachesToDelete.map(cacheName => caches.delete(cacheName))
            );
            
            console.log('✅ Caches antigos removidos');
        }
        
    } catch (error) {
        console.error('❌ Erro ao limpar caches antigos:', error);
    }
}

// ========================================
// INTERCEPTAÇÃO DE REQUISIÇÕES
// ========================================

self.addEventListener('fetch', (evento) => {
    const request = evento.request;
    const url = new URL(request.url);
    
    // Ignorar requisições não-HTTP
    if (!request.url.startsWith('http')) {
        return;
    }
    
    // Ignorar requisições de extensões do browser
    if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
        return;
    }
    
    // Escolher estratégia baseada no tipo de recurso
    if (isStaticAsset(request)) {
        evento.respondWith(handleStaticAsset(request));
    } else if (isApiRequest(request)) {
        evento.respondWith(handleApiRequest(request));
    } else if (isPageRequest(request)) {
        evento.respondWith(handlePageRequest(request));
    } else {
        evento.respondWith(handleDynamicRequest(request));
    }
});

/**
 * Verifica se é um recurso estático
 */
function isStaticAsset(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    return pathname.endsWith('.css') ||
           pathname.endsWith('.js') ||
           pathname.endsWith('.jpg') ||
           pathname.endsWith('.jpeg') ||
           pathname.endsWith('.png') ||
           pathname.endsWith('.gif') ||
           pathname.endsWith('.svg') ||
           pathname.endsWith('.ico') ||
           pathname.endsWith('.woff') ||
           pathname.endsWith('.woff2') ||
           pathname.endsWith('.ttf') ||
           url.origin === 'https://fonts.googleapis.com' ||
           url.origin === 'https://fonts.gstatic.com' ||
           url.origin === 'https://unpkg.com';
}

/**
 * Verifica se é uma requisição de API
 */
function isApiRequest(request) {
    const url = new URL(request.url);
    
    return CACHE_API_PATTERNS.some(pattern => pattern.test(url.href)) ||
           url.pathname.includes('/api/') ||
           url.pathname.includes('/rest/v1/');
}

/**
 * Verifica se é uma requisição de página
 */
function isPageRequest(request) {
    const url = new URL(request.url);
    
    return request.method === 'GET' &&
           request.headers.get('accept')?.includes('text/html');
}

// ========================================
// ESTRATÉGIAS DE CACHE
// ========================================

/**
 * Estratégia Cache First para recursos estáticos
 */
async function handleStaticAsset(request) {
    try {
        // Tentar buscar no cache primeiro
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            console.log(`📋 Cache hit: ${request.url}`);
            
            // Verificar se o cache não está muito antigo
            const cacheTimestamp = await getCacheTimestamp(CACHE_STATIC);
            if (cacheTimestamp && (Date.now() - cacheTimestamp) < CACHE_LIFETIME.static) {
                return cachedResponse;
            }
        }
        
        // Se não estiver no cache ou estiver antigo, buscar na rede
        console.log(`🌐 Network fetch: ${request.url}`);
        const networkResponse = await fetch(request);
        
        if (networkResponse && networkResponse.status === 200) {
            // Cachear a nova resposta
            const cache = await caches.open(CACHE_STATIC);
            await cache.put(request, networkResponse.clone());
            console.log(`💾 Cached: ${request.url}`);
        }
        
        return networkResponse;
        
    } catch (error) {
        console.warn(`⚠️ Erro ao buscar recurso estático: ${request.url}`, error);
        
        // Tentar retornar do cache mesmo se antigo
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Retornar erro se não conseguir de forma alguma
        return new Response('Recurso não disponível offline', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

/**
 * Estratégia Network First para APIs com fallback
 */
async function handleApiRequest(request) {
    try {
        // Tentar buscar na rede primeiro
        console.log(`🌐 API request: ${request.url}`);
        
        const networkResponse = await fetch(request, {
            timeout: 5000 // 5 segundos de timeout
        });
        
        if (networkResponse && networkResponse.status === 200) {
            // Cachear resposta da API se for GET
            if (request.method === 'GET') {
                const cache = await caches.open(CACHE_API);
                await cache.put(request, networkResponse.clone());
                console.log(`💾 API cached: ${request.url}`);
            }
            
            return networkResponse;
        }
        
        throw new Error(`HTTP ${networkResponse.status}`);
        
    } catch (error) {
        console.warn(`⚠️ Erro na requisição API: ${request.url}`, error);
        
        // Tentar buscar no cache se a rede falhar
        if (request.method === 'GET') {
            const cachedResponse = await caches.match(request);
            if (cachedResponse) {
                console.log(`📋 API cache fallback: ${request.url}`);
                return cachedResponse;
            }
        }
        
        // Retornar dados offline para APIs específicas
        return createOfflineApiResponse(request);
    }
}

/**
 * Estratégia para páginas HTML
 */
async function handlePageRequest(request) {
    try {
        // Tentar buscar na rede primeiro
        console.log(`🌐 Page request: ${request.url}`);
        
        const networkResponse = await fetch(request, {
            timeout: 5000
        });
        
        if (networkResponse && networkResponse.status === 200) {
            // Cachear página se estiver na lista
            const url = new URL(request.url);
            if (CACHE_PAGES.some(page => url.pathname.includes(page))) {
                const cache = await caches.open(CACHE_DYNAMIC);
                await cache.put(request, networkResponse.clone());
                console.log(`💾 Page cached: ${request.url}`);
            }
            
            return networkResponse;
        }
        
        throw new Error(`HTTP ${networkResponse.status}`);
        
    } catch (error) {
        console.warn(`⚠️ Erro ao buscar página: ${request.url}`, error);
        
        // Tentar buscar no cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            console.log(`📋 Page cache hit: ${request.url}`);
            return cachedResponse;
        }
        
        // Retornar página offline
        return getOfflinePage();
    }
}

/**
 * Estratégia para outros recursos dinâmicos
 */
async function handleDynamicRequest(request) {
    try {
        // Tentar rede primeiro
        const networkResponse = await fetch(request, {
            timeout: 5000
        });
        
        if (networkResponse && networkResponse.status === 200) {
            // Cachear se for GET e resposta válida
            if (request.method === 'GET') {
                const cache = await caches.open(CACHE_DYNAMIC);
                await cache.put(request, networkResponse.clone());
            }
            
            return networkResponse;
        }
        
        throw new Error(`HTTP ${networkResponse.status}`);
        
    } catch (error) {
        // Tentar cache como fallback
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Retornar erro se nada funcionar
        return new Response('Conteúdo não disponível offline', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

/**
 * Obtém timestamp do cache
 */
async function getCacheTimestamp(cacheName) {
    try {
        const cache = await caches.open(cacheName);
        const response = await cache.match('__cache_timestamp');
        
        if (response) {
            const data = await response.json();
            return data.timestamp;
        }
        
        return null;
        
    } catch (error) {
        return null;
    }
}

/**
 * Retorna página offline
 */
async function getOfflinePage() {
    try {
        const cache = await caches.open(CACHE_STATIC);
        const offlineResponse = await cache.match('/pages/offline.html');
        
        if (offlineResponse) {
            return offlineResponse;
        }
        
        // Fallback se página offline não estiver cacheada
        return new Response(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Offline - IPVONLINE</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        margin: 0;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        text-align: center;
                        padding: 20px;
                    }
                    .offline-container {
                        max-width: 400px;
                    }
                    .offline-icon {
                        font-size: 64px;
                        margin-bottom: 20px;
                    }
                    h1 {
                        margin-bottom: 10px;
                        font-size: 24px;
                    }
                    p {
                        margin-bottom: 20px;
                        opacity: 0.9;
                    }
                    .btn {
                        background: rgba(255,255,255,0.2);
                        border: 2px solid rgba(255,255,255,0.3);
                        color: white;
                        padding: 12px 24px;
                        border-radius: 8px;
                        text-decoration: none;
                        display: inline-block;
                        transition: all 0.3s ease;
                    }
                    .btn:hover {
                        background: rgba(255,255,255,0.3);
                    }
                </style>
            </head>
            <body>
                <div class="offline-container">
                    <div class="offline-icon">📱</div>
                    <h1>Você está offline</h1>
                    <p>Não foi possível conectar à internet. Algumas funcionalidades podem estar limitadas.</p>
                    <a href="/" class="btn">Voltar ao Início</a>
                </div>
            </body>
            </html>
        `, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8'
            }
        });
        
    } catch (error) {
        console.error('❌ Erro ao obter página offline:', error);
        return new Response('Offline', { status: 503 });
    }
}

/**
 * Cria resposta offline para APIs específicas
 */
function createOfflineApiResponse(request) {
    const url = new URL(request.url);
    
    // Resposta para API da Bíblia
    if (url.href.includes('biblia') || url.href.includes('versiculo')) {
        const offlineVersiculo = {
            texto: "O Senhor é a minha luz e a minha salvação; a quem temerei? O Senhor é o meu forte refúgio; de quem terei medo?",
            referencia: "Salmos 27:1",
            livro: "Salmos",
            capitulo: 27,
            versiculo: 1,
            versao: "NVI",
            offline: true
        };
        
        return new Response(JSON.stringify(offlineVersiculo), {
            headers: {
                'Content-Type': 'application/json',
                'X-Offline': 'true'
            }
        });
    }
    
    // Resposta genérica para outras APIs
    return new Response(JSON.stringify({
        error: 'Offline',
        message: 'Esta funcionalidade requer conexão com a internet',
        offline: true
    }), {
        status: 503,
        headers: {
            'Content-Type': 'application/json',
            'X-Offline': 'true'
        }
    });
}

// ========================================
// SINCRONIZAÇÃO EM BACKGROUND
// ========================================

self.addEventListener('sync', (evento) => {
    console.log('🔄 Background sync:', evento.tag);
    
    if (evento.tag === 'background-sync') {
        evento.waitUntil(performBackgroundSync());
    }
});

/**
 * Executa sincronização em background
 */
async function performBackgroundSync() {
    try {
        console.log('🔄 Iniciando sincronização em background...');
        
        // Enviar dados offline para o servidor
        const clients = await self.clients.matchAll();
        
        clients.forEach(client => {
            client.postMessage({
                type: 'BACKGROUND_SYNC',
                action: 'SYNC_OFFLINE_DATA'
            });
        });
        
        console.log('✅ Sincronização em background concluída');
        
    } catch (error) {
        console.error('❌ Erro na sincronização em background:', error);
    }
}

// ========================================
// NOTIFICAÇÕES PUSH
// ========================================

self.addEventListener('push', (evento) => {
    console.log('📱 Push notification recebida');
    
    let data = {
        title: 'IPVONLINE',
        body: 'Nova mensagem disponível',
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png'
    };
    
    if (evento.data) {
        try {
            data = { ...data, ...evento.data.json() };
        } catch (error) {
            console.warn('⚠️ Erro ao processar dados da notificação:', error);
        }
    }
    
    const options = {
        title: data.title,
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        data: data,
        actions: [
            {
                action: 'open',
                title: 'Abrir'
            },
            {
                action: 'close',
                title: 'Fechar'
            }
        ]
    };
    
    evento.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', (evento) => {
    console.log('📱 Notificação clicada:', evento.action);
    
    evento.notification.close();
    
    if (evento.action === 'open' || evento.action === '') {
        evento.waitUntil(
            self.clients.openWindow('/')
        );
    }
});

// ========================================
// MENSAGENS DO CLIENTE
// ========================================

self.addEventListener('message', (evento) => {
    console.log('💬 Mensagem recebida do cliente:', evento.data);
    
    const { type, payload } = evento.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'GET_VERSION':
            evento.ports[0].postMessage({
                version: CACHE_NAME,
                timestamp: Date.now()
            });
            break;
            
        case 'CLEAR_CACHE':
            clearAllCaches().then(() => {
                evento.ports[0].postMessage({ success: true });
            });
            break;
            
        case 'CACHE_SIZE':
            getCacheSize().then(size => {
                evento.ports[0].postMessage({ size });
            });
            break;
            
        default:
            console.warn('⚠️ Tipo de mensagem não reconhecido:', type);
    }
});

/**
 * Remove todos os caches
 */
async function clearAllCaches() {
    try {
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('🧹 Todos os caches foram removidos');
        return true;
    } catch (error) {
        console.error('❌ Erro ao limpar caches:', error);
        return false;
    }
}

/**
 * Calcula tamanho aproximado do cache
 */
async function getCacheSize() {
    try {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            const estimate = await navigator.storage.estimate();
            return {
                used: estimate.usage,
                available: estimate.quota
            };
        }
        
        return { used: 0, available: 0 };
        
    } catch (error) {
        console.error('❌ Erro ao calcular tamanho do cache:', error);
        return { used: 0, available: 0 };
    }
}

// ========================================
// TRATAMENTO DE ERROS
// ========================================

self.addEventListener('error', (evento) => {
    console.error('❌ Erro no Service Worker:', evento.error);
});

self.addEventListener('unhandledrejection', (evento) => {
    console.error('❌ Promise rejeitada no Service Worker:', evento.reason);
});

// ========================================
// LOG DE STATUS
// ========================================

console.log(`🔧 Service Worker carregado: ${CACHE_NAME}`);
console.log(`📦 Cache estático: ${CACHE_STATIC}`);
console.log(`🔄 Cache dinâmico: ${CACHE_DYNAMIC}`);
console.log(`🌐 Cache API: ${CACHE_API}`);