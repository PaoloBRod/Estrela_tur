export interface Seller {
  id: string;
  name: string;
  agencyId: string;
}

export interface Agency {
  id: string;
  name: string;
}

export interface SaleRecord {
  id: string;
  date: string; // ISO Date string
  timestamp: string; // HH:mm
  sellerName: string;
  agencyName: string;
  busCompany: string;
  valueCard: number;
  valueCash: number;
  valueMachine: number;
  total: number;
}

export enum PaymentType {
  CARD = 'Cartão',
  CASH_PIX = 'Dinheiro/PIX',
  MACHINE = 'Maquininha Estrela',
  TOTAL = 'Total'
}

export type AccessType = 'SALES' | 'CLOSING';

export interface ClosingEntry {
  companyName: string;
  agencyId: string;
  docNumber: string;
  docValue: number;
}

export interface ClosingReportItem {
  companyName: string;
  closingDate: string;
  docNumber: string; // Can be multiple joined
  docValue: number;
  systemTotal: number; // Cash + Machine
  difference: number;
  status: 'OK' | 'CX +' | 'CX -';
}