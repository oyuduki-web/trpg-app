'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Dice1 } from 'lucide-react'
import { CharacterStats, CthulhuSkills, CharacterBasicInfo } from '@/types/cthulhu'
import { calculateDerivedStats, DEFAULT_SKILLS } from '@/lib/cthulhu-utils'

export default function NewCharacterPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [basicInfo, setBasicInfo] = useState<CharacterBasicInfo>({
    name: '',
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
    setStats(prev => ({
      ...prev,
      [statName]: value,
    }))
    
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

    const newStats = {
      str: roll3d6(),    // 3d6 (3-18)
      con: roll3d6(),    // 3d6 (3-18)
      pow: roll3d6(),    // 3d6 (3-18)
      dex: roll3d6(),    // 3d6 (3-18)
      app: roll3d6(),    // 3d6 (3-18)
      siz: roll2d6plus6(), // 2d6+6 (8-18)
      int: roll3d6(),    // 3d6 (3-18)
      edu: roll3d6plus3(), // 3d6+3 (6-21)
      luck: roll3d6(),   // 3d6 (3-18)
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowLeft className="w-5 h-5" />
            戻る
          </Link>
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
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                能力値
              </h2>
              <button
                type="button"
                onClick={rollStats}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Dice1 className="w-4 h-4" />
                ランダム生成
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {Object.entries(stats).map(([statName, value]) => (
                <div key={statName}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {statName.toUpperCase()}
                  </label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => handleStatsChange(statName as keyof CharacterStats, Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="0"
                    max="100"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 副能力値 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              副能力値（自動計算）
            </h2>
            <div className="grid gap-4 md:grid-cols-4">
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
                  MOV
                </label>
                <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white">
                  {derivedStats.mov}
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