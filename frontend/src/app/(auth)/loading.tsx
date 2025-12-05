export default function AuthLoading() {
  return (
    <div className="flex flex-col items-center gap-4 text-white">
      <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white" />
      <p className="text-sm font-medium opacity-90">Đang tải ...</p>
    </div>
  );
}
