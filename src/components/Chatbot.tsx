import { useState } from "react";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<
    { sender: "user" | "bot"; text: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    setLoading(true);
    setError(null);

    try {
      // Placeholder request, ganti dengan URL dan payload sesuai kebutuhan
      const res = await fetch("https://your-placeholder-chatbot-api.com/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      if (!res.ok) throw new Error("Failed to fetch response");
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: data.reply || "No response" },
      ]);
    } catch (err) {
      setError("Failed to get response. Please try again." + err);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <>
      {/* Floating Button */}
      <button
        className="fixed z-[1200] right-8 bottom-8 bg-rose-500 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl hover:bg-rose-600 transition"
        aria-label="Open Chatbot"
        onClick={() => setOpen(true)}
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}
      >
        💬
      </button>

      {/* Popup Chatbot */}
      {open && (
        <div className="fixed inset-0 z-[1300] flex items-end justify-end pointer-events-none">
          <div
            className="w-full h-full absolute"
            onClick={() => setOpen(false)}
          />
          <div className="pointer-events-auto">
            <div className="fixed right-8 bottom-28 w-80 h-[500px] bg-white/95 rounded-2xl shadow-2xl border border-rose-100 flex flex-col z-[1400]">
              <div className="p-4 border-b font-bold text-rose-700 text-lg flex justify-between items-center">
                <span>Chatbot</span>
                <button
                  className="text-gray-400 hover:text-rose-600 text-xl"
                  onClick={() => setOpen(false)}
                  aria-label="Close Chatbot"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.length === 0 && (
                  <div className="text-gray-400 text-sm text-center">
                    Ask anything about Indonesian culture or provinces!
                  </div>
                )}
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`rounded-lg px-3 py-2 max-w-[85%] text-sm ${
                      msg.sender === "user"
                        ? "bg-rose-100 ml-auto text-right"
                        : "bg-gray-100 mr-auto text-left"
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
                {loading && (
                  <div className="text-xs text-gray-400">Bot is typing...</div>
                )}
                {error && <div className="text-xs text-red-500">{error}</div>}
              </div>
              <div className="p-3 border-t flex gap-2">
                <input
                  className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
                  type="text"
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                />
                <button
                  className="bg-rose-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-rose-600 disabled:opacity-50"
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
