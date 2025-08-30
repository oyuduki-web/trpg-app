'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Home, ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href: string
}

interface NavigationProps {
  breadcrumbs?: BreadcrumbItem[]
  showBackButton?: boolean
  backHref?: string
  title?: string
}

export default function Navigation({ 
  breadcrumbs, 
  showBackButton = true, 
  backHref,
  title 
}: NavigationProps) {
  const router = useRouter()
  const pathname = usePathname()

  // デフォルトのパンくずナビゲーションを生成
  const defaultBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(segment => segment)
    const crumbs: BreadcrumbItem[] = [{ label: 'ホーム', href: '/' }]
    
    let currentPath = ''
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`
      
      if (segment === 'characters') {
        crumbs.push({ label: 'キャラクター', href: '/characters' })
      } else if (segment === 'new') {
        crumbs.push({ label: '新規作成', href: currentPath })
      } else if (segment === 'import') {
        crumbs.push({ label: 'いあきゃらインポート', href: currentPath })
      } else if (segment === 'session') {
        crumbs.push({ label: 'セッション管理', href: currentPath })
      } else if (segment === 'history') {
        crumbs.push({ label: '履歴', href: currentPath })
      } else if (segment === 'images') {
        crumbs.push({ label: '画像管理', href: currentPath })
      } else if (segment === 'backup') {
        crumbs.push({ label: 'バックアップ', href: currentPath })
      } else if (segments[index - 1] === 'characters' && segment !== 'new') {
        // キャラクターIDの場合、実際のキャラクター名は取得が困難なので汎用名
        crumbs.push({ label: title || 'キャラクター詳細', href: currentPath })
      }
    })
    
    return crumbs
  }

  const finalBreadcrumbs = breadcrumbs || defaultBreadcrumbs()

  const handleBack = () => {
    if (backHref) {
      router.push(backHref)
    } else {
      router.back()
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">戻る</span>
            </button>
          )}

          {/* パンくずナビゲーション */}
          <nav className="flex items-center space-x-2 text-sm">
            {finalBreadcrumbs.map((crumb, index) => (
              <div key={crumb.href} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="w-3 h-3 text-gray-400 mx-1" />
                )}
                {index === finalBreadcrumbs.length - 1 ? (
                  <span className="text-gray-800 dark:text-white font-medium">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                  >
                    {crumb.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}