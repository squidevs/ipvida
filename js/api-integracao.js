// ============================================
// API-INTEGRACAO.JS - Integrações Externas
// ============================================

// YouTube Data API
const YOUTUBE_API_KEY = 'SUA_API_KEY_AQUI';
const CANAL_ID = 'UC-XXXXXXXXX'; // @ipbvida

async function buscarVideosYouTube() {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CANAL_ID}&part=snippet,id&order=date&maxResults=6&type=video`
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
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));
  } catch (erro) {
    console.error('Erro ao buscar vídeos:', erro);
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
