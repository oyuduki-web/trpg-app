import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: characterId } = await params
    const body = await request.json()
    
    const {
      scenarioTitle,
      kpName,
      playDate,
      participants,
      memo,
      skillGrowth,
      sanityLoss,
      insanitySymptoms
    } = body

    // トランザクション内で全ての処理を実行
    const result = await prisma.$transaction(async (prisma) => {
      // 1. シナリオを作成または取得
      let scenario = await prisma.scenario.findFirst({
        where: { title: scenarioTitle }
      })
      
      if (!scenario) {
        scenario = await prisma.scenario.create({
          data: {
            title: scenarioTitle,
            author: kpName || undefined,
          }
        })
      }

      // 2. セッションを作成
      const session = await prisma.session.create({
        data: {
          characterId,
          scenarioId: scenario.id,
          kpName: kpName || undefined,
          playDate: new Date(playDate),
          participants: participants || undefined,
          memo: memo || undefined,
        }
      })

      // 3. 現在のキャラクター情報を取得
      const character = await prisma.character.findUnique({
        where: { id: characterId }
      })

      if (!character) {
        throw new Error('キャラクターが見つかりません')
      }

      const currentSkills = JSON.parse(character.skills)
      const updatedSkills = { ...currentSkills }

      // 4. 技能成長の履歴を記録し、キャラクターの技能値を更新
      for (const growth of skillGrowth) {
        await prisma.skillHistory.create({
          data: {
            characterId,
            sessionId: session.id,
            skillName: growth.skillName,
            oldValue: growth.oldValue,
            newValue: growth.newValue,
            reason: `${scenarioTitle}での成長`,
          }
        })
        
        // 技能値を更新
        updatedSkills[growth.skillName] = growth.newValue
      }

      // 5. SAN値変動の履歴を記録し、キャラクターのSAN値を更新
      let newSanValue = character.san
      if (sanityLoss > 0) {
        newSanValue = Math.max(0, character.san - sanityLoss)
        
        await prisma.sanityHistory.create({
          data: {
            characterId,
            sessionId: session.id,
            oldValue: character.san,
            newValue: newSanValue,
            reason: `${scenarioTitle}でのSAN値減少`,
          }
        })
      }

      // 6. 狂気症状を記録
      for (const symptom of insanitySymptoms) {
        if (symptom.name.trim()) {
          await prisma.insanitySymptom.create({
            data: {
              characterId,
              sessionId: session.id,
              symptomType: symptom.type,
              symptomName: symptom.name,
              description: symptom.description || undefined,
            }
          })
        }
      }

      // 7. キャラクター情報を更新
      const updatedCharacter = await prisma.character.update({
        where: { id: characterId },
        data: {
          skills: JSON.stringify(updatedSkills),
          san: newSanValue,
        }
      })

      return {
        session,
        scenario,
        updatedCharacter,
        skillGrowthCount: skillGrowth.length,
        sanityLoss,
        insanityCount: insanitySymptoms.filter((s: { name: string }) => s.name.trim()).length
      }
    })

    return NextResponse.json({
      success: true,
      message: 'セッション記録が保存されました',
      data: result
    })

  } catch (error) {
    console.error('セッション保存エラー:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'セッション記録の保存に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: characterId } = await params

    const sessions = await prisma.session.findMany({
      where: { characterId },
      include: {
        scenario: true,
        skillHistories: true,
        sanityHistories: true,
        insanitySymptoms: true,
      },
      orderBy: {
        playDate: 'desc'
      }
    })

    return NextResponse.json(sessions)

  } catch (error) {
    console.error('セッション取得エラー:', error)
    return NextResponse.json(
      { error: 'セッション履歴の取得に失敗しました' },
      { status: 500 }
    )
  }
}