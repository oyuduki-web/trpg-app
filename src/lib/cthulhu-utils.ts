import { CthulhuSkills, CharacterStats, DerivedStats } from '@/types/cthulhu'

// デフォルトの技能値を定義（6版ルールブック準拠）
export const DEFAULT_SKILLS: CthulhuSkills = {
  dodge: 0, // DEX×2で計算
  fight: 50, // こぶし／パンチ
  firearms: 20, // 拳銃
  accounting: 10, // 経理
  anthropology: 1, // 人類学
  archaeology: 1, // 考古学
  art: 5, // 芸術
  charm: 15, // 信用
  climb: 40, // 登攀
  creditRating: 15, // 信用
  cthulhuMythos: 0, // クトゥルフ神話
  disguise: 1, // 変装
  electricalRepair: 10, // 電気修理
  fastTalk: 5, // 言いくるめ
  firstAid: 30, // 応急手当
  history: 20, // 歴史
  intimidate: 15, // 威圧（説得に統合）
  jump: 25, // 跳躍
  languageOwn: 0, // 母国語 EDU×5で計算
  law: 5, // 法律
  libraryUse: 25, // 図書館
  listen: 25, // 聞き耳
  locksmith: 1, // 鍵開け
  mechanicalRepair: 20, // 機械修理
  medicine: 5, // 医学
  naturalHistory: 10, // 博物学
  navigate: 10, // ナビゲート
  occult: 5, // オカルト
  operateHeavyMachinery: 1, // 重機械操作
  persuade: 15, // 説得
  psychology: 5, // 心理学
  psychoanalysis: 1, // 精神分析
  ride: 5, // 乗馬
  science: 1, // 科学（生物学、物理学等）
  sleightOfHand: 10, // しのび歩き
  spotHidden: 25, // 目星
  stealth: 10, // 隠れる
  survival: 10, // 追跡相当
  swim: 25, // 水泳
  throw: 25, // 投擲
  track: 10, // 追跡
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