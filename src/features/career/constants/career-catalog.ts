import type {
  CareerCompany,
  CareerDream,
  CareerInterview,
  CareerJobOffer,
  CareerRole,
} from '@/types/career';
import { CareerCompanyKey, CareerRoleKey } from '@/types/career';

export const CAREER_ROLES: CareerRole[] = [
  { key: CareerRoleKey.STUDENT, name: 'Student', description: 'Aprendendo inglês para abrir portas globais.', requiredLevel: 1, icon: '🎓' },
  { key: CareerRoleKey.JUNIOR_DEVELOPER, name: 'Junior Developer', description: 'Primeiros passos no mercado de tecnologia.', requiredLevel: 5, icon: '💻' },
  { key: CareerRoleKey.REMOTE_DEVELOPER, name: 'Remote Developer', description: 'Trabalhando de qualquer lugar do mundo.', requiredLevel: 12, icon: '🌍' },
  { key: CareerRoleKey.SENIOR_DEVELOPER, name: 'Senior Developer', description: 'Impacto técnico reconhecido internacionalmente.', requiredLevel: 20, icon: '⭐' },
  { key: CareerRoleKey.INTERNATIONAL_DEVELOPER, name: 'International Developer', description: 'Colaborando com times globais.', requiredLevel: 30, icon: '🌐' },
  { key: CareerRoleKey.GLOBAL_ENGINEER, name: 'Global Engineer', description: 'Referência técnica em escala mundial.', requiredLevel: 45, icon: '🛰️' },
  { key: CareerRoleKey.TECH_LEAD, name: 'Tech Lead', description: 'Liderando equipes e decisões estratégicas.', requiredLevel: 60, icon: '🎯' },
  { key: CareerRoleKey.CTO, name: 'CTO', description: 'Visão executiva e excelência de longo prazo.', requiredLevel: 80, icon: '👑' },
];

export const CAREER_COMPANIES: CareerCompany[] = [
  { key: CareerCompanyKey.STARTUP_LOCAL, name: 'Startup Local', description: 'Seu primeiro emprego na tech.', icon: '🏠', requiredLevel: 1 },
  { key: CareerCompanyKey.STARTUP_NATIONAL, name: 'Startup Nacional', description: 'Empresa em expansão pelo país.', icon: '🏢', requiredLevel: 15, requiredStreak: 7 },
  { key: CareerCompanyKey.INTERNATIONAL_COMPANY, name: 'Empresa Internacional', description: 'Operação global, times distribuídos.', icon: '✈️', requiredLevel: 30, requiredRoleKey: CareerRoleKey.INTERNATIONAL_DEVELOPER },
  { key: CareerCompanyKey.BIG_TECH, name: 'Big Tech', description: 'As maiores empresas de tecnologia do mundo.', icon: '🦄', requiredLevel: 50, requiredAchievements: 10 },
];

export const CAREER_INTERVIEWS: CareerInterview[] = [
  { key: 'behavioral', name: 'Behavioral Interview', description: 'Comunicação e fit cultural.', icon: '💬', requiredLevel: 10, targetCareerMissions: 5, rewardCoins: 100, rewardXp: 50 },
  { key: 'technical', name: 'Technical Interview', description: 'Desafios técnicos em inglês.', icon: '⚙️', requiredLevel: 20, targetCareerMissions: 10, rewardCoins: 200, rewardXp: 100 },
  { key: 'english', name: 'English Interview', description: 'Fluência e clareza na conversação.', icon: '🗣️', requiredLevel: 25, targetCareerMissions: 15, rewardCoins: 300, rewardXp: 150 },
  { key: 'leadership', name: 'Leadership Interview', description: 'Liderança e visão estratégica.', icon: '🎤', requiredLevel: 55, targetCareerMissions: 20, rewardCoins: 500, rewardXp: 250 },
];

export const CAREER_JOB_OFFERS: CareerJobOffer[] = [
  { key: 'remote_junior', name: 'Remote Junior Offer', companyKey: CareerCompanyKey.STARTUP_NATIONAL, description: 'Primeira oferta remota.', icon: '📩', requiredLevel: 12, salaryLabel: '$2k/mo' },
  { key: 'international_mid', name: 'International Mid Offer', companyKey: CareerCompanyKey.INTERNATIONAL_COMPANY, description: 'Salário em dólar, time global.', icon: '💼', requiredLevel: 30, requiredEnglishScore: 50, salaryLabel: '$5k/mo' },
  { key: 'big_tech_senior', name: 'Big Tech Senior Offer', companyKey: CareerCompanyKey.BIG_TECH, description: 'Pacote completo em Big Tech.', icon: '🏆', requiredLevel: 50, requiredAchievements: 15, salaryLabel: '$10k/mo' },
  { key: 'tech_lead_offer', name: 'Tech Lead Offer', companyKey: CareerCompanyKey.BIG_TECH, description: 'Liderança em empresa tier-1.', icon: '🚀', requiredLevel: 65, requiredEnglishScore: 100, salaryLabel: '$15k/mo' },
];

export const CAREER_DREAMS: CareerDream[] = [
  { key: 'work_remote', name: 'Trabalhar remoto', description: 'Construa consistência para viver de anywhere.', icon: '🏡', target: 30, metric: 'streak' },
  { key: 'earn_dollars', name: 'Ganhar em dólar', description: 'Acumule moedas como metáfora de renda internacional.', icon: '💵', target: 5000, metric: 'coins' },
  { key: 'move_abroad', name: 'Mudar para outro país', description: 'Expanda sua cidade internacional.', icon: '🌎', target: 50, metric: 'city_percent' },
  { key: 'join_big_tech', name: 'Entrar em Big Tech', description: 'Alcance o nível e prestígio necessários.', icon: '🦄', target: 50, metric: 'level' },
];

export const ROLES_BY_KEY = Object.fromEntries(CAREER_ROLES.map((role) => [role.key, role]));
export const COMPANIES_BY_KEY = Object.fromEntries(CAREER_COMPANIES.map((company) => [company.key, company]));
