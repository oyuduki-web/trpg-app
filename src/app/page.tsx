'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Users, BookOpen, Search, Filter, Calendar, AlertTriangle } from 'lucide-react'

interface Character {
  id: string
  name: string
  occupation?: string
  age?: number
  san: number
  maxSan: number
  createdAt: string
  updatedAt: string
  lastPlayDate: string | null
  lastScenario: string | null
  sessionCount: number
  activeSymptoms: number
  status: 'new' | 'active' | 'inactive'
}

export default function Home() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [filteredCharacters, setFilteredCharacters] = useState<Character[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'active' | 'inactive'>('all')
  const [sortBy, setSortBy] = useState<'updated' | 'name' | 'lastPlay' | 'sessions'>('updated')

  useEffect(() => {
    fetchCharacters()
  }, [])

  useEffect(() => {
    let filtered = characters.filter(character => {
      // 検索フィルタ
      const matchesSearch = character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (character.occupation?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
                           (character.lastScenario?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      
      // ステータスフィルタ
      const matchesStatus = statusFilter === 'all' || character.status === statusFilter
      
      return matchesSearch && matchesStatus
    })

    // ソート
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name, 'ja')
        case 'lastPlay':
          const dateA = a.lastPlayDate ? new Date(a.lastPlayDate).getTime() : 0
          const dateB = b.lastPlayDate ? new Date(b.lastPlayDate).getTime() : 0
          return dateB - dateA
        case 'sessions':
          return b.sessionCount - a.sessionCount
        case 'updated':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
    })

    setFilteredCharacters(filtered)
  }, [characters, searchQuery, statusFilter, sortBy])

  const fetchCharacters = async () => {
    try {
      const response = await fetch('/api/characters')
      if (response.ok) {
        const data = await response.json()
        setCharacters(data)
      }
    } catch (error) {
      console.error('キャラクター取得エラー:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            クトゥルフ神話TRPG キャラクター管理
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            キャラクターシートの作成・管理・履歴追跡
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {/* 新規キャラクター作成カード */}
          <Link 
            href="/characters/new"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500"
          >
            <div className="flex flex-col items-center text-center">
              <Plus className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                新規キャラクター作成
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                新しい探索者を作成
              </p>
            </div>
          </Link>

          {/* いあきゃらインポートカード */}
          <Link 
            href="/import"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-green-500"
          >
            <div className="flex flex-col items-center text-center">
              <BookOpen className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                いあきゃらからインポート
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                既存データを取り込み
              </p>
            </div>
          </Link>
        </div>

        {/* キャラクター一覧 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-500" />
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  キャラクター一覧
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({filteredCharacters.length}/{characters.length}体)
                </span>
              </div>
            </div>
            
            {/* 検索・フィルタ */}
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {/* 検索 */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="名前、職業、シナリオで検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              
              {/* ステータスフィルタ */}
              <div className="relative">
                <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
                >
                  <option value="all">全てのステータス</option>
                  <option value="active">アクティブ</option>
                  <option value="inactive">非アクティブ</option>
                  <option value="new">新規</option>
                </select>
              </div>
              
              {/* ソート */}
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="updated">更新日順</option>
                  <option value="name">名前順</option>
                  <option value="lastPlay">最終プレイ順</option>
                  <option value="sessions">セッション数順</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <p className="text-gray-600 dark:text-gray-300 p-6">読み込み中...</p>
            ) : characters.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-300 text-center py-8">
                キャラクターがありません。新規作成またはインポートしてください。
              </p>
            ) : filteredCharacters.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-300 text-center py-8">
                検索条件に該当するキャラクターがありません。
              </p>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      キャラクター
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      SAN値
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      最終プレイ
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      セッション数
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      状態
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredCharacters.map((character) => (
                    <tr key={character.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3">
                        <div className={`w-3 h-3 rounded-full ${
                          character.status === 'active' ? 'bg-green-500' :
                          character.status === 'inactive' ? 'bg-yellow-500' :
                          'bg-gray-400'
                        }`} title={
                          character.status === 'active' ? 'アクティブ (30日以内にプレイ)' :
                          character.status === 'inactive' ? '非アクティブ (30日以上プレイなし)' :
                          '新規 (未プレイ)'
                        } />
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/characters/${character.id}`}
                          className="block hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {character.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {character.occupation}
                            {character.age && ` (${character.age}歳)`}
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {character.san}/{character.maxSan}
                          </span>
                          {character.activeSymptoms > 0 && (
                            <div title={`未回復の狂気症状: ${character.activeSymptoms}個`}>
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {character.lastPlayDate ? (
                          <div>
                            <div className="text-sm text-gray-900 dark:text-white">
                              {new Date(character.lastPlayDate).toLocaleDateString('ja-JP')}
                            </div>
                            {character.lastScenario && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-32">
                                {character.lastScenario}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">未プレイ</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {character.sessionCount}回
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(character.updatedAt).toLocaleDateString('ja-JP')}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
