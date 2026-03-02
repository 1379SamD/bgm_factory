import { useMemo, useState } from 'react'

type Track = {
  id: string
  name: string
  durationSec: number
}

const dummyTracks: Track[] = [
  { id: 't01', name: '001.mp3', durationSec: 192 },
  { id: 't02', name: '002.mp3', durationSec: 178 },
  { id: 't03', name: '003.mp3', durationSec: 225 },
  { id: 't04', name: '004.mp3', durationSec: 171 },
  { id: 't05', name: '005.mp3', durationSec: 241 },
  { id: 't06', name: '006.mp3', durationSec: 199 },
  { id: 't07', name: '007.mp3', durationSec: 187 },
  { id: 't08', name: '008.mp3', durationSec: 203 },
  { id: 't09', name: '009.mp3', durationSec: 214 },
  { id: 't10', name: '010.mp3', durationSec: 190 },
]

function formatMMSS(totalSec: number) {
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatHHMMSS(totalSec: number) {
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function App() {
  // tracks は今はダミー。次にIPCで差し替える
  const [tracks] = useState<Track[]>(dummyTracks)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [title, setTitle] = useState('')
  const [descJp, setDescJp] = useState('')
  const [descEn, setDescEn] = useState('')
  const [hashtags, setHashtags] = useState('')

  const selectedTracks = useMemo(
    () => tracks.filter((t) => selectedIds.has(t.id)),
    [tracks, selectedIds]
  )

  const totalSec = useMemo(
    () => selectedTracks.reduce((sum, t) => sum + t.durationSec, 0),
    [selectedTracks]
  )

  const over60min = totalSec >= 60 * 60

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    setSelectedIds(new Set(tracks.map((t) => t.id)))
  }

  const clearAll = () => {
    setSelectedIds(new Set())
  }

  const saveMetaToLocal = () => {
    const payload = {
      title,
      description_jp: descJp,
      description_en: descEn,
      hashtags,
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem('bgmFactory:meta', JSON.stringify(payload, null, 2))
    alert('保存しました（localStorage）。次はIPCでmeta.jsonに保存する！')
  }

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    alert('コピーしました')
  }

  return (
    <div style={styles.app}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={styles.brand}>BGM Factory</div>
          <div style={styles.sub}>
            選択 {selectedTracks.length}曲 / 合計 {formatHHMMSS(totalSec)}{' '}
            <span style={{ ...styles.badge, ...(over60min ? styles.badgeOk : styles.badgeNg) }}>
              {over60min ? '✓ 60分超え' : '60分未満'}
            </span>
          </div>
        </div>

        <div style={styles.tabs}>
          <button style={{ ...styles.tab, ...styles.tabActive }}>Create</button>
          <button style={styles.tab} disabled>
            Publish（v2）
          </button>
          <button style={styles.tab} disabled>
            Analytics（後で）
          </button>
        </div>
      </div>

      {/* 3 columns */}
      <div style={styles.columns}>
        {/* Left */}
        <section style={styles.card}>
          <div style={styles.cardTitle}>IMPORT</div>
          <div style={styles.cardSub}>今日のDL（ダミー10曲）</div>

          <div style={styles.list}>
            {tracks.map((t) => (
              <label key={t.id} style={styles.row}>
                <input
                  type="checkbox"
                  checked={selectedIds.has(t.id)}
                  onChange={() => toggle(t.id)}
                />
                <span style={{ flex: 1 }}>{t.name}</span>
                <span style={styles.muted}>{formatMMSS(t.durationSec)}</span>
              </label>
            ))}
          </div>

          <div style={styles.actions}>
            <button style={styles.btn} onClick={selectAll}>
              全選択
            </button>
            <button style={styles.btnGhost} onClick={clearAll}>
              解除
            </button>
          </div>
        </section>

        {/* Center */}
        <section style={styles.cardWide}>
          <div style={styles.cardTitle}>BUILD</div>
          <div style={styles.cardSub}>選択した曲をまとめる（v1ではフォルダ作成は後でIPC）</div>

          <div style={styles.buildBox}>
            {selectedTracks.length === 0 ? (
              <div style={styles.muted}>左で曲をチェックするとここに表示される</div>
            ) : (
              selectedTracks.map((t) => (
                <div key={t.id} style={styles.buildRow}>
                  <span style={{ flex: 1 }}>{t.name}</span>
                  <span style={styles.muted}>{formatMMSS(t.durationSec)}</span>
                </div>
              ))
            )}
          </div>

          <div style={styles.totalLine}>
            合計：<b>{formatHHMMSS(totalSec)}</b>{' '}
            <span style={{ ...styles.badge, ...(over60min ? styles.badgeOk : styles.badgeNg) }}>
              {over60min ? 'Ready' : 'Need more'}
            </span>
          </div>

          <div style={styles.actions}>
            <button style={styles.btnPrimary} disabled={selectedTracks.length === 0}>
              作業フォルダ作成（次：IPCで実装）
            </button>
            <button style={styles.btn} disabled>
              フォルダを開く（次：IPC）
            </button>
          </div>
        </section>

        {/* Right */}
        <section style={styles.card}>
          <div style={styles.cardTitle}>METADATA</div>
          <div style={styles.cardSub}>投稿用メタ（先に保存しておく）</div>

          <div style={styles.field}>
            <div style={styles.label}>Title</div>
            <input style={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div style={styles.field}>
            <div style={styles.label}>JP Description</div>
            <textarea
              style={styles.textarea}
              value={descJp}
              onChange={(e) => setDescJp(e.target.value)}
            />
          </div>

          <div style={styles.field}>
            <div style={styles.label}>EN Description</div>
            <textarea
              style={styles.textarea}
              value={descEn}
              onChange={(e) => setDescEn(e.target.value)}
            />
          </div>

          <div style={styles.field}>
            <div style={styles.label}>Hashtags</div>
            <input
              style={styles.input}
              placeholder="#SleepMusic #作業用BGM ..."
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
            />
          </div>

          <div style={styles.actionsCol}>
            <button style={styles.btnPrimary} onClick={saveMetaToLocal}>
              JSON保存（今はlocalStorage）
            </button>
            <button style={styles.btn} onClick={() => copy(title)} disabled={!title}>
              タイトルコピー
            </button>
            <button
              style={styles.btn}
              onClick={() => copy(descJp + '\n\n' + descEn)}
              disabled={!descJp && !descEn}
            >
              説明コピー（JP+EN）
            </button>
            <button style={styles.btn} onClick={() => copy(hashtags)} disabled={!hashtags}>
              タグコピー
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  app: {
    minHeight: '100vh',
    background: '#0F1115',
    color: '#EDEFF4',
    padding: 16,
    boxSizing: 'border-box',
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  brand: { fontSize: 20, fontWeight: 700 },
  sub: { color: '#A8B0C0', fontSize: 13 },
  tabs: { display: 'flex', gap: 8 },
  tab: {
    borderRadius: 12,
    padding: '10px 12px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.10)',
    color: '#EDEFF4',
    cursor: 'pointer',
  },
  tabActive: {
    background: 'rgba(245,178,122,0.18)',
    border: '1px solid rgba(245,178,122,0.28)',
  },
  columns: {
    display: 'grid',
    gridTemplateColumns: '320px 1fr 320px',
    gap: 16,
    alignItems: 'start',
  },
  card: {
    borderRadius: 16,
    padding: 16,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.10)',
    backdropFilter: 'blur(10px)',
  },
  cardWide: {
    borderRadius: 16,
    padding: 16,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.10)',
    backdropFilter: 'blur(10px)',
    minHeight: 520,
  },
  cardTitle: { fontSize: 12, letterSpacing: 1.2, fontWeight: 800, color: '#C9D2E3' },
  cardSub: { marginTop: 6, marginBottom: 12, fontSize: 12, color: '#A8B0C0' },
  list: { display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 420, overflow: 'auto' },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 10px',
    borderRadius: 12,
    background: 'rgba(0,0,0,0.20)',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  muted: { color: '#9AA6BD', fontSize: 12 },
  actions: { display: 'flex', gap: 8, marginTop: 12 },
  actionsCol: { display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 },
  btn: {
    borderRadius: 12,
    padding: '10px 12px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#EDEFF4',
    cursor: 'pointer',
  },
  btnGhost: {
    borderRadius: 12,
    padding: '10px 12px',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.16)',
    color: '#EDEFF4',
    cursor: 'pointer',
  },
  btnPrimary: {
    borderRadius: 12,
    padding: '10px 12px',
    background: 'rgba(245,178,122,0.22)',
    border: '1px solid rgba(245,178,122,0.32)',
    color: '#F8EDE3',
    cursor: 'pointer',
    fontWeight: 700,
  },
  buildBox: {
    borderRadius: 16,
    padding: 12,
    background: 'rgba(0,0,0,0.18)',
    border: '1px solid rgba(255,255,255,0.08)',
    minHeight: 320,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  buildRow: {
    display: 'flex',
    gap: 10,
    padding: '8px 10px',
    borderRadius: 12,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  totalLine: { marginTop: 12, color: '#C9D2E3' },
  badge: {
    marginLeft: 8,
    padding: '2px 8px',
    borderRadius: 999,
    fontSize: 12,
    border: '1px solid transparent',
  },
  badgeOk: { background: 'rgba(59,201,123,0.18)', borderColor: 'rgba(59,201,123,0.28)' },
  badgeNg: { background: 'rgba(255,107,107,0.16)', borderColor: 'rgba(255,107,107,0.28)' },
  field: { display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 },
  label: { fontSize: 12, color: '#A8B0C0' },
  input: {
    borderRadius: 12,
    padding: '10px 12px',
    background: 'rgba(0,0,0,0.22)',
    border: '1px solid rgba(255,255,255,0.10)',
    color: '#EDEFF4',
    outline: 'none',
  },
  textarea: {
    borderRadius: 12,
    padding: '10px 12px',
    background: 'rgba(0,0,0,0.22)',
    border: '1px solid rgba(255,255,255,0.10)',
    color: '#EDEFF4',
    outline: 'none',
    minHeight: 92,
    resize: 'vertical',
  },
}