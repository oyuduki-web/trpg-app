'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Dice1 } from 'lucide-react'
import { CharacterStats, CthulhuSkills, CharacterBasicInfo } from '@/types/cthulhu'
import { calculateDerivedStats, DEFAULT_SKILLS } from '@/lib/cthulhu-utils'
import Navigation from '@/components/Navigation'

export default function NewCharacterPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [basicInfo, setBasicInfo] = useState<CharacterBasicInfo>({
    name: '',
    nameReading: '',
    occupation: '',
    age: undefined,
    gender: '',
    birthplace: '',
    residence: '',
  })

  const [stats, setStats] = useState<CharacterStats>({
    str: 0,
    con: 0,
    pow: 0,
    dex: 0,
    app: 0,
    siz: 0,
    int: 0,
    edu: 0,
    luck: 0,
  })

  const [skills, setSkills] = useState<CthulhuSkills>(DEFAULT_SKILLS)

  const derivedStats = calculateDerivedStats(stats)

  const handleStatsChange = (statName: keyof CharacterStats, value: number) => {
    setStats(prev => {
      const newStats = {
        ...prev,
        [statName]: value,
      }
      
      // POWが変更された場合、幸運を自動計算
      if (statName === 'pow') {
        newStats.luck = value * 5
      }
      
      return newStats
    })
    
    // 母語技能を自動更新（6版: EDU×5）
    if (statName === 'edu') {
      setSkills(prev => ({
        ...prev,
        languageOwn: value * 5,
      }))
    }
    
    // 回避技能を自動更新（6版: DEX×2）
    if (statName === 'dex') {
      setSkills(prev => ({
        ...prev,
        dodge: value * 2,
      }))
    }
  }

  const handleSkillChange = (skillName: keyof CthulhuSkills, value: number) => {
    setSkills(prev => ({
      ...prev,
      [skillName]: value,
    }))
  }

  const rollStats = () => {
    // 6版準拠のダイス振り
    const roll3d6 = () => {
      const rolls = Array.from({ length: 3 }, () => Math.floor(Math.random() * 6) + 1)
      return rolls.reduce((sum, roll) => sum + roll, 0)
    }

    const roll2d6plus6 = () => {
      const rolls = Array.from({ length: 2 }, () => Math.floor(Math.random() * 6) + 1)
      return rolls.reduce((sum, roll) => sum + roll, 0) + 6
    }

    const roll3d6plus3 = () => {
      const rolls = Array.from({ length: 3 }, () => Math.floor(Math.random() * 6) + 1)
      return rolls.reduce((sum, roll) => sum + roll, 0) + 3
    }

    const pow = roll3d6()    // POWを先に計算
    const newStats = {
      str: roll3d6(),    // 3d6 (3-18)
      con: roll3d6(),    // 3d6 (3-18)
      pow: pow,          // 3d6 (3-18)
      dex: roll3d6(),    // 3d6 (3-18)
      app: roll3d6(),    // 3d6 (3-18)
      siz: roll2d6plus6(), // 2d6+6 (8-18)
      int: roll3d6(),    // 3d6 (3-18)
      edu: roll3d6plus3(), // 3d6+3 (6-21)
      luck: pow * 5,     // POW×5
    }

    setStats(newStats)
    setSkills(prev => ({
      ...prev,
      languageOwn: newStats.edu * 5, // EDU×5
      dodge: newStats.dex * 2,       // DEX×2
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!basicInfo.name.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...basicInfo,
          ...stats,
          ...derivedStats,
          skills,
        }),
      })

      if (response.ok) {
        const character = await response.json()
        router.push(`/characters/${character.id}`)
      } else {
        alert('キャラクター作成に失敗しました')
      }
    } catch (error) {
      console.error('キャラクター作成エラー:', error)
      alert('キャラクター作成に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation 
        title="新規キャラクター作成"
        backHref="/"
      />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            新規キャラクター作成
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本情報 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              基本情報
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  名前 *
                </label>
                <input
                  type="text"
                  value={basicInfo.name}
                  onChange={(e) => setBasicInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  読み仮名
                </label>
                <input
                  type="text"
                  value={basicInfo.nameReading || ''}
                  onChange={(e) => setBasicInfo(prev => ({ ...prev, nameReading: e.target.value }))}
                  placeholder="ひらがなで入力"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  職業
                </label>
                <input
                  type="text"
                  value={basicInfo.occupation || ''}
                  onChange={(e) => setBasicInfo(prev => ({ ...prev, occupation: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  年齢
                </label>
                <input
                  type="number"
                  value={basicInfo.age || ''}
                  onChange={(e) => setBasicInfo(prev => ({ ...prev, age: e.target.value ? Number(e.target.value) : undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  性別
                </label>
                <input
                  type="text"
                  value={basicInfo.gender || ''}
                  onChange={(e) => setBasicInfo(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* 能力値 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  能力値
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  6版ルール: STR/CON/POW/DEX/APP/INT = 3d6, SIZ = 2d6+6, EDU = 3d6+3, 幸運 = POW×5, 知識 = EDU×5, アイデア = INT×5
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={rollStats}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Dice1 className="w-4 h-4" />
                  ランダム生成
                </button>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {Object.entries(stats).map(([statName, value]) => {
                const statLabels: Record<keyof CharacterStats, string> = {
                  str: 'STR (筋力)',
                  con: 'CON (体力)',
                  pow: 'POW (精神力)',
                  dex: 'DEX (敏捷性)',
                  app: 'APP (外見)',
                  siz: 'SIZ (体格)',
                  int: 'INT (知性)',
                  edu: 'EDU (教育)',
                  luck: '幸運 (自動計算)'
                }
                
                const getStatRange = (stat: keyof CharacterStats) => {
                  switch(stat) {
                    case 'siz': return '(8-18)'
                    case 'edu': return '(6-21)'
                    case 'luck': return '(POW×5)'
                    default: return '(3-18)'
                  }
                }
                
                return (
                  <div key={statName} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {statLabels[statName as keyof CharacterStats]}
                      <span className="text-xs text-gray-500 ml-1">
                        {getStatRange(statName as keyof CharacterStats)}
                      </span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => handleStatsChange(statName as keyof CharacterStats, Number(e.target.value))}
                        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white ${
                          statName === 'luck' 
                            ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' 
                            : 'bg-white dark:bg-gray-700'
                        }`}
                        min="0"
                        max="100"
                        readOnly={statName === 'luck'}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          let newValue: number
                          if (statName === 'luck') {
                            // 幸運の場合はPOW×5で計算（個別再ロールなし）
                            newValue = stats.pow * 5
                          } else if (statName === 'siz') {
                            const rolls = Array.from({ length: 2 }, () => Math.floor(Math.random() * 6) + 1)
                            newValue = rolls.reduce((sum, roll) => sum + roll, 0) + 6
                          } else if (statName === 'edu') {
                            const rolls = Array.from({ length: 3 }, () => Math.floor(Math.random() * 6) + 1)
                            newValue = rolls.reduce((sum, roll) => sum + roll, 0) + 3
                          } else {
                            const rolls = Array.from({ length: 3 }, () => Math.floor(Math.random() * 6) + 1)
                            newValue = rolls.reduce((sum, roll) => sum + roll, 0)
                          }
                          handleStatsChange(statName as keyof CharacterStats, newValue)
                        }}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        title={statName === 'luck' ? 'POW×5で再計算' : 'この能力値のみ再ロール'}
                      >
                        <Dice1 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 副能力値 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              副能力値（自動計算）
            </h2>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  HP
                </label>
                <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white">
                  {derivedStats.hp}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  MP
                </label>
                <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white">
                  {derivedStats.mp}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  SAN
                </label>
                <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white">
                  {derivedStats.san}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  知識
                </label>
                <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white">
                  {stats.edu * 5}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  アイデア
                </label>
                <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white">
                  {stats.int * 5}
                </div>
              </div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={!basicInfo.name.trim() || isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? '保存中...' : 'キャラクター作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}