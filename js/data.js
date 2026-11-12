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
        ['Teoria da Empresa', 'Estuda os principais conceitos e características da teoria da empresa, incluindo sua classificação e elementos.'],
        ['Empresário', 'Analisa quem é considerado empresário, os requisitos para o exercício da empresa e os impedimentos legais.'],
        ['Estabelecimento Empresarial', 'Estuda o complexo de bens organizado para o exercício da empresa, o trespasse e o aviamento.'],
        ['Registro Empresarial', 'Aborda o Registro Público de Empresas Mercantis, as Juntas Comerciais e os atos de registro.'],
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
    d.topicos = d.topicos.map(function (t) { return { id: slug(t[0]), nome: t[0], desc: t[1] }; });
    return d;
  });

  var formatos = [
    { id: 'pdf', nome: 'PDF', icon: 'pdf', l1: 'Resumos objetivos', l2: 'e completos', desc: 'Resumos objetivos e completos.', dur: '12 min', tipo: 'PDF' },
    { id: 'podcast', nome: 'Podcast', icon: 'headphones', l1: 'Aprenda ouvindo', l2: 'onde estiver', desc: 'Aprenda ouvindo onde estiver.', dur: '15 min', tipo: 'Áudio' },
    { id: 'mapa', nome: 'Mapa Mental', nomeLp: 'Mapa mental', icon: 'mindmap', l1: 'Visualize conceitos', l2: 'e relações', desc: 'Visualize conceitos e relações.', dur: '8 min', tipo: 'Mapa' },
    { id: 'video', nome: 'Videoaula', icon: 'video', iconFmt: 'playCircle', l1: 'Assista às explicações', l2: 'dos especialistas', desc: 'Assista às explicações dos especialistas.', dur: '18 min', tipo: 'Vídeo' }
  ];

  /* Conteúdo específico do tópico em destaque */
  var especifico = {
    'empresarial/teoria-da-empresa': {
      resumo: [
        'A empresa é uma atividade organizada, que visa à produção ou circulação de bens e serviços.',
        'É caracterizada pela organização dos fatores de produção, pela finalidade econômica e pela assunção de riscos.',
        'Pode ser classificada em individual ou societária, conforme sua titularidade.'
      ],
      pages: [
        [
          { h: 'Conceito', p: 'A teoria da empresa estuda o conceito, a natureza jurídica e os elementos que caracterizam a empresa, bem como sua classificação e os efeitos jurídicos decorrentes de sua existência.' },
          { h: 'Elementos da empresa', li: ['Organização', 'Finalidade econômica', 'Atividade contínua', 'Assunção de riscos'] }
        ],
        [
          { h: 'Evolução histórica', p: 'O direito comercial brasileiro adotava a teoria dos atos de comércio, de inspiração francesa, prevista no Código Comercial de 1850. Com o Código Civil de 2002, o Brasil passou a adotar a teoria da empresa, de origem italiana (Código Civil italiano de 1942).' },
          { h: 'Mudança de foco', p: 'O critério deixa de ser o tipo de ato praticado e passa a ser a forma como a atividade econômica é exercida: de modo profissional e organizado.' }
        ],
        [
          { h: 'Conceito legal de empresário', p: 'Nos termos do art. 966 do Código Civil, considera-se empresário quem exerce profissionalmente atividade econômica organizada para a produção ou a circulação de bens ou de serviços.' },
          { h: 'Elementos do conceito', li: ['Profissionalismo (habitualidade)', 'Atividade econômica (fim lucrativo)', 'Organização dos fatores de produção', 'Produção ou circulação de bens ou serviços'] }
        ],
        [
          { h: 'Atividades não empresariais', p: 'Pelo parágrafo único do art. 966, não se considera empresário quem exerce profissão intelectual, de natureza científica, literária ou artística, ainda com o concurso de auxiliares ou colaboradores, salvo se o exercício da profissão constituir elemento de empresa.' },
          { h: 'Elemento de empresa', p: 'Ocorre quando a atividade intelectual se dilui em uma estrutura organizada maior, tornando-se apenas um dos fatores da atividade empresarial.' }
        ],
        [
          { h: 'Empresário rural', p: 'O exercente de atividade rural pode, facultativamente, requerer inscrição no Registro Público de Empresas Mercantis (art. 971 do CC). Feita a inscrição, fica equiparado, para todos os efeitos, ao empresário sujeito a registro.' }
        ],
        [
          { h: 'Classificação quanto à titularidade', li: ['Empresário individual: pessoa física que exerce a empresa em nome próprio', 'Sociedade empresária: pessoa jurídica constituída para o exercício da empresa', 'Sociedade limitada unipessoal: constituída por uma única pessoa (Lei 13.874/2019)'] },
          { h: 'Observação', p: 'A EIRELI deixou de existir com a Lei 14.195/2021, sendo transformada em sociedade limitada unipessoal.' }
        ],
        [
          { h: 'Capacidade e impedimentos', p: 'Podem exercer a atividade de empresário os que estiverem em pleno gozo da capacidade civil e não forem legalmente impedidos (art. 972 do CC).' },
          { h: 'Registro obrigatório', p: 'É obrigatória a inscrição do empresário no Registro Público de Empresas Mercantis da respectiva sede, antes do início de sua atividade (art. 967 do CC).' }
        ],
        [
          { h: 'Síntese', li: ['A empresa é atividade, e não sujeito de direito', 'Empresário é quem exerce a empresa', 'Estabelecimento é o conjunto de bens utilizado para exercê-la', 'Profissões intelectuais, em regra, não são empresariais'] },
          { h: 'Para revisar', p: 'Releia o art. 966 do Código Civil e resolva as questões da aba "Questões" para fixar o conteúdo.' }
        ]
      ],
      refs: [
        'Código Civil — Lei 10.406/2002, arts. 966 a 980',
        'Lei 8.934/1994 — Registro Público de Empresas Mercantis',
        'Lei 13.874/2019 — Declaração de Direitos de Liberdade Econômica',
        'Lei 14.195/2021 — Extinção da EIRELI',
        'COELHO, Fábio Ulhoa. Curso de Direito Comercial, v. 1',
        'TOMAZETTE, Marlon. Curso de Direito Empresarial, v. 1'
      ],
      questoes: [
        {
          q: 'De acordo com o art. 966 do Código Civil, considera-se empresário quem:',
          opts: ['Pratica habitualmente atos de comércio', 'Exerce profissionalmente atividade econômica organizada para a produção ou a circulação de bens ou de serviços', 'Possui registro em conselho profissional', 'Exerce qualquer atividade com fins lucrativos'],
          a: 1, exp: 'É a literalidade do art. 966 do CC, que adotou a teoria da empresa.'
        },
        {
          q: 'Quem exerce profissão intelectual, de natureza científica, literária ou artística:',
          opts: ['É sempre considerado empresário', 'Nunca pode ser empresário', 'Não é considerado empresário, salvo se o exercício da profissão constituir elemento de empresa', 'É empresário apenas se tiver empregados'],
          a: 2, exp: 'Parágrafo único do art. 966 do CC.'
        },
        {
          q: 'A inscrição do empresário no Registro Público de Empresas Mercantis deve ocorrer:',
          opts: ['Antes do início de sua atividade', 'Em até 2 anos após o início da atividade', 'Apenas se houver faturamento', 'Somente para sociedades anônimas'],
          a: 0, exp: 'Art. 967 do CC: a inscrição é obrigatória antes do início da atividade.'
        }
      ],
      mapa: {
        centro: 'Teoria da Empresa',
        ramos: [
          { n: 'Conceito', d: 'Atividade econômica organizada para a produção ou circulação de bens ou serviços (art. 966 do CC).', c: ['Art. 966 CC', 'Atividade'] },
          { n: 'Elementos', d: 'Organização, finalidade econômica, atividade contínua e assunção de riscos.', c: ['Organização', 'Finalidade econômica', 'Continuidade', 'Riscos'] },
          { n: 'Titularidade', d: 'A empresa pode ser exercida por empresário individual ou por sociedade empresária.', c: ['Individual', 'Societária'] },
          { n: 'Exceções', d: 'Profissões intelectuais não são empresariais, salvo se constituírem elemento de empresa. O rural pode optar pelo registro.', c: ['Intelectuais', 'Rural (art. 971)'] },
          { n: 'Registro', d: 'Inscrição obrigatória no Registro Público de Empresas Mercantis antes do início da atividade (art. 967).', c: ['Junta Comercial', 'Art. 967 CC'] }
        ]
      }
    }
  };

  /* Questões gerais (simulados) */
  var banco = [
    { q: 'São Poderes da União, independentes e harmônicos entre si:', opts: ['Legislativo, Executivo e Judiciário', 'Executivo, Judiciário e Ministério Público', 'Legislativo, Executivo e Tribunal de Contas', 'Judiciário, Legislativo e Defensoria Pública'], a: 0, exp: 'Art. 2º da Constituição Federal.' },
    { q: 'Segundo o art. 1º do Código Penal:', opts: ['Não há crime sem lei anterior que o defina, nem pena sem prévia cominação legal', 'A lei penal sempre retroage', 'O costume pode criar crimes', 'Medidas provisórias podem criar crimes'], a: 0, exp: 'Princípios da legalidade e da anterioridade (art. 1º do CP e art. 5º, XXXIX, da CF).' },
    { q: 'A menoridade civil cessa aos:', opts: ['16 anos completos', '18 anos completos', '21 anos completos', '17 anos completos'], a: 1, exp: 'Art. 5º do Código Civil.' },
    { q: 'A duração do trabalho normal, conforme a Constituição, não pode ser superior a:', opts: ['6 horas diárias e 36 semanais', '8 horas diárias e 40 semanais', '8 horas diárias e 44 semanais', '10 horas diárias e 48 semanais'], a: 2, exp: 'Art. 7º, XIII, da Constituição Federal.' },
    { q: 'No CPC/2015, o prazo geral para interpor recursos (exceto embargos de declaração) é de:', opts: ['5 dias úteis', '10 dias corridos', '15 dias úteis', '30 dias corridos'], a: 2, exp: 'Art. 1.003, § 5º, do CPC.' }
  ];

  var simulados = [
    { id: 'oab-geral', nome: 'Simulado Geral — OAB 1ª fase', desc: 'Questões de várias disciplinas para treinar.', min: 15, qs: banco.concat(especifico['empresarial/teoria-da-empresa'].questoes) },
    { id: 'empresarial', nome: 'Direito Empresarial — Teoria da Empresa', desc: 'Fixe os conceitos do art. 966 do Código Civil.', min: 6, qs: especifico['empresarial/teoria-da-empresa'].questoes },
    { id: 'fundamentos', nome: 'Fundamentos — Constitucional, Penal e Civil', desc: 'Base essencial para começar bem.', min: 6, qs: banco.slice(0, 3) }
  ];

  window.ATEMPO_DATA = {
    slug: slug,
    disciplinas: disciplinas,
    formatos: formatos,
    especifico: especifico,
    simulados: simulados
  };
})();
