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
