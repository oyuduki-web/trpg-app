'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Users, BookOpen } from 'lucide-react'

interface Character {
  id: string
  name: string
  occupation?: string
  createdAt: string
}

export default function Home() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCharacters()
  }, [])

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
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                キャラクター一覧
              </h2>
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <p className="text-gray-600 dark:text-gray-300">読み込み中...</p>
            ) : characters.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-300 text-center py-8">
                キャラクターがありません。新規作成またはインポートしてください。
              </p>
            ) : (
              <div className="space-y-4">
                {characters.map((character) => (
                  <Link
                    key={character.id}
                    href={`/characters/${character.id}`}
                    className="block p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white">
                          {character.name}
                        </h3>
                        {character.occupation && (
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {character.occupation}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        作成日: {new Date(character.createdAt).toLocaleDateString('ja-JP')}
                      </p>
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
