'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, Upload, RefreshCw, Shield, AlertCircle } from 'lucide-react'

interface Character {
  id: string
  name: string
}

export default function CharacterBackupPage() {
  const params = useParams()
  const characterId = params.id as string
  
  const [character, setCharacter] = useState<Character | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [lastBackup, setLastBackup] = useState<string | null>(null)

  useEffect(() => {
    fetchCharacter()
  }, [characterId])

  const fetchCharacter = async () => {
    try {
      const response = await fetch(`/api/characters/${characterId}`)
      if (response.ok) {
        const data = await response.json()
        setCharacter(data)
      }
    } catch (error) {
      console.error('キャラクター取得エラー:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch(`/api/characters/${characterId}/backup`)
      if (response.ok) {
        const data = await response.json()
        
        // JSONファイルとしてダウンロード
        const blob = new Blob([JSON.stringify(data, null, 2)], { 
          type: 'application/json' 
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${character?.name || 'character'}_backup_${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        setLastBackup(new Date().toISOString())
      } else {
        alert('バックアップの作成に失敗しました')
      }
    } catch (error) {
      console.error('エクスポートエラー:', error)
      alert('バックアップの作成に失敗しました')
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async (file: File) => {
    setIsImporting(true)
    try {
      const text = await file.text()
      const backupData = JSON.parse(text)
      
      // バックアップデータの検証
      if (!backupData.character || !backupData.character.id) {
        alert('無効なバックアップファイルです')
        return
      }
      
      if (backupData.character.id !== characterId) {
        const confirmRestore = confirm(
          `このバックアップは別のキャラクター（${backupData.character.name}）のものです。` +
          '現在のキャラクターに復元しますか？'
        )
        if (!confirmRestore) return
      }

      const response = await fetch(`/api/characters/${characterId}/backup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backupData),
      })

      if (response.ok) {
        alert('バックアップの復元が完了しました')
        window.location.href = `/characters/${characterId}`
      } else {
        const error = await response.json()
        alert(`復元に失敗しました: ${error.error}`)
      }
    } catch (error) {
      console.error('インポートエラー:', error)
      alert('バックアップファイルの読み込みに失敗しました')
    } finally {
      setIsImporting(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.name.endsWith('.json')) {
        alert('JSONファイルを選択してください')
        return
      }
      handleImport(file)
    }
  }

  const handleAutoBackup = async () => {
    // 実装例：定期的な自動バックアップ
    try {
      await handleExport()
      alert('自動バックアップが完了しました')
    } catch (error) {
      console.error('自動バックアップエラー:', error)
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
                バックアップ・復元
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {character.name} のデータ管理
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* エクスポート機能 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                データのエクスポート
              </h2>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              キャラクターの全データ（基本情報、能力値、技能、セッション履歴、画像情報）をJSONファイルとして保存します。
            </p>

            <div className="flex gap-4">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                {isExporting ? 'エクスポート中...' : 'バックアップファイルを作成'}
              </button>
              
              <button
                onClick={handleAutoBackup}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <RefreshCw className="w-4 h-4" />
                自動バックアップ実行
              </button>
            </div>

            {lastBackup && (
              <div className="mt-4 text-sm text-green-600 dark:text-green-400">
                最終バックアップ: {new Date(lastBackup).toLocaleString('ja-JP')}
              </div>
            )}
          </div>

          {/* インポート機能 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <Upload className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                データの復元
              </h2>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
                    注意事項
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    復元を実行すると、現在のキャラクターデータは完全に上書きされます。
                    事前に現在のデータをバックアップすることを強く推奨します。
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  バックアップファイルを選択
                </span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  disabled={isImporting}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200"
                />
              </label>
              
              {isImporting && (
                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  復元中...
                </div>
              )}
            </div>
          </div>

          {/* バックアップ情報 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              バックアップに含まれるデータ
            </h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h3 className="font-medium text-gray-800 dark:text-white">基本データ</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• キャラクター基本情報</li>
                  <li>• 能力値・副能力値</li>
                  <li>• 技能値</li>
                  <li>• 現在のHP・MP・SAN値</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium text-gray-800 dark:text-white">履歴データ</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• セッション記録</li>
                  <li>• 技能成長履歴</li>
                  <li>• SAN値変動履歴</li>
                  <li>• 狂気症状記録</li>
                  <li>• 立ち絵画像情報</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 使い方ガイド */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
              使い方ガイド
            </h3>
            <div className="space-y-3 text-blue-700 dark:text-blue-300">
              <div>
                <h4 className="font-medium">定期バックアップの推奨</h4>
                <p className="text-sm">重要なセッション後や大きな変更を加えた後は、必ずバックアップを作成してください。</p>
              </div>
              <div>
                <h4 className="font-medium">ファイル名の付け方</h4>
                <p className="text-sm">バックアップファイルは「キャラクター名_backup_日付.json」の形式で自動生成されます。</p>
              </div>
              <div>
                <h4 className="font-medium">他の端末での利用</h4>
                <p className="text-sm">バックアップファイルを使って、別の環境でキャラクターデータを復元できます。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}