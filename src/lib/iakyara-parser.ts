import { CharacterBasicInfo, CharacterStats, CthulhuSkills } from '@/types/cthulhu'

interface IakyaraParseResult {
  basicInfo: CharacterBasicInfo
  stats: CharacterStats
  skills: CthulhuSkills
  derivedStats: {
    hp: number
    maxHp: number
    mp: number
    maxMp: number
    san: number
    maxSan: number
    mov: number
    build: number
  }
  memo: string
}

export function parseIakyaraText(text: string): IakyaraParseResult {
  const lines = text.split('\n')
  
  // 初期値
  const result: IakyaraParseResult = {
    basicInfo: {
      name: '',
      occupation: '',
      age: undefined,
      gender: '',
      birthplace: '',
      residence: ''
    },
    stats: {
      str: 0,
      con: 0,
      pow: 0,
      dex: 0,
      app: 0,
      siz: 0,
      int: 0,
      edu: 0,
      luck: 0
    },
    skills: {
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
      jump: 20,
      languageOwn: 0,
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
      swim: 20,
      throw: 20,
      track: 10,
    },
    derivedStats: {
      hp: 0,
      maxHp: 0,
      mp: 0,
      maxMp: 0,
      san: 0,
      maxSan: 0,
      mov: 0,
      build: 0
    },
    memo: ''
  }

  let currentSection = ''
  const memoLines: string[] = []
  let inMemoSection = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // セクション判定
    if (line.includes('【基本情報】')) {
      currentSection = 'basic'
      continue
    } else if (line.includes('【能力値】')) {
      currentSection = 'stats'
      continue
    } else if (line.includes('【技能値】')) {
      currentSection = 'skills'
      continue
    } else if (line.includes('【メモ】')) {
      currentSection = 'memo'
      inMemoSection = true
      continue
    }

    // 基本情報の解析
    if (currentSection === 'basic') {
      if (line.startsWith('名前:')) {
        const nameMatch = line.match(/名前:\s*(.+?)(?:\s*\(.*\))?$/)
        if (nameMatch) {
          result.basicInfo.name = nameMatch[1].trim()
        }
      } else if (line.startsWith('職業:')) {
        const occupation = line.replace('職業:', '').trim()
        if (occupation) {
          result.basicInfo.occupation = occupation
        }
      } else if (line.includes('年齢:')) {
        const ageMatch = line.match(/年齢:\s*(\d+)/)
        if (ageMatch) {
          result.basicInfo.age = parseInt(ageMatch[1])
        }
        const genderMatch = line.match(/性別:\s*([^\/\s]+)/)
        if (genderMatch) {
          result.basicInfo.gender = genderMatch[1].trim()
        }
      } else if (line.startsWith('出身:')) {
        const birthplace = line.replace('出身:', '').trim()
        if (birthplace) {
          result.basicInfo.birthplace = birthplace
        }
      }
    }

    // 能力値の解析
    if (currentSection === 'stats') {
      const statMatch = line.match(/^(STR|CON|POW|DEX|APP|SIZ|INT|EDU|HP|MP|SAN|幸運)\s+(\d+)/)
      if (statMatch) {
        const statName = statMatch[1]
        const value = parseInt(statMatch[2])

        switch (statName) {
          case 'STR':
            result.stats.str = value
            break
          case 'CON':
            result.stats.con = value
            break
          case 'POW':
            result.stats.pow = value
            break
          case 'DEX':
            result.stats.dex = value
            break
          case 'APP':
            result.stats.app = value
            break
          case 'SIZ':
            result.stats.siz = value
            break
          case 'INT':
            result.stats.int = value
            break
          case 'EDU':
            result.stats.edu = value
            break
          case 'HP':
            result.derivedStats.hp = value
            result.derivedStats.maxHp = value
            break
          case 'MP':
            result.derivedStats.mp = value
            result.derivedStats.maxMp = value
            break
          case 'SAN':
            result.derivedStats.san = value
            break
          case '幸運':
            result.stats.luck = value
            break
        }
      }

      // SAN値の最大値を取得
      const sanMaxMatch = line.match(/現在SAN値\s+\d+\s*\/\s*(\d+)/)
      if (sanMaxMatch) {
        result.derivedStats.maxSan = parseInt(sanMaxMatch[1])
      }
    }

    // 技能値の解析
    if (currentSection === 'skills') {
      const skillMatch = line.match(/^([^\s]+(?:\s+[^\s]+)*)\s+(\d+)\s+\d+/)
      if (skillMatch) {
        const skillName = skillMatch[1].trim()
        const totalValue = parseInt(skillMatch[2])

        // 技能名のマッピング
        const skillMapping: Record<string, keyof CthulhuSkills> = {
          '回避': 'dodge',
          'こぶし（パンチ）': 'fight',
          '拳銃': 'firearms',
          '経理': 'accounting',
          '人類学': 'anthropology',
          '考古学': 'archaeology',
          '芸術': 'art',
          '信用': 'charm',
          '登攀': 'climb',
          '変装': 'disguise',
          '電気修理': 'electricalRepair',
          '言いくるめ': 'fastTalk',
          '応急手当': 'firstAid',
          '歴史': 'history',
          '跳躍': 'jump',
          '母国語': 'languageOwn',
          '法律': 'law',
          '図書館': 'libraryUse',
          '聞き耳': 'listen',
          '鍵開け': 'locksmith',
          '機械修理': 'mechanicalRepair',
          '医学': 'medicine',
          '博物学': 'naturalHistory',
          'ナビゲート': 'navigate',
          'オカルト': 'occult',
          '重機械操作': 'operateHeavyMachinery',
          '説得': 'persuade',
          '心理学': 'psychology',
          '精神分析': 'psychoanalysis',
          '乗馬': 'ride',
          '化学': 'science',
          '隠す': 'sleightOfHand',
          '目星': 'spotHidden',
          '忍び歩き': 'stealth',
          '水泳': 'swim',
          '投擲': 'throw',
          '追跡': 'track',
        }

        const mappedSkill = skillMapping[skillName]
        if (mappedSkill) {
          result.skills[mappedSkill] = totalValue
        }

        // クトゥルフ神話技能は特別処理
        if (skillName === 'クトゥルフ神話') {
          result.skills.cthulhuMythos = totalValue
          // SAN最大値を再計算
          result.derivedStats.maxSan = Math.max(0, result.derivedStats.maxSan - totalValue)
        }
      }
    }

    // メモの解析
    if (inMemoSection && line) {
      memoLines.push(line)
    }
  }

  // MOVとBUILDの計算
  result.derivedStats.mov = calculateMov(result.stats)
  result.derivedStats.build = calculateBuild(result.stats.str + result.stats.siz)

  // いあきゃらのテキストデータをそのまま使用（再計算しない）
  // HP, MP, SANはテキストから読み取った値をそのまま保持

  // メモをまとめる
  result.memo = memoLines.join('\n')

  return result
}

function calculateMov(stats: CharacterStats): number {
  let mov = 8
  if (stats.dex < stats.siz && stats.str < stats.siz) {
    mov = 7
  } else if (stats.dex > stats.siz && stats.str > stats.siz) {
    mov = 9
  }
  return mov
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