// 技能名の日本語マッピング
export const skillNamesJa: Record<string, string> = {
  // 戦闘技能
  dodge: '回避',
  fight: 'こぶし（パンチ）',
  firearms: '拳銃',
  
  // 探索技能
  accounting: '経理',
  anthropology: '人類学',
  archaeology: '考古学',
  art: '芸術',
  charm: '信用',
  climb: '登攀',
  creditRating: '信用度',
  cthulhuMythos: 'クトゥルフ神話',
  disguise: '変装',
  electricalRepair: '電気修理',
  fastTalk: '言いくるめ',
  firstAid: '応急手当',
  history: '歴史',
  jump: '跳躍',
  languageOwn: '母国語（日本語）',
  law: '法律',
  libraryUse: '図書館',
  listen: '聞き耳',
  locksmith: '鍵開け',
  mechanicalRepair: '機械修理',
  medicine: '医学',
  naturalHistory: '博物学',
  navigate: 'ナビゲート',
  occult: 'オカルト',
  operateHeavyMachinery: '重機械操作',
  persuade: '説得',
  psychology: '心理学',
  psychoanalysis: '精神分析',
  ride: '乗馬',
  science: '生物学',
  sleightOfHand: 'しのび歩き',
  spotHidden: '目星',
  stealth: '隠れる',
  swim: '水泳',
  throw: '投擲',
  track: '追跡',
}

// 技能名を日本語に変換する関数
export function getSkillNameJa(skillKey: string): string {
  return skillNamesJa[skillKey] || skillKey
}