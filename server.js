const express = require("express");
const http = require("http");
const { WebSocketServer } = require("ws");
const cors = require("cors");

const app = express();
const httpServer = http.createServer(app);
const wss = new WebSocketServer({ server: httpServer });

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Keep only the latest reading per device name
let equipmentMap = {};

function broadcast(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === 1) client.send(msg);
  });
}

// GET - frontend polling
app.get("/data", (req, res) => {
  res.json(Object.values(equipmentMap));
});

// POST - from ESP32
app.post("/data", (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0)
    return res.status(400).json({ status: "error", message: "No data received" });

  const entry = { ...req.body, lastSeen: new Date().toISOString() };
  const key = req.body.name || "unknown";
  equipmentMap[key] = entry;

  console.log("Received from ESP32:", entry);
  broadcast({ type: "update", equipment: Object.values(equipmentMap) });
  res.json({ status: "ok" });
});

// New WebSocket clients get current state immediately
wss.on("connection", (ws) => {
  console.log("Frontend connected via WebSocket");
  ws.send(JSON.stringify({ type: "init", equipment: Object.values(equipmentMap) }));
});

httpServer.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});