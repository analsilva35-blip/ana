// Data layer and LocalStorage persistence for EstudaFlow

const getDateOffset = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const INITIAL_SUBJECTS = [
  {
    id: 'sub-1',
    name: 'Cálculo Diferencial e Integral',
    color: '#6366f1',
    professor: 'Prof. Ricardo Santos',
    targetHoursPerWeek: 8,
    topics: [
      { id: 'top-101', title: 'Limites Fundamentais e Continuidade', status: 'dominado', notes: 'Revisados limites trigonométricos.' },
      { id: 'top-102', title: 'Derivadas e Regra da Cadeia', status: 'dominado', notes: 'Fórmulas dominadas com sucesso.' },
      { id: 'top-103', title: 'Aplicações de Derivadas (Máximos e Mínimos)', status: 'revisado', notes: 'Fazer mais 5 exercícios da lista 3.' },
      { id: 'top-104', title: 'Integrais Definidas e Teorema Fundamental', status: 'em_andamento', notes: 'Estudando cálculo de áreas.' },
      { id: 'top-105', title: 'Técnicas de Integração por Partes e Substituição', status: 'a_estudar', notes: 'Prioridade alta para a semana.' },
      { id: 'top-106', title: 'Integrais Impróprias e Frações Parciais', status: 'a_estudar', notes: '' },
    ]
  },
  {
    id: 'sub-2',
    name: 'Estrutura de Dados e Algoritmos',
    color: '#8b5cf6',
    professor: 'Profa. Camila Duarte',
    targetHoursPerWeek: 7,
    topics: [
      { id: 'top-201', title: 'Complexidade de Algoritmos (Notação Big-O)', status: 'dominado', notes: 'Pior e caso médio memorizados.' },
      { id: 'top-202', title: 'Listas Encadeadas, Pilhas e Filas', status: 'dominado', notes: 'Implementação em memória concluída.' },
      { id: 'top-203', title: 'Árvores Binárias de Busca (BST) e AVL', status: 'revisado', notes: 'Revisar balanceamento e rotações.' },
      { id: 'top-204', title: 'Grafos: Busca em Largura (BFS) e Profundidade (DFS)', status: 'em_andamento', notes: 'Praticar no LeetCode.' },
      { id: 'top-205', title: 'Algoritmos de Ordenação (Quicksort, Mergesort)', status: 'dominado', notes: 'Estabilidade memorizada.' },
      { id: 'top-206', title: 'Programação Dinâmica e Memoization', status: 'a_estudar', notes: 'Tema avançado para a P2.' },
    ]
  },
  {
    id: 'sub-3',
    name: 'Direito Constitucional',
    color: '#10b981',
    professor: 'Dr. Fernando Lima',
    targetHoursPerWeek: 6,
    topics: [
      { id: 'top-301', title: 'Princípios Fundamentais (Art. 1º ao 4º da CF)', status: 'dominado', notes: 'Fundamentos e objetivos.' },
      { id: 'top-302', title: 'Direitos e Garantias Fundamentais (Art. 5º)', status: 'dominado', notes: 'Remédios constitucionais.' },
      { id: 'top-303', title: 'Direitos Sociais, Nacionalidade e Políticos', status: 'revisado', notes: 'Condições de elegibilidade.' },
      { id: 'top-304', title: 'Organização do Estado e Repartição de Competências', status: 'em_andamento', notes: 'Competências da União.' },
      { id: 'top-305', title: 'Processo Legislativo e Emendas Constitucionais', status: 'a_estudar', notes: 'Quórum de 3/5 em 2 turnos.' },
      { id: 'top-306', title: 'Controle Concentrado de Constitucionalidade (ADI, ADC)', status: 'a_estudar', notes: 'Legitimados do Art. 103.' },
    ]
  },
  {
    id: 'sub-4',
    name: 'Bioquímica e Biologia Molecular',
    color: '#f43f5e',
    professor: 'Dra. Beatriz Moraes',
    targetHoursPerWeek: 5,
    topics: [
      { id: 'top-401', title: 'Estrutura e Propriedades de Aminoácidos e Proteínas', status: 'dominado', notes: 'Ligações peptídicas.' },
      { id: 'top-402', title: 'Cinética Enzimática e Mecanismos de Inibição', status: 'revisado', notes: 'Constante Km e Vmax.' },
      { id: 'top-403', title: 'Glicólise e Ciclo do Ácido Cítrico (Krebs)', status: 'em_andamento', notes: 'Rendimento de ATP e NADH.' },
      { id: 'top-404', title: 'Cadeia de Transporte de Elétrons e Quimiosmose', status: 'a_estudar', notes: 'Gradiente e ATP sintase.' },
      { id: 'top-405', title: 'Metabolismo de Lipídios e Beta-Oxidação', status: 'a_estudar', notes: '' },
    ]
  },
  {
    id: 'sub-5',
    name: 'Inglês Instrumental e Acadêmico',
    color: '#f59e0b',
    professor: 'Prof. Anthony Miller',
    targetHoursPerWeek: 4,
    topics: [
      { id: 'top-501', title: 'Academic Vocabulary List (Sublists 1-3)', status: 'dominado', notes: 'Vocabulário científico.' },
      { id: 'top-502', title: 'Técnicas de Leitura: Skimming e Scanning', status: 'dominado', notes: 'Análise de artigos acadêmicos.' },
      { id: 'top-503', title: 'Conectivos Lógicos e Marcadores de Discurso', status: 'revisado', notes: 'However, furthermore, nonetheless.' },
      { id: 'top-504', title: 'Redação de Abstracts e Estrutura Científica', status: 'em_andamento', notes: 'Prática de resumos.' },
    ]
  }
];

const INITIAL_TASKS = [
  {
    id: 'task-1',
    title: 'Resolver lista de exercícios de Integrais por Partes (Questões 1 a 10)',
    subjectId: 'sub-1',
    dueDate: getDateOffset(0),
    completed: false,
    priority: 'alta'
  },
  {
    id: 'task-2',
    title: 'Implementar algoritmo de Busca em Largura (BFS) em Grafo',
    subjectId: 'sub-2',
    dueDate: getDateOffset(0),
    completed: true,
    priority: 'media'
  },
  {
    id: 'task-3',
    title: 'Fazer mapa mental sobre Competências da União (Art. 22 CF)',
    subjectId: 'sub-3',
    dueDate: getDateOffset(1),
    completed: false,
    priority: 'media'
  },
  {
    id: 'task-4',
    title: 'Revisar flashcards de Cinética Enzimática e Glicólise',
    subjectId: 'sub-4',
    dueDate: getDateOffset(0),
    completed: false,
    priority: 'alta'
  },
  {
    id: 'task-5',
    title: 'Ler artigo de Biologia Celular para o fichamento de Inglês',
    subjectId: 'sub-5',
    dueDate: getDateOffset(2),
    completed: false,
    priority: 'baixa'
  }
];

const INITIAL_DEADLINES = [
  {
    id: 'dl-1',
    title: 'Prova Intermediária P1 — Cálculo Integral',
    subjectId: 'sub-1',
    date: getDateOffset(4),
    type: 'prova',
    weight: 'Peso 40%'
  },
  {
    id: 'dl-2',
    title: 'Entrega do Projeto Prático de Grafos e Árvores',
    subjectId: 'sub-2',
    date: getDateOffset(10),
    type: 'trabalho',
    weight: 'Nota 10'
  },
  {
    id: 'dl-3',
    title: 'Revisão Espaçada R2 — CF/88 Art. 5º',
    subjectId: 'sub-3',
    date: getDateOffset(2),
    type: 'revisao',
    weight: 'Consolidação 7d'
  },
  {
    id: 'dl-4',
    title: 'Seminário de Metabolismo Celular',
    subjectId: 'sub-4',
    date: getDateOffset(15),
    type: 'trabalho',
    weight: 'Apresentação'
  },
  {
    id: 'dl-5',
    title: 'Exame de Proficiência em Leitura Acadêmica',
    subjectId: 'sub-5',
    date: getDateOffset(22),
    type: 'prova',
    weight: 'Certificação'
  }
];

const INITIAL_SCHEDULE_SLOTS = [
  // Segunda (1)
  { id: 'sch-1', dayOfWeek: 1, startTime: '08:00', endTime: '10:00', subjectId: 'sub-1', title: 'Cálculo — Teoria e Exercícios', roomOrLink: 'Sala 204' },
  { id: 'sch-2', dayOfWeek: 1, startTime: '10:30', endTime: '12:00', subjectId: 'sub-3', title: 'Dir. Constitucional — Leitura de Lei Seca', roomOrLink: 'Biblioteca' },
  { id: 'sch-3', dayOfWeek: 1, startTime: '14:30', endTime: '16:30', subjectId: 'sub-2', title: 'Estrutura de Dados — Lab Prático', roomOrLink: 'Lab 03' },

  // Terça (2)
  { id: 'sch-4', dayOfWeek: 2, startTime: '09:00', endTime: '11:00', subjectId: 'sub-4', title: 'Bioquímica — Ciclos Metabólicos', roomOrLink: 'Sala 105' },
  { id: 'sch-5', dayOfWeek: 2, startTime: '14:00', endTime: '15:30', subjectId: 'sub-5', title: 'Inglês Acadêmico — Leitura de Papers', roomOrLink: 'Online' },
  { id: 'sch-6', dayOfWeek: 2, startTime: '16:00', endTime: '18:00', subjectId: 'sub-2', title: 'Resolução de Desafios LeetCode', roomOrLink: 'Home Office' },

  // Quarta (3)
  { id: 'sch-7', dayOfWeek: 3, startTime: '08:00', endTime: '10:00', subjectId: 'sub-1', title: 'Cálculo — Técnicas de Integração', roomOrLink: 'Sala 204' },
  { id: 'sch-8', dayOfWeek: 3, startTime: '10:30', endTime: '12:30', subjectId: 'sub-3', title: 'Controle de Constitucionalidade', roomOrLink: 'Sala 301' },
  { id: 'sch-9', dayOfWeek: 3, startTime: '15:00', endTime: '17:00', subjectId: 'sub-4', title: 'Bioquímica — Revisão Ativa', roomOrLink: 'Biblioteca' },

  // Quinta (4)
  { id: 'sch-10', dayOfWeek: 4, startTime: '09:00', endTime: '11:30', subjectId: 'sub-2', title: 'Grafos e Algoritmos Gulosos', roomOrLink: 'Lab 03' },
  { id: 'sch-11', dayOfWeek: 4, startTime: '14:00', endTime: '16:00', subjectId: 'sub-1', title: 'Monitoria e Plantão de Dúvidas', roomOrLink: 'Sala de Estudos' },

  // Sexta (5)
  { id: 'sch-12', dayOfWeek: 5, startTime: '08:30', endTime: '11:00', subjectId: 'sub-3', title: 'Simulado de Questões Comentadas', roomOrLink: 'Home Office' },
  { id: 'sch-13', dayOfWeek: 5, startTime: '14:00', endTime: '16:30', subjectId: 'sub-4', title: 'Laboratório de Biologia Molecular', roomOrLink: 'Lab Bio' },

  // Sábado (6)
  { id: 'sch-14', dayOfWeek: 6, startTime: '09:00', endTime: '12:00', subjectId: 'sub-1', title: 'Simulado Geral & Revisão Espaçada', roomOrLink: 'Home Office' }
];

const INITIAL_FLASHCARDS = [
  {
    id: 'fc-1',
    subjectId: 'sub-1',
    front: 'O que diz o Teorema Fundamental do Cálculo (Parte 1)?',
    back: 'Se f é contínua em [a, b], a função g(x) = ∫[a, x] f(t)dt é diferenciável e g\'(x) = f(x). Diferenciação e integração são operações inversas!',
    difficulty: 'bom',
    reviewsCount: 4,
    lastReviewed: getDateOffset(-1)
  },
  {
    id: 'fc-2',
    subjectId: 'sub-1',
    front: 'Qual é a fórmula de Integração por Partes?',
    back: '∫ u dv = u · v - ∫ v du\nMnemônico: "Um Dia Vi Uma Vaca Vestida De Uniforme"!',
    difficulty: 'facil',
    reviewsCount: 7,
    lastReviewed: getDateOffset(0)
  },
  {
    id: 'fc-3',
    subjectId: 'sub-2',
    front: 'Qual é a complexidade de tempo de busca em uma Árvore AVL balanceada?',
    back: 'O(log n) no pior caso, pois o balanceamento mantém a altura estritamente controlada com fatores entre -1, 0 e 1.',
    difficulty: 'bom',
    reviewsCount: 5,
    lastReviewed: getDateOffset(-2)
  },
  {
    id: 'fc-4',
    subjectId: 'sub-2',
    front: 'Qual a principal diferença estrutural entre DFS (Profundidade) e BFS (Largura) em Grafos?',
    back: 'DFS usa Pilha (Stack / Recursão) e explora até o fundo de cada ramo. BFS usa Fila (Queue) e explora primeiro os vizinhos do mesmo nível.',
    difficulty: 'facil',
    reviewsCount: 6,
    lastReviewed: getDateOffset(-1)
  },
  {
    id: 'fc-5',
    subjectId: 'sub-3',
    front: 'Quais são as 4 Cláusulas Pétreas expressas no Art. 60, § 4º da CF/88?',
    back: '1. Forma federativa de Estado;\n2. Voto direto, secreto, universal e periódico;\n3. Separação dos Poderes;\n4. Direitos e garantias individuais.',
    difficulty: 'facil',
    reviewsCount: 8,
    lastReviewed: getDateOffset(0)
  },
  {
    id: 'fc-6',
    subjectId: 'sub-3',
    front: 'Qual o quórum para aprovação de uma Emenda Constitucional (PEC)?',
    back: 'Aprovada em 2 turnos de votação em cada Casa do Congresso Nacional por 3/5 dos votos dos respectivos membros.',
    difficulty: 'bom',
    reviewsCount: 3,
    lastReviewed: getDateOffset(-3)
  },
  {
    id: 'fc-7',
    subjectId: 'sub-4',
    front: 'O que indica a constante de Michaelis-Menten (Km) de uma enzima?',
    back: 'Km é a concentração de substrato [S] onde a reação atinge metade da velocidade máxima (1/2 Vmax). Um Km menor indica maior afinidade!',
    difficulty: 'dificil',
    reviewsCount: 2,
    lastReviewed: getDateOffset(-1)
  },
  {
    id: 'fc-8',
    subjectId: 'sub-4',
    front: 'Qual o saldo líquido de ATP gerado na Glicólise?',
    back: 'Saldo líquido de 2 ATP (produz 4, mas consome 2) + 2 NADH + 2 moléculas de piruvato.',
    difficulty: 'bom',
    reviewsCount: 4,
    lastReviewed: getDateOffset(0)
  },
  {
    id: 'fc-9',
    subjectId: 'sub-5',
    front: 'O que significa a palavra "Nonetheless" em artigos científicos?',
    back: 'Significa "Não obstante", "Apesar disso", "Contudo". Indica contraste ou concessão elegante.',
    difficulty: 'facil',
    reviewsCount: 5,
    lastReviewed: getDateOffset(-2)
  }
];

const INITIAL_SESSIONS = [
  { id: 'ses-1', date: getDateOffset(-6), durationMinutes: 180, subjectId: 'sub-1', mode: 'pomodoro', notes: 'Lista de Limites' },
  { id: 'ses-2', date: getDateOffset(-6), durationMinutes: 60, subjectId: 'sub-3', mode: 'livre', notes: 'Leitura CF Art 1 a 4' },

  { id: 'ses-3', date: getDateOffset(-5), durationMinutes: 120, subjectId: 'sub-2', mode: 'pomodoro', notes: 'Listas e Pilhas' },
  { id: 'ses-4', date: getDateOffset(-5), durationMinutes: 90, subjectId: 'sub-4', mode: 'pomodoro', notes: 'Estrutura de Proteínas' },

  { id: 'ses-5', date: getDateOffset(-4), durationMinutes: 150, subjectId: 'sub-1', mode: 'pomodoro', notes: 'Regra da Cadeia' },
  { id: 'ses-6', date: getDateOffset(-4), durationMinutes: 90, subjectId: 'sub-5', mode: 'livre', notes: 'Vocabulary AVL' },

  { id: 'ses-7', date: getDateOffset(-3), durationMinutes: 210, subjectId: 'sub-2', mode: 'pomodoro', notes: 'Árvores AVL e rotações' },
  { id: 'ses-8', date: getDateOffset(-3), durationMinutes: 60, subjectId: 'sub-3', mode: 'pomodoro', notes: 'Direitos Fundamentais Art 5' },

  { id: 'ses-9', date: getDateOffset(-2), durationMinutes: 180, subjectId: 'sub-3', mode: 'pomodoro', notes: 'Nacionalidade e Direitos Políticos' },
  { id: 'ses-10', date: getDateOffset(-2), durationMinutes: 120, subjectId: 'sub-4', mode: 'pomodoro', notes: 'Cinética Enzimática' },

  { id: 'ses-11', date: getDateOffset(-1), durationMinutes: 150, subjectId: 'sub-1', mode: 'pomodoro', notes: 'Aplicações de Derivadas' },
  { id: 'ses-12', date: getDateOffset(-1), durationMinutes: 120, subjectId: 'sub-2', mode: 'pomodoro', notes: 'Grafos BFS e DFS' },

  { id: 'ses-13', date: getDateOffset(0), durationMinutes: 110, subjectId: 'sub-1', mode: 'pomodoro', notes: 'Integrais Definidas' },
  { id: 'ses-14', date: getDateOffset(0), durationMinutes: 45, subjectId: 'sub-4', mode: 'pomodoro', notes: 'Ciclo de Krebs' }
];

const INITIAL_SETTINGS = {
  dailyGoalHours: 4,
  pomodoroWork: 25,
  pomodoroShortBreak: 5,
  pomodoroLongBreak: 15,
  pomodoroLongBreakInterval: 4,
  soundAlerts: true
};

class Store {
  constructor() {
    this.subjects = this.load('ef_subjects', INITIAL_SUBJECTS);
    this.tasks = this.load('ef_tasks', INITIAL_TASKS);
    this.deadlines = this.load('ef_deadlines', INITIAL_DEADLINES);
    this.scheduleSlots = this.load('ef_schedule', INITIAL_SCHEDULE_SLOTS);
    this.flashcards = this.load('ef_flashcards', INITIAL_FLASHCARDS);
    this.sessions = this.load('ef_sessions', INITIAL_SESSIONS);
    this.settings = this.load('ef_settings', INITIAL_SETTINGS);
    this.theme = localStorage.getItem('ef_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }

  load(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }

  setTheme(theme) {
    this.theme = theme;
    localStorage.setItem('ef_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  toggleTheme() {
    const next = this.theme === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
    return next;
  }

  getTodayMinutes() {
    const today = new Date().toISOString().split('T')[0];
    return this.sessions
      .filter(s => s.date === today)
      .reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
  }

  getStreakData() {
    const today = new Date().toISOString().split('T')[0];
    const uniqueDates = [...new Set(this.sessions.map(s => s.date))].sort().reverse();

    if (uniqueDates.length === 0) {
      return { current: 0, studiedToday: false };
    }

    const studiedToday = uniqueDates.includes(today);
    let streak = 0;
    const checkDate = new Date();

    if (!studiedToday) {
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayStr = checkDate.toISOString().split('T')[0];
      if (!uniqueDates.includes(yesterdayStr)) {
        return { current: 0, studiedToday: false };
      }
    }

    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (uniqueDates.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return { current: streak, studiedToday };
  }

  // Subjects
  addSubject(data) {
    const sub = {
      id: 'sub-' + Date.now(),
      name: data.name,
      color: data.color || '#6366f1',
      professor: data.professor || '',
      targetHoursPerWeek: Number(data.targetHoursPerWeek) || 5,
      topics: []
    };
    this.subjects.push(sub);
    this.save('ef_subjects', this.subjects);
    return sub;
  }

  updateSubject(id, data) {
    this.subjects = this.subjects.map(s => s.id === id ? { ...s, ...data } : s);
    this.save('ef_subjects', this.subjects);
  }

  deleteSubject(id) {
    this.subjects = this.subjects.filter(s => s.id !== id);
    this.tasks = this.tasks.filter(t => t.subjectId !== id);
    this.deadlines = this.deadlines.filter(d => d.subjectId !== id);
    this.scheduleSlots = this.scheduleSlots.filter(s => s.subjectId !== id);
    this.flashcards = this.flashcards.filter(f => f.subjectId !== id);
    this.save('ef_subjects', this.subjects);
    this.save('ef_tasks', this.tasks);
    this.save('ef_deadlines', this.deadlines);
    this.save('ef_schedule', this.scheduleSlots);
    this.save('ef_flashcards', this.flashcards);
  }

  addTopic(subjectId, title, notes = '') {
    const sub = this.subjects.find(s => s.id === subjectId);
    if (!sub) return;
    const topic = {
      id: 'top-' + Date.now(),
      title,
      notes,
      status: 'a_estudar'
    };
    sub.topics.push(topic);
    this.save('ef_subjects', this.subjects);
    return topic;
  }

  updateTopicStatus(subjectId, topicId, status) {
    const sub = this.subjects.find(s => s.id === subjectId);
    if (!sub) return;
    const t = sub.topics.find(top => top.id === topicId);
    if (t) {
      t.status = status;
      this.save('ef_subjects', this.subjects);
      if (status === 'dominado' && window.audioService) {
        window.audioService.playSuccess();
      }
    }
  }

  deleteTopic(subjectId, topicId) {
    const sub = this.subjects.find(s => s.id === subjectId);
    if (!sub) return;
    sub.topics = sub.topics.filter(t => t.id !== topicId);
    this.save('ef_subjects', this.subjects);
  }

  // Tasks
  addTask(data) {
    const task = {
      id: 'task-' + Date.now(),
      title: data.title,
      subjectId: data.subjectId || '',
      dueDate: data.dueDate || new Date().toISOString().split('T')[0],
      completed: false,
      priority: data.priority || 'media'
    };
    this.tasks.unshift(task);
    this.save('ef_tasks', this.tasks);
    return task;
  }

  toggleTask(id) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.save('ef_tasks', this.tasks);
      if (task.completed && window.audioService) {
        window.audioService.playSuccess();
      }
    }
  }

  deleteTask(id) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.save('ef_tasks', this.tasks);
  }

  // Deadlines & Spaced Reviews
  addDeadline(data) {
    const dl = {
      id: 'dl-' + Date.now(),
      title: data.title,
      subjectId: data.subjectId,
      date: data.date,
      type: data.type || 'prova',
      weight: data.weight || ''
    };
    this.deadlines.push(dl);
    this.deadlines.sort((a, b) => new Date(a.date) - new Date(b.date));
    this.save('ef_deadlines', this.deadlines);
    return dl;
  }

  deleteDeadline(id) {
    this.deadlines = this.deadlines.filter(d => d.id !== id);
    this.save('ef_deadlines', this.deadlines);
  }

  addSpacedReviews(topicTitle, subjectId) {
    const now = new Date();
    const addDays = (days) => {
      const d = new Date(now);
      d.setDate(d.getDate() + days);
      return d.toISOString().split('T')[0];
    };

    const r1 = {
      id: 'dl-r1-' + Date.now(),
      title: `Revisão 24h (R1): ${topicTitle}`,
      subjectId,
      date: addDays(1),
      type: 'revisao',
      weight: 'Fixação 24h'
    };
    const r2 = {
      id: 'dl-r2-' + Date.now(),
      title: `Revisão 7 dias (R2): ${topicTitle}`,
      subjectId,
      date: addDays(7),
      type: 'revisao',
      weight: 'Consolidação 7d'
    };
    const r3 = {
      id: 'dl-r3-' + Date.now(),
      title: `Revisão 30 dias (R3): ${topicTitle}`,
      subjectId,
      date: addDays(30),
      type: 'revisao',
      weight: 'Longo Prazo 30d'
    };

    this.deadlines.push(r1, r2, r3);
    this.deadlines.sort((a, b) => new Date(a.date) - new Date(b.date));
    this.save('ef_deadlines', this.deadlines);
    if (window.audioService) window.audioService.playSuccess();
  }

  // Schedule Slots
  addScheduleSlot(data) {
    const slot = {
      id: 'sch-' + Date.now(),
      dayOfWeek: Number(data.dayOfWeek),
      startTime: data.startTime,
      endTime: data.endTime,
      subjectId: data.subjectId,
      title: data.title || '',
      roomOrLink: data.roomOrLink || ''
    };
    this.scheduleSlots.push(slot);
    this.save('ef_schedule', this.scheduleSlots);
    return slot;
  }

  deleteScheduleSlot(id) {
    this.scheduleSlots = this.scheduleSlots.filter(s => s.id !== id);
    this.save('ef_schedule', this.scheduleSlots);
  }

  // Flashcards
  addFlashcard(data) {
    const card = {
      id: 'fc-' + Date.now(),
      subjectId: data.subjectId,
      front: data.front,
      back: data.back,
      difficulty: 'novo',
      reviewsCount: 0,
      lastReviewed: null
    };
    this.flashcards.unshift(card);
    this.save('ef_flashcards', this.flashcards);
    return card;
  }

  rateFlashcard(cardId, difficulty) {
    const card = this.flashcards.find(c => c.id === cardId);
    if (card) {
      card.difficulty = difficulty;
      card.reviewsCount = (card.reviewsCount || 0) + 1;
      card.lastReviewed = new Date().toISOString().split('T')[0];
      this.save('ef_flashcards', this.flashcards);
      if ((difficulty === 'facil' || difficulty === 'bom') && window.audioService) {
        window.audioService.playSuccess();
      }
    }
  }

  deleteFlashcard(id) {
    this.flashcards = this.flashcards.filter(c => c.id !== id);
    this.save('ef_flashcards', this.flashcards);
  }

  // Sessions
  logSession(data) {
    const session = {
      id: 'ses-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      durationMinutes: Number(data.durationMinutes) || 25,
      subjectId: data.subjectId,
      mode: data.mode || 'pomodoro',
      notes: data.notes || '',
      completedAt: new Date().toISOString()
    };
    this.sessions.unshift(session);
    this.save('ef_sessions', this.sessions);
    if (window.audioService) window.audioService.playSuccess();
    return session;
  }

  // Settings
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.save('ef_settings', this.settings);
  }

  // Backup
  exportBackup() {
    const dump = {
      subjects: this.subjects,
      tasks: this.tasks,
      deadlines: this.deadlines,
      scheduleSlots: this.scheduleSlots,
      flashcards: this.flashcards,
      sessions: this.sessions,
      settings: this.settings,
      exportedAt: new Date().toISOString(),
      app: 'EstudaFlow'
    };
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estudaflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importBackup(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.subjects) { this.subjects = data.subjects; this.save('ef_subjects', this.subjects); }
      if (data.tasks) { this.tasks = data.tasks; this.save('ef_tasks', this.tasks); }
      if (data.deadlines) { this.deadlines = data.deadlines; this.save('ef_deadlines', this.deadlines); }
      if (data.scheduleSlots) { this.scheduleSlots = data.scheduleSlots; this.save('ef_schedule', this.scheduleSlots); }
      if (data.flashcards) { this.flashcards = data.flashcards; this.save('ef_flashcards', this.flashcards); }
      if (data.sessions) { this.sessions = data.sessions; this.save('ef_sessions', this.sessions); }
      if (data.settings) { this.settings = data.settings; this.save('ef_settings', this.settings); }
      return true;
    } catch (e) {
      return false;
    }
  }

  resetDemo() {
    this.subjects = INITIAL_SUBJECTS;
    this.tasks = INITIAL_TASKS;
    this.deadlines = INITIAL_DEADLINES;
    this.scheduleSlots = INITIAL_SCHEDULE_SLOTS;
    this.flashcards = INITIAL_FLASHCARDS;
    this.sessions = INITIAL_SESSIONS;
    this.settings = INITIAL_SETTINGS;
    this.save('ef_subjects', this.subjects);
    this.save('ef_tasks', this.tasks);
    this.save('ef_deadlines', this.deadlines);
    this.save('ef_schedule', this.scheduleSlots);
    this.save('ef_flashcards', this.flashcards);
    this.save('ef_sessions', this.sessions);
    this.save('ef_settings', this.settings);
  }

  clearAll() {
    this.subjects = [];
    this.tasks = [];
    this.deadlines = [];
    this.scheduleSlots = [];
    this.flashcards = [];
    this.sessions = [];
    this.save('ef_subjects', this.subjects);
    this.save('ef_tasks', this.tasks);
    this.save('ef_deadlines', this.deadlines);
    this.save('ef_schedule', this.scheduleSlots);
    this.save('ef_flashcards', this.flashcards);
    this.save('ef_sessions', this.sessions);
  }
}

window.store = new Store();
