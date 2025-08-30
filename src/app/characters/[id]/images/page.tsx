'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Upload, Plus, Trash2, Edit2, Save, X } from 'lucide-react'

interface CharacterImage {
  id: string
  filename: string
  originalName: string
  imageName: string | null
  filePath: string
  createdAt: string
}

interface Character {
  id: string
  name: string
}

export default function CharacterImagesPage() {
  const params = useParams()
  const characterId = params.id as string
  
  const [character, setCharacter] = useState<Character | null>(null)
  const [images, setImages] = useState<CharacterImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [editingImageId, setEditingImageId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)

  useEffect(() => {
    fetchData()
  }, [characterId])

  const fetchData = async () => {
    try {
      const [characterResponse, imagesResponse] = await Promise.all([
        fetch(`/api/characters/${characterId}`),
        fetch(`/api/characters/${characterId}/images`)
      ])

      if (characterResponse.ok && imagesResponse.ok) {
        const characterData = await characterResponse.json()
        const imagesData = await imagesResponse.json()
        setCharacter(characterData)
        setImages(imagesData)
      }
    } catch (error) {
      console.error('データ取得エラー:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = async (files: FileList) => {
    if (images.length >= 5) {
      alert('画像は最大5枚まで登録できます')
      return
    }

    const remainingSlots = 5 - images.length
    const filesToUpload = Array.from(files).slice(0, remainingSlots)

    for (const file of filesToUpload) {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} は画像ファイルではありません`)
        continue
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB制限
        alert(`${file.name} は5MBを超えています`)
        continue
      }

      await uploadFile(file)
    }
  }

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch(`/api/characters/${characterId}/images`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const newImage = await response.json()
        setImages(prev => [...prev, newImage])
      } else {
        alert('画像のアップロードに失敗しました')
      }
    } catch (error) {
      console.error('アップロードエラー:', error)
      alert('画像のアップロードに失敗しました')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('この画像を削除しますか？')) return

    try {
      const response = await fetch(`/api/characters/${characterId}/images/${imageId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setImages(prev => prev.filter(img => img.id !== imageId))
      } else {
        alert('画像の削除に失敗しました')
      }
    } catch (error) {
      console.error('削除エラー:', error)
      alert('画像の削除に失敗しました')
    }
  }

  const handleEditName = (imageId: string, currentName: string | null) => {
    setEditingImageId(imageId)
    setEditingName(currentName || '')
  }

  const handleSaveName = async () => {
    if (!editingImageId) return

    try {
      const response = await fetch(`/api/characters/${characterId}/images/${editingImageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageName: editingName.trim() || null,
        }),
      })

      if (response.ok) {
        setImages(prev => prev.map(img => 
          img.id === editingImageId 
            ? { ...img, imageName: editingName.trim() || null }
            : img
        ))
        setEditingImageId(null)
        setEditingName('')
      } else {
        alert('名前の更新に失敗しました')
      }
    } catch (error) {
      console.error('更新エラー:', error)
      alert('名前の更新に失敗しました')
    }
  }

  const handleCancelEdit = () => {
    setEditingImageId(null)
    setEditingName('')
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
                立ち絵管理
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {character.name} の画像 ({images.length}/5)
              </p>
            </div>
          </div>
        </div>

        {/* アップロードエリア */}
        {images.length < 5 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              画像をアップロード
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
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                画像ファイルをドラッグ＆ドロップ
                <br />
                または
              </p>
              <label className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">
                <Plus className="w-4 h-4" />
                ファイルを選択
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileInput}
                  disabled={isUploading}
                />
              </label>
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                <p>対応形式: JPG, PNG, GIF</p>
                <p>最大サイズ: 5MB</p>
                <p>最大登録数: 5枚</p>
              </div>
            </div>
          </div>
        )}

        {/* 画像一覧 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            登録済み画像
          </h2>
          
          {images.length === 0 ? (
            <div className="text-center py-12">
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                画像がありません
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                上記のエリアから画像をアップロードしてください
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {images.map((image) => (
                <div key={image.id} className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                  <div className="aspect-square relative">
                    <Image
                      src={image.filePath}
                      alt={image.imageName || image.originalName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="p-4">
                    {editingImageId === image.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          placeholder="画像の名前（例: 通常、狂気時、正装）"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveName}
                            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                          >
                            <Save className="w-3 h-3" />
                            保存
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex items-center gap-1 px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 text-sm"
                          >
                            <X className="w-3 h-3" />
                            キャンセル
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-800 dark:text-white truncate">
                              {image.imageName || '名前未設定'}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {image.originalName}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditName(image.id, image.imageName)}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                          >
                            <Edit2 className="w-3 h-3" />
                            編集
                          </button>
                          <button
                            onClick={() => handleDeleteImage(image.id)}
                            className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                          >
                            <Trash2 className="w-3 h-3" />
                            削除
                          </button>
                        </div>
                        
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {new Date(image.createdAt).toLocaleDateString('ja-JP')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}