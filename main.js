const WebSocket = require("ws");
const dotenv = require("dotenv");
const fs = require("fs");
const http = require("http");

dotenv.config();
const authToken = process.env.AUTH_TOKEN;
const friendsList = JSON.parse(fs.readFileSync("./users/friends.json", "utf8"));

const vrcHeaders = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
};

const vrchatWs = new WebSocket(`wss://pipeline.vrchat.cloud/?authToken=${authToken}`, {
  headers: vrcHeaders,
});

vrchatWs.on("open", () => {
  console.log("✅ VRChat WebSocket connection established.");
});

// ===============================
// Local WebSocket Relay
// ===============================
const wss = new WebSocket.Server({ port: 8787, path: "/stream" });
console.log("🌐 Local WebSocket relay running at ws://localhost:8787/stream");

function broadcast(obj) {
  const data = JSON.stringify(obj);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) client.send(data);
  }
}

function logShort(data) {
  const uid = data?.content?.userId || data?.userId || "(unknown)";
  const name = data?.content?.user?.displayName || data?.user?.displayName || "(no name)";
  const type = data?.type || "(no type)";
  console.log(`[${new Date().toLocaleTimeString()}] ${type}: ${name} (${uid})`);
}

// ===============================
// 🔧 Utility: Safe world補完関数
// ===============================
function normalizePayload(data) {
  if (typeof data.content === "string") {
    try { data.content = JSON.parse(data.content); } catch {}
  }

  // friend-locationなどでworldが欠けている場合
  if (data.type === "friend-location") {
    const c = data.content ?? {};
    if (!c.world && c.worldId === "private") {
      c.world = {
        id: "private",
        name: "(Private World)",
        thumbnailImageUrl: "",
        authorName: "",
        capacity: 0
      };
      data.content = c;
    } else if (!c.world && c.location === "traveling") {
      c.world = {
        id: "traveling",
        name: "(Traveling...)",
        thumbnailImageUrl: "",
        authorName: "",
        capacity: 0
      };
      data.content = c;
    }
  }

  return data;
}

// ===============================
// Message handling
// ===============================
vrchatWs.on("message", (message) => {
  try {
    const raw = message.toString();
    const data = JSON.parse(raw);
    const normalized = normalizePayload(data); // 🧠 ここで補完

    const userId = normalized.content?.userId || normalized.userId;
    if (userId && friendsList.includes(userId)) {
      logShort(normalized);
      broadcast(normalized);
    }
  } catch (err) {
    console.error("Parse error:", err.message);
  }
});

vrchatWs.on("error", (err) => console.error("VRChat WS error:", err));
vrchatWs.on("close", () => console.log("❌ VRChat connection closed."));

// ===============================
// Serve GUI
// ===============================
const htmlPath = "./index.html";
if (fs.existsSync(htmlPath)) {
  const server = http.createServer((req, res) => {
    if (req.url === "/" || req.url === "/index.html") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(fs.readFileSync(htmlPath));
    } else {
      res.writeHead(404);
      res.end("Not found");
    }
  });
  server.listen(8080, () =>
    console.log("🖥️  GUI available at http://localhost:8080/")
  );
} else {
  console.log("⚠️ index.html not found — GUI will not be served locally.");
}
