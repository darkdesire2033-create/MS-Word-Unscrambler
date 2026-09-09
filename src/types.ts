export type LanguageCode =
  | 'en'
  | 'hi'
  | 'kn'
  | 'ta'
  | 'te'
  | 'ml'
  | 'mr'
  | 'bn'
  | 'gu';

export interface Station {
  code: string;
  name: string;
  state: string;
  city: string;
  index: number;
  localName?: Record<LanguageCode, string>;
}

export type TrainType = 'PASSENGER' | 'MAIL_EXP' | 'SUPERFAST';

export interface TrainSchedule {
  id: string;
  number: string;
  name: string;
  type: TrainType;
  depTime: string;
  arrTime: string;
  duration: string;
  distanceKm: number;
  farePerPax: number;
}

export interface StoredTicket {
  id: string; // SAMPLE + 9 digits
  pnr: string;
  fromCode: string;
  fromName: string;
  toCode: string;
  toName: string;
  trainName: string;
  trainNumber: string;
  trainType: TrainType;
  depTime: string;
  arrTime: string;
  date: string;
  passengers: number;
  totalFare: number;
  issued: string; // ISO string
  hmac: string; // btoa(pnr + issued).slice(0, 16)
  expiresAt: number; // timestamp (2 hrs)
  ticketType: 'JOURNEY' | 'PLATFORM';
}
