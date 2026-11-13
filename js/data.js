/* ATEMPO — dados mockados da demonstração */
(function () {
  'use strict';

  function slug(s) {
    return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  var disciplinas = [
    {
      id: 'constitucional', nome: 'Direito Constitucional', l1: 'Direito', l2: 'Constitucional',
      abrev: 'Dir. Constitucional', icon: 'landmark', progresso: 72, lei: 'Constituição Federal de 1988',
      topicos: [
        ['Teoria da Constituição', 'Estuda o conceito, a classificação e os elementos das constituições, além do poder constituinte e da aplicabilidade das normas constitucionais.'],
        ['Direitos Fundamentais', 'Analisa os direitos e garantias fundamentais, suas gerações, características e mecanismos de proteção previstos na Constituição.'],
        ['Organização do Estado', 'Aborda a forma federativa, a repartição de competências entre União, Estados, Distrito Federal e Municípios e a intervenção.'],
        ['Organização dos Poderes', 'Examina a separação dos Poderes Legislativo, Executivo e Judiciário, suas funções típicas, atípicas e prerrogativas.'],
        ['Controle de Constitucionalidade', 'Estuda os modelos difuso e concentrado de controle, as ações constitucionais e os efeitos das decisões.']
      ]
    },
    {
      id: 'civil', nome: 'Direito Civil', l1: 'Direito', l2: 'Civil',
      abrev: 'Dir. Civil', icon: 'scale', progresso: 64, lei: 'Código Civil (Lei 10.406/2002)',
      topicos: [
        ['Lei de Introdução (LINDB)', 'Estuda a vigência, a aplicação, a interpretação e a integração das normas jurídicas no tempo e no espaço.'],
        ['Pessoas Naturais e Jurídicas', 'Aborda personalidade, capacidade, direitos da personalidade e a constituição das pessoas jurídicas.'],
        ['Negócio Jurídico', 'Analisa os planos de existência, validade e eficácia, os defeitos e as hipóteses de invalidade do negócio jurídico.'],
        ['Obrigações', 'Estuda as modalidades, a transmissão, o adimplemento e o inadimplemento das obrigações.'],
        ['Contratos', 'Examina a teoria geral dos contratos, seus princípios, formação, extinção e as principais espécies contratuais.']
      ]
    },
    {
      id: 'penal', nome: 'Direito Penal', l1: 'Direito', l2: 'Penal',
      abrev: 'Dir. Penal', icon: 'shield', progresso: 58, lei: 'Código Penal (Decreto-Lei 2.848/1940)',
      topicos: [
        ['Princípios do Direito Penal', 'Estuda a legalidade, a anterioridade, a intervenção mínima, a culpabilidade e demais princípios limitadores.'],
        ['Teoria do Crime', 'Analisa o conceito analítico de crime: fato típico, ilicitude e culpabilidade, com seus elementos.'],
        ['Culpabilidade', 'Aborda imputabilidade, potencial consciência da ilicitude e exigibilidade de conduta diversa.'],
        ['Concurso de Pessoas', 'Estuda autoria, coautoria e participação, bem como os requisitos do concurso de agentes.'],
        ['Teoria da Pena', 'Examina as espécies de pena, suas finalidades e o sistema trifásico de dosimetria.']
      ]
    },
    {
      id: 'empresarial', nome: 'Direito Empresarial', l1: 'Direito', l2: 'Empresarial',
      abrev: 'Dir. Empresarial', icon: 'briefcase', progresso: 45, lei: 'Código Civil, arts. 966 a 1.195',
      topicos: [
        ['Teoria da Empresa', 'Parte 01 · Evolução histórica, Teoria da Empresa, empresa x empresário x estabelecimento, fontes e o art. 966 do Código Civil.'],
        ['Empresário e Exercício da Empresa', 'Parte 02 · Empresário individual, capacidade, incapaz, impedimentos, responsabilidade, empresário rural, cooperativas e registro.', 'empresario'],
        ['Organização e Obrigações Empresariais', 'Parte 03 · Escrituração, livros empresariais, balanços, ME, EPP, MEI e nome empresarial.', 'organizacao-empresarial'],
        ['Estabelecimento Empresarial', 'Estuda o complexo de bens organizado para o exercício da empresa, o trespasse e o aviamento.'],
        ['Sociedade Empresária', 'Examina a constituição, os tipos societários e a responsabilidade dos sócios nas sociedades empresárias.']
      ]
    },
    {
      id: 'trabalho', nome: 'Direito do Trabalho', l1: 'Direito', l2: 'do Trabalho',
      abrev: 'Dir. do Trabalho', icon: 'worker', progresso: 80, lei: 'CLT (Decreto-Lei 5.452/1943)',
      topicos: [
        ['Princípios do Direito do Trabalho', 'Estuda a proteção, a primazia da realidade, a continuidade e a irrenunciabilidade de direitos.'],
        ['Relação de Emprego', 'Analisa os requisitos da relação de emprego: pessoalidade, onerosidade, não eventualidade e subordinação.'],
        ['Contrato de Trabalho', 'Aborda as modalidades, a alteração, a suspensão, a interrupção e a extinção do contrato de trabalho.'],
        ['Jornada de Trabalho', 'Estuda os limites da jornada, as horas extras, os intervalos e o trabalho noturno.'],
        ['Remuneração e Salário', 'Examina a distinção entre salário e remuneração, as parcelas salariais e a proteção ao salário.']
      ]
    },
    {
      id: 'processo-civil', nome: 'Processo Civil', l1: 'Processo', l2: 'Civil',
      abrev: 'Proc. Civil', icon: 'filetext', progresso: 35, lei: 'Código de Processo Civil (Lei 13.105/2015)',
      topicos: [
        ['Normas Fundamentais', 'Estuda as normas fundamentais do processo civil, como contraditório, cooperação e duração razoável do processo.'],
        ['Jurisdição e Competência', 'Analisa as características da jurisdição e os critérios de fixação e modificação da competência.'],
        ['Sujeitos do Processo', 'Aborda partes, procuradores, litisconsórcio, intervenção de terceiros e o papel do juiz.'],
        ['Procedimento Comum', 'Examina as fases do procedimento comum, da petição inicial à sentença.'],
        ['Recursos', 'Estuda a teoria geral dos recursos, seus pressupostos de admissibilidade e as espécies recursais.']
      ]
    }
  ].map(function (d) {
    d.topicos = d.topicos.map(function (t) { return { id: t[2] || slug(t[0]), nome: t[0], desc: t[1] }; });
    return d;
  });

  var formatos = [
    { id: 'pdf', nome: 'PDF', icon: 'pdf', l1: 'Resumos objetivos', l2: 'e completos', desc: 'Resumos objetivos e completos.', dur: '12 min', tipo: 'PDF' },
    { id: 'podcast', nome: 'Podcast', icon: 'headphones', l1: 'Aprenda ouvindo', l2: 'onde estiver', desc: 'Aprenda ouvindo onde estiver.', dur: '15 min', tipo: 'Áudio' },
    { id: 'mapa', nome: 'Mapa Mental', nomeLp: 'Mapa mental', icon: 'mindmap', l1: 'Visualize conceitos', l2: 'e relações', desc: 'Visualize conceitos e relações.', dur: '8 min', tipo: 'Mapa' },
    { id: 'video', nome: 'Videoaula', icon: 'video', iconFmt: 'playCircle', l1: 'Assista às explicações', l2: 'dos especialistas', desc: 'Assista às explicações dos especialistas.', dur: '18 min', tipo: 'Vídeo' }
  ];

  /* Conteúdo real das apostilas (js/empresarial.js) */
  var especifico = window.ATEMPO_CONTEUDO || {};

  /* Simulados: 46º Exame de Ordem (js/oab46.js) + questões das apostilas */
  var OAB = window.ATEMPO_OAB46 || { areas: [], questoes: [] };
  var areaNome = {};
  OAB.areas.forEach(function (a) { areaNome[a.id] = a.nome; });
  var oabQs = OAB.questoes.map(function (x) {
    return {
      n: x.n, area: x.area, areaNome: areaNome[x.area], p: x.p, q: x.p[x.p.length - 1], opts: x.opts, a: x.a,
      exp: 'Gabarito definitivo da FGV: alternativa ' + 'ABCD'[x.a] + '.' + (x.n === 69 ? ' (A FGV retificou esta questão; o gabarito preliminar indicava A.)' : '')
    };
  });
  function apostila(k, rotulo) {
    return ((especifico[k] || {}).questoes || []).filter(function (q) { return !/^OAB/.test(q.q); })
      .map(function (q) { return Object.assign({ areaNome: rotulo }, q); });
  }
  var simulados = [
    { id: 'oab46', destaque: true, nome: '46º Exame de Ordem — Prova completa', desc: 'As 80 questões da 1ª fase (03/05/2026 · Tipo 1 – Branca), com o gabarito definitivo da FGV. Aprovação com 40 acertos.', min: 300, qs: oabQs },
    { id: 'empresarial', nome: 'Direito Empresarial — Partes 01 a 03', desc: 'Questões das três apostilas ATEMPO e as 4 de Empresarial do 46º Exame.', min: 30,
      qs: apostila('empresarial/teoria-da-empresa', 'Parte 01 · Teoria da Empresa')
        .concat(apostila('empresarial/empresario', 'Parte 02 · Empresário'))
        .concat(apostila('empresarial/organizacao-empresarial', 'Parte 03 · Organização'))
        .concat(oabQs.filter(function (q) { return q.area === 'empresarial'; })) }
  ];
  OAB.areas.forEach(function (a) {
    var qs = oabQs.filter(function (q) { return q.area === a.id; });
    simulados.push({ id: 'oab46-' + a.id, area: true, nome: a.nome, desc: '46º Exame · questões ' + a.de + ' a ' + a.ate + '.', min: Math.max(5, qs.length * 4), qs: qs });
  });

  /* conteúdo de um tópico (específico ou gerado a partir dos dados) */
  function content(d, t) {
    var sp = especifico[d.id + '/' + t.id];
    if (sp) return sp;
    var nome = t.nome, area = d.nome;
    var outras = disciplinas.filter(function (x) { return x.id !== d.id; }).slice(0, 3).map(function (x) { return x.lei; });
    return {
      resumo: [
        t.desc,
        nome + ' tem como base normativa principal: ' + d.lei + '.',
        'Dominar ' + nome.toLowerCase() + ' exige unir texto legal, doutrina e jurisprudência dos tribunais superiores.'
      ],
      pages: [
        [{ h: 'Conceito', p: t.desc }, { h: 'Pontos-chave', li: ['Conceito e natureza jurídica', 'Características principais', 'Fundamento legal', 'Aplicação prática'] }],
        [{ h: 'Fundamento legal', p: 'O tema é disciplinado principalmente por: ' + d.lei + '. A leitura atenta dos dispositivos é o primeiro passo para compreender o assunto.' }],
        [{ h: 'Características', p: 'O estudo de ' + nome.toLowerCase() + ' envolve a identificação de seus elementos essenciais e das relações com outros institutos de ' + area + '.' }],
        [{ h: 'Visão da doutrina', p: 'A doutrina sistematiza os conceitos, organiza classificações e aponta divergências relevantes para a interpretação do tema.' }],
        [{ h: 'Jurisprudência', p: 'Os entendimentos do STF e do STJ orientam a aplicação prática do tema e são frequentemente cobrados em provas.' }],
        [{ h: 'Aplicação prática', p: 'Em casos concretos, identifique os fatos relevantes, enquadre-os nas normas aplicáveis e verifique as consequências jurídicas.' }],
        [{ h: 'Pontos de atenção', li: ['Leia a literalidade da lei', 'Observe exceções e prazos', 'Relacione com súmulas e precedentes'] }],
        [{ h: 'Síntese', p: 'Revise o resumo ao lado e resolva as questões para fixar o conteúdo de ' + nome + '.' }]
      ],
      refs: [d.lei, 'Constituição Federal de 1988', 'Jurisprudência do STF e do STJ', 'Doutrina de referência em ' + area],
      questoes: [{ q: 'Qual é a principal base normativa para o estudo de "' + nome + '"?', opts: [d.lei].concat(outras), a: 0, exp: 'O tema é disciplinado principalmente por: ' + d.lei + '.' }],
      mapa: {
        centro: nome,
        ramos: [
          { n: 'Conceito', d: t.desc, c: ['Definição', 'Natureza'] },
          { n: 'Fundamento', d: 'Base normativa: ' + d.lei + '.', c: ['Lei', 'Princípios'] },
          { n: 'Características', d: 'Elementos essenciais que identificam o instituto.', c: ['Elementos', 'Requisitos'] },
          { n: 'Jurisprudência', d: 'Entendimentos consolidados nos tribunais superiores.', c: ['STF', 'STJ'] },
          { n: 'Prática', d: 'Aplicação do tema em casos concretos e em provas.', c: ['Casos', 'Provas'] }
        ]
      }
    };
  }

  window.ATEMPO_DATA = {
    slug: slug,
    content: content,
    disciplinas: disciplinas,
    formatos: formatos,
    especifico: especifico,
    simulados: simulados,
    oabAreas: OAB.areas
  };
})();
