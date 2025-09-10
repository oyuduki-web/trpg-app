'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, Brain, AlertTriangle, Calendar, User } from 'lucide-react'
import { getSkillNameJa } from '@/lib/skill-names'

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

export default function CharacterHistoryPage() {
  const params = useParams()
  const characterId = params.id as string
  const [sessions, setSessions] = useState<SessionHistory[]>([])
  const [characterName, setCharacterName] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<'all' | 'skills' | 'sanity'>('all')

  useEffect(() => {
    fetchHistory()
  }, [characterId])

  const fetchHistory = async () => {
    try {
      const [sessionsResponse, characterResponse] = await Promise.all([
        fetch(`/api/characters/${characterId}/sessions`),
        fetch(`/api/characters/${characterId}`)
      ])

      if (sessionsResponse.ok && characterResponse.ok) {
        const sessionsData = await sessionsResponse.json()
        const characterData = await characterResponse.json()
        setSessions(sessionsData)
        setCharacterName(characterData.name)
      }
    } catch (error) {
      console.error('履歴取得エラー:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getFilteredSessions = () => {
    if (activeFilter === 'all') return sessions
    if (activeFilter === 'skills') {
      return sessions.filter(session => session.skillHistories.length > 0)
    }
    if (activeFilter === 'sanity') {
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
                冒険履歴
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {characterName} の成長記録
              </p>
            </div>
          </div>
        </div>

        {/* フィルターボタン */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            全て ({sessions.length})
          </button>
          <button
            onClick={() => setActiveFilter('skills')}
            className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium ${
              activeFilter === 'skills'
                ? 'bg-green-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            技能成長 ({sessions.filter(s => s.skillHistories.length > 0).length})
          </button>
          <button
            onClick={() => setActiveFilter('sanity')}
            className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium ${
              activeFilter === 'sanity'
                ? 'bg-red-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Brain className="w-4 h-4" />
            SAN値変動 ({sessions.filter(s => s.sanityHistories.length > 0 || s.insanitySymptoms.length > 0).length})
          </button>
        </div>

        {/* セッション履歴 */}
        <div className="space-y-6">
          {getFilteredSessions().length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                履歴がありません
              </h3>
              <p className="text-gray-500 dark:text-gray-500">
                セッション記録を追加して冒険の軌跡を残しましょう
              </p>
              <Link
                href={`/characters/${characterId}/session`}
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                セッション記録を追加
              </Link>
            </div>
          ) : (
            getFilteredSessions().map((session) => (
              <div key={session.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
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
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  {/* 技能成長 */}
                  {session.skillHistories.length > 0 && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <h4 className="font-semibold text-green-800 dark:text-green-200">
                          技能成長 ({session.skillHistories.length}個)
                        </h4>
                      </div>
                      <div className="space-y-2">
                        {session.skillHistories.map((history) => (
                          <div key={history.id} className="text-sm text-green-700 dark:text-green-300">
                            <span className="font-medium">{getSkillNameJa(history.skillName)}</span>: 
                            {history.oldValue}% → {history.newValue}% 
                            <span className="text-green-600 dark:text-green-400">
                              (+{history.newValue - history.oldValue})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SAN値変動・狂気症状 */}
                  {(session.sanityHistories.length > 0 || session.insanitySymptoms.length > 0) && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Brain className="w-5 h-5 text-red-600 dark:text-red-400" />
                        <h4 className="font-semibold text-red-800 dark:text-red-200">
                          SAN値・狂気
                        </h4>
                      </div>
                      <div className="space-y-2">
                        {session.sanityHistories.map((history) => (
                          <div key={history.id} className="text-sm text-red-700 dark:text-red-300">
                            <div className="font-medium">
                              SAN値: {history.oldValue} → {history.newValue} 
                              <span className="text-red-600 dark:text-red-400">
                                ({history.newValue - history.oldValue})
                              </span>
                            </div>
                            <div className="text-xs text-red-600 dark:text-red-400">
                              理由: {history.reason}
                            </div>
                          </div>
                        ))}
                        {session.insanitySymptoms.map((symptom) => (
                          <div key={symptom.id} className="text-sm text-red-700 dark:text-red-300">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-3 h-3" />
                              <span className="font-medium">{symptom.symptomName}</span>
                              <span className="text-xs px-2 py-1 bg-red-200 dark:bg-red-800 rounded">
                                {symptom.symptomType === 'indefinite' && '不定の狂気'}
                                {symptom.symptomType === 'phobia' && '恐怖症'}
                                {symptom.symptomType === 'mania' && '躁病'}
                              </span>
                            </div>
                            {symptom.description && (
                              <div className="text-xs text-red-600 dark:text-red-400 ml-5">
                                {symptom.description}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* メモ */}
                {session.memo && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      メモ・感想
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {session.memo}
                    </p>
                  </div>
                )}

                {/* 参加者 */}
                {session.participants && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">参加者:</span> {session.participants}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* 統計情報 */}
        {sessions.length > 0 && (
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              冒険統計
            </h3>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {sessions.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  セッション数
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {sessions.reduce((sum, s) => sum + s.skillHistories.length, 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  技能成長回数
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {sessions.reduce((sum, s) => sum + Math.abs(
                    s.sanityHistories.reduce((sanSum, h) => sanSum + (h.newValue - h.oldValue), 0)
                  ), 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  総SAN値減少
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {sessions.reduce((sum, s) => sum + s.insanitySymptoms.length, 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  狂気症状数
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}