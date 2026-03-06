import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wifi, Copy, CheckCheck, ChevronRight, Code2 } from 'lucide-react';
import { toast } from "sonner";

export default function Setup() {
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const { data: equipmentList = [] } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => base44.entities.Equipment.list(),
  });

  const appId = window.location.hostname.split('.')[0];

  const generateCode = () => {
    const equipment = equipmentList.find(e => e.id === selectedEquipment);
    const pingUrl = `https://api.base44.com/api/apps/${appId}/entities/SensorPing`;
    const equipUrl = `https://api.base44.com/api/apps/${appId}/entities/Equipment/${selectedEquipment}`;

    return `#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <math.h>

// Network credentials (WPA2-Enterprise)
const char* ssid = "${ssid || 'YOUR_SSID'}";
const char* identity = "YOUR_IDENTITY";
const char* password = "${password || 'YOUR_PASSWORD'}";

// Base44 API
const char* apiKey = "${apiKey || 'YOUR_API_KEY'}";
const char* pingUrl = "${pingUrl}";
const char* equipUrl = "${equipUrl}";

// Equipment: ${equipment?.name || 'Unknown'} (${equipment?.type || ''})
const char* equipmentId = "${selectedEquipment}";
const char* deviceId = "ESP32_01";

const int RSSI_THRESHOLD = -80;
const int HYSTERESIS = 10;
unsigned long lastCheck = 0;
const int checkInterval = 2000;

String getRoomName(String bssid) {
  bssid.toUpperCase();
  if (bssid == "60:26:EF:FB:C5:60") return "Library - 4E59";
  if (bssid.startsWith("60:26:EF:FB:C5")) return "Library - 4E59 (Secondary Band)";
  return "Unknown Area";
}

float calculateDistance(int rssi) {
  float measuredPower = -55.0;
  float n = 2.7;
  return pow(10, (measuredPower - rssi) / (10 * n));
}

void connectToBestAP() {
  WiFi.disconnect(true);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, WPA2_AUTH_PEAP, identity, identity, password);
  int timeout = 0;
  while (WiFi.status() != WL_CONNECTED && timeout < 30) {
    delay(500);
    Serial.print(".");
    timeout++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\\n[CONNECTED] IP: " + WiFi.localIP().toString());
  } else {
    Serial.println("\\n[FAILED] Check credentials.");
  }
}

void sendData(String bssid, float distance, int rssi) {
  if (WiFi.status() != WL_CONNECTED) return;
  String room = getRoomName(bssid);

  // 1. Save a ping record
  HTTPClient http1;
  http1.begin(pingUrl);
  http1.addHeader("Content-Type", "application/json");
  http1.addHeader("x-api-key", apiKey);
  String ping = "{\\"device_id\\":\\"" + String(deviceId) + "\\",";
  ping += "\\"bssid\\":\\"" + bssid + "\\",";
  ping += "\\"dist\\":" + String(distance, 2) + ",";
  ping += "\\"rssi\\":" + String(rssi) + ",";
  ping += "\\"room\\":\\"" + room + "\\",";
  ping += "\\"equipment_id\\":\\"" + String(equipmentId) + "\\"}";
  int r1 = http1.POST(ping);
  Serial.println("Ping: " + String(r1));
  http1.end();

  // 2. Update the Equipment record directly
  HTTPClient http2;
  http2.begin(equipUrl);
  http2.addHeader("Content-Type", "application/json");
  http2.addHeader("x-api-key", apiKey);
  String update = "{\\"distance\\":" + String(distance, 2) + ",";
  update += "\\"last_ping\\":\\"" + String(millis()) + "\\"}";
  int r2 = http2.PATCH(update);
  Serial.println("Equipment update: " + String(r2));
  http2.end();
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  connectToBestAP();
}

void loop() {
  if (millis() - lastCheck > checkInterval) {
    lastCheck = millis();
    if (WiFi.status() == WL_CONNECTED) {
      int rssi = WiFi.RSSI();
      String bssid = WiFi.BSSIDstr();
      float distance = calculateDistance(rssi);

      sendData(bssid, distance, rssi);

      Serial.print("BSSID: "); Serial.print(bssid);
      Serial.print(" | RSSI: "); Serial.print(rssi);
      Serial.print("dBm | Dist: "); Serial.print(distance, 1); Serial.println("m");

      if (rssi < RSSI_THRESHOLD) {
        int n = WiFi.scanNetworks();
        for (int i = 0; i < n; i++) {
          if (WiFi.SSID(i) == ssid && WiFi.RSSI(i) > (rssi + HYSTERESIS)) {
            connectToBestAP();
            break;
          }
        }
      }
    } else {
      connectToBestAP();
    }
  }
}`;
  };

  const handleGenerate = () => {
    if (!ssid || !password || !apiKey || !selectedEquipment) {
      toast.error('Please fill in all fields before generating code.');
      return;
    }
    setShowCode(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateCode());
    setCopied(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">ESP32 Setup Wizard</h2>
        <p className="text-slate-500 mt-1">Fill in your details and get ready-to-upload Arduino code.</p>
      </div>

      <Card className="border-0 shadow-md rounded-2xl">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wifi className="w-5 h-5 text-blue-500" />
            Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label>WiFi Network Name (SSID)</Label>
              <Input placeholder="HospitalNetwork" value={ssid} onChange={e => setSsid(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>WiFi Password</Label>
              <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Base44 API Key</Label>
            <Input placeholder="Paste your API key from Base44 Settings" value={apiKey} onChange={e => setApiKey(e.target.value)} />
            <p className="text-xs text-slate-400">Find this in Base44 dashboard → Settings → API Keys</p>
          </div>

          <div className="space-y-2">
            <Label>Link to Equipment Asset</Label>
            <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select equipment to attach this tracker to..." />
              </SelectTrigger>
              <SelectContent>
                {equipmentList.map(item => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} — {item.type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleGenerate} className="w-full h-12 bg-blue-600 hover:bg-blue-700 rounded-xl mt-2 flex items-center gap-2">
            Generate Arduino Code
            <ChevronRight className="w-5 h-5" />
          </Button>
        </CardContent>
      </Card>

      {showCode && (
        <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-900 flex flex-row items-center justify-between py-4">
            <CardTitle className="flex items-center gap-2 text-base text-white">
              <Code2 className="w-5 h-5 text-blue-400" />
              Generated Arduino Code
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700 bg-transparent rounded-lg flex items-center gap-2"
            >
              {copied ? <CheckCheck className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </Button>
          </CardHeader>
          <CardContent className="p-0 bg-slate-950">
            <pre className="text-sm text-slate-300 p-6 overflow-x-auto leading-relaxed whitespace-pre font-mono">
              {generateCode()}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}