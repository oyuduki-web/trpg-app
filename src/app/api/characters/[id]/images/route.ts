import { NextResponse } from 'next/server'
import { put, del } from '@vercel/blob'
import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: characterId } = await params

    const images = await prisma.characterImage.findMany({
      where: { characterId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(images)

  } catch (error) {
    console.error('画像取得エラー:', error)
    return NextResponse.json(
      { error: '画像の取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: characterId } = await params
    
    // 現在の画像数をチェック
    const imageCount = await prisma.characterImage.count({
      where: { characterId }
    })

    if (imageCount >= 5) {
      return NextResponse.json(
        { error: '画像は最大5枚まで登録できます' },
        { status: 400 }
      )
    }

    const formData = await request.formData()
    const image = formData.get('image') as File

    if (!image) {
      return NextResponse.json(
        { error: '画像ファイルが見つかりません' },
        { status: 400 }
      )
    }

    // ファイルタイプをチェック
    if (!image.type.startsWith('image/')) {
      return NextResponse.json(
        { error: '画像ファイルのみアップロード可能です' },
        { status: 400 }
      )
    }

    // ファイルサイズをチェック (5MB制限)
    if (image.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'ファイルサイズは5MB以下にしてください' },
        { status: 400 }
      )
    }

    // ファイル名を生成
    const fileExtension = image.name.split('.').pop() || 'jpg'
    const filename = `characters/${characterId}/${uuidv4()}.${fileExtension}`
    
    // Vercel Blobにアップロード
    const blob = await put(filename, image, {
      access: 'public',
    })

    // データベースに記録
    const characterImage = await prisma.characterImage.create({
      data: {
        characterId,
        filename: blob.pathname,
        originalName: image.name,
        filePath: blob.url,
        fileSize: image.size,
        mimeType: image.type,
      }
    })

    return NextResponse.json(characterImage)

  } catch (error) {
    console.error('画像アップロードエラー:', error)
    return NextResponse.json(
      { error: '画像のアップロードに失敗しました' },
      { status: 500 }
    )
  }
}