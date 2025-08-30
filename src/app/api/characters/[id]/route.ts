import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const character = await prisma.character.findUnique({
      where: {
        id,
      },
      include: {
        images: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    if (!character) {
      return NextResponse.json(
        { error: 'キャラクターが見つかりません' },
        { status: 404 }
      )
    }

    return NextResponse.json(character)
  } catch (error) {
    console.error('キャラクター取得エラー:', error)
    return NextResponse.json(
      { error: 'キャラクターの取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const character = await prisma.character.update({
      where: {
        id,
      },
      data: {
        name: body.name,
        occupation: body.occupation,
        age: body.age,
        gender: body.gender,
        birthplace: body.birthplace,
        residence: body.residence,
        str: body.str,
        con: body.con,
        pow: body.pow,
        dex: body.dex,
        app: body.app,
        siz: body.siz,
        int: body.int,
        edu: body.edu,
        luck: body.luck,
        hp: body.hp,
        maxHp: body.maxHp,
        mp: body.mp,
        maxMp: body.maxMp,
        san: body.san,
        maxSan: body.maxSan,
        mov: body.mov,
        build: body.build,
        skills: JSON.stringify(body.skills),
      },
    })

    return NextResponse.json(character)
  } catch (error) {
    console.error('キャラクター更新エラー:', error)
    return NextResponse.json(
      { error: 'キャラクターの更新に失敗しました' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.character.delete({
      where: {
        id,
      },
    })

    return NextResponse.json({ message: 'キャラクターが削除されました' })
  } catch (error) {
    console.error('キャラクター削除エラー:', error)
    return NextResponse.json(
      { error: 'キャラクターの削除に失敗しました' },
      { status: 500 }
    )
  }
}