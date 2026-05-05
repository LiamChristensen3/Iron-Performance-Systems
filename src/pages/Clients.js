import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function Clients({ onSelectClient }) {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchClients()
  }, [])

  async function fetchClients() {
    setLoading(true)
    const { data } = await supabase
      .from('clients')
      .select('*, programs(*)')
      .order('created_at', { ascending: false })
    setClients(data || [])
    setLoading(false)
  }

  const categories = [
    { key: 'all', label: 'All' },
    { key: 'athlete', label: 'Athletes' },
    { key: 'bodybuilder', label: 'Bodybuilders' },
    { key: 'genpop', label: 'Gen pop' },
    { key: 'pt', label: 'PT patients' },
  ]

  const filtered = clients.filter(c => {
    const matchesFilter = filter === 'all' || c.category === filter
    const matchesSearch = c.full_name.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  function getCategoryStyle(cat) {
    switch (cat) {
      case 'athlete': return { bg: 'rgba(55,138,221,0.25)', color: '#93c5fd', border: 'rgba(55,138,221,0.3)' }
      case 'bodybuilder': return { bg: 'rgba(127,119,221,0.25)', color: '#c4b5fd', border: 'rgba(127,119,221,0.3)' }
      case 'genpop': return { bg: 'rgba(29,158,117,0.25)', color: '#6ee7b7', border: 'rgba(29,158,117,0.3)' }
      case 'pt': return { bg: 'rgba(216,90,48,0.25)', color: '#fca5a5', border: 'rgba(216,90,48,0.3)' }
      default: return { bg: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', border: 'rgba(255,255,255,0.15)' }
    }
  }

  function getCategoryLabel(cat) {
    switch (cat) {
      case 'genpop': return 'Gen pop'
      case 'pt': return 'PT patient'
      default: return cat.charAt(0).toUpperCase() + cat.slice(1)
    }
  }

  function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  function getActiveProgram(client) {
    if (!client.programs || client.programs.length === 0) return null
    return client.programs.find(p => p.status === 'active') || client.programs[0]
  }

  const glass = {
    background: 'rgba(10,10,10,0.55)',
    border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    backdropFilter: 'blur(12px)',
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>Clients</h1>
        <button
          onClick={() => onSelectClient('new')}
          style={{ background: '#BA7517', color: '#fff', border: 'none', borderRadius: '8px', padding: '7px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
        >
          + New client
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search clients..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ background: 'rgba(10,10,10,0.55)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px 14px', fontSize: '12px', color: '#fff', outline: 'none', width: '220px' }}
        />
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setFilter(cat.key)}
              style={{ padding: '6px 14px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: '0.5px solid', borderColor: filter === cat.key ? '#BA7517' : 'rgba(255,255,255,0.15)', background: filter === cat.key ? '#BA7517' : 'transparent', color: filter === cat.key ? '#fff' : 'rgba(255,255,255,0.4)', transition: 'all 0.15s' }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>Loading clients...</div>
      ) : filtered.length === 0 ? (
        <div style={{ ...glass, padding: '48px', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>
            {search ? 'No clients match your search' : 'No clients yet'}
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginBottom: '16px' }}>
            {search ? 'Try a different search term' : 'Add your first client to get started'}
          </div>
          {!search && (
            <button
              onClick={() => onSelectClient('new')}
              style={{ background: '#BA7517', color: '#fff', border: 'none', borderRadius: '8px', padding: '7px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
            >
              + Add first client
            </button>
          )}
        </div>
      ) : (
        <div style={{ ...glass, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
                {['Client', 'Category', 'Current program', 'Progress', 'Status'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(client => {
                const program = getActiveProgram(client)
                const progress = program ? Math.round((program.week_current / program.week_total) * 100) : 0
                const catStyle = getCategoryStyle(client.category)
                return (
                  <tr
                    key={client.id}
                    onClick={() => onSelectClient(client)}
                    style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: catStyle.bg, border: '0.5px solid ' + catStyle.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: catStyle.color, flexShrink: 0 }}>
                          {getInitials(client.full_name)}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{client.full_name}</div>
                          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '1px' }}>{client.sport || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 9px', borderRadius: '999px', background: catStyle.bg, color: catStyle.color, border: '0.5px solid ' + catStyle.border }}>
                        {getCategoryLabel(client.category)}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                      {program ? `${program.method} · Wk ${program.week_current}/${program.week_total}` : '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {program ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', minWidth: '60px', overflow: 'hidden' }}>
                            <div style={{ height: '3px', borderRadius: '999px', background: '#BA7517', width: progress + '%' }} />
                          </div>
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>{progress}%</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>No program</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 9px', borderRadius: '999px', background: program ? 'rgba(29,158,117,0.2)' : 'rgba(255,255,255,0.06)', color: program ? '#6ee7b7' : 'rgba(255,255,255,0.3)', border: '0.5px solid ' + (program ? 'rgba(29,158,117,0.3)' : 'rgba(255,255,255,0.1)') }}>
                        {program ? 'Active' : 'No program'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}