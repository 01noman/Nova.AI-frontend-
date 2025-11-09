
const API_URL = "https://nova-ai-backend-rjf3.onrender.com"; 

const chatContainer = document.getElementById("chatContainer");
const sendBtn = document.getElementById("sendBtn");
const textarea = document.getElementById("ingredients");
const themeToggle = document.getElementById("themeToggle");

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "🌙" : "🌞";
});

sendBtn.addEventListener("click", sendMessage);
textarea.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

function appendMessage(text, sender) {
  const msgContainer = document.createElement("div");
  msgContainer.className = `message-container ${sender}`;

  const msg = document.createElement("div");
  msg.className = `message ${sender} fade-in`;
  msg.textContent = "";
  msgContainer.appendChild(msg);

  if (sender === "ai") {
    const controls = document.createElement("div");
    controls.className = "message-controls";

    const copyBtn = document.createElement("button");
    copyBtn.textContent = "📋 Copy";
    copyBtn.addEventListener("click", () => navigator.clipboard.writeText(text));

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "💾 Save";
    saveBtn.addEventListener("click", () => saveConversation(text));

    const shareBtn = document.createElement("button");
    shareBtn.textContent = "📤 Share";
    shareBtn.addEventListener("click", () => shareRecipe(text));

    controls.appendChild(copyBtn);
    controls.appendChild(saveBtn);
    controls.appendChild(shareBtn);
    msgContainer.appendChild(controls);
  }

  chatContainer.appendChild(msgContainer);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  typeText(msg, text);
}

async function sendMessage() {
  const ingredients = textarea.value.trim();
  if (!ingredients) return;

  appendMessage(ingredients, "user");
  textarea.value = "";

  const typing = document.createElement("div");
  typing.className = "message ai fade-in";
  typing.textContent = "Chef Nova is thinking...";
  chatContainer.appendChild(typing);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredients })
    });
    const text = await res.text();
    typing.remove();
    appendMessage(text, "ai");
  } catch (err) {
    typing.remove();
    appendMessage("❌ Error: " + err.message, "ai");
  }
}

function typeText(element, text) {
  element.textContent = "";
  let i = 0;
  const speed = 15;
  function typing() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      chatContainer.scrollTop = chatContainer.scrollHeight;
      setTimeout(typing, speed);
    }
  }
  typing();
}

function saveConversation(text) {
  let saved = JSON.parse(localStorage.getItem("savedRecipes") || "[]");
  saved.push(text);
  localStorage.setItem("savedRecipes", JSON.stringify(saved));
  alert("Recipe saved!");
}

function shareRecipe(text) {
  const encoded = encodeURIComponent(text);
  const baseUrl = window.location.origin + window.location.pathname;
  const url = `${baseUrl}?recipe=${encoded}`;
  navigator.clipboard.writeText(url);
  alert("Recipe link copied! Anyone opening this link will see it.");
}

window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const sharedRecipe = params.get("recipe");
  if (sharedRecipe) {
    appendMessage(decodeURIComponent(sharedRecipe), "ai");
  }
});
