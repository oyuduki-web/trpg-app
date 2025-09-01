'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
  imagePath: string | null
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
        console.log('Fetched characters:', data)
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
                  <option value="active">ロスト以外</option>
                  <option value="inactive">ロスト</option>
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

          <div className="p-6">
            {isLoading ? (
              <p className="text-gray-600 dark:text-gray-300 text-center">読み込み中...</p>
            ) : characters.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-300 text-center py-8">
                キャラクターがありません。新規作成またはインポートしてください。
              </p>
            ) : filteredCharacters.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-300 text-center py-8">
                検索条件に該当するキャラクターがありません。
              </p>
            ) : (
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {filteredCharacters.map((character) => (
                  <Link
                    key={character.id}
                    href={`/characters/${character.id}`}
                    className="group flex flex-col items-center"
                  >
                    <div className="relative transition-transform group-hover:scale-105 aspect-square w-full max-w-32">
                      {/* ステータス表示 */}
                      <div className="absolute top-2 right-2 z-10">
                        <div className={`w-4 h-4 rounded-full border-2 border-white shadow-lg ${
                          character.status === 'active' ? 'bg-green-500' :
                          character.status === 'inactive' ? 'bg-red-500' :
                          'bg-gray-400'
                        }`} title={
                          character.status === 'active' ? 'ロスト以外' :
                          character.status === 'inactive' ? 'ロスト' :
                          '新規 (未プレイ)'
                        } />
                      </div>
                      
                      {/* キャラクター画像 */}
                      <div className="w-full h-full relative rounded-full overflow-hidden">
                        {character.imagePath ? (
                          <Image
                            src={character.imagePath}
                            alt={character.name}
                            fill
                            className="object-cover object-top"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700">
                            <span className="text-4xl text-gray-400 dark:text-gray-500">👤</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* キャラクター名 */}
                    <div className="mt-2 text-center">
                      <div className="font-semibold text-sm text-gray-900 dark:text-white truncate max-w-32">
                        {character.name}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
