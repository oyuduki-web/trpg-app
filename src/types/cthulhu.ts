// クトゥルフ神話TRPG関連の型定義

export interface CthulhuSkills {
  // 戦闘技能
  dodge: number
  fight: number
  firearms: number
  // 探索技能
  accounting: number
  anthropology: number
  archaeology: number
  art: number
  charm: number
  climb: number
  creditRating: number
  cthulhuMythos: number
  disguise: number
  electricalRepair: number
  fastTalk: number
  firstAid: number
  history: number
  jump: number
  languageOwn: number
  law: number
  libraryUse: number
  listen: number
  locksmith: number
  mechanicalRepair: number
  medicine: number
  naturalHistory: number
  navigate: number
  occult: number
  operateHeavyMachinery: number
  persuade: number
  psychology: number
  psychoanalysis: number
  ride: number
  science: number
  sleightOfHand: number
  spotHidden: number
  stealth: number
  swim: number
  throw: number
  track: number
  // その他の技能
  [key: string]: number
}

export interface CharacterStats extends Record<string, number> {
  str: number
  con: number
  pow: number
  dex: number
  app: number
  siz: number
  int: number
  edu: number
  luck: number
}

export interface DerivedStats {
  hp: number
  maxHp: number
  mp: number
  maxMp: number
  san: number
  maxSan: number
  mov: number
  build: number
}

export interface CharacterBasicInfo {
  name: string
  occupation?: string
  age?: number
  gender?: string
  birthplace?: string
  residence?: string
}

export type InsanitySymptomType = 'indefinite' | 'phobia' | 'mania'

export interface SkillGrowthResult {
  skillName: string
  oldValue: number
  newValue: number
  grown: boolean
}