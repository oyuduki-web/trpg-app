import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: characterId } = await params

    // キャラクター情報とすべての関連データを取得
    const character = await prisma.character.findUnique({
      where: { id: characterId },
      include: {
        sessions: {
          include: {
            scenario: true,
            skillHistories: true,
            sanityHistories: true,
            insanitySymptoms: true,
          }
        },
        skillHistories: true,
        sanityHistories: true,
        insanitySymptoms: true,
        images: true,
      }
    })

    if (!character) {
      return NextResponse.json(
        { error: 'キャラクターが見つかりません' },
        { status: 404 }
      )
    }

    // バックアップデータ構造
    const backupData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      character: {
        id: character.id,
        name: character.name,
        occupation: character.occupation,
        age: character.age,
        gender: character.gender,
        birthplace: character.birthplace,
        residence: character.residence,
        
        // 能力値
        stats: {
          str: character.str,
          con: character.con,
          pow: character.pow,
          dex: character.dex,
          app: character.app,
          siz: character.siz,
          int: character.int,
          edu: character.edu,
          luck: character.luck,
        },
        
        // 副能力値
        derivedStats: {
          hp: character.hp,
          maxHp: character.maxHp,
          mp: character.mp,
          maxMp: character.maxMp,
          san: character.san,
          maxSan: character.maxSan,
          mov: character.mov,
          build: character.build,
        },
        
        // 技能値
        skills: JSON.parse(character.skills),
        
        createdAt: character.createdAt,
        updatedAt: character.updatedAt,
      },
      
      // セッション履歴
      sessions: character.sessions.map(session => ({
        id: session.id,
        playDate: session.playDate,
        kpName: session.kpName,
        participants: session.participants,
        memo: session.memo,
        scenario: {
          title: session.scenario.title,
          author: session.scenario.author,
          description: session.scenario.description,
        },
        skillHistories: session.skillHistories.map(history => ({
          skillName: history.skillName,
          oldValue: history.oldValue,
          newValue: history.newValue,
          reason: history.reason,
          createdAt: history.createdAt,
        })),
        sanityHistories: session.sanityHistories.map(history => ({
          oldValue: history.oldValue,
          newValue: history.newValue,
          reason: history.reason,
          createdAt: history.createdAt,
        })),
        insanitySymptoms: session.insanitySymptoms.map(symptom => ({
          symptomType: symptom.symptomType,
          symptomName: symptom.symptomName,
          description: symptom.description,
          isRecovered: symptom.isRecovered,
          recoveredAt: symptom.recoveredAt,
          createdAt: symptom.createdAt,
        })),
        createdAt: session.createdAt,
      })),
      
      // 画像情報（実際のファイルは含まれません）
      images: character.images.map(image => ({
        id: image.id,
        filename: image.filename,
        originalName: image.originalName,
        imageName: image.imageName,
        createdAt: image.createdAt,
      })),
      
      // 統計情報
      statistics: {
        totalSessions: character.sessions.length,
        totalSkillGrowths: character.skillHistories.length,
        totalSanityLoss: character.sanityHistories.reduce(
          (sum, history) => sum + (history.oldValue - history.newValue), 0
        ),
        totalInsanitySymptoms: character.insanitySymptoms.length,
        totalImages: character.images.length,
      }
    }

    return NextResponse.json(backupData)

  } catch (error) {
    console.error('バックアップエラー:', error)
    return NextResponse.json(
      { error: 'バックアップの作成に失敗しました' },
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
    const backupData = await request.json()

    // バックアップデータの検証
    if (!backupData.version || !backupData.character) {
      return NextResponse.json(
        { error: '無効なバックアップデータです' },
        { status: 400 }
      )
    }

    // トランザクション内で復元を実行
    const result = await prisma.$transaction(async (prisma) => {
      // 既存の履歴データを削除
      await prisma.insanitySymptom.deleteMany({
        where: { characterId }
      })
      
      await prisma.sanityHistory.deleteMany({
        where: { characterId }
      })
      
      await prisma.skillHistory.deleteMany({
        where: { characterId }
      })
      
      await prisma.session.deleteMany({
        where: { characterId }
      })

      // キャラクター基本情報を更新
      const updatedCharacter = await prisma.character.update({
        where: { id: characterId },
        data: {
          name: backupData.character.name,
          occupation: backupData.character.occupation,
          age: backupData.character.age,
          gender: backupData.character.gender,
          birthplace: backupData.character.birthplace,
          residence: backupData.character.residence,
          
          str: backupData.character.stats.str,
          con: backupData.character.stats.con,
          pow: backupData.character.stats.pow,
          dex: backupData.character.stats.dex,
          app: backupData.character.stats.app,
          siz: backupData.character.stats.siz,
          int: backupData.character.stats.int,
          edu: backupData.character.stats.edu,
          luck: backupData.character.stats.luck,
          
          hp: backupData.character.derivedStats.hp,
          maxHp: backupData.character.derivedStats.maxHp,
          mp: backupData.character.derivedStats.mp,
          maxMp: backupData.character.derivedStats.maxMp,
          san: backupData.character.derivedStats.san,
          maxSan: backupData.character.derivedStats.maxSan,
          mov: backupData.character.derivedStats.mov,
          build: backupData.character.derivedStats.build,
          
          skills: JSON.stringify(backupData.character.skills),
        }
      })

      // セッション履歴を復元
      if (backupData.sessions && backupData.sessions.length > 0) {
        for (const sessionData of backupData.sessions) {
          // シナリオを作成または取得
          let scenario = await prisma.scenario.findFirst({
            where: { title: sessionData.scenario.title }
          })
          
          if (!scenario) {
            scenario = await prisma.scenario.create({
              data: {
                title: sessionData.scenario.title,
                author: sessionData.scenario.author,
                description: sessionData.scenario.description,
              }
            })
          }

          // セッションを作成
          const session = await prisma.session.create({
            data: {
              characterId,
              scenarioId: scenario.id,
              kpName: sessionData.kpName,
              playDate: new Date(sessionData.playDate),
              participants: sessionData.participants,
              memo: sessionData.memo,
            }
          })

          // 技能成長履歴を復元
          for (const skillHistory of sessionData.skillHistories || []) {
            await prisma.skillHistory.create({
              data: {
                characterId,
                sessionId: session.id,
                skillName: skillHistory.skillName,
                oldValue: skillHistory.oldValue,
                newValue: skillHistory.newValue,
                reason: skillHistory.reason,
              }
            })
          }

          // SAN値変動履歴を復元
          for (const sanityHistory of sessionData.sanityHistories || []) {
            await prisma.sanityHistory.create({
              data: {
                characterId,
                sessionId: session.id,
                oldValue: sanityHistory.oldValue,
                newValue: sanityHistory.newValue,
                reason: sanityHistory.reason,
              }
            })
          }

          // 狂気症状を復元
          for (const symptom of sessionData.insanitySymptoms || []) {
            await prisma.insanitySymptom.create({
              data: {
                characterId,
                sessionId: session.id,
                symptomType: symptom.symptomType,
                symptomName: symptom.symptomName,
                description: symptom.description,
                isRecovered: symptom.isRecovered,
                recoveredAt: symptom.recoveredAt ? new Date(symptom.recoveredAt) : null,
              }
            })
          }
        }
      }

      return updatedCharacter
    })

    return NextResponse.json({
      success: true,
      message: 'バックアップから正常に復元されました',
      character: result
    })

  } catch (error) {
    console.error('復元エラー:', error)
    return NextResponse.json(
      { error: 'バックアップからの復元に失敗しました' },
      { status: 500 }
    )
  }
}