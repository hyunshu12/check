export interface ReasonDef {
  key: string;
  label: string;
  isAbsent?: boolean;
  isEtc?: boolean;
}

export const reasons: ReasonDef[] = [
  { key: 'toilet', label: '화장실(물)' },
  { key: 'hallway', label: '복도' },
  { key: 'club', label: '동아리' },
  { key: 'after', label: '방과후' },
  { key: 'project', label: '프로젝트' },
  { key: 'early', label: '조기입실' },
  { key: 'etc', label: '기타', isEtc: true },
  { key: 'absent', label: '결석(조퇴)', isAbsent: true }
];

const ABSENT_RE = /결석|조퇴|병결|귀가/;
const TOILET_RE = /화장실/;
const HALLWAY_RE = /^복도$/;
const CLUB_RE = /동아리/;
const AFTER_RE = /방과후/;
const PROJECT_RE = /프로젝트|앱창작실/;
const EARLY_RE = /조기\s*입실/;

export function reasonForLocation(location: string): ReasonDef {
  if (!location) return reasons.find((r) => r.key === 'etc')!;
  if (ABSENT_RE.test(location)) return reasons.find((r) => r.key === 'absent')!;
  if (TOILET_RE.test(location)) return reasons.find((r) => r.key === 'toilet')!;
  if (HALLWAY_RE.test(location)) return reasons.find((r) => r.key === 'hallway')!;
  if (CLUB_RE.test(location)) return reasons.find((r) => r.key === 'club')!;
  if (AFTER_RE.test(location)) return reasons.find((r) => r.key === 'after')!;
  if (PROJECT_RE.test(location)) return reasons.find((r) => r.key === 'project')!;
  if (EARLY_RE.test(location)) return reasons.find((r) => r.key === 'early')!;
  return reasons.find((r) => r.key === 'etc')!;
}
