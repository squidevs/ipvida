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

// Vídeos YouTube
function videosYoutube() {
  return {
    videos: [],
    
    init() {
      this.carregarVideos();
    },
    
    async carregarVideos() {
      // Vídeos exemplo (substituir com API do YouTube)
      this.videos = [
        {
          id: 1,
          titulo: 'Culto Dominical - Sermão',
          descricao: 'Mensagem da Palavra de Deus',
          thumbnail: 'assets/images/foto03.png',
          url: 'https://youtube.com/@ipbvida'
        },
        {
          id: 2,
          titulo: 'Estudo Bíblico',
          descricao: 'Aprofundando na Escritura',
          thumbnail: 'assets/images/foto01.png',
          url: 'https://youtube.com/@ipbvida'
        },
        {
          id: 3,
          titulo: 'Louvor e Adoração',
          descricao: 'Momentos de culto',
          thumbnail: 'assets/images/comunidade.png',
          url: 'https://youtube.com/@ipbvida'
        }
      ];
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
          titulo: 'Proteção de Dados na Igreja e nos Concílios',
          dia: '16',
          mes: 'out',
          horario: '19h30',
          local: 'Templo Principal',
          categoria: 'DESTAQUES',
          corCategoria: '#1A4731',
          link: '#',
          cor1: '#1A4731',
          cor2: '#2D5F4A'
        },
        {
          id: 2,
          titulo: 'A Reforma Protestante do Século XVI',
          dia: '10',
          mes: 'out',
          horario: '20h00',
          local: 'Auditório',
          categoria: 'ÚLTIMAS',
          corCategoria: '#2C3E50',
          link: '#',
          cor1: '#2C3E50',
          cor2: '#34495E'
        },
        {
          id: 3,
          titulo: 'Outubro Rosa - Cuidado da Mulher',
          dia: '02',
          mes: 'out',
          horario: '15h00',
          local: 'Salão de Eventos',
          categoria: 'INFORMATIVOS',
          corCategoria: '#8B3A62',
          link: '#',
          cor1: '#8B3A62',
          cor2: '#A94976'
        },
        {
          id: 4,
          titulo: 'Mês da Reforma Protestante',
          dia: '01',
          mes: 'out',
          horario: 'Todo o mês',
          local: 'Diversos locais',
          categoria: 'ARTIGOS',
          corCategoria: '#D4AF37',
          link: '#',
          cor1: '#D4AF37',
          cor2: '#C9A352'
        },
        {
          id: 5,
          titulo: 'Primeira Edição do Congresso APECOM',
          dia: '25',
          mes: 'set',
          horario: '09h00',
          local: 'Gravatá-PE',
          categoria: 'BRASIL PRESBITERIANO',
          corCategoria: '#3498DB',
          link: '#',
          cor1: '#3498DB',
          cor2: '#5DADE2'
        },
        {
          id: 6,
          titulo: 'UPHs em Ação',
          dia: '22',
          mes: 'set',
          horario: 'Diversos horários',
          local: 'Todo o Brasil',
          categoria: 'NOTÍCIAS',
          corCategoria: '#E74C3C',
          link: '#',
          cor1: '#E74C3C',
          cor2: '#EC7063'
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
