'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            エラーが発生しました
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            申し訳ございません。予期しないエラーが発生しました。
          </p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            再試行
          </button>
        </div>
      </div>
    </div>
  )
}