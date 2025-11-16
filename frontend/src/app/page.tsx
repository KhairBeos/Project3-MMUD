import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="text-center text-white space-y-8 p-8">
        <h1 className="text-6xl font-bold mb-4">🔐 SecureChat</h1>
        <p className="text-xl mb-8">End-to-End Encrypted Messaging Platform</p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition"
          >
            Register
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="p-6 bg-white/10 backdrop-blur-sm rounded-lg">
            <div className="text-4xl mb-2">🔒</div>
            <h3 className="font-semibold mb-2">End-to-End Encryption</h3>
            <p className="text-sm">
              Your messages are encrypted on your device
            </p>
          </div>

          <div className="p-6 bg-white/10 backdrop-blur-sm rounded-lg">
            <div className="text-4xl mb-2">📞</div>
            <h3 className="font-semibold mb-2">Voice & Video Calls</h3>
            <p className="text-sm">Secure audio and video communication</p>
          </div>

          <div className="p-6 bg-white/10 backdrop-blur-sm rounded-lg">
            <div className="text-4xl mb-2">👥</div>
            <h3 className="font-semibold mb-2">Group Chats</h3>
            <p className="text-sm">Create encrypted group conversations</p>
          </div>
        </div>
      </div>
    </div>
  );
}
