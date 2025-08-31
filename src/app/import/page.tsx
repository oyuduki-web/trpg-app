'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react'
import { parseIakyaraText } from '@/lib/iakyara-parser'
import Navigation from '@/components/Navigation'

interface ParsedCharacter {
  name: string
  occupation?: string
  age?: number
  gender?: string
  stats: Record<string, number>
  skills: Record<string, number>
  memo: string
}

export default function ImportPage() {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [parsedCharacter, setParsedCharacter] = useState<ParsedCharacter | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = async (file: File) => {
    if (!file.name.endsWith('.txt')) {
      setError('テキストファイル(.txt)を選択してください')
      return
    }

    setIsUploading(true)
    setError(null)
    setParsedCharacter(null)

    try {
      const text = await file.text()
      setOriginalText(text)
      const parsed = parseIakyaraText(text)
      
      if (!parsed.basicInfo.name) {
        setError('キャラクター名が見つかりません。いあきゃらのテキストファイルか確認してください。')
        return
      }

      setParsedCharacter({
        name: parsed.basicInfo.name,
        occupation: parsed.basicInfo.occupation,
        age: parsed.basicInfo.age,
        gender: parsed.basicInfo.gender,
        stats: parsed.stats,
        skills: parsed.skills,
        memo: parsed.memo
      })
    } catch (err) {
      console.error('ファイル解析エラー:', err)
      setError('ファイルの解析に失敗しました。ファイル形式を確認してください。')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const [originalText, setOriginalText] = useState<string>('')

  const handleImport = async () => {
    if (!parsedCharacter || !originalText) return

    setIsUploading(true)
    try {
      const parsed = parseIakyaraText(originalText)
      
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: parsed.basicInfo.name,
          occupation: parsed.basicInfo.occupation,
          age: parsed.basicInfo.age,
          gender: parsed.basicInfo.gender,
          birthplace: parsed.basicInfo.birthplace || '',
          residence: parsed.basicInfo.residence || '',
          ...parsed.stats,
          ...parsed.derivedStats,
          skills: parsed.skills,
          memo: parsed.memo,
          isLost: false,
        }),
      })

      if (response.ok) {
        const character = await response.json()
        router.push(`/characters/${character.id}`)
      } else {
        setError('キャラクターの保存に失敗しました')
      }
    } catch (err) {
      console.error('インポートエラー:', err)
      setError('インポートに失敗しました')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation 
        title="いあきゃらからインポート"
        backHref="/"
      />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            いあきゃらからインポート
          </h1>
        </div>

        {/* ファイルアップロード */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            テキストファイルをアップロード
          </h2>
          
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragOver(true)
            }}
            onDragLeave={(e) => {
              e.preventDefault()
              setIsDragOver(false)
            }}
          >
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              いあきゃらのテキストファイルをドラッグ＆ドロップ
              <br />
              または
            </p>
            <label className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">
              <Upload className="w-4 h-4" />
              ファイルを選択
              <input
                type="file"
                accept=".txt"
                className="hidden"
                onChange={handleFileInput}
                disabled={isUploading}
              />
            </label>
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* プレビュー */}
        {parsedCharacter && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                インポートプレビュー
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 mb-6">
              {/* 基本情報 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                  基本情報
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">名前:</span>
                    <span className="text-gray-800 dark:text-white font-semibold">
                      {parsedCharacter.name}
                    </span>
                  </div>
                  {parsedCharacter.occupation && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">職業:</span>
                      <span className="text-gray-800 dark:text-white">
                        {parsedCharacter.occupation}
                      </span>
                    </div>
                  )}
                  {parsedCharacter.age && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">年齢:</span>
                      <span className="text-gray-800 dark:text-white">
                        {parsedCharacter.age}
                      </span>
                    </div>
                  )}
                  {parsedCharacter.gender && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">性別:</span>
                      <span className="text-gray-800 dark:text-white">
                        {parsedCharacter.gender}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 能力値プレビュー */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                  能力値
                </h3>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  {Object.entries(parsedCharacter.stats).map(([stat, value]) => (
                    <div key={stat} className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        {stat.toUpperCase()}:
                      </span>
                      <span className="text-gray-800 dark:text-white font-semibold">
                        {value as number}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 技能値の一部を表示 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                主要技能
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                {Object.entries(parsedCharacter.skills)
                  .filter(([_, value]) => (value as number) > 30)
                  .slice(0, 8)
                  .map(([skill, value]) => (
                    <div key={skill} className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300 capitalize">
                        {skill}:
                      </span>
                      <span className="text-gray-800 dark:text-white font-semibold">
                        {value as number}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* メモ表示 */}
            {parsedCharacter.memo && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                  メモ
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4 text-sm">
                  <pre className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {parsedCharacter.memo}
                  </pre>
                </div>
              </div>
            )}

            {/* インポートボタン */}
            <div className="flex gap-4">
              <button
                onClick={handleImport}
                disabled={isUploading}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isUploading ? 'インポート中...' : 'キャラクターをインポート'}
              </button>
              <button
                onClick={() => setParsedCharacter(null)}
                className="px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}

        {/* 使い方説明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
            使い方
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-700 dark:text-blue-300">
            <li>いあきゃらサイトでキャラクターシートを作成</li>
            <li>「テキスト出力」機能でテキストファイルをダウンロード</li>
            <li>ダウンロードしたファイルをこのページにアップロード</li>
            <li>プレビューを確認してインポート実行</li>
          </ol>
        </div>
      </div>
    </div>
  )
}