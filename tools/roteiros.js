/* Gera os roteiros de áudio (podcast, videoaula, resumo) a partir de js/data.js.
   Uso: node tools/roteiros.js > tools/roteiros.json */
'use strict';
const fs = require('fs');
const path = require('path');

global.window = {};
['empresarial.js', 'oab46.js', 'data.js'].forEach(f => eval(fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8')));
const D = global.window.ATEMPO_DATA;

const HOST = 'pt-BR-AntonioNeural';      // Rafael, apresentador
const PROF = 'pt-BR-FranciscaNeural';    // Prof.ª Helena Martins

/* texto escrito -> texto falado */
function fala(s) {
  return s
    .replace(/\barts\.\s/g, 'artigos ')
    .replace(/\bart\.\s/g, 'artigo ')
    .replace(/§\s*/g, 'parágrafo ')
    .replace(/(\d[\d.]*)\/(\d{4})/g, '$1, de $2')
    .replace(/\bn[º°]\s*/g, 'número ')
    .replace(/R\$\s*([\d.,]+)( milhões| mil)?/g, (m, n, u) => n + (u || '') + (u === ' milhões' ? ' de reais' : ' reais'))
    .replace(/\bLC\b/g, 'Lei Complementar')
    .replace(/\bEPP\b/g, 'E P P')
    .replace(/\bME\b/g, 'M E')
    .replace(/\bp\. ú\./g, 'parágrafo único')
    .replace(/\bCPC\b/g, 'Código de Processo Civil')
    .replace(/\bCC\b/g, 'Código Civil')
    .replace(/\bCP\b/g, 'Código Penal')
    .replace(/\bCF\b/g, 'Constituição Federal')
    .replace(/\bEIRELI\b/g, 'Eireli')
    .replace(/[“”"]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
function lista(li) {
  if (li.length === 1) return li[0];
  return li.slice(0, -1).join('; ') + '; e ' + li[li.length - 1];
}
function secaoFalada(s) {
  let t = s.p ? s.p : '';
  if (s.li) t += (t ? ' ' : '') + 'Os pontos principais são: ' + lista(s.li) + '.';
  if (s.ex) t += ' Um exemplo prático: ' + s.ex;
  return t;
}
const perguntas = [
  h => `Helena, vamos começar pelo começo: ${h.toLowerCase()}. Como você explica?`,
  h => `E o que a gente precisa saber sobre ${h.toLowerCase()}?`,
  h => `Agora me conta sobre ${h.toLowerCase()}.`,
  h => `Interessante. E quanto a ${h.toLowerCase()}?`,
  h => `Isso cai muito em prova, né? E sobre ${h.toLowerCase()}?`,
  h => `Vamos avançar: ${h.toLowerCase()}. O que é importante?`
];

const out = {};
D.disciplinas.forEach(d => {
  d.topicos.forEach(t => {
    const c = D.content(d, t);

    /* ---------- podcast (diálogo) ---------- */
    const pod = [];
    pod.push({ ch: 'Abertura', v: HOST, text: `Olá! Eu sou o Rafael e este é o ATEMPO Podcast: Direito, no seu tempo. No episódio de hoje, o tema é ${t.nome}, dentro de ${d.nome}. E pra conversar comigo, está aqui a professora Helena Martins. Tudo bem, Helena?` });
    pod.push({ ch: 'Abertura', v: PROF, text: `Tudo ótimo, Rafael! Obrigada pelo convite. ${t.nome} é um tema muito importante, e aparece bastante nas provas. Então, vamos lá!` });
    c.pages.forEach((pg, i) => {
      const h = pg[0].h;
      pod.push({ ch: h, v: HOST, text: pg[0].q || perguntas[i % perguntas.length](h) });
      pod.push({ ch: h, v: PROF, text: pg.map(secaoFalada).join(' ') });
    });
    pod.push({ ch: 'Encerramento', v: HOST, text: 'Helena, pra fechar: qual é o resumo de tudo isso?' });
    pod.push({ ch: 'Encerramento', v: PROF, text: c.resumo.join(' ') + ' Revise com calma e resolva as questões, que o conteúdo fixa!' });
    pod.push({ ch: 'Encerramento', v: HOST, text: `Perfeito! Esse foi o ATEMPO Podcast sobre ${t.nome}. Obrigado pela companhia, e até o próximo episódio!` });

    /* ---------- videoaula (narração por slide) ---------- */
    const vid = [];
    vid.push({ h: t.nome, pts: [t.desc], v: PROF, text: `Olá! Eu sou a professora Helena Martins, e nesta videoaula vamos estudar ${t.nome}, um tema de ${d.nome}. ${t.desc}` });
    c.pages.forEach(pg => {
      const pts = [];
      if (pg[0].pts) pg[0].pts.forEach(x => pts.push(x)); else pg.forEach(s => { if (s.li) s.li.forEach(x => pts.push(x)); else pts.push(s.p); });
      vid.push({ h: pg[0].h, pts: pts.slice(0, 4), v: PROF, text: pg.map(s => s.h + '. ' + secaoFalada(s)).join(' ') });
    });
    vid.push({ h: 'Resumo da aula', pts: c.resumo, v: PROF, text: 'Para revisar: ' + c.resumo.join(' ') + ' Bons estudos, e até a próxima aula!' });

    /* ---------- resumo falado ---------- */
    const res = [{ v: PROF, text: `Resumo de ${t.nome}. ` + c.resumo.join(' ') }];

    const fix = arr => arr.map(s => Object.assign({}, s, { text: fala(s.text) }));
    out[d.id + '/' + t.id] = { podcast: fix(pod), video: fix(vid), resumo: fix(res) };
  });
});
process.stdout.write(JSON.stringify(out, null, 1));
