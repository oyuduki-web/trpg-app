import { CthulhuSkills, CharacterStats, DerivedStats } from '@/types/cthulhu'

// デフォルトの技能値を定義
export const DEFAULT_SKILLS: CthulhuSkills = {
  dodge: 0,
  fight: 25,
  firearms: 20,
  accounting: 5,
  anthropology: 1,
  archaeology: 1,
  art: 5,
  charm: 15,
  climb: 20,
  creditRating: 0,
  cthulhuMythos: 0,
  disguise: 5,
  electricalRepair: 10,
  fastTalk: 5,
  firstAid: 30,
  history: 5,
  intimidate: 15,
  jump: 20,
  languageOwn: 0, // EDU値で計算
  law: 5,
  libraryUse: 20,
  listen: 20,
  locksmith: 1,
  mechanicalRepair: 10,
  medicine: 1,
  naturalHistory: 10,
  navigate: 10,
  occult: 5,
  operateHeavyMachinery: 1,
  persuade: 10,
  psychology: 10,
  psychoanalysis: 1,
  ride: 5,
  science: 1,
  sleightOfHand: 10,
  spotHidden: 25,
  stealth: 20,
  survival: 10,
  swim: 20,
  throw: 20,
  track: 10,
}

// 能力値から副能力値を計算（6版準拠）
export function calculateDerivedStats(stats: CharacterStats): DerivedStats {
  const hp = Math.ceil((stats.con + stats.siz) / 2) // (CON+SIZ)÷2 端数切り上げ
  const mp = stats.pow // POW×1（POW値そのまま）
  const san = stats.pow * 5 // POW×5
  const maxSan = stats.pow * 5 - 0 // クトゥルフ神話技能値を引く（初期は0）
  
  let mov = 8
  if (stats.dex < stats.siz && stats.str < stats.siz) {
    mov = 7
  } else if (stats.dex > stats.siz && stats.str > stats.siz) {
    mov = 9
  }

  const build = calculateBuild(stats.str + stats.siz)

  return {
    hp,
    maxHp: hp,
    mp,
    maxMp: mp,
    san,
    maxSan,
    mov,
    build,
  }
}

function calculateBuild(strPlusSiz: number): number {
  if (strPlusSiz <= 64) return -2
  if (strPlusSiz <= 84) return -1
  if (strPlusSiz <= 124) return 0
  if (strPlusSiz <= 164) return 1
  if (strPlusSiz <= 204) return 2
  if (strPlusSiz <= 284) return 3
  if (strPlusSiz <= 364) return 4
  if (strPlusSiz <= 444) return 5
  return 6
}

// 技能成長をチェック
export function rollSkillGrowth(currentValue: number): boolean {
  if (currentValue >= 90) return false
  const roll = Math.floor(Math.random() * 100) + 1
  return roll > currentValue
}

// 技能成長値を計算（1d10）
export function rollSkillIncrease(): number {
  return Math.floor(Math.random() * 10) + 1
}

// SAN値チェックのダイスロール
export function rollSanCheck(successDice: string, failDice: string): {
  roll: number
  success: boolean
  loss: number
} {
  const roll = Math.floor(Math.random() * 100) + 1
  // ここでは簡単な実装として、失敗時のダメージのみ計算
  // 実際のアプリでは、successDiceとfailDiceを解析してダイスロールを行う
  const loss = Math.floor(Math.random() * 6) + 1 // 仮実装
  
  return {
    roll,
    success: false, // 仮実装
    loss,
  }
}