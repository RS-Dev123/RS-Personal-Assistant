const chatArea = document.getElementById("chatArea");
const userInput = document.getElementById("userInput");
const chatList = document.getElementById("chatList");

/* ---------- STORAGE ---------- */
let chats = JSON.parse(localStorage.getItem("chats") || "[]");
let currentChat = chats[0] || createChat();

/* ---------- SAVE ---------- */
function saveChats() {
  localStorage.setItem("chats", JSON.stringify(chats));
}

/* ---------- CREATE ---------- */
function createChat() {
  const chat = { id: Date.now(), messages: [] };
  chats.unshift(chat);
  saveChats();
  return chat;
}

function newChat() {
  currentChat = createChat();
  renderSidebar();
  renderChat();
}

/* ---------- SIDEBAR ---------- */
function renderSidebar() {
  chatList.innerHTML = "";
  chats.forEach(chat => {
    const div = document.createElement("div");
    div.textContent = "Chat " + chat.id.toString().slice(-4);
    if (chat === currentChat) div.classList.add("active");

    div.onclick = () => {
      currentChat = chat;
      renderChat();
      renderSidebar();
    };

    div.oncontextmenu = e => {
      e.preventDefault();
      if (confirm("Delete this chat?")) {
        chats = chats.filter(c => c !== chat);
        currentChat = chats[0] || createChat();
        saveChats();
        renderSidebar();
        renderChat();
      }
    };

    chatList.appendChild(div);
  });
}

/* ---------- RENDER ---------- */
function renderChat() {
  chatArea.innerHTML = "";
  if (!currentChat.messages.length) {
    chatArea.innerHTML = `
      <div class="welcome">
        <h1>Ask anything</h1>
        <p>Your personal AI assistant is ready.</p>
      </div>`;
    return;
  }
  currentChat.messages.forEach(m => renderMessage(m));
}

function renderMessage(msg) {
  const div = document.createElement("div");
  div.className = `message ${msg.role}`;
  if (msg.type === "image") {
    div.innerHTML = `<img src="${msg.url}">`;
  } else {
    div.innerHTML = marked.parse(msg.text);
  }
  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
}

/* ---------- SEND TEXT ---------- */
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  document.querySelector(".welcome")?.remove();
  userInput.value = "";

  currentChat.messages.push({ role: "user", text });
  renderMessage({ role: "user", text });

  const res = await fetch("http://127.0.0.1:8000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text })
  });

  const data = await res.json();
  currentChat.messages.push({ role: "bot", text: data.reply });
  renderMessage({ role: "bot", text: data.reply });

  saveChats();
}

/* ---------- IMAGE ---------- */
async function generateImage() {
  const prompt = userInput.value.trim();
  if (!prompt) return;

  document.querySelector(".welcome")?.remove();
  userInput.value = "";

  currentChat.messages.push({ role: "user", text: prompt });
  renderMessage({ role: "user", text: prompt });

  const res = await fetch("http://127.0.0.1:8000/generate-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });

  const data = await res.json();
  currentChat.messages.push({
    role: "bot",
    type: "image",
    url: data.image_url
  });
  renderMessage({
    role: "bot",
    type: "image",
    url: data.image_url
  });

  saveChats();
}

/* ---------- ENTER KEY ---------- */
userInput.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

/* ---------- INIT ---------- */
renderSidebar();
renderChat();
