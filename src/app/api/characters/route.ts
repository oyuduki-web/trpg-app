import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const characters = await prisma.character.findMany({
      select: {
        id: true,
        name: true,
        occupation: true,
        age: true,
        san: true,
        maxSan: true,
        createdAt: true,
        updatedAt: true,
        sessions: {
          select: {
            playDate: true,
            scenario: {
              select: {
                title: true,
              }
            }
          },
          orderBy: {
            playDate: 'desc'
          },
          take: 1
        },
        _count: {
          select: {
            sessions: true,
            insanitySymptoms: {
              where: {
                isRecovered: false
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    // 最終プレイ日と追加情報を含むデータに変換
    const charactersWithLastPlay = characters.map(character => ({
      ...character,
      lastPlayDate: character.sessions[0]?.playDate || null,
      lastScenario: character.sessions[0]?.scenario?.title || null,
      sessionCount: character._count.sessions,
      activeSymptoms: character._count.insanitySymptoms,
      status: character._count.sessions === 0 ? 'new' : 
              (character.sessions[0]?.playDate && 
               new Date(character.sessions[0].playDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) ? 'active' : 'inactive'
    }))

    return NextResponse.json(charactersWithLastPlay)
  } catch (error) {
    console.error('キャラクター取得エラー:', error)
    return NextResponse.json(
      { error: 'キャラクターの取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const character = await prisma.character.create({
      data: {
        name: body.name,
        occupation: body.occupation,
        age: body.age,
        gender: body.gender,
        birthplace: body.birthplace,
        residence: body.residence,
        str: body.str || 0,
        con: body.con || 0,
        pow: body.pow || 0,
        dex: body.dex || 0,
        app: body.app || 0,
        siz: body.siz || 0,
        int: body.int || 0,
        edu: body.edu || 0,
        luck: body.luck || 0,
        hp: body.hp || 0,
        maxHp: body.maxHp || 0,
        mp: body.mp || 0,
        maxMp: body.maxMp || 0,
        san: body.san || 0,
        maxSan: body.maxSan || 0,
        mov: body.mov || 0,
        build: body.build || 0,
        skills: JSON.stringify(body.skills || {}),
      },
    })

    return NextResponse.json(character)
  } catch (error) {
    console.error('キャラクター作成エラー:', error)
    return NextResponse.json(
      { error: 'キャラクターの作成に失敗しました' },
      { status: 500 }
    )
  }
}