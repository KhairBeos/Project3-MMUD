"use client";

import { useState } from "react";

const mockMessages = [
  { id: 1, text: "Hey! How are you?", sender: "them", time: "10:30 AM" },
  { id: 2, text: "I am good! How about you?", sender: "me", time: "10:31 AM" },
  {
    id: 3,
    text: "Great! Want to grab coffee later?",
    sender: "them",
    time: "10:32 AM",
  },
  { id: 4, text: "Sure! How about 3pm?", sender: "me", time: "10:33 AM" },
];

export default function ConversationPage({
  params,
}: {
  params: { conversationId: string };
}) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(mockMessages);

  const handleSend = () => {
    if (!message.trim()) return;

    setMessages([
      ...messages,
      {
        id: messages.length + 1,
        text: message,
        sender: "me",
        time: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setMessage("");
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Chat Header */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
            A
          </div>
          <div>
            <h2 className="font-semibold">Alice Johnson</h2>
            <p className="text-sm text-green-600">● Online</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            📞
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            📹
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            ℹ️
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "me" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-md px-4 py-2 rounded-2xl ${
                msg.sender === "me"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-900"
              }`}
            >
              <p>{msg.text}</p>
              <p
                className={`text-xs mt-1 ${
                  msg.sender === "me" ? "text-blue-100" : "text-gray-500"
                }`}
              >
                {msg.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
        <div className="flex gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            📎
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            😊
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
