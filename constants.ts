import { Agency, Seller } from './types';

export const AGENCIES: Agency[] = [
  { id: 'ag1', name: 'Agência Centro' },
  { id: 'ag2', name: 'Agência Rodoviária' },
  { id: 'ag3', name: 'Agência Norte' },
  { id: 'ag4', name: 'Agência Sul' },
  { id: 'ag5', name: 'Agência Aeroporto' },
];

export const SELLERS: Seller[] = [
  // Agência Centro
  { id: 's1', name: 'Carlos Silva', agencyId: 'ag1' },
  { id: 's2', name: 'Ana Paula', agencyId: 'ag1' },
  { id: 's3', name: 'Roberto Gomes', agencyId: 'ag1' },
  { id: 's4', name: 'Fernanda Lima', agencyId: 'ag1' },
  { id: 's5', name: 'João Pedro', agencyId: 'ag1' },
  // Agência Rodoviária
  { id: 's6', name: 'Mariana Costa', agencyId: 'ag2' },
  { id: 's7', name: 'Pedro Henrique', agencyId: 'ag2' },
  { id: 's8', name: 'Lucas Oliveira', agencyId: 'ag2' },
  { id: 's9', name: 'Juliana Santos', agencyId: 'ag2' },
  { id: 's10', name: 'Ricardo Alves', agencyId: 'ag2' },
  // Agência Norte
  { id: 's11', name: 'Patrícia Souza', agencyId: 'ag3' },
  { id: 's12', name: 'Marcos Paulo', agencyId: 'ag3' },
  { id: 's13', name: 'Bruna Ferreira', agencyId: 'ag3' },
  { id: 's14', name: 'Gustavo Rocha', agencyId: 'ag3' },
  { id: 's15', name: 'Camila Dias', agencyId: 'ag3' },
  // Agência Sul
  { id: 's16', name: 'Felipe Martins', agencyId: 'ag4' },
  { id: 's17', name: 'Vanessa Lopes', agencyId: 'ag4' },
  { id: 's18', name: 'Thiago Moreira', agencyId: 'ag4' },
  { id: 's19', name: 'Amanda Nunes', agencyId: 'ag4' },
  { id: 's20', name: 'Bruno Cardoso', agencyId: 'ag4' },
  // Agência Aeroporto
  { id: 's21', name: 'Renata Freitas', agencyId: 'ag5' },
  { id: 's22', name: 'Daniel Barbosa', agencyId: 'ag5' },
  { id: 's23', name: 'Elaine Ramos', agencyId: 'ag5' },
  { id: 's24', name: 'Vitor Hugo', agencyId: 'ag5' },
  { id: 's25', name: 'Larissa Castro', agencyId: 'ag5' },
];

export const BUS_COMPANIES = [
  'Guanabara',
  'Real Expresso',
  'Rápido Federal',
  'Go Pass',
  'Progresso',
  'Fabitur',
  'Rode Rotas',
  'Real Maia',
  'RealTur',
  'Matriz',
  'Cargas',
];

export const ADMIN_USERS = [
  { id: 'admin1', name: 'Vânia Vieira', password: '12345' },
  { id: 'admin2', name: 'Paolo BR', password: 'paolo' },
];

export const INITIAL_PASSWORD = '12345';