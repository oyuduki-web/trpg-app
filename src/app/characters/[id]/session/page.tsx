'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Plus, Minus, TrendingUp, Brain, AlertTriangle } from 'lucide-react'
import { Character } from '@/generated/prisma'
import { CthulhuSkills, SkillGrowthResult, InsanitySymptomType } from '@/types/cthulhu'

interface CharacterWithParsedSkills extends Omit<Character, 'skills'> {
  skills: CthulhuSkills
}

interface SessionData {
  scenarioTitle: string
  kpName: string
  playDate: string
  participants: string
  memo: string
  skillGrowth: SkillGrowthResult[]
  sanityLoss: number
  sanityReason: string
  insanitySymptoms: {
    type: InsanitySymptomType
    name: string
    description: string
  }[]
}

export default function SessionUpdatePage() {
  const params = useParams()
  const router = useRouter()
  const characterId = params.id as string
  
  const [character, setCharacter] = useState<CharacterWithParsedSkills | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  const [sessionData, setSessionData] = useState<SessionData>({
    scenarioTitle: '',
    kpName: '',
    playDate: new Date().toISOString().split('T')[0],
    participants: '',
    memo: '',
    skillGrowth: [],
    sanityLoss: 0,
    sanityReason: '',
    insanitySymptoms: []
  })

  const [activeTab, setActiveTab] = useState<'basic' | 'skills' | 'sanity'>('basic')

  useEffect(() => {
    fetchCharacter()
  }, [characterId])

  const fetchCharacter = async () => {
    try {
      const response = await fetch(`/api/characters/${characterId}`)
      if (response.ok) {
        const data = await response.json()
        data.skills = JSON.parse(data.skills)
        setCharacter(data)
      }
    } catch (error) {
      console.error('キャラクター取得エラー:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkillGrowthToggle = (skillName: string, currentValue: number) => {
    setSessionData(prev => {
      const existingIndex = prev.skillGrowth.findIndex(g => g.skillName === skillName)
      
      if (existingIndex >= 0) {
        // 既存の成長を削除
        return {
          ...prev,
          skillGrowth: prev.skillGrowth.filter((_, i) => i !== existingIndex)
        }
      } else {
        // 新しい成長を追加（1d10で仮の値）
        const growth = Math.floor(Math.random() * 10) + 1
        return {
          ...prev,
          skillGrowth: [
            ...prev.skillGrowth,
            {
              skillName,
              oldValue: currentValue,
              newValue: Math.min(currentValue + growth, 90),
              grown: true
            }
          ]
        }
      }
    })
  }

  const handleAddInsanity = () => {
    setSessionData(prev => ({
      ...prev,
      insanitySymptoms: [
        ...prev.insanitySymptoms,
        {
          type: 'indefinite',
          name: '',
          description: ''
        }
      ]
    }))
  }

  const handleRemoveInsanity = (index: number) => {
    setSessionData(prev => ({
      ...prev,
      insanitySymptoms: prev.insanitySymptoms.filter((_, i) => i !== index)
    }))
  }

  const handleInsanityChange = (index: number, field: keyof SessionData['insanitySymptoms'][0], value: string) => {
    setSessionData(prev => ({
      ...prev,
      insanitySymptoms: prev.insanitySymptoms.map((symptom, i) => 
        i === index ? { ...symptom, [field]: value } : symptom
      )
    }))
  }

  const handleSave = async () => {
    if (!character || !sessionData.scenarioTitle.trim()) {
      alert('シナリオ名は必須です')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/characters/${characterId}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      })

      if (response.ok) {
        router.push(`/characters/${characterId}`)
      } else {
        alert('セッション記録の保存に失敗しました')
      }
    } catch (error) {
      console.error('セッション保存エラー:', error)
      alert('セッション記録の保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">読み込み中...</p>
      </div>
    )
  }

  if (!character) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">キャラクターが見つかりません</p>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ホームに戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href={`/characters/${characterId}`}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <ArrowLeft className="w-5 h-5" />
              戻る
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                セッション記録
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {character.name} の冒険記録
              </p>
            </div>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('basic')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'basic'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              基本情報
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'skills'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-1" />
              技能成長
            </button>
            <button
              onClick={() => setActiveTab('sanity')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'sanity'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Brain className="w-4 h-4 inline mr-1" />
              SAN値・狂気
            </button>
          </div>

          <div className="p-6">
            {/* 基本情報タブ */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      シナリオ名 *
                    </label>
                    <input
                      type="text"
                      value={sessionData.scenarioTitle}
                      onChange={(e) => setSessionData(prev => ({ ...prev, scenarioTitle: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      KP名
                    </label>
                    <input
                      type="text"
                      value={sessionData.kpName}
                      onChange={(e) => setSessionData(prev => ({ ...prev, kpName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      プレイ日
                    </label>
                    <input
                      type="date"
                      value={sessionData.playDate}
                      onChange={(e) => setSessionData(prev => ({ ...prev, playDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      参加者
                    </label>
                    <input
                      type="text"
                      value={sessionData.participants}
                      onChange={(e) => setSessionData(prev => ({ ...prev, participants: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="他の参加者名"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    メモ・感想
                  </label>
                  <textarea
                    rows={4}
                    value={sessionData.memo}
                    onChange={(e) => setSessionData(prev => ({ ...prev, memo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="シナリオの感想や重要な出来事など..."
                  />
                </div>
              </div>
            )}

            {/* 技能成長タブ */}
            {activeTab === 'skills' && (
              <div className="space-y-6">
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  成長した技能をクリックして選択してください。自動的に成長値が計算されます。
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(character.skills).map(([skillName, currentValue]) => {
                    const isGrown = sessionData.skillGrowth.some(g => g.skillName === skillName)
                    const growth = sessionData.skillGrowth.find(g => g.skillName === skillName)
                    
                    return (
                      <div
                        key={skillName}
                        onClick={() => handleSkillGrowthToggle(skillName, currentValue)}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          isGrown
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                            {skillName.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <div className="text-right">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {currentValue}% 
                              {growth && (
                                <span className="text-green-600 dark:text-green-400">
                                  → {growth.newValue}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {sessionData.skillGrowth.length > 0 && (
                  <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                      成長した技能 ({sessionData.skillGrowth.length}個)
                    </h4>
                    <div className="space-y-1">
                      {sessionData.skillGrowth.map((growth, index) => (
                        <div key={index} className="text-sm text-green-700 dark:text-green-300">
                          {growth.skillName}: {growth.oldValue}% → {growth.newValue}% 
                          (+{growth.newValue - growth.oldValue})
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SAN値・狂気タブ */}
            {activeTab === 'sanity' && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      SAN値減少
                    </label>
                    <input
                      type="number"
                      value={sessionData.sanityLoss}
                      onChange={(e) => setSessionData(prev => ({ ...prev, sanityLoss: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      減少理由
                    </label>
                    <input
                      type="text"
                      value={sessionData.sanityReason}
                      onChange={(e) => setSessionData(prev => ({ ...prev, sanityReason: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="例: ショゴスを目撃"
                    />
                  </div>
                </div>

                {sessionData.sanityLoss > 0 && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="text-red-700 dark:text-red-300">
                      現在SAN値: {character.san} → {Math.max(0, character.san - sessionData.sanityLoss)}
                    </div>
                  </div>
                )}

                {/* 狂気症状 */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      狂気症状
                    </h3>
                    <button
                      onClick={handleAddInsanity}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      <Plus className="w-4 h-4" />
                      追加
                    </button>
                  </div>

                  {sessionData.insanitySymptoms.map((symptom, index) => (
                    <div key={index} className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg mb-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                種類
                              </label>
                              <select
                                value={symptom.type}
                                onChange={(e) => handleInsanityChange(index, 'type', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              >
                                <option value="indefinite">不定の狂気</option>
                                <option value="phobia">恐怖症</option>
                                <option value="mania">躁病</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                症状名
                              </label>
                              <input
                                type="text"
                                value={symptom.name}
                                onChange={(e) => handleInsanityChange(index, 'name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="例: 蜘蛛恐怖症"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              詳細
                            </label>
                            <textarea
                              rows={2}
                              value={symptom.description}
                              onChange={(e) => handleInsanityChange(index, 'description', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder="症状の詳細や発症条件など..."
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveInsanity(index)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={!sessionData.scenarioTitle.trim() || isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isSaving ? '保存中...' : 'セッション記録を保存'}
          </button>
        </div>
      </div>
    </div>
  )
}