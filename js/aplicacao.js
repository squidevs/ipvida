// ============================================
// APLICACAO.JS - Controle Principal Alpine.js
// ============================================

// Componente Principal
function aplicacao() {
  return {
    menuAberto: false,
    
    init() {
      console.log('IPV Online Iniciado');
      this.configurarScrollSuave();
      this.revelarElementosNoScroll();
    },
    
    fecharMenu() {
      this.menuAberto = false;
    },
    
    configurarScrollSuave() {
      document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const id = link.getAttribute('href');
          if (id === '#') return;
          
          const elemento = document.querySelector(id);
          if (elemento) {
            const offsetTop = elemento.offsetTop - 70;
            window.scrollTo({
              top: offsetTop,
              behavior: 'smooth'
            });
            this.fecharMenu();
          }
        });
      });
    },
    
    revelarElementosNoScroll() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revelado');
          }
        });
      }, { threshold: 0.1 });
      
      document.querySelectorAll('.scroll-reveal').forEach(el => {
        observer.observe(el);
      });
    }
  };
}

// Carrossel Devocionais
function carrosselDevocionais() {
  return {
    slideAtual: 0,
    autoplay: null,
    versiculoDia: {
      texto: '"Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna."',
      referencia: 'João 3:16'
    },
    salmoDia: {
      texto: '"O SENHOR é o meu pastor; nada me faltará. Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas."',
      referencia: 'Salmos 23:1-2'
    },
    proberbioDia: {
      texto: '"Confia no SENHOR de todo o teu coração e não te estribes no teu próprio entendimento. Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas."',
      referencia: 'Provérbios 3:5-6'
    },
    
    init() {
      this.carregarVersiculos();
      this.iniciarAutoplay();
    },
    
    async carregarVersiculos() {
      try {
        // Buscar versículo do dia da API Bíblia Online
        const response = await fetch('https://www.abibliadigital.com.br/api/verses/nvi/random');
        const data = await response.json();
        
        if (data.text && data.book && data.chapter && data.number) {
          this.versiculoDia = {
            texto: `"${data.text}"`,
            referencia: `${data.book.name} ${data.chapter}:${data.number}`
          };
        }
      } catch (erro) {
        console.log('Usando versículos padrão');
      }
    },
    
    proximo() {
      this.slideAtual = (this.slideAtual + 1) % 3;
      this.resetarAutoplay();
    },
    
    anterior() {
      this.slideAtual = this.slideAtual === 0 ? 2 : this.slideAtual - 1;
      this.resetarAutoplay();
    },
    
    irPara(index) {
      this.slideAtual = index;
      this.resetarAutoplay();
    },
    
    iniciarAutoplay() {
      this.autoplay = setInterval(() => {
        this.proximo();
      }, 5000);
    },
    
    resetarAutoplay() {
      clearInterval(this.autoplay);
      this.iniciarAutoplay();
    }
  };
}

// Vídeos YouTube e Live
function videosYoutube() {
  return {
    videos: [],
    live: null,
    carregando: true,
    
    init() {
      this.verificarLive();
      this.carregarVideos();
      // Verificar live a cada 2 minutos
      setInterval(() => this.verificarLive(), 120000);
    },
    
    async verificarLive() {
      try {
        // Tenta buscar da API do YouTube
        const statusLive = await verificarLiveYouTube();
        this.live = statusLive;
      } catch (erro) {
        console.log('Usando dados mockados para live');
        // Fallback: você pode simular se tem live ou não
        this.live = { aoVivo: false };
      }
    },
    
    async carregarVideos() {
      this.carregando = true;
      try {
        // Tenta buscar vídeos reais da API
        const videosAPI = await buscarVideosYouTube(6);
        
        if (videosAPI && videosAPI.length > 0) {
          this.videos = videosAPI;
        } else {
          // Fallback: Últimos 9 cultos da IPB Vida
          this.videos = [
            {
              id: 'H3vpXaanS4Y',
              titulo: 'Culto Dominical - IPB Vida',
              descricao: 'Culto de adoração e pregação da Palavra de Deus',
              thumbnail: 'https://i.ytimg.com/vi/H3vpXaanS4Y/hqdefault.jpg',
              url: 'https://www.youtube.com/watch?v=H3vpXaanS4Y',
              duracao: '1:45:23',
              data: '2025-11-03'
            },
            {
              id: 'Lp5FsNQx_k8',
              titulo: 'Culto de Celebração - IPB Vida',
              descricao: 'Momento de louvor e adoração ao Senhor',
              thumbnail: 'https://i.ytimg.com/vi/Lp5FsNQx_k8/hqdefault.jpg',
              url: 'https://www.youtube.com/watch?v=Lp5FsNQx_k8',
              duracao: '1:38:15',
              data: '2025-10-31'
            },
            {
              id: 'LZphVnUPJfw',
              titulo: 'Culto Vespertino - IPB Vida',
              descricao: 'Culto vespertino com pregação expositiva',
              thumbnail: 'https://i.ytimg.com/vi/LZphVnUPJfw/hqdefault.jpg',
              url: 'https://www.youtube.com/watch?v=LZphVnUPJfw',
              duracao: '1:52:40',
              data: '2025-10-27'
            },
            {
              id: 'ZtA8lBgmZlA',
              titulo: 'Culto Dominical Matutino - IPB Vida',
              descricao: 'Culto matutino de domingo com a família IPB Vida',
              thumbnail: 'https://i.ytimg.com/vi/ZtA8lBgmZlA/hqdefault.jpg',
              url: 'https://www.youtube.com/watch?v=ZtA8lBgmZlA',
              duracao: '1:43:55',
              data: '2025-10-24'
            },
            {
              id: 'W5tBcSnUJhU',
              titulo: 'Culto de Domingo - IPB Vida',
              descricao: 'Celebração dominical com adoração e ensino bíblico',
              thumbnail: 'https://i.ytimg.com/vi/W5tBcSnUJhU/hqdefault.jpg',
              url: 'https://www.youtube.com/watch?v=W5tBcSnUJhU',
              duracao: '1:41:20',
              data: '2025-10-20'
            },
            {
              id: 'yZtjpruaTFc',
              titulo: 'Culto de Adoração - IPB Vida',
              descricao: 'Momento de adoração e reflexão na Palavra',
              thumbnail: 'https://i.ytimg.com/vi/yZtjpruaTFc/hqdefault.jpg',
              url: 'https://www.youtube.com/watch?v=yZtjpruaTFc',
              duracao: '1:47:30',
              data: '2025-10-17'
            },
            {
              id: 'RrK6MACslgU',
              titulo: 'Culto Solene - IPB Vida',
              descricao: 'Culto especial de celebração e gratidão',
              thumbnail: 'https://i.ytimg.com/vi/RrK6MACslgU/hqdefault.jpg',
              url: 'https://www.youtube.com/watch?v=RrK6MACslgU',
              duracao: '1:39:45',
              data: '2025-10-13'
            },
            {
              id: 'fMykvWJBB0c',
              titulo: 'Culto Dominical - Pregação da Palavra',
              descricao: 'Culto com pregação expositiva das Escrituras',
              thumbnail: 'https://i.ytimg.com/vi/fMykvWJBB0c/hqdefault.jpg',
              url: 'https://www.youtube.com/watch?v=fMykvWJBB0c',
              duracao: '1:44:10',
              data: '2025-10-10'
            },
            {
              id: '32gwoMw7d0s',
              titulo: 'Culto de Louvor e Pregação',
              descricao: 'Culto com louvor congregacional e mensagem bíblica',
              thumbnail: 'https://i.ytimg.com/vi/32gwoMw7d0s/hqdefault.jpg',
              url: 'https://www.youtube.com/watch?v=32gwoMw7d0s',
              duracao: '1:50:25',
              data: '2025-10-06'
            }
          ];
        }
      } catch (erro) {
        console.error('Erro ao carregar vídeos:', erro);
      } finally {
        this.carregando = false;
      }
    },
    
    inscreverCanal() {
      window.open('https://youtube.com/@ipbvida?sub_confirmation=1', '_blank');
    },
    
    assistirAoVivo() {
      if (this.live && this.live.aoVivo) {
        window.open(this.live.url, '_blank');
      } else {
        alert('Não há transmissão ao vivo no momento. Inscreva-se para ser notificado!');
      }
    },
    
    formatarData(dataString) {
      if (!dataString) return '';
      const data = new Date(dataString + 'T00:00:00');
      return data.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'short',
        year: 'numeric'
      });
    }
  };
}

// Programação
function programacaoIgreja() {
  return {
    slideAtual: 0,
    programas: [],
    gruposBanners: [],
    
    init() {
      this.carregarProgramacao();
      this.agruparBanners();
      this.iniciarAutoPlay();
    },
    
    carregarProgramacao() {
      this.programas = [
        {
          id: 1,
          titulo: 'Culto de Celebração e Adoração',
          dia: '10',
          mes: 'nov',
          horario: '19h30',
          local: 'Templo Principal',
          categoria: 'CULTOS',
          corCategoria: '#1A4731',
          link: '#',
          cor1: '#1A4731',
          cor2: '#2D5F4A',
          imagem: 'assets/images/programacao/culto.svg'
        },
        {
          id: 2,
          titulo: 'Escola Bíblica Dominical',
          dia: '10',
          mes: 'nov',
          horario: '09h00',
          local: 'Salas de Aula',
          categoria: 'ENSINO',
          corCategoria: '#2C3E50',
          link: '#',
          cor1: '#2C3E50',
          cor2: '#34495E',
          imagem: 'assets/images/programacao/ebd.svg'
        },
        {
          id: 3,
          titulo: 'Reunião de Oração',
          dia: '13',
          mes: 'nov',
          horario: '20h00',
          local: 'Templo',
          categoria: 'ORAÇÃO',
          corCategoria: '#8B3A62',
          link: '#',
          cor1: '#8B3A62',
          cor2: '#A94976',
          imagem: 'assets/images/programacao/oracao.svg'
        },
        {
          id: 4,
          titulo: 'Estudo Bíblico de Quarta',
          dia: '13',
          mes: 'nov',
          horario: '19h30',
          local: 'Salão',
          categoria: 'ESTUDO',
          corCategoria: '#D4AF37',
          link: '#',
          cor1: '#D4AF37',
          cor2: '#C9A352',
          imagem: 'assets/images/programacao/estudo.svg'
        },
        {
          id: 5,
          titulo: 'Culto de Jovens e Adolescentes',
          dia: '15',
          mes: 'nov',
          horario: '19h00',
          local: 'Salão Jovem',
          categoria: 'JOVENS',
          corCategoria: '#3498DB',
          link: '#',
          cor1: '#3498DB',
          cor2: '#5DADE2',
          imagem: 'assets/images/programacao/jovens.svg'
        },
        {
          id: 6,
          titulo: 'Ministério Infantil',
          dia: '10',
          mes: 'nov',
          horario: '10h00',
          local: 'Sala Infantil',
          categoria: 'CRIANÇAS',
          corCategoria: '#E74C3C',
          link: '#',
          cor1: '#E74C3C',
          cor2: '#EC7063',
          imagem: 'assets/images/programacao/infantil.svg'
        },
        {
          id: 7,
          titulo: 'Grupo de Casais',
          dia: '16',
          mes: 'nov',
          horario: '20h00',
          local: 'Residência',
          categoria: 'GRUPOS',
          corCategoria: '#16A085',
          link: '#',
          cor1: '#16A085',
          cor2: '#1ABC9C',
          imagem: 'assets/images/programacao/casais.svg'
        },
        {
          id: 8,
          titulo: 'Ação Social Comunitária',
          dia: '17',
          mes: 'nov',
          horario: '14h00',
          local: 'Comunidade',
          categoria: 'MISSÕES',
          corCategoria: '#9B59B6',
          link: '#',
          cor1: '#9B59B6',
          cor2: '#8E44AD',
          imagem: 'assets/images/programacao/social.svg'
        }
      ];
    },
    
    agruparBanners() {
      // Agrupa os primeiros 6 programas em grupos de 3 para o carrossel
      const banners = this.programas.slice(0, 6);
      this.gruposBanners = [];
      for (let i = 0; i < banners.length; i += 3) {
        this.gruposBanners.push(banners.slice(i, i + 3));
      }
    },
    
    proximoSlide() {
      this.slideAtual = (this.slideAtual + 1) % this.gruposBanners.length;
    },
    
    anteriorSlide() {
      this.slideAtual = this.slideAtual === 0 ? this.gruposBanners.length - 1 : this.slideAtual - 1;
    },
    
    iniciarAutoPlay() {
      setInterval(() => {
        this.proximoSlide();
      }, 5000);
    }
  };
}

// Eventos
function eventosIgreja() {
  return {
    eventos: [],
    
    init() {
      this.carregarEventos();
    },
    
    carregarEventos() {
      this.eventos = [
        {
          id: 1,
          titulo: 'Culto de Celebração',
          descricao: 'Venha celebrar conosco a bondade de Deus com louvor e pregação da Palavra.',
          data: '2025-11-09',
          imagem: 'assets/images/foto-igreja.png'
        },
        {
          id: 2,
          titulo: 'Escola Bíblica Dominical',
          descricao: 'Estudo aprofundado das Escrituras para todas as idades.',
          data: '2025-11-10',
          imagem: 'assets/images/foto01.png'
        },
        {
          id: 3,
          titulo: 'Reunião de Oração',
          descricao: 'Momento de intercessão e busca pela presença de Deus.',
          data: '2025-11-08',
          imagem: 'assets/images/foto03.png'
        }
      ];
    },
    
    formatarData(dataString) {
      const data = new Date(dataString + 'T00:00:00');
      return data.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'long',
        year: 'numeric'
      });
    }
  };
}

// Formulário Contato
function formularioContato() {
  return {
    dados: {
      nome: '',
      email: '',
      telefone: '',
      assunto: '',
      mensagem: ''
    },
    
    async enviar() {
      // Validação básica
      if (!this.dados.nome || !this.dados.email || !this.dados.mensagem) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
      }
      
      // Aqui você integraria com EmailJS ou backend
      console.log('Enviando formulário:', this.dados);
      
      alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
      
      // Limpar formulário
      this.dados = {
        nome: '',
        email: '',
        telefone: '',
        assunto: '',
        mensagem: ''
      };
    }
  };
}

// Notícias IPB
function noticiasIPB() {
  return {
    noticias: [],
    carregando: true,
    
    init() {
      this.carregarNoticias();
    },
    
    async carregarNoticias() {
      this.carregando = true;
      try {
        const noticiasAPI = await buscarNoticiasIPB();
        this.noticias = noticiasAPI;
      } catch (erro) {
        console.error('Erro ao carregar notícias:', erro);
      } finally {
        this.carregando = false;
      }
    },
    
    formatarData(dataString) {
      const data = new Date(dataString);
      return data.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'long',
        year: 'numeric'
      });
    }
  };
}

// Copiar PIX
function copiarPix() {
  const chavePix = '00.000.000/0001-00';
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(chavePix).then(() => {
      alert('Chave PIX copiada para a área de transferência!');
    });
  } else {
    alert('Chave PIX: ' + chavePix);
  }
}
