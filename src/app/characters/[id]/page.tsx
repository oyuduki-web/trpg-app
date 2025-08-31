'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Edit, History, BookOpen, ImageIcon, Shield, TrendingUp, Brain, AlertTriangle, Calendar, User, Trash2, Save, X, FileText } from 'lucide-react'
import { Character } from '@/generated/prisma'
import { getSkillNameJa } from '@/lib/skill-names'
import Navigation from '@/components/Navigation'

interface CharacterWithParsedSkills extends Omit<Character, 'skills'> {
  skills: Record<string, number>
  images?: Array<{
    id: string
    filePath: string
    imageName: string | null
    createdAt: Date
  }>
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
  const router = useRouter()
  const characterId = params.id as string
  const [character, setCharacter] = useState<CharacterWithParsedSkills | null>(null)
  const [sessions, setSessions] = useState<SessionHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview')
  const [historyFilter, setHistoryFilter] = useState<'all' | 'skills' | 'sanity'>('all')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null)
  const [isDeletingSession, setIsDeletingSession] = useState(false)
  const [isEditingMemo, setIsEditingMemo] = useState(false)
  const [memoText, setMemoText] = useState('')
  const [isSavingMemo, setIsSavingMemo] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

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
        setMemoText(characterData.memo || '')
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

  const handleDeleteCharacter = async () => {
    if (!character) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/characters/${characterId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // 削除成功時はトップページに戻る
        router.push('/')
      } else {
        console.error('キャラクター削除に失敗しました')
        alert('キャラクターの削除に失敗しました')
      }
    } catch (error) {
      console.error('削除エラー:', error)
      alert('キャラクターの削除に失敗しました')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    setIsDeletingSession(true)
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // セッション一覧から削除されたセッションを除外
        setSessions(prev => prev.filter(session => session.id !== sessionId))
        setSessionToDelete(null)
      } else {
        console.error('セッション削除に失敗しました')
        alert('セッションの削除に失敗しました')
      }
    } catch (error) {
      console.error('セッション削除エラー:', error)
      alert('セッションの削除に失敗しました')
    } finally {
      setIsDeletingSession(false)
    }
  }

  const handleSaveMemo = async () => {
    if (!character) return

    setIsSavingMemo(true)
    try {
      const response = await fetch(`/api/characters/${characterId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...character,
          memo: memoText,
        }),
      })

      if (response.ok) {
        const updatedCharacter = await response.json()
        updatedCharacter.skills = JSON.parse(updatedCharacter.skills)
        setCharacter(updatedCharacter)
        setIsEditingMemo(false)
      } else {
        console.error('メモの保存に失敗しました')
        alert('メモの保存に失敗しました')
      }
    } catch (error) {
      console.error('メモ保存エラー:', error)
      alert('メモの保存に失敗しました')
    } finally {
      setIsSavingMemo(false)
    }
  }

  const handleStatusToggle = async () => {
    if (!character) return

    setIsUpdatingStatus(true)
    try {
      const response = await fetch(`/api/characters/${characterId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...character,
          isLost: !character.isLost,
        }),
      })

      if (response.ok) {
        const updatedCharacter = await response.json()
        updatedCharacter.skills = JSON.parse(updatedCharacter.skills)
        setCharacter(updatedCharacter)
      } else {
        console.error('ステータスの更新に失敗しました')
        alert('ステータスの更新に失敗しました')
      }
    } catch (error) {
      console.error('ステータス更新エラー:', error)
      alert('ステータスの更新に失敗しました')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleCancelMemo = () => {
    setMemoText(character?.memo || '')
    setIsEditingMemo(false)
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
      <Navigation 
        title={character.name}
        backHref="/"
      />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* ヘッダー（立ち絵付き） */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-start gap-6">
            {/* 立ち絵表示 */}
            {character.images && character.images.length > 0 ? (
              <div className="flex-shrink-0">
                <div className="w-48 h-64 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
                  <Image
                    src={character.images?.[0]?.filePath || ''}
                    alt={`${character.name}の立ち絵`}
                    width={192}
                    height={256}
                    className="object-cover"
                    onError={() => {
                      // 画像読み込みエラー時の処理
                      console.log('画像の読み込みに失敗しました:', character.images?.[0]?.filePath)
                    }}
                  />
                </div>
                {character.images?.[0]?.imageName && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                    {character.images?.[0]?.imageName}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex-shrink-0">
                <div className="w-48 h-64 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <User className="w-16 h-16 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                  立ち絵なし
                </p>
              </div>
            )}
            
            {/* キャラクター情報 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                    {character.name}
                  </h1>
                  <div className="space-y-1 text-gray-600 dark:text-gray-300">
                    {character.occupation && (
                      <p className="text-lg">{character.occupation}</p>
                    )}
                    <div className="flex gap-4 text-sm">
                      {character.age && <span>年齢: {character.age}歳</span>}
                      {character.gender && <span>性別: {character.gender}</span>}
                    </div>
                    <div className="flex gap-4 text-sm">
                      {character.birthplace && <span>出身: {character.birthplace}</span>}
                      {character.residence && <span>現住所: {character.residence}</span>}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 重要ステータス */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-lg font-semibold text-gray-800 dark:text-white">
                    {character.hp}/{character.maxHp}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">HP</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-lg font-semibold text-gray-800 dark:text-white">
                    {character.mp}/{character.maxMp}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">MP</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-lg font-semibold text-gray-800 dark:text-white">
                    {character.san}/{character.maxSan}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">SAN値</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex items-center justify-between mb-8">
          <div></div>
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
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              削除
            </button>
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
                通過履歴
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
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">ステータス:</span>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    character.isLost 
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {character.isLost ? 'ロスト' : 'ロスト以外'}
                  </span>
                  <button
                    onClick={handleStatusToggle}
                    disabled={isUpdatingStatus}
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isUpdatingStatus ? '更新中...' : '切替'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 能力値 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              能力値
            </h2>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
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
                <div className="text-sm text-gray-600 dark:text-gray-300">幸運</div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">{character.luck}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-300">知識</div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">{character.edu * 5}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-300">アイデア</div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">{character.int * 5}</div>
              </div>
            </div>
          </div>

          {/* 副能力値 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              副能力値
            </h2>
            <div className="grid grid-cols-3 gap-4">
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
          
          {/* メモ欄 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5" />
                メモ
              </h2>
              {!isEditingMemo && (
                <button
                  onClick={() => setIsEditingMemo(true)}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-3 h-3" />
                  編集
                </button>
              )}
            </div>
            
            {isEditingMemo ? (
              <div className="space-y-4">
                <textarea
                  value={memoText}
                  onChange={(e) => setMemoText(e.target.value)}
                  placeholder="キャラクターについてのメモを入力してください..."
                  className="w-full h-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={handleCancelMemo}
                    disabled={isSavingMemo}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    キャンセル
                  </button>
                  <button
                    onClick={handleSaveMemo}
                    disabled={isSavingMemo}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSavingMemo ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        保存中...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        保存
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="min-h-[120px] p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                {character.memo ? (
                  <p className="text-gray-800 dark:text-white whitespace-pre-wrap">
                    {character.memo}
                  </p>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    メモがありません。「編集」ボタンからメモを追加できます。
                  </p>
                )}
              </div>
            )}
          </div>
          </div>
        )}

        {/* 通過履歴タブ */}
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
                  まだ通過履歴がありません
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
                      <div className="flex-1">
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
                      
                      {/* 削除ボタン */}
                      <button
                        onClick={() => setSessionToDelete(session.id)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="このセッション記録を削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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

      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  キャラクターを削除
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  この操作は取り消せません
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                <span className="font-semibold">{character.name}</span> を削除してもよろしいですか？
              </p>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>• すべてのセッション履歴</p>
                <p>• 技能成長・SAN値変動履歴</p>
                <p>• 狂気症状履歴</p>
                <p>• アップロードした立ち絵</p>
                <p className="mt-2 text-red-600 dark:text-red-400 font-medium">
                  これらのデータはすべて完全に削除されます。
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleDeleteCharacter}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    削除中...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    削除する
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* セッション削除確認ダイアログ */}
      {sessionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  セッション記録を削除
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  この操作は取り消せません
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              {(() => {
                const session = sessions.find(s => s.id === sessionToDelete)
                return session ? (
                  <div>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      <span className="font-semibold">{session.scenario.title}</span> のセッション記録を削除してもよろしいですか？
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      プレイ日: {new Date(session.playDate).toLocaleDateString('ja-JP')}
                    </p>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                      <p className="text-red-600 dark:text-red-400 font-medium">
                        以下のデータが削除されます：
                      </p>
                      <p>• 技能成長記録</p>
                      <p>• SAN値変動記録</p>
                      <p>• 狂気症状記録</p>
                      <p>• セッションメモ</p>
                    </div>
                  </div>
                ) : null
              })()}
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setSessionToDelete(null)}
                disabled={isDeletingSession}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                onClick={() => handleDeleteSession(sessionToDelete)}
                disabled={isDeletingSession}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeletingSession ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    削除中...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    削除する
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}