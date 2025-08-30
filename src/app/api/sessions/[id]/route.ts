import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // セッションを削除（Cascadeでリレーション先も削除される）
    await prisma.session.delete({
      where: {
        id,
      },
    })

    return NextResponse.json({ message: 'セッションが削除されました' })
  } catch (error) {
    console.error('セッション削除エラー:', error)
    return NextResponse.json(
      { error: 'セッションの削除に失敗しました' },
      { status: 500 }
    )
  }
}