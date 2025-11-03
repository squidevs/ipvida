/* ========================================
   IPVONLINE - Autenticação
   Instituto Pastoral da Vida
   
   Este arquivo contém as funcionalidades de:
   - Autenticação com Supabase
   - Gerenciamento de sessão
   - Controle de acesso
   - Formulários de login/cadastro
   ======================================== */

'use strict';

// ========================================
// CONFIGURAÇÕES DE AUTENTICAÇÃO
// ========================================

const AUTH_CONFIG = {
    // URLs do Supabase (exemplo - substituir pelas reais)
    supabaseUrl: 'https://seu-projeto.supabase.co',
    supabaseAnonKey: 'sua-chave-anonima-aqui',
    
    // Configurações de sessão
    sessionKey: 'ipv_session',
    userKey: 'ipv_user',
    sessionDuration: 7 * 24 * 60 * 60 * 1000, // 7 dias em millisegundos
    
    // Páginas protegidas
    paginasPrivadas: ['dashboard.html', 'admin.html'],
    paginasAdmin: ['admin.html'],
    
    // Redirecionamentos
    redirecionamentos: {
        aposLogin: 'pages/dashboard.html',
        aposLogout: 'index.html',
        loginRequired: 'pages/login.html',
        adminRequired: 'pages/login.html'
    }
};

// Estado da autenticação
const AUTH_STATE = {
    usuario: null,
    logado: false,
    admin: false,
    verificandoSessao: false
};

// ========================================
// CLIENTE SUPABASE (SIMULADO)
// ========================================

/**
 * Cliente Supabase simulado para demonstração
 * Em produção, você usaria a biblioteca oficial do Supabase
 */
const SupabaseClient = {
    // Simulação de dados para demonstração
    usuarios: [
        {
            id: '1',
            email: 'admin@ipvonline.org',
            senha: 'admin123', // Em produção, isso seria criptografado
            nome: 'Administrador',
            sobrenome: 'Sistema',
            role: 'admin',
            created_at: '2024-01-01T00:00:00Z',
            email_verified: true
        },
        {
            id: '2',
            email: 'usuario@exemplo.com',
            senha: 'senha123',
            nome: 'João',
            sobrenome: 'Silva',
            role: 'user',
            created_at: '2024-01-02T00:00:00Z',
            email_verified: true
        }
    ],
    
    /**
     * Simula login com email e senha
     */
    async signIn(email, senha) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const usuario = this.usuarios.find(u => 
                    u.email.toLowerCase() === email.toLowerCase() && u.senha === senha
                );
                
                if (usuario) {
                    const { senha: _, ...usuarioSemSenha } = usuario;
                    resolve({
                        data: {
                            user: usuarioSemSenha,
                            session: {
                                access_token: 'token-simulado-' + Date.now(),
                                refresh_token: 'refresh-simulado-' + Date.now(),
                                expires_at: Date.now() + AUTH_CONFIG.sessionDuration
                            }
                        },
                        error: null
                    });
                } else {
                    reject({
                        data: null,
                        error: { message: 'Email ou senha incorretos' }
                    });
                }
            }, 1000); // Simular delay de rede
        });
    },
    
    /**
     * Simula cadastro de novo usuário
     */
    async signUp(email, senha, metadados = {}) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Verificar se email já existe
                const emailExiste = this.usuarios.some(u => 
                    u.email.toLowerCase() === email.toLowerCase()
                );
                
                if (emailExiste) {
                    reject({
                        data: null,
                        error: { message: 'Este email já está cadastrado' }
                    });
                    return;
                }
                
                // Criar novo usuário
                const novoUsuario = {
                    id: (this.usuarios.length + 1).toString(),
                    email: email.toLowerCase(),
                    senha: senha, // Em produção, seria criptografado
                    nome: metadados.nome || '',
                    sobrenome: metadados.sobrenome || '',
                    role: 'user',
                    created_at: new Date().toISOString(),
                    email_verified: true // Simplificado para demo
                };
                
                this.usuarios.push(novoUsuario);
                
                const { senha: _, ...usuarioSemSenha } = novoUsuario;
                resolve({
                    data: {
                        user: usuarioSemSenha,
                        session: {
                            access_token: 'token-simulado-' + Date.now(),
                            refresh_token: 'refresh-simulado-' + Date.now(),
                            expires_at: Date.now() + AUTH_CONFIG.sessionDuration
                        }
                    },
                    error: null
                });
            }, 1500); // Simular delay de rede
        });
    },
    
    /**
     * Simula logout
     */
    async signOut() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    data: null,
                    error: null
                });
            }, 500);
        });
    },
    
    /**
     * Simula verificação de sessão
     */
    async getSession() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const sessionData = localStorage.getItem(AUTH_CONFIG.sessionKey);
                if (sessionData) {
                    try {
                        const session = JSON.parse(sessionData);
                        if (session.expires_at > Date.now()) {
                            resolve({
                                data: { session },
                                error: null
                            });
                        } else {
                            resolve({
                                data: { session: null },
                                error: null
                            });
                        }
                    } catch {
                        resolve({
                            data: { session: null },
                            error: null
                        });
                    }
                } else {
                    resolve({
                        data: { session: null },
                        error: null
                    });
                }
            }, 300);
        });
    },
    
    /**
     * Simula recuperação de senha
     */
    async resetPassword(email) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const usuario = this.usuarios.find(u => 
                    u.email.toLowerCase() === email.toLowerCase()
                );
                
                if (usuario) {
                    resolve({
                        data: null,
                        error: null
                    });
                } else {
                    reject({
                        data: null,
                        error: { message: 'Email não encontrado' }
                    });
                }
            }, 1000);
        });
    }
};

// ========================================
// FUNÇÕES DE AUTENTICAÇÃO
// ========================================

/**
 * Realiza login do usuário
 */
async function realizarLogin(email, senha, lembrarMe = false) {
    try {
        console.log('🔐 Tentando fazer login...');
        
        const response = await SupabaseClient.signIn(email, senha);
        
        if (response.data && response.data.user) {
            // Salvar dados da sessão
            salvarSessao(response.data.session, response.data.user, lembrarMe);
            
            // Atualizar estado
            AUTH_STATE.usuario = response.data.user;
            AUTH_STATE.logado = true;
            AUTH_STATE.admin = response.data.user.role === 'admin';
            
            console.log('✅ Login realizado com sucesso:', response.data.user.email);
            
            return {
                sucesso: true,
                usuario: response.data.user
            };
        }
        
    } catch (erro) {
        console.error('❌ Erro no login:', erro);
        
        return {
            sucesso: false,
            erro: erro.error?.message || 'Erro ao fazer login'
        };
    }
}

/**
 * Realiza cadastro de novo usuário
 */
async function realizarCadastro(dadosUsuario) {
    try {
        console.log('📝 Tentando criar conta...');
        
        const { email, senha, nome, sobrenome } = dadosUsuario;
        
        const response = await SupabaseClient.signUp(email, senha, {
            nome,
            sobrenome
        });
        
        if (response.data && response.data.user) {
            // Salvar dados da sessão
            salvarSessao(response.data.session, response.data.user, false);
            
            // Atualizar estado
            AUTH_STATE.usuario = response.data.user;
            AUTH_STATE.logado = true;
            AUTH_STATE.admin = response.data.user.role === 'admin';
            
            console.log('✅ Conta criada com sucesso:', response.data.user.email);
            
            return {
                sucesso: true,
                usuario: response.data.user
            };
        }
        
    } catch (erro) {
        console.error('❌ Erro no cadastro:', erro);
        
        return {
            sucesso: false,
            erro: erro.error?.message || 'Erro ao criar conta'
        };
    }
}

/**
 * Realiza logout do usuário
 */
async function realizarLogout() {
    try {
        console.log('🚪 Fazendo logout...');
        
        await SupabaseClient.signOut();
        
        // Limpar dados locais
        limparSessao();
        
        // Atualizar estado
        AUTH_STATE.usuario = null;
        AUTH_STATE.logado = false;
        AUTH_STATE.admin = false;
        
        console.log('✅ Logout realizado com sucesso');
        
        return {
            sucesso: true
        };
        
    } catch (erro) {
        console.error('❌ Erro no logout:', erro);
        
        // Mesmo com erro, limpar dados locais
        limparSessao();
        AUTH_STATE.usuario = null;
        AUTH_STATE.logado = false;
        AUTH_STATE.admin = false;
        
        return {
            sucesso: false,
            erro: erro.error?.message || 'Erro ao fazer logout'
        };
    }
}

/**
 * Recupera senha do usuário
 */
async function recuperarSenha(email) {
    try {
        console.log('🔑 Enviando link de recuperação...');
        
        await SupabaseClient.resetPassword(email);
        
        console.log('✅ Link de recuperação enviado');
        
        return {
            sucesso: true
        };
        
    } catch (erro) {
        console.error('❌ Erro na recuperação:', erro);
        
        return {
            sucesso: false,
            erro: erro.error?.message || 'Erro ao enviar link de recuperação'
        };
    }
}

/**
 * Verifica se o usuário está autenticado
 */
async function verificarAutenticacao() {
    if (AUTH_STATE.verificandoSessao) return false;
    
    AUTH_STATE.verificandoSessao = true;
    
    try {
        // Verificar sessão local primeiro
        const sessaoLocal = carregarSessao();
        if (sessaoLocal) {
            AUTH_STATE.usuario = sessaoLocal.usuario;
            AUTH_STATE.logado = true;
            AUTH_STATE.admin = sessaoLocal.usuario.role === 'admin';
            
            console.log('✅ Sessão local válida:', sessaoLocal.usuario.email);
            return true;
        }
        
        // Verificar com o servidor
        const response = await SupabaseClient.getSession();
        
        if (response.data?.session) {
            // Carregar dados do usuário
            const userData = localStorage.getItem(AUTH_CONFIG.userKey);
            if (userData) {
                const usuario = JSON.parse(userData);
                
                AUTH_STATE.usuario = usuario;
                AUTH_STATE.logado = true;
                AUTH_STATE.admin = usuario.role === 'admin';
                
                console.log('✅ Sessão do servidor válida:', usuario.email);
                return true;
            }
        }
        
        console.log('ℹ️ Nenhuma sessão válida encontrada');
        return false;
        
    } catch (erro) {
        console.error('❌ Erro ao verificar autenticação:', erro);
        return false;
        
    } finally {
        AUTH_STATE.verificandoSessao = false;
    }
}

/**
 * Verifica se o usuário é administrador
 */
function verificarAdmin() {
    return AUTH_STATE.logado && AUTH_STATE.admin;
}

/**
 * Obtém o usuário atual
 */
function obterUsuarioAtual() {
    return AUTH_STATE.usuario;
}

/**
 * Verifica se está logado
 */
function estaLogado() {
    return AUTH_STATE.logado;
}

// ========================================
// GERENCIAMENTO DE SESSÃO
// ========================================

/**
 * Salva dados da sessão no localStorage
 */
function salvarSessao(session, usuario, persistir = false) {
    try {
        const dadosSessao = {
            session,
            usuario,
            persistir,
            timestamp: Date.now()
        };
        
        localStorage.setItem(AUTH_CONFIG.sessionKey, JSON.stringify(dadosSessao.session));
        localStorage.setItem(AUTH_CONFIG.userKey, JSON.stringify(dadosSessao.usuario));
        
        // Se escolheu lembrar, salvar também no sessionStorage como backup
        if (persistir) {
            sessionStorage.setItem(AUTH_CONFIG.sessionKey, JSON.stringify(dadosSessao.session));
            sessionStorage.setItem(AUTH_CONFIG.userKey, JSON.stringify(dadosSessao.usuario));
        }
        
        console.log('💾 Sessão salva com sucesso');
        
    } catch (erro) {
        console.error('❌ Erro ao salvar sessão:', erro);
    }
}

/**
 * Carrega dados da sessão do localStorage
 */
function carregarSessao() {
    try {
        const sessionData = localStorage.getItem(AUTH_CONFIG.sessionKey);
        const userData = localStorage.getItem(AUTH_CONFIG.userKey);
        
        if (sessionData && userData) {
            const session = JSON.parse(sessionData);
            const usuario = JSON.parse(userData);
            
            // Verificar se a sessão não expirou
            if (session.expires_at > Date.now()) {
                return {
                    session,
                    usuario
                };
            } else {
                // Sessão expirada, limpar
                limparSessao();
                console.log('⏰ Sessão expirada');
            }
        }
        
        return null;
        
    } catch (erro) {
        console.error('❌ Erro ao carregar sessão:', erro);
        limparSessao(); // Limpar dados corrompidos
        return null;
    }
}

/**
 * Limpa todos os dados da sessão
 */
function limparSessao() {
    try {
        localStorage.removeItem(AUTH_CONFIG.sessionKey);
        localStorage.removeItem(AUTH_CONFIG.userKey);
        sessionStorage.removeItem(AUTH_CONFIG.sessionKey);
        sessionStorage.removeItem(AUTH_CONFIG.userKey);
        
        console.log('🧹 Sessão limpa');
        
    } catch (erro) {
        console.error('❌ Erro ao limpar sessão:', erro);
    }
}

// ========================================
// CONTROLE DE ACESSO
// ========================================

/**
 * Requer autenticação para acessar a página
 */
async function requireAuth() {
    const autenticado = await verificarAutenticacao();
    
    if (!autenticado) {
        console.log('🔒 Acesso negado - login requerido');
        
        // Salvar URL atual para redirecionamento após login
        const urlAtual = window.location.href;
        sessionStorage.setItem('redirect_after_login', urlAtual);
        
        // Redirecionar para login
        window.location.href = '../' + AUTH_CONFIG.redirecionamentos.loginRequired;
        return false;
    }
    
    return true;
}

/**
 * Requer privilégios de administrador
 */
async function requireAdmin() {
    const autenticado = await verificarAutenticacao();
    
    if (!autenticado) {
        console.log('🔒 Acesso negado - login requerido');
        window.location.href = '../' + AUTH_CONFIG.redirecionamentos.adminRequired;
        return false;
    }
    
    if (!verificarAdmin()) {
        console.log('🔒 Acesso negado - privilégios de admin requeridos');
        mostrarNotificacao('Acesso negado. Você não tem privilégios de administrador.', 'error');
        window.location.href = '../' + AUTH_CONFIG.redirecionamentos.aposLogin;
        return false;
    }
    
    return true;
}

/**
 * Redireciona usuário logado para área apropriada
 */
function redirecionarSeLogado() {
    if (AUTH_STATE.logado) {
        const urlRedirect = sessionStorage.getItem('redirect_after_login');
        
        if (urlRedirect) {
            sessionStorage.removeItem('redirect_after_login');
            window.location.href = urlRedirect;
        } else {
            window.location.href = AUTH_CONFIG.redirecionamentos.aposLogin;
        }
    }
}

// ========================================
// CONFIGURAÇÃO DE FORMULÁRIOS
// ========================================

/**
 * Configura o formulário de login
 */
function configurarFormularioLogin() {
    const form = document.getElementById('form-login');
    if (!form) return;
    
    form.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        
        const email = form.email.value.trim();
        const senha = form.senha.value;
        const lembrarMe = form['lembrar-me']?.checked || false;
        
        // Validações básicas
        if (!email || !senha) {
            mostrarNotificacao('Por favor, preencha todos os campos', 'error');
            return;
        }
        
        // Mostrar loading
        const btnSubmit = form.querySelector('button[type="submit"]');
        const btnContent = btnSubmit.querySelector('.btn-content');
        const btnLoading = btnSubmit.querySelector('.btn-loading');
        
        btnContent.style.display = 'none';
        btnLoading.style.display = 'flex';
        btnSubmit.disabled = true;
        
        try {
            const resultado = await realizarLogin(email, senha, lembrarMe);
            
            if (resultado.sucesso) {
                mostrarNotificacao('Login realizado com sucesso!', 'success');
                
                // Aguardar um pouco antes de redirecionar
                setTimeout(() => {
                    redirecionarSeLogado();
                }, 1000);
                
            } else {
                mostrarNotificacao(resultado.erro, 'error');
            }
            
        } catch (erro) {
            console.error('❌ Erro no formulário de login:', erro);
            mostrarNotificacao('Erro inesperado. Tente novamente.', 'error');
            
        } finally {
            // Restaurar botão
            btnContent.style.display = 'flex';
            btnLoading.style.display = 'none';
            btnSubmit.disabled = false;
        }
    });
    
    // Configurar toggle de senha
    const toggleSenha = document.getElementById('toggle-senha');
    const inputSenha = document.getElementById('senha');
    
    if (toggleSenha && inputSenha) {
        toggleSenha.addEventListener('click', () => {
            const icon = toggleSenha.querySelector('.material-icons');
            
            if (inputSenha.type === 'password') {
                inputSenha.type = 'text';
                icon.textContent = 'visibility_off';
            } else {
                inputSenha.type = 'password';
                icon.textContent = 'visibility';
            }
        });
    }
}

/**
 * Configura o formulário de cadastro
 */
function configurarFormularioCadastro() {
    const form = document.getElementById('form-cadastro');
    if (!form) return;
    
    form.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        
        const dadosUsuario = {
            nome: form.nome.value.trim(),
            sobrenome: form.sobrenome.value.trim(),
            email: form.email.value.trim(),
            senha: form.senha.value,
            confirmarSenha: form['confirmar-senha'].value,
            aceitaTermos: form['aceita-termos'].checked
        };
        
        // Validações
        const validacao = validarDadosCadastro(dadosUsuario);
        if (!validacao.valido) {
            mostrarNotificacao(validacao.erro, 'error');
            return;
        }
        
        // Mostrar loading
        const btnSubmit = form.querySelector('button[type="submit"]');
        const btnContent = btnSubmit.querySelector('.btn-content');
        const btnLoading = btnSubmit.querySelector('.btn-loading');
        
        btnContent.style.display = 'none';
        btnLoading.style.display = 'flex';
        btnSubmit.disabled = true;
        
        try {
            const resultado = await realizarCadastro(dadosUsuario);
            
            if (resultado.sucesso) {
                mostrarNotificacao('Conta criada com sucesso!', 'success');
                
                // Aguardar um pouco antes de redirecionar
                setTimeout(() => {
                    window.location.href = AUTH_CONFIG.redirecionamentos.aposLogin;
                }, 1000);
                
            } else {
                mostrarNotificacao(resultado.erro, 'error');
            }
            
        } catch (erro) {
            console.error('❌ Erro no formulário de cadastro:', erro);
            mostrarNotificacao('Erro inesperado. Tente novamente.', 'error');
            
        } finally {
            // Restaurar botão
            btnContent.style.display = 'flex';
            btnLoading.style.display = 'none';
            btnSubmit.disabled = false;
        }
    });
    
    // Configurar toggles de senha
    configurarTogglesSenha();
    
    // Configurar validação em tempo real
    configurarValidacaoTempoReal();
}

/**
 * Configura recuperação de senha
 */
function configurarRecuperacaoSenha() {
    const linkEsqueciSenha = document.getElementById('esqueci-senha');
    const modal = document.getElementById('modal-recuperacao');
    const formRecuperacao = document.getElementById('form-recuperacao');
    
    if (linkEsqueciSenha && modal) {
        linkEsqueciSenha.addEventListener('click', (evento) => {
            evento.preventDefault();
            modal.style.display = 'flex';
        });
    }
    
    if (formRecuperacao) {
        formRecuperacao.addEventListener('submit', async (evento) => {
            evento.preventDefault();
            
            const email = formRecuperacao['email-recuperacao'].value.trim();
            
            if (!email) {
                mostrarNotificacao('Por favor, digite seu e-mail', 'error');
                return;
            }
            
            try {
                const resultado = await recuperarSenha(email);
                
                if (resultado.sucesso) {
                    mostrarNotificacao('Link de recuperação enviado! Verifique seu e-mail.', 'success');
                    modal.style.display = 'none';
                } else {
                    mostrarNotificacao(resultado.erro, 'error');
                }
                
            } catch (erro) {
                console.error('❌ Erro na recuperação:', erro);
                mostrarNotificacao('Erro inesperado. Tente novamente.', 'error');
            }
        });
    }
    
    // Fechar modal
    const btnFechar = document.getElementById('fechar-modal');
    const overlay = document.getElementById('modal-overlay');
    
    if (btnFechar) {
        btnFechar.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    
    if (overlay) {
        overlay.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
}

// ========================================
// VALIDAÇÕES
// ========================================

/**
 * Valida dados do cadastro
 */
function validarDadosCadastro(dados) {
    // Nome
    if (!dados.nome || dados.nome.length < 2) {
        return { valido: false, erro: 'Nome deve ter pelo menos 2 caracteres' };
    }
    
    // Sobrenome
    if (!dados.sobrenome || dados.sobrenome.length < 2) {
        return { valido: false, erro: 'Sobrenome deve ter pelo menos 2 caracteres' };
    }
    
    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!dados.email || !emailRegex.test(dados.email)) {
        return { valido: false, erro: 'Email inválido' };
    }
    
    // Senha
    if (!dados.senha || dados.senha.length < 8) {
        return { valido: false, erro: 'Senha deve ter pelo menos 8 caracteres' };
    }
    
    // Confirmar senha
    if (dados.senha !== dados.confirmarSenha) {
        return { valido: false, erro: 'Senhas não coincidem' };
    }
    
    // Termos
    if (!dados.aceitaTermos) {
        return { valido: false, erro: 'Você deve aceitar os termos de uso' };
    }
    
    return { valido: true };
}

// ========================================
// INICIALIZAÇÃO
// ========================================

// Verificar autenticação quando a página carrega
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar se é uma página que requer autenticação
    const paginaAtual = window.location.pathname;
    const requerAuth = AUTH_CONFIG.paginasPrivadas.some(pagina => paginaAtual.includes(pagina));
    const requerAdmin = AUTH_CONFIG.paginasAdmin.some(pagina => paginaAtual.includes(pagina));
    
    if (requerAuth || requerAdmin) {
        console.log('🔐 Verificando autenticação para página protegida...');
        
        if (requerAdmin) {
            await requireAdmin();
        } else {
            await requireAuth();
        }
    } else {
        // Para páginas públicas, apenas verificar se está logado
        await verificarAutenticacao();
        
        // Se estiver em página de login/cadastro e já estiver logado, redirecionar
        if ((paginaAtual.includes('login.html') || paginaAtual.includes('register.html')) && AUTH_STATE.logado) {
            redirecionarSeLogado();
        }
    }
});

// Exportar funções para uso global
window.AUTH = {
    realizarLogin,
    realizarCadastro,
    realizarLogout,
    recuperarSenha,
    verificarAutenticacao,
    verificarAdmin,
    requireAuth,
    requireAdmin,
    obterUsuarioAtual,
    estaLogado,
    AUTH_STATE,
    AUTH_CONFIG
};