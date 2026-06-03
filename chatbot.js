let apiKey = "";
const history = [];

function saveKey() {
  const input = document.getElementById("api-key-input");
  apiKey = input.value.trim();
  if (apiKey) {
    input.value = "";
    document.getElementById("api-key-bar").style.display = "none";
    addMessage("API key saved! How can I help you?", "bot");
  }
}

function addMessage(text, sender) {
  const chatBox = document.getElementById("chat-box");
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}

async function getBotReply(userText) {
  history.push({ role: "user", parts: [{ text: userText }] });

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: history }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "API error");
  }

  const data = await res.json();
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
  history.push({ role: "model", parts: [{ text: reply }] });
  return reply;
}

async function sendMessage() {
  if (!apiKey) return addMessage("Please enter your Gemini API key first.", "bot");

  const input = document.getElementById("user-input");
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";
  input.disabled = true;

  const thinking = addMessage("Thinking...", "bot");

  try {
    const reply = await getBotReply(text);
    thinking.textContent = reply;
  } catch (e) {
    thinking.textContent = `Error: ${e.message}`;
  } finally {
    input.disabled = false;
    input.focus();
  }
}

document.getElementById("user-input").addEventListener("keydown", e => {
  if (e.key === "Enter") sendMessage();
});

document.getElementById("api-key-input").addEventListener("keydown", e => {
  if (e.key === "Enter") saveKey();
});
