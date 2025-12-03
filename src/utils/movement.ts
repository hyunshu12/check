import { MovementMap, MovementRecord } from '../types';

export function upsertMovement(map: MovementMap, hakbun: string, record: MovementRecord | null): MovementMap {
  const clone = { ...map };
  if (!record || !record.location) {
    delete clone[hakbun];
    return clone;
  }
  clone[hakbun] = record;
  return clone;
}

