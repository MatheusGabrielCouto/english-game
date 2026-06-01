/**
 * Vocabulário e frases para entrevistas internacionais em tecnologia.
 * Foco em comunicação profissional — sem sintaxe de linguagens específicas.
 */
export type InterviewSeedEntry = {
  front: string;
  back: string;
  tags: string[];
  example?: string;
};

export const INTERVIEW_TECH_ENTRIES: InterviewSeedEntry[] = [
  // Abertura e rapport
  {
    front: 'Nice to meet you',
    back: 'Prazer em conhecê-lo(a)',
    tags: ['interview', 'opening'],
    example: 'Nice to meet you — thank you for having me today.',
  },
  {
    front: 'Thank you for your time',
    back: 'Obrigado(a) pelo seu tempo',
    tags: ['interview', 'opening'],
  },
  {
    front: 'Thanks for the opportunity',
    back: 'Obrigado(a) pela oportunidade',
    tags: ['interview', 'opening'],
  },
  {
    front: 'I appreciate the invitation',
    back: 'Agradeço o convite',
    tags: ['interview', 'opening'],
  },
  {
    front: 'How are you doing today?',
    back: 'Como você está hoje?',
    tags: ['interview', 'small-talk'],
  },
  {
    front: 'Shall we get started?',
    back: 'Podemos começar?',
    tags: ['interview', 'opening'],
  },

  // Perguntas clássicas
  {
    front: 'Tell me about yourself',
    back: 'Fale sobre você / Apresente-se',
    tags: ['interview', 'classic'],
    example: 'I usually keep this answer under two minutes.',
  },
  {
    front: 'Walk me through your resume',
    back: 'Percorra seu currículo comigo',
    tags: ['interview', 'classic'],
  },
  {
    front: 'Why do you want to work here?',
    back: 'Por que você quer trabalhar aqui?',
    tags: ['interview', 'classic'],
  },
  {
    front: 'Why are you leaving your current role?',
    back: 'Por que você está saindo do emprego atual?',
    tags: ['interview', 'classic'],
  },
  {
    front: 'Why should we hire you?',
    back: 'Por que devemos contratá-lo(a)?',
    tags: ['interview', 'classic'],
  },
  {
    front: 'What are your strengths?',
    back: 'Quais são seus pontos fortes?',
    tags: ['interview', 'classic'],
  },
  {
    front: 'What is your greatest weakness?',
    back: 'Qual é sua maior fraqueza?',
    tags: ['interview', 'classic'],
  },
  {
    front: 'Where do you see yourself in five years?',
    back: 'Onde você se vê em cinco anos?',
    tags: ['interview', 'classic'],
  },
  {
    front: 'What motivates you at work?',
    back: 'O que te motiva no trabalho?',
    tags: ['interview', 'classic'],
  },
  {
    front: 'What are you looking for in your next role?',
    back: 'O que você busca no próximo emprego?',
    tags: ['interview', 'classic'],
  },

  // STAR / comportamental
  {
    front: 'Tell me about a time you showed leadership',
    back: 'Conte uma vez em que você demonstrou liderança',
    tags: ['interview', 'behavioral', 'star'],
  },
  {
    front: 'Describe a situation when you failed',
    back: 'Descreva uma situação em que você falhou',
    tags: ['interview', 'behavioral', 'star'],
  },
  {
    front: 'Tell me about a conflict with a colleague',
    back: 'Conte um conflito com um colega',
    tags: ['interview', 'behavioral', 'star'],
  },
  {
    front: 'Give an example of working under pressure',
    back: 'Dê um exemplo de trabalho sob pressão',
    tags: ['interview', 'behavioral', 'star'],
  },
  {
    front: 'Tell me about your biggest achievement',
    back: 'Conte sua maior conquista',
    tags: ['interview', 'behavioral', 'star'],
  },
  {
    front: 'Describe a time you had to learn something quickly',
    back: 'Descreva quando precisou aprender algo rápido',
    tags: ['interview', 'behavioral', 'star'],
  },
  {
    front: 'Tell me about a difficult decision you made',
    back: 'Conte uma decisão difícil que você tomou',
    tags: ['interview', 'behavioral', 'star'],
  },
  {
    front: 'How do you handle constructive criticism?',
    back: 'Como você lida com críticas construtivas?',
    tags: ['interview', 'behavioral'],
  },
  {
    front: 'Tell me about a time you disagreed with your manager',
    back: 'Conte quando discordou do seu gestor',
    tags: ['interview', 'behavioral', 'star'],
  },

  // Frases para estruturar respostas (STAR leve)
  {
    front: 'In my previous role I was responsible for',
    back: 'No meu emprego anterior eu era responsável por',
    tags: ['interview', 'phrase', 'star'],
    example: 'In my previous role I was responsible for the checkout team.',
  },
  {
    front: 'The situation was',
    back: 'A situação era',
    tags: ['interview', 'phrase', 'star'],
  },
  {
    front: 'My task was to',
    back: 'Minha tarefa era',
    tags: ['interview', 'phrase', 'star'],
  },
  {
    front: 'I took ownership of',
    back: 'Eu assumi a responsabilidade por',
    tags: ['interview', 'phrase'],
  },
  {
    front: 'I collaborated closely with',
    back: 'Eu colaborei de perto com',
    tags: ['interview', 'phrase'],
  },
  {
    front: 'The main challenge was',
    back: 'O principal desafio foi',
    tags: ['interview', 'phrase'],
  },
  {
    front: 'The result was',
    back: 'O resultado foi',
    tags: ['interview', 'phrase', 'star'],
  },
  {
    front: 'We measured success by',
    back: 'Medimos o sucesso por',
    tags: ['interview', 'phrase'],
  },
  {
    front: 'I learned that',
    back: 'Eu aprendi que',
    tags: ['interview', 'phrase'],
  },
  {
    front: 'Looking back, I would',
    back: 'Olhando para trás, eu',
    tags: ['interview', 'phrase'],
  },
  {
    front: 'If I faced that again, I would',
    back: 'Se enfrentasse isso de novo, eu',
    tags: ['interview', 'phrase'],
  },

  // Trabalho em equipe e comunicação
  {
    front: 'stakeholder',
    back: 'parte interessada / stakeholder',
    tags: ['interview', 'vocab', 'work'],
  },
  {
    front: 'cross-functional',
    back: 'multifuncional / entre áreas',
    tags: ['interview', 'vocab', 'work'],
  },
  {
    front: 'handoff',
    back: 'repasse de responsabilidade',
    tags: ['interview', 'vocab', 'work'],
    example: 'We need a clear handoff to the support team.',
  },
  {
    front: 'follow-up',
    back: 'acompanhamento / retorno',
    tags: ['interview', 'vocab', 'work'],
  },
  {
    front: 'alignment',
    back: 'alinhamento',
    tags: ['interview', 'vocab', 'work'],
  },
  {
    front: 'buy-in',
    back: 'adesão / apoio do time',
    tags: ['interview', 'vocab', 'work'],
  },
  {
    front: 'consensus',
    back: 'consenso',
    tags: ['interview', 'vocab', 'work'],
  },
  {
    front: 'I prefer written summaries after meetings',
    back: 'Prefiro resumos escritos após reuniões',
    tags: ['interview', 'phrase', 'remote'],
  },
  {
    front: 'I keep stakeholders informed',
    back: 'Mantenho as partes interessadas informadas',
    tags: ['interview', 'phrase'],
  },
  {
    front: 'I communicate proactively',
    back: 'Eu comunico de forma proativa',
    tags: ['interview', 'phrase'],
  },
  {
    front: 'I escalate blockers early',
    back: 'Eu escalo impedimentos cedo',
    tags: ['interview', 'phrase'],
  },
  {
    front: 'I give clear status updates',
    back: 'Dou atualizações de status claras',
    tags: ['interview', 'phrase'],
  },

  // Priorização e entrega
  {
    front: 'How do you prioritize your work?',
    back: 'Como você prioriza seu trabalho?',
    tags: ['interview', 'classic'],
  },
  {
    front: 'How do you handle tight deadlines?',
    back: 'Como lida com prazos apertados?',
    tags: ['interview', 'classic'],
  },
  {
    front: 'deadline',
    back: 'prazo',
    tags: ['interview', 'vocab', 'work'],
  },
  {
    front: 'milestone',
    back: 'marco / entrega parcial',
    tags: ['interview', 'vocab', 'work'],
  },
  {
    front: 'deliverable',
    back: 'entregável',
    tags: ['interview', 'vocab', 'work'],
  },
  {
    front: 'scope',
    back: 'escopo',
    tags: ['interview', 'vocab', 'work'],
    example: 'We need to reduce the scope for this release.',
  },
  {
    front: 'trade-off',
    back: 'compromisso / troca',
    tags: ['interview', 'vocab', 'work'],
  },
  {
    front: 'I break work into smaller tasks',
    back: 'Eu divido o trabalho em tarefas menores',
    tags: ['interview', 'phrase'],
  },
  {
    front: 'I focus on impact first',
    back: 'Priorizo impacto primeiro',
    tags: ['interview', 'phrase'],
  },
  {
    front: 'I negotiate priorities when needed',
    back: 'Negocio prioridades quando necessário',
    tags: ['interview', 'phrase'],
  },
  {
    front: 'blocker',
    back: 'impedimento / bloqueio',
    tags: ['interview', 'vocab', 'work'],
  },
  {
    front: 'backlog',
    back: 'lista pendente / backlog',
    tags: ['interview', 'vocab', 'work'],
  },

  // Cultura e fit
  {
    front: 'culture fit',
    back: 'adequação à cultura',
    tags: ['interview', 'vocab', 'culture'],
  },
  {
    front: 'What type of work environment do you prefer?',
    back: 'Que tipo de ambiente de trabalho você prefere?',
    tags: ['interview', 'culture'],
  },
  {
    front: 'How do you like to receive feedback?',
    back: 'Como você prefere receber feedback?',
    tags: ['interview', 'culture'],
  },
  {
    front: 'I thrive in collaborative teams',
    back: 'Eu me dou bem em times colaborativos',
    tags: ['interview', 'phrase'],
  },
  {
    front: 'I am comfortable with ambiguity',
    back: 'Estou confortável com ambiguidade',
    tags: ['interview', 'phrase'],
  },
  {
    front: 'I value psychological safety',
    back: 'Valorizo segurança psicológica',
    tags: ['interview', 'phrase'],
  },
  {
    front: 'I adapt well to change',
    back: 'Eu me adapto bem a mudanças',
    tags: ['interview', 'phrase'],
  },
  {
    front: 'I am a self-starter',
    back: 'Sou proativo(a) / autônomo(a)',
    tags: ['interview', 'phrase'],
  },
  {
    front: 'I am detail-oriented',
    back: 'Sou detalhista',
    tags: ['interview', 'phrase'],
  },
  {
    front: 'I stay calm under pressure',
    back: 'Permaneço calmo(a) sob pressão',
    tags: ['interview', 'phrase'],
  },

  // Remoto e global
  {
    front: 'I have experience working remotely',
    back: 'Tenho experiência trabalhando remoto',
    tags: ['interview', 'remote'],
  },
  {
    front: 'I am comfortable with async communication',
    back: 'Estou confortável com comunicação assíncrona',
    tags: ['interview', 'remote'],
  },
  {
    front: 'time zone',
    back: 'fuso horário',
    tags: ['interview', 'vocab', 'remote'],
  },
  {
    front: 'overlap hours',
    back: 'horas em comum (fusos)',
    tags: ['interview', 'vocab', 'remote'],
  },
  {
    front: 'I overlap four hours with the team',
    back: 'Tenho quatro horas de sobreposição com o time',
    tags: ['interview', 'phrase', 'remote'],
  },
  {
    front: 'I am fluent in professional English',
    back: 'Sou fluente em inglês profissional',
    tags: ['interview', 'phrase'],
  },
  {
    front: 'I am open to relocation',
    back: 'Estou aberto(a) a realocação',
    tags: ['interview', 'phrase'],
  },
  {
    front: 'I have a valid work permit',
    back: 'Tenho autorização de trabalho válida',
    tags: ['interview', 'phrase'],
  },

  // Papel e senioridade
  {
    front: 'What would you do in your first 90 days?',
    back: 'O que faria nos primeiros 90 dias?',
    tags: ['interview', 'role'],
  },
  {
    front: 'How do you mentor others?',
    back: 'Como você orienta outras pessoas?',
    tags: ['interview', 'role'],
  },
  {
    front: 'ownership',
    back: 'senso de dono / ownership',
    tags: ['interview', 'vocab', 'role'],
  },
  {
    front: 'accountability',
    back: 'responsabilização',
    tags: ['interview', 'vocab', 'role'],
  },
  {
    front: 'I take end-to-end responsibility',
    back: 'Assumo responsabilidade de ponta a ponta',
    tags: ['interview', 'phrase'],
  },
  {
    front: 'I mentor junior team members',
    back: 'Oriento membros júnior do time',
    tags: ['interview', 'phrase'],
  },
  {
    front: 'I align with company goals',
    back: 'Alinho com os objetivos da empresa',
    tags: ['interview', 'phrase'],
  },
  {
    front: 'impact',
    back: 'impacto',
    tags: ['interview', 'vocab', 'role'],
  },
  {
    front: 'outcome',
    back: 'resultado / desfecho',
    tags: ['interview', 'vocab', 'role'],
  },
  {
    front: 'initiative',
    back: 'iniciativa',
    tags: ['interview', 'vocab', 'role'],
  },

  // Salário e negociação (suave)
  {
    front: 'What are your salary expectations?',
    back: 'Quais são suas expectativas salariais?',
    tags: ['interview', 'salary'],
  },
  {
    front: 'I am open to discussing compensation',
    back: 'Estou aberto(a) a discutir remuneração',
    tags: ['interview', 'phrase', 'salary'],
  },
  {
    front: 'compensation package',
    back: 'pacote de remuneração',
    tags: ['interview', 'vocab', 'salary'],
  },
  {
    front: 'benefits',
    back: 'benefícios',
    tags: ['interview', 'vocab', 'salary'],
  },
  {
    front: 'equity',
    back: 'participação / equity',
    tags: ['interview', 'vocab', 'salary'],
  },
  {
    front: 'notice period',
    back: 'período de aviso prévio',
    tags: ['interview', 'vocab', 'salary'],
  },
  {
    front: 'Compensation is important but not my only factor',
    back: 'Salário importa, mas não é meu único fator',
    tags: ['interview', 'phrase', 'salary'],
  },

  // Perguntas para o entrevistador
  {
    front: 'Do you have any questions for us?',
    back: 'Você tem alguma pergunta para nós?',
    tags: ['interview', 'closing'],
  },
  {
    front: 'What does success look like in this role?',
    back: 'Como é o sucesso nesta função?',
    tags: ['interview', 'questions'],
  },
  {
    front: 'How does the team collaborate day to day?',
    back: 'Como o time colabora no dia a dia?',
    tags: ['interview', 'questions'],
  },
  {
    front: 'What are the next steps in the process?',
    back: 'Quais são os próximos passos do processo?',
    tags: ['interview', 'questions'],
  },
  {
    front: 'What does onboarding look like?',
    back: 'Como é o onboarding?',
    tags: ['interview', 'questions'],
  },
  {
    front: 'How is performance measured?',
    back: 'Como o desempenho é medido?',
    tags: ['interview', 'questions'],
  },
  {
    front: 'What challenges is the team facing right now?',
    back: 'Quais desafios o time enfrenta agora?',
    tags: ['interview', 'questions'],
  },

  // Durante a entrevista — comprar tempo / clarificar
  {
    front: 'That is a great question',
    back: 'Essa é uma ótima pergunta',
    tags: ['interview', 'phrase', 'live'],
  },
  {
    front: 'Let me think about that for a moment',
    back: 'Deixe-me pensar um momento',
    tags: ['interview', 'phrase', 'live'],
  },
  {
    front: 'Could you repeat the question, please?',
    back: 'Poderia repetir a pergunta, por favor?',
    tags: ['interview', 'phrase', 'live'],
  },
  {
    front: 'Just to make sure I understood',
    back: 'Só para confirmar que entendi',
    tags: ['interview', 'phrase', 'live'],
  },
  {
    front: 'To give you some context',
    back: 'Para dar um pouco de contexto',
    tags: ['interview', 'phrase', 'live'],
  },
  {
    front: 'I would approach it by',
    back: 'Eu abordaria isso assim',
    tags: ['interview', 'phrase', 'live'],
  },
  {
    front: 'I do not have direct experience with that yet',
    back: 'Ainda não tenho experiência direta com isso',
    tags: ['interview', 'phrase', 'live'],
  },
  {
    front: 'I am a quick learner',
    back: 'Aprendo rápido',
    tags: ['interview', 'phrase', 'live'],
  },
  {
    front: 'I would be happy to follow up by email',
    back: 'Fico feliz em dar seguimento por e-mail',
    tags: ['interview', 'phrase', 'live'],
  },

  // Encerramento
  {
    front: 'I am very interested in this position',
    back: 'Tenho muito interesse nesta vaga',
    tags: ['interview', 'closing'],
  },
  {
    front: 'I look forward to hearing from you',
    back: 'Fico no aguardo do seu retorno',
    tags: ['interview', 'closing'],
  },
  {
    front: 'It was a pleasure speaking with you',
    back: 'Foi um prazer conversar com você',
    tags: ['interview', 'closing'],
  },
  {
    front: 'Have a great rest of your day',
    back: 'Tenha um ótimo restante de dia',
    tags: ['interview', 'closing'],
  },

  // Vocabulário extra útil em tech (não é linguagem de programação)
  {
    front: 'recruiter',
    back: 'recrutador(a)',
    tags: ['interview', 'vocab', 'process'],
  },
  {
    front: 'hiring manager',
    back: 'gestor(a) contratante',
    tags: ['interview', 'vocab', 'process'],
  },
  {
    front: 'panel interview',
    back: 'entrevista em painel',
    tags: ['interview', 'vocab', 'process'],
  },
  {
    front: 'take-home assignment',
    back: 'desafio para fazer em casa',
    tags: ['interview', 'vocab', 'process'],
  },
  {
    front: 'reference check',
    back: 'checagem de referências',
    tags: ['interview', 'vocab', 'process'],
  },
  {
    front: 'offer letter',
    back: 'carta de oferta',
    tags: ['interview', 'vocab', 'process'],
  },
  {
    front: 'probation period',
    back: 'período de experiência',
    tags: ['interview', 'vocab', 'process'],
  },
  {
    front: 'performance review',
    back: 'avaliação de desempenho',
    tags: ['interview', 'vocab', 'work'],
  },
  {
    front: 'career growth',
    back: 'crescimento de carreira',
    tags: ['interview', 'vocab', 'work'],
  },
  {
    front: 'learning curve',
    back: 'curva de aprendizado',
    tags: ['interview', 'vocab', 'work'],
  },
  {
    front: 'onboarding',
    back: 'integração / onboarding',
    tags: ['interview', 'vocab', 'work'],
  },
  {
    front: 'feedback loop',
    back: 'ciclo de feedback',
    tags: ['interview', 'vocab', 'work'],
  },
  {
    front: 'reliable',
    back: 'confiável',
    tags: ['interview', 'vocab', 'soft-skills'],
  },
  {
    front: 'proactive',
    back: 'proativo(a)',
    tags: ['interview', 'vocab', 'soft-skills'],
  },
  {
    front: 'collaborative',
    back: 'colaborativo(a)',
    tags: ['interview', 'vocab', 'soft-skills'],
  },
  {
    front: 'I am excited about this opportunity because',
    back: 'Estou animado(a) com esta oportunidade porque',
    tags: ['interview', 'phrase', 'closing'],
    example: 'I am excited about this opportunity because of the product mission.',
  },
];
