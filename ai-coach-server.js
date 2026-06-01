const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 8787);
const model = process.env.OPENAI_MODEL || "gpt-5.4-mini";

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (req.method === "GET" && url.pathname === "/health") {
      send(res, 200, JSON.stringify({ ok: true }), "application/json; charset=utf-8");
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/coach") {
      await handleCoach(req, res);
      return;
    }

    if (req.method !== "GET") {
      send(res, 405, "Method not allowed", "text/plain; charset=utf-8");
      return;
    }

    const safePath = path.normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
    const filePath = path.join(root, safePath === "/" ? "todo-checklist-app.html" : safePath);
    if (!filePath.startsWith(root)) {
      send(res, 403, "Forbidden", "text/plain; charset=utf-8");
      return;
    }

    fs.readFile(filePath, (error, body) => {
      if (error) {
        send(res, 404, "Not found", "text/plain; charset=utf-8");
        return;
      }
      const isServiceWorker = path.basename(filePath) === "service-worker.js";
      send(res, 200, body, types[path.extname(filePath)] || "application/octet-stream", isServiceWorker ? "no-store" : undefined);
    });
  } catch (error) {
    send(res, 500, JSON.stringify({ error: "server_error" }), "application/json; charset=utf-8");
  }
});

async function handleCoach(req, res) {
  if (!process.env.OPENAI_API_KEY) {
    send(res, 503, JSON.stringify({ error: "missing_openai_api_key" }), "application/json; charset=utf-8");
    return;
  }

  const snapshot = await readJson(req);
  const toneInstruction = {
    gentle: "Tone: gentle, encouraging, calm. Avoid pressure.",
    realistic: "Tone: realistic, clear, practical. Be direct but not harsh.",
    strict: "Tone: strict and urgent. Push the user firmly, but do not insult them.",
  }[snapshot.tone] || "Tone: realistic, clear, practical.";

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content: `You are a concise Korean productivity coach. Give one practical, humane sentence based on today's task progress. Avoid generic praise. Keep it under 90 Korean characters. ${toneInstruction}`,
        },
        {
          role: "user",
          content: JSON.stringify(snapshot),
        },
      ],
      max_output_tokens: 180,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    send(res, response.status, JSON.stringify({ error: "openai_error", detail: data.error?.message || data }), "application/json; charset=utf-8");
    return;
  }

  send(res, 200, JSON.stringify({ message: extractText(data) }), "application/json; charset=utf-8");
}

function extractText(data) {
  if (data.output_text) return data.output_text;
  return (data.output || [])
    .flatMap((item) => item.content || [])
    .map((content) => content.text || "")
    .join("")
    .trim();
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 100_000) {
        req.destroy();
        reject(new Error("payload_too_large"));
      }
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function send(res, status, body, type, cacheControl) {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": cacheControl || (type.startsWith("text/html") ? "no-store" : "public, max-age=60"),
  });
  res.end(body);
}

server.listen(port, "0.0.0.0", () => {
  console.log(`Checklist AI coach server listening on port ${port}`);
});
