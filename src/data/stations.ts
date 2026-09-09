import { Station, TrainSchedule, TrainType } from '../types';

export const STATIONS: Station[] = [
  { code: 'SBC', name: 'KSR Bengaluru', city: 'Bengaluru', state: 'Karnataka', index: 0 },
  { code: 'MYS', name: 'Mysuru Jn', city: 'Mysuru', state: 'Karnataka', index: 1 },
  { code: 'MAS', name: 'Chennai Central', city: 'Chennai', state: 'Tamil Nadu', index: 2 },
  { code: 'NDLS', name: 'New Delhi', city: 'New Delhi', state: 'Delhi', index: 3 },
  { code: 'CSTM', name: 'Mumbai CSMT', city: 'Mumbai', state: 'Maharashtra', index: 4 },
  { code: 'HWH', name: 'Howrah Jn', city: 'Kolkata', state: 'West Bengal', index: 5 },
  { code: 'PUNE', name: 'Pune Jn', city: 'Pune', state: 'Maharashtra', index: 6 },
  { code: 'HYB', name: 'Hyderabad', city: 'Hyderabad', state: 'Telangana', index: 7 },
  { code: 'AGC', name: 'Agra Cantt', city: 'Agra', state: 'Uttar Pradesh', index: 8 },
  { code: 'JP', name: 'Jaipur Jn', city: 'Jaipur', state: 'Rajasthan', index: 9 },
  { code: 'LKO', name: 'Lucknow NR', city: 'Lucknow', state: 'Uttar Pradesh', index: 10 },
  { code: 'BPL', name: 'Bhopal Jn', city: 'Bhopal', state: 'Madhya Pradesh', index: 11 },
  { code: 'NGP', name: 'Nagpur Jn', city: 'Nagpur', state: 'Maharashtra', index: 12 },
  { code: 'MAQ', name: 'Mangaluru Central', city: 'Mangaluru', state: 'Karnataka', index: 13 },
  { code: 'UBL', name: 'Hubballi Jn', city: 'Hubballi', state: 'Karnataka', index: 14 },
  { code: 'YPR', name: 'Yesvantpur Jn', city: 'Bengaluru', state: 'Karnataka', index: 15 },
  { code: 'KJM', name: 'Krishnarajapuram', city: 'Bengaluru', state: 'Karnataka', index: 16 },
  { code: 'MKM', name: 'Mandya', city: 'Mandya', state: 'Karnataka', index: 17 },
  { code: 'RMM', name: 'Ramanagara', city: 'Ramanagara', state: 'Karnataka', index: 18 },
];

/**
 * Calculates distance in KM using the specified formula:
 * getDistanceKm = 20 + |idxDiff|*18 + random 15
 * Using deterministic pseudo-random offset based on code pair so distance is consistent for same query.
 */
export function getDistanceKm(fromStation: Station, toStation: Station): number {
  const idxDiff = Math.abs(fromStation.index - toStation.index);
  // Deterministic seed from char codes
  const seed = (fromStation.code.charCodeAt(0) * 17 + toStation.code.charCodeAt(0) * 31) % 15;
  const km = 20 + idxDiff * 18 + seed;
  return Math.max(20, km);
}

/**
 * Calculates fare according to specification:
 * km * 0.6 base
 * MAIL_EXP + 15
 * SUPERFAST + 30
 * round to 5, min 10
 */
export function calculateFare(km: number, trainType: TrainType): number {
  let base = km * 0.6;
  if (trainType === 'MAIL_EXP') {
    base += 15;
  } else if (trainType === 'SUPERFAST') {
    base += 30;
  }
  // Round to nearest 5
  let rounded = Math.round(base / 5) * 5;
  return Math.max(10, rounded);
}

// Corridors & Train catalog for realistic display
export function generateTrainsForRoute(from: Station, to: Station): TrainSchedule[] {
  const distance = getDistanceKm(from, to);
  const isSbcMysCorridor =
    (from.code === 'SBC' || from.code === 'MKM' || from.code === 'RMM') &&
    (to.code === 'MYS' || to.code === 'MKM' || to.code === 'SBC' || to.code === 'RMM');

  const baseTrains: Array<{ name: string; number: string; type: TrainType; dep: string; durMins: number }> = isSbcMysCorridor
    ? [
        { name: 'Chamundi SF Express', number: '16215', type: 'SUPERFAST', dep: '06:15', durMins: Math.round(distance * 1.05) },
        { name: 'Tipu SF Express', number: '12613', type: 'SUPERFAST', dep: '08:30', durMins: Math.round(distance * 1.0) },
        { name: 'Malgudi Passenger / Memu', number: '06575', type: 'PASSENGER', dep: '10:15', durMins: Math.round(distance * 1.4) },
        { name: 'Rajya Rani SF Express', number: '20659', type: 'SUPERFAST', dep: '14:20', durMins: Math.round(distance * 1.05) },
        { name: 'Kaveri Express', number: '16021', type: 'MAIL_EXP', dep: '17:00', durMins: Math.round(distance * 1.15) },
        { name: 'Vande Bharat Express', number: '20607', type: 'SUPERFAST', dep: '19:45', durMins: Math.round(distance * 0.85) },
      ]
    : [
        { name: `${from.city} - ${to.city} Intercity Exp`, number: '12677', type: 'SUPERFAST', dep: '06:30', durMins: Math.round(distance * 1.1) },
        { name: `Bharat Mail Express`, number: '16525', type: 'MAIL_EXP', dep: '09:10', durMins: Math.round(distance * 1.25) },
        { name: `Jan Shatabdi Express`, number: '12079', type: 'SUPERFAST', dep: '12:45', durMins: Math.round(distance * 1.0) },
        { name: `${to.city} Special Passenger`, number: '06511', type: 'PASSENGER', dep: '15:20', durMins: Math.round(distance * 1.5) },
        { name: `Garib Rath Superfast`, number: '12258', type: 'SUPERFAST', dep: '18:15', durMins: Math.round(distance * 1.05) },
        { name: `Night Express / Fast Passenger`, number: '16591', type: 'MAIL_EXP', dep: '21:40', durMins: Math.round(distance * 1.3) },
      ];

  return baseTrains.map((t, idx) => {
    // calculate arrival time from departure + durMins
    const [h, m] = t.dep.split(':').map(Number);
    const totalDepMins = h * 60 + m;
    const totalArrMins = (totalDepMins + t.durMins) % (24 * 60);
    const arrH = Math.floor(totalArrMins / 60);
    const arrM = totalArrMins % 60;
    const arrTime = `${String(arrH).padStart(2, '0')}:${String(arrM).padStart(2, '0')}`;

    const durH = Math.floor(t.durMins / 60);
    const durM = t.durMins % 60;
    const duration = durH > 0 ? `${durH}h ${durM}m` : `${durM}m`;

    const fare = calculateFare(distance, t.type);

    return {
      id: `TR-${t.number}-${idx}`,
      number: t.number,
      name: t.name,
      type: t.type,
      depTime: t.dep,
      arrTime: arrTime,
      duration,
      distanceKm: distance,
      farePerPax: fare,
    };
  });
}
