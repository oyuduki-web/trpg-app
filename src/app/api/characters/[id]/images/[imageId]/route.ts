import { NextResponse } from 'next/server'
import { del } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { imageId } = await params
    const body = await request.json()
    const { imageName } = body

    const updatedImage = await prisma.characterImage.update({
      where: { id: imageId },
      data: {
        imageName: imageName || null,
      }
    })

    return NextResponse.json(updatedImage)

  } catch (error) {
    console.error('画像更新エラー:', error)
    return NextResponse.json(
      { error: '画像の更新に失敗しました' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { imageId } = await params

    // 画像情報を取得
    const image = await prisma.characterImage.findUnique({
      where: { id: imageId }
    })

    if (!image) {
      return NextResponse.json(
        { error: '画像が見つかりません' },
        { status: 404 }
      )
    }

    // Vercel Blobからファイルを削除
    try {
      await del(image.filePath)
    } catch (fileError) {
      console.warn('Blob削除エラー:', fileError)
      // ファイルが既に存在しない場合は続行
    }

    // データベースから削除
    await prisma.characterImage.delete({
      where: { id: imageId }
    })

    return NextResponse.json({ message: '画像が削除されました' })

  } catch (error) {
    console.error('画像削除エラー:', error)
    return NextResponse.json(
      { error: '画像の削除に失敗しました' },
      { status: 500 }
    )
  }
}