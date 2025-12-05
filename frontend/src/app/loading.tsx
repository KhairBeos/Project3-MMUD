export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-6">
      <div className="flex flex-col items-center gap-4 text-white">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
        <p className="mt-2 text-sm font-medium opacity-90">Đang tải ...</p>
      </div>
    </div>
  )
}