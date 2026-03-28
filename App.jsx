import { useEffect, useState, useCallback } from "react";

const API_URL = "http://localhost:3000/data";
const POLL_INTERVAL = 15000;

const STATUS_CONFIG = {
  "in use":      { label: "In Use",      bg: "#EEF2FF", color: "#4F46E5", dot: "#4F46E5" },
  "available":   { label: "Available",   bg: "#F0FDF4", color: "#16A34A", dot: "#16A34A" },
  "maintenance": { label: "Maintenance", bg: "#FFFBEB", color: "#D97706", dot: "#D97706" },
  "vacant":      { label: "Vacant",      bg: "#F8FAFC", color: "#64748B", dot: "#94A3B8" },
};

function getStatusConfig(status = "") {
  return STATUS_CONFIG[status.toLowerCase()] || STATUS_CONFIG["vacant"];
}

function getDistanceColor(dist) {
  const d = parseFloat(dist);
  if (isNaN(d)) return "#64748B";
  if (d <= 3)  return "#16A34A";
  if (d <= 10) return "#D97706";
  return "#DC2626";
}

function WifiIcon({ size = 14, color = "#94A3B8" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
      <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
      <circle cx="12" cy="20" r="1" fill={color} stroke="none"/>
    </svg>
  );
}

function PinIcon({ color = "#94A3B8" }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill={color} stroke="none">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  );
}

function BatteryIcon({ color = "#94A3B8" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="18" height="11" rx="2" ry="2"/>
      <path d="M22 11v3"/>
    </svg>
  );
}

function StatusBadge({ status }) {
  const cfg = getStatusConfig(status);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20,
      background: cfg.bg, color: cfg.color,
      fontSize: 12, fontWeight: 500, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

function DeviceCard({ device }) {
  const dist = parseFloat(device.distance);
  const distColor = getDistanceColor(dist);
  const displayDist = isNaN(dist) ? "—" : `${dist.toFixed(1)}m`;
  const name = device.name || "Unknown Device";
  const location = device.location || "—";
  const status = device.status || "vacant";

  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid #E2E8F0",
      borderRadius: 12,
      padding: "18px 20px 14px",
      display: "flex", flexDirection: "column", gap: 12,
      transition: "box-shadow 0.2s",
      cursor: "default",
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#0F172A", letterSpacing: "-0.01em" }}>
            {name}
          </div>
          <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>
            ESP32-C3 Sensor
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Distance + Battery row */}
      <div style={{ display: "flex", gap: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
            <PinIcon color={distColor} />
            <span style={{ fontSize: 11, fontWeight: 500, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Distance</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: distColor }}>
            {displayDist}
          </div>
        </div>

        {device.battery !== undefined && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
              <BatteryIcon color="#94A3B8" />
              <span style={{ fontSize: 11, fontWeight: 500, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Battery</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#0F172A" }}>
              {device.battery}%
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderTop: "1px solid #F1F5F9", paddingTop: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <WifiIcon />
          <span style={{ fontSize: 12, color: "#94A3B8" }}>ESP32-C5 Sensor</span>
        </div>
        <span style={{ fontSize: 12, color: "#64748B", fontWeight: 500 }}>{location}</span>
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <aside style={{
      width: 220, flexShrink: 0,
      background: "#FFFFFF",
      borderRight: "1px solid #E2E8F0",
      display: "flex", flexDirection: "column",
      padding: "24px 0",
      minHeight: "100vh",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 20px 28px" }}>
        <div style={{
          width: 34, height: 34, borderRadius: 8,
          background: "#3B82F6",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        </div>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.02em" }}>MediTrack</span>
      </div>

      {/* Nav */}
      {[
        { label: "Dashboard", icon: "▦", active: true },
        { label: "Asset Search", icon: "○" },
        { label: "System Settings", icon: "⚙" },
      ].map(item => (
        <div key={item.label} style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 20px",
          background: item.active ? "#EFF6FF" : "transparent",
          color: item.active ? "#2563EB" : "#64748B",
          fontSize: 14, fontWeight: item.active ? 500 : 400,
          cursor: "pointer", borderRadius: "0 8px 8px 0", marginRight: 12,
        }}>
          <span style={{ fontSize: 14 }}>{item.icon}</span>
          {item.label}
        </div>
      ))}

      <div style={{ marginTop: "auto", padding: "0 20px", borderTop: "1px solid #F1F5F9", paddingTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "#E2E8F0",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#94A3B8">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#0F172A" }}>Admin User</div>
            <div style={{ fontSize: 12, color: "#94A3B8" }}>Cardiology Dept</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function App() {
  const [equipment, setEquipment] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [countdown, setCountdown] = useState(POLL_INTERVAL / 1000);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setEquipment(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
      setCountdown(POLL_INTERVAL / 1000);
    } catch (err) {
      console.error("Failed to fetch:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const pollTimer = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(pollTimer);
  }, [fetchData]);

  useEffect(() => {
    const tick = setInterval(() => {
      setCountdown(c => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(tick);
  }, [lastUpdated]);

  const filters = ["All", "Available", "In Use", "Maintenance"];

  const filtered = equipment.filter(d => {
    const matchSearch = (d.name || "").toLowerCase().includes(search.toLowerCase()) ||
                        (d.location || "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || (d.status || "").toLowerCase() === filter.toLowerCase();
    return matchSearch && matchFilter;
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8FAFC", fontFamily: "'Geist', 'DM Sans', system-ui, sans-serif" }}>
      <Sidebar />

      <main style={{ flex: 1, padding: "32px 36px" }}>
        {/* Page header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", margin: 0, letterSpacing: "-0.02em" }}>
            Asset Dashboard
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: equipment.length > 0 ? "#22C55E" : "#E2E8F0" }} />
            <span style={{ fontSize: 13, color: "#94A3B8" }}>
              {equipment.length > 0
                ? `Refreshing in ${countdown}s`
                : "Waiting for devices..."}
            </span>
          </div>
        </div>

        {/* Search + filter bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1", minWidth: 240, maxWidth: 420 }}>
            <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
              width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search equipment by name or location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "9px 12px 9px 36px",
                border: "1px solid #E2E8F0", borderRadius: 8,
                fontSize: 14, color: "#0F172A", background: "#FFFFFF",
                outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ display: "flex", background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 8, overflow: "hidden" }}>
            {filters.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: "8px 16px", fontSize: 13, fontWeight: 500, border: "none",
                background: filter === f ? "#0F172A" : "transparent",
                color: filter === f ? "#FFFFFF" : "#64748B",
                cursor: "pointer", transition: "all 0.15s",
              }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: 80, color: "#94A3B8", gap: 12,
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <span style={{ fontSize: 15 }}>
              {equipment.length === 0 ? "Waiting for ESP32 data..." : "No devices match your search."}
            </span>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
          }}>
            {filtered.map((device, i) => (
              <DeviceCard key={device.name || i} device={device} />
            ))}
          </div>
        )}

        {lastUpdated && (
          <div style={{ marginTop: 24, fontSize: 12, color: "#CBD5E1", textAlign: "right" }}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </main>
    </div>
  );
}
