'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, History, BookOpen, ImageIcon, Shield, TrendingUp, Brain, AlertTriangle, Calendar, User } from 'lucide-react'
import { Character } from '@/generated/prisma'
import { getSkillNameJa } from '@/lib/skill-names'

interface CharacterWithParsedSkills extends Omit<Character, 'skills'> {
  skills: Record<string, number>
}

interface SessionHistory {
  id: string
  playDate: string
  kpName: string | null
  participants: string | null
  memo: string | null
  scenario: {
    id: string
    title: string
    author: string | null
  }
  skillHistories: Array<{
    id: string
    skillName: string
    oldValue: number
    newValue: number
    reason: string | null
    createdAt: string
  }>
  sanityHistories: Array<{
    id: string
    oldValue: number
    newValue: number
    reason: string
    createdAt: string
  }>
  insanitySymptoms: Array<{
    id: string
    symptomType: string
    symptomName: string
    description: string | null
    isRecovered: boolean
    createdAt: string
  }>
}

export default function CharacterDetailPage() {
  const params = useParams()
  const characterId = params.id as string
  const [character, setCharacter] = useState<CharacterWithParsedSkills | null>(null)
  const [sessions, setSessions] = useState<SessionHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview')
  const [historyFilter, setHistoryFilter] = useState<'all' | 'skills' | 'sanity'>('all')

  useEffect(() => {
    fetchData()
  }, [characterId])

  const fetchData = async () => {
    try {
      const [characterResponse, sessionsResponse] = await Promise.all([
        fetch(`/api/characters/${characterId}`),
        fetch(`/api/characters/${characterId}/sessions`)
      ])

      if (characterResponse.ok) {
        const characterData = await characterResponse.json()
        characterData.skills = JSON.parse(characterData.skills)
        setCharacter(characterData)
      }

      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json()
        setSessions(sessionsData)
      }
    } catch (error) {
      console.error('データ取得エラー:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getFilteredSessions = () => {
    if (historyFilter === 'all') return sessions
    if (historyFilter === 'skills') {
      return sessions.filter(session => session.skillHistories.length > 0)
    }
    if (historyFilter === 'sanity') {
      return sessions.filter(session => 
        session.sanityHistories.length > 0 || session.insanitySymptoms.length > 0
      )
    }
    return sessions
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
              href="/"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <ArrowLeft className="w-5 h-5" />
              戻る
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              {character.name}
            </h1>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <Edit className="w-4 h-4" />
              編集
            </button>
            <Link 
              href={`/characters/${characterId}/session`}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <History className="w-4 h-4" />
              セッション記録
            </Link>
            <Link 
              href={`/characters/${characterId}/images`}
              className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
            >
              <ImageIcon className="w-4 h-4" />
              立ち絵管理
            </Link>
            <Link 
              href={`/characters/${characterId}/backup`}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              <Shield className="w-4 h-4" />
              バックアップ
            </Link>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                キャラクター概要
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                冒険履歴
                {sessions.length > 0 && (
                  <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs font-semibold px-2 py-1 rounded-full">
                    {sessions.length}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* タブコンテンツ */}
        {activeTab === 'overview' && (
          <div className="grid gap-6 lg:grid-cols-2">
          {/* 基本情報 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              基本情報
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">職業:</span>
                <span className="text-gray-800 dark:text-white">{character.occupation || '未設定'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">年齢:</span>
                <span className="text-gray-800 dark:text-white">{character.age || '未設定'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">性別:</span>
                <span className="text-gray-800 dark:text-white">{character.gender || '未設定'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">出身地:</span>
                <span className="text-gray-800 dark:text-white">{character.birthplace || '未設定'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">現住所:</span>
                <span className="text-gray-800 dark:text-white">{character.residence || '未設定'}</span>
              </div>
            </div>
          </div>

          {/* 能力値 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              能力値
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-300">STR</div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">{character.str}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-300">CON</div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">{character.con}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-300">POW</div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">{character.pow}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-300">DEX</div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">{character.dex}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-300">APP</div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">{character.app}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-300">SIZ</div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">{character.siz}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-300">INT</div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">{character.int}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-300">EDU</div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">{character.edu}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-300">LUCK</div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">{character.luck}</div>
              </div>
            </div>
          </div>

          {/* 副能力値 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              副能力値
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-300">HP</div>
                <div className="text-xl font-bold text-red-600">{character.hp} / {character.maxHp}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-300">MP</div>
                <div className="text-xl font-bold text-blue-600">{character.mp} / {character.maxMp}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-300">SAN</div>
                <div className="text-xl font-bold text-purple-600">{character.san} / {character.maxSan}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-300">MOV</div>
                <div className="text-xl font-bold text-green-600">{character.mov}</div>
              </div>
            </div>
          </div>

          {/* 技能値 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              技能値
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(character.skills).map(([skillName, value]) => (
                <div key={skillName} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {getSkillNameJa(skillName)}
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
          </div>
        )}

        {/* 冒険履歴タブ */}
        {activeTab === 'history' && (
          <div>
            {/* フィルターボタン */}
            <div className="mb-6 flex gap-2 flex-wrap">
              <button
                onClick={() => setHistoryFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  historyFilter === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                全て ({sessions.length})
              </button>
              <button
                onClick={() => setHistoryFilter('skills')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${
                  historyFilter === 'skills'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                技能成長 ({sessions.filter(s => s.skillHistories.length > 0).length})
              </button>
              <button
                onClick={() => setHistoryFilter('sanity')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${
                  historyFilter === 'sanity'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <Brain className="w-4 h-4" />
                SAN値変動 ({sessions.filter(s => s.sanityHistories.length > 0 || s.insanitySymptoms.length > 0).length})
              </button>
            </div>

            {/* 履歴コンテンツ */}
            {getFilteredSessions().length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  まだ冒険履歴がありません
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  セッション記録を追加すると、ここに履歴が表示されます
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {getFilteredSessions().map((session) => (
                  <div key={session.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    {/* セッション基本情報 */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">
                          {session.scenario.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(session.playDate).toLocaleDateString('ja-JP')}
                          </div>
                          {session.kpName && (
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              KP: {session.kpName}
                            </div>
                          )}
                        </div>
                        {session.scenario.author && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            作者: {session.scenario.author}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* 変更内容 */}
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* 技能成長 */}
                      {session.skillHistories.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            技能成長
                          </h4>
                          <div className="space-y-2">
                            {session.skillHistories.map((history) => (
                              <div key={history.id} className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  {getSkillNameJa(history.skillName)}
                                </span>
                                <span className="font-semibold text-green-700 dark:text-green-400">
                                  {history.oldValue}% → {history.newValue}% (+{history.newValue - history.oldValue})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* SAN値変動・狂気症状 */}
                      {(session.sanityHistories.length > 0 || session.insanitySymptoms.length > 0) && (
                        <div>
                          <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                            <Brain className="w-4 h-4" />
                            SAN値変動・狂気症状
                          </h4>
                          <div className="space-y-2">
                            {session.sanityHistories.map((history) => (
                              <div key={history.id} className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  {history.reason}
                                </span>
                                <span className="font-semibold text-red-700 dark:text-red-400">
                                  {history.oldValue} → {history.newValue} ({history.newValue - history.oldValue})
                                </span>
                              </div>
                            ))}
                            {session.insanitySymptoms.map((symptom) => (
                              <div key={symptom.id} className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-orange-700 dark:text-orange-400">
                                    {symptom.symptomName}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                                    <span className="text-sm text-orange-600 dark:text-orange-400">
                                      {symptom.symptomType === 'indefinite' ? '不定' : 
                                       symptom.symptomType === 'phobia' ? '恐怖症' : '躁病'}
                                    </span>
                                  </div>
                                </div>
                                {symptom.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {symptom.description}
                                  </p>
                                )}
                                {symptom.isRecovered && (
                                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-full mt-2">
                                    回復済み
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* メモ */}
                    {session.memo && (
                      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <h5 className="font-medium text-gray-800 dark:text-white mb-2">メモ</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                          {session.memo}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}