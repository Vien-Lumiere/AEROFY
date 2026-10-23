import React, { useState, useEffect, useCallback } from 'react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement,
  LineElement, Tooltip, Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

// ── CONFIG ─────────────────────────────────────────────────
const SHEET_ID   = '1RFmxVAN5UOsF_h797rr8wS9sNoaZzKi05Ei1o9TicrI'
const REFRESH_MS = 30_000

// ── SENSOR DEFINITIONS ─────────────────────────────────────
const SENSORS = [
  { key:'suhu',   label:'Suhu Udara',    icon:'🌡️',  unit:'°C',  color:'#f97316', min:0,   max:50,   prec:1 },
  { key:'rh',     label:'Kelembaban',    icon:'💧',  unit:'%',   color:'#3b82f6', min:0,   max:100,  prec:0 },
  { key:'ph',     label:'pH Air',        icon:'🧪',  unit:'pH',  color:'#a855f7', min:0,   max:14,   prec:2 },
  { key:'turb1',  label:'Kekeruhan 1',   icon:'🌊',  unit:'%',   color:'#06b6d4', min:0,   max:100,  prec:1 },
  { key:'turb2',  label:'Kekeruhan 2',   icon:'🌊',  unit:'%',   color:'#0ea5e9', min:0,   max:100,  prec:1 },
  { key:'co21',   label:'CO₂ Sensor 1',  icon:'☁️',  unit:'ppm', color:'#94a3b8', min:400, max:2000, prec:0 },
  { key:'co22',   label:'CO₂ Sensor 2',  icon:'☁️',  unit:'ppm', color:'#64748b', min:400, max:2000, prec:0 },
  { key:'level1', label:'Level Air 1',   icon:'📏',  unit:'cm',  color:'#22c55e', min:0,   max:25,   prec:1 },
  { key:'level2', label:'Level Air 2',   icon:'📏',  unit:'cm',  color:'#16a34a', min:0,   max:30,   prec:1 },
  { key:'solar',  label:'Panel Surya',   icon:'☀️',  unit:'V',   color:'#eab308', min:0,   max:25,   prec:2 },
]

// ── FETCH & PARSE GOOGLE SHEETS ────────────────────────────
async function loadSheet() {
  const url  = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`
  const res  = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const text = await res.text()
  const m    = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\)/)
  if (!m) throw new Error('Format respons tidak dikenal')

  const gviz = JSON.parse(m[1])
  const cols  = gviz.table.cols.map(c => (c.label || c.id).toLowerCase().trim())
  const rows  = (gviz.table.rows || []).map(row => {
    const obj = {}
    cols.forEach((col, i) => { obj[col] = row.c?.[i]?.v ?? null })
    return obj
  })
  return { cols, rows: rows.reverse() } // newest first
}

// ── SENSOR CARD ────────────────────────────────────────────
function SensorCard({ sensor, value }) {
  const { label, icon, unit, color, min, max, prec } = sensor
  const num = parseFloat(value)
  const display = isNaN(num) ? '—' : num.toFixed(prec)
  const pct = isNaN(num) ? 0 : Math.min(100, Math.max(0, (num - min) / (max - min) * 100))

  // color status
  let valColor = color
  if (!isNaN(num)) {
    if (sensor.key === 'ph' && (num < 6 || num > 8.5)) valColor = '#ef4444'
    else if (sensor.key === 'turb1' || sensor.key === 'turb2') {
      if (num > 50) valColor = '#ef4444'
      else if (num > 30) valColor = '#eab308'
    }
    else if ((sensor.key === 'level1' && num < 12) || (sensor.key === 'level2' && num < 15)) {
      valColor = '#ef4444'
    }
  }

  return (
    <div className="sensor-card" style={{ '--c': color }}>
      <div className="sc-icon">{icon}</div>
      <div className="sc-label">{label}</div>
      <div className="sc-value">
        <span style={{ color: valColor }}>{display}</span>
        <span className="sc-unit">{unit}</span>
      </div>
      <div className="sc-bar">
        <div className="sc-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

// ── SENSOR CHART ───────────────────────────────────────────
function SensorChart({ rows }) {
  const [activeKey, setActiveKey] = useState('suhu')
  const sensor  = SENSORS.find(s => s.key === activeKey)
  const last20  = [...rows].slice(0, 20).reverse()

  const labels  = last20.map(r => {
    const ts = String(r.timestamp || '')
    return ts.includes(' ') ? ts.split(' ')[1]?.slice(0, 5) : ts.slice(-5)
  })
  const values  = last20.map(r => {
    const v = parseFloat(r[activeKey])
    return isNaN(v) ? null : v
  })

  const data = {
    labels,
    datasets: [{
      data: values,
      borderColor: sensor.color,
      backgroundColor: sensor.color + '22',
      borderWidth: 2.5,
      pointRadius: 4,
      pointHoverRadius: 7,
      pointBackgroundColor: sensor.color,
      pointBorderColor: '#060a12',
      pointBorderWidth: 2,
      fill: true,
      tension: 0.4,
      spanGaps: true,
    }]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        borderColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        titleColor: '#94a3b8',
        bodyColor: '#e2e8f0',
        callbacks: {
          label: ctx => `${ctx.parsed.y !== null ? ctx.parsed.y.toFixed(sensor.prec) : '—'} ${sensor.unit}`
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#64748b', font: { family: 'DM Mono', size: 11 } }
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: {
          color: '#64748b',
          font: { family: 'DM Mono', size: 11 },
          callback: v => `${v} ${sensor.unit}`
        }
      }
    }
  }

  return (
    <div className="chart-panel">
      <div className="chart-header">
        <h3>{sensor.icon} {sensor.label} <span style={{ color: sensor.color, fontSize: '0.85em' }}>— 20 data terakhir</span></h3>
        <div className="chart-tabs">
          {SENSORS.map(s => (
            <button
              key={s.key}
              className={`chart-tab${s.key === activeKey ? ' active' : ''}`}
              onClick={() => setActiveKey(s.key)}
              style={s.key === activeKey ? { borderColor: s.color + '80', color: s.color } : {}}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>
      </div>
      <div className="chart-wrap">
        <Line data={data} options={options} />
      </div>
    </div>
  )
}

// ── DATA TABLE ─────────────────────────────────────────────
function DataTable({ cols, rows }) {
  if (!rows.length) return null
  const displayCols = cols.slice(0, 11)
  const display20   = rows.slice(0, 20)

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{displayCols.map(c => <th key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {display20.map((row, i) => (
            <tr key={i}>
              {displayCols.map(c => (
                <td key={c}>{row[c] !== null && row[c] !== undefined ? String(row[c]) : '—'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── MAIN APP ───────────────────────────────────────────────
export default function App() {
  const [rows,       setRows]       = useState([])
  const [cols,       setCols]       = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { cols, rows } = await loadSheet()
      setCols(cols)
      setRows(rows)
      setLastUpdate(new Date().toLocaleString('id-ID'))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, REFRESH_MS)
    return () => clearInterval(id)
  }, [load])

  const latest = rows[0] || {}
  const statusClass = loading ? 'loading' : error ? 'error' : 'ok'
  const statusText  = loading
    ? 'Memuat data...'
    : error
    ? 'Gagal terhubung'
    : `Online · ${rows.length} baris data`

  return (
    <>
      {/* ── HEADER ── */}
      <header>
        <div className="logo">
          <div className="logo-icon">💧</div>
          <div>
            <h1>AEROFY</h1>
            <div className="logo-sub">ESP32 Telemetry Dashboard</div>
          </div>
        </div>
        <div className={`status-badge ${statusClass}`}>
          <div className="status-dot" />
          <span>{statusText}</span>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main>
        {/* Time bar */}
        <div className="time-bar">
          <div>
            <div className="tbl">Data terakhir diperbarui</div>
            <div className="tbv">{lastUpdate || '—'}</div>
          </div>
          <button className="refresh-btn" onClick={load} disabled={loading}>
            {loading ? '⏳ Memuat...' : '🔄 Refresh'}
          </button>
        </div>

        {/* Sensor cards */}
        <div className="section-title">📡 Kondisi Terkini</div>
        <div className="sensor-grid">
          {SENSORS.map(s => (
            <SensorCard key={s.key} sensor={s} value={latest[s.key]} />
          ))}
        </div>

        {/* Chart + Table — hanya tampil kalau ada data */}
        {rows.length > 0 && (
          <>
            <div className="section-title">📈 Grafik Riwayat</div>
            <SensorChart rows={rows} />

            <div className="section-title">📋 Log Data</div>
            <DataTable cols={cols} rows={rows} />
          </>
        )}

        {/* Loading state */}
        {loading && rows.length === 0 && (
          <div className="loading-state">
            ⏳ Mengambil data dari Google Sheets...
          </div>
        )}

        {/* Error state */}
        {error && rows.length === 0 && (
          <div className="error-state">
            <div style={{ fontSize: '2rem' }}>❌</div>
            <div style={{ marginTop: 12, color: '#e2e8f0' }}>Gagal memuat data</div>
            <div className="err-msg">{error}</div>
            <div className="err-hint">
              Pastikan Google Sheet sudah di-share publik:<br />
              <b>Share → Anyone with the link → Viewer</b>
            </div>
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer>
        Data dari{' '}
        <a href={`https://docs.google.com/spreadsheets/d/${SHEET_ID}`} target="_blank" rel="noreferrer">
          Google Sheets
        </a>
        {' · '} AEROFY Monitoring System {' · '} Auto-refresh tiap 30 detik
      </footer>
    </>
  )
}
