const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export async function chatbotAsk({
  userMessage,
  culturalItem,
  chatHistory,
}: {
  userMessage: string;
  culturalItem?: any;
  chatHistory?: { role: "user" | "bot"; message: string }[];
}) {
  const res = await fetch(`${BASE_URL}/chatbot/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_message: userMessage,
      cultural_item: culturalItem,
      chat_history: chatHistory,
    }),
  });
  if (!res.ok) throw new Error("Failed to fetch response");
  const data = await res.json();
  return data.response;
}

export async function chatbotAutoGreet(culturalItem?: any) {
  const res = await fetch(`${BASE_URL}/chatbot/auto-greet`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(culturalItem || {}),
  });
  if (!res.ok) throw new Error("Failed to fetch greeting");
  const data = await res.json();
  return data.response;
}
