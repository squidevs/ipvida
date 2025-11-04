// ============================================
// API-INTEGRACAO.JS - Integrações Externas
// ============================================

// YouTube Data API
const YOUTUBE_API_KEY = 'SUA_API_KEY_AQUI';
const CANAL_ID = 'UC-XXXXXXXXX'; // @ipbvida

// Buscar vídeos do canal
async function buscarVideosYouTube(maxResults = 6) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CANAL_ID}&part=snippet,id&order=date&maxResults=${maxResults}&type=video`
    );
    
    if (!response.ok) {
      throw new Error('Erro na API do YouTube');
    }
    
    const data = await response.json();
    
    return data.items.map(item => ({
      id: item.id.videoId,
      titulo: item.snippet.title,
      descricao: item.snippet.description.substring(0, 100) + '...',
      thumbnail: item.snippet.thumbnails.medium.url,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      dataPublicacao: item.snippet.publishedAt
    }));
  } catch (erro) {
    console.error('Erro ao buscar vídeos:', erro);
    return [];
  }
}

// Verificar se há transmissão ao vivo
async function verificarLiveYouTube() {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CANAL_ID}&part=snippet&eventType=live&type=video`
    );
    
    if (!response.ok) {
      throw new Error('Erro ao verificar live');
    }
    
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const live = data.items[0];
      return {
        aoVivo: true,
        videoId: live.id.videoId,
        titulo: live.snippet.title,
        thumbnail: live.snippet.thumbnails.medium.url,
        url: `https://www.youtube.com/watch?v=${live.id.videoId}`
      };
    }
    
    return { aoVivo: false };
  } catch (erro) {
    console.error('Erro ao verificar live:', erro);
    return { aoVivo: false };
  }
}

// Buscar notícias da IPB (via RSS ou scraping)
async function buscarNoticiasIPB() {
  try {
    // Como não há API oficial, vamos usar dados estruturados
    // Você pode substituir por um serviço de RSS-to-JSON ou backend próprio
    const response = await fetch('https://ipb.org.br/feed/rss');
    
    // Por enquanto, retornar dados mockados estruturados
    return [
      {
        id: 1,
        titulo: 'Sínodo da Igreja Presbiteriana do Brasil realiza encontro anual',
        descricao: 'Líderes presbiterianos de todo o país se reúnem para discutir o futuro da denominação.',
        dataPublicacao: '2025-11-01',
        categoria: 'Institucional',
        link: 'https://ipb.org.br/noticia/sinodo-2025',
        imagem: 'assets/images/noticia-ipb-1.jpg'
      },
      {
        id: 2,
        titulo: 'Missões IPB anuncia novo campo missionário na África',
        descricao: 'Igreja envia missionários para iniciar trabalho de evangelização e plantação de igrejas.',
        dataPublicacao: '2025-10-28',
        categoria: 'Missões',
        link: 'https://ipb.org.br/noticia/missoes-africa',
        imagem: 'assets/images/noticia-ipb-2.jpg'
      },
      {
        id: 3,
        titulo: 'Seminário Teológico IPB abre inscrições para 2026',
        descricao: 'Instituição oferece cursos de graduação e pós-graduação em teologia reformada.',
        dataPublicacao: '2025-10-25',
        categoria: 'Educação',
        link: 'https://ipb.org.br/noticia/seminario-2026',
        imagem: 'assets/images/noticia-ipb-3.jpg'
      },
      {
        id: 4,
        titulo: 'Campanha de arrecadação para construção de templos',
        descricao: 'IPB lança campanha nacional para auxiliar congregações na construção de novos templos.',
        dataPublicacao: '2025-10-20',
        categoria: 'Projetos',
        link: 'https://ipb.org.br/noticia/campanha-templos',
        imagem: 'assets/images/noticia-ipb-4.jpg'
      }
    ];
  } catch (erro) {
    console.error('Erro ao buscar notícias IPB:', erro);
    return [];
  }
}

// Bíblia Online API
async function buscarVersiculoAleatorio() {
  try {
    const response = await fetch('https://www.abibliadigital.com.br/api/verses/nvi/random');
    const data = await response.json();
    
    return {
      texto: data.text,
      referencia: `${data.book.name} ${data.chapter}:${data.number}`,
      livro: data.book.name,
      capitulo: data.chapter,
      versiculo: data.number
    };
  } catch (erro) {
    console.error('Erro ao buscar versículo:', erro);
    return null;
  }
}

async function buscarSalmoAleatorio() {
  try {
    // Salmos tem 150 capítulos
    const numeroSalmo = Math.floor(Math.random() * 150) + 1;
    const response = await fetch(`https://www.abibliadigital.com.br/api/verses/nvi/sl/${numeroSalmo}`);
    const data = await response.json();
    
    if (data.verses && data.verses.length > 0) {
      const versiculoAleatorio = data.verses[Math.floor(Math.random() * data.verses.length)];
      return {
        texto: versiculoAleatorio.text,
        referencia: `Salmos ${numeroSalmo}:${versiculoAleatorio.number}`,
        livro: 'Salmos',
        capitulo: numeroSalmo,
        versiculo: versiculoAleatorio.number
      };
    }
  } catch (erro) {
    console.error('Erro ao buscar salmo:', erro);
    return null;
  }
}

async function buscarProverbioAleatorio() {
  try {
    // Provérbios tem 31 capítulos
    const numeroCapitulo = Math.floor(Math.random() * 31) + 1;
    const response = await fetch(`https://www.abibliadigital.com.br/api/verses/nvi/pv/${numeroCapitulo}`);
    const data = await response.json();
    
    if (data.verses && data.verses.length > 0) {
      const versiculoAleatorio = data.verses[Math.floor(Math.random() * data.verses.length)];
      return {
        texto: versiculoAleatorio.text,
        referencia: `Provérbios ${numeroCapitulo}:${versiculoAleatorio.number}`,
        livro: 'Provérbios',
        capitulo: numeroCapitulo,
        versiculo: versiculoAleatorio.number
      };
    }
  } catch (erro) {
    console.error('Erro ao buscar provérbio:', erro);
    return null;
  }
}

// Supabase (configurar quando tiver credenciais)
const SUPABASE_URL = 'https://seu-projeto.supabase.co';
const SUPABASE_ANON_KEY = 'sua-chave-anonima';

// EmailJS (configurar quando tiver credenciais)
const EMAILJS_SERVICE_ID = 'seu_service_id';
const EMAILJS_TEMPLATE_ID = 'seu_template_id';
const EMAILJS_USER_ID = 'seu_user_id';

async function enviarEmail(dados) {
  try {
    // Integrar com EmailJS quando configurado
    console.log('Enviando email:', dados);
    return { sucesso: true };
  } catch (erro) {
    console.error('Erro ao enviar email:', erro);
    return { sucesso: false, erro: erro.message };
  }
}
