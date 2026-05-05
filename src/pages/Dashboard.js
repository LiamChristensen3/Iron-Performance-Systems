import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function Dashboard({ coach, onSelectClient, onSelectTeam }) {
  const [clients, setClients] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const [{ data: clientsData }, { data: teamsData }] = await Promise.all([
      supabase.from('clients').select('*, programs(*)').order('created_at', { ascending: false }),
      supabase.from('teams').select('*, clients(count)').order('created_at', { ascending: false })
    ])
    setClients(clientsData || [])
    setTeams(teamsData || [])
    setLoading(false)
  }

  const activePrograms = clients.filter(c => c.programs && c.programs.length > 0).length

  function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  function getCategoryColor(cat) {
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

  const glassCard = {
    ...glass,
    padding: '14px',
    marginBottom: '8px',
    cursor: 'pointer',
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Good morning, {coach?.full_name?.split(' ')[0]}.
        </h1>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
          {clients.length} active clients &middot; {teams.length} teams &middot; {activePrograms} active programs
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '24px' }}>
        {[
          { label: 'Total clients', value: clients.length, delta: null },
          { label: 'Teams', value: teams.length, delta: null },
          { label: 'Active programs', value: activePrograms, delta: null },
          { label: 'Sessions this week', value: 0, delta: null },
        ].map(stat => (
          <div key={stat.label} style={{ ...glass, padding: '14px 16px' }}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>{stat.label}</div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)' }}>My teams</div>
            <button onClick={() => onSelectTeam && onSelectTeam(null)} style={{ fontSize: '11px', color: '#BA7517', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>See all →</button>
          </div>
          {loading ? (
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>Loading...</div>
          ) : teams.length === 0 ? (
            <div style={{ ...glass, padding: '32px', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>No teams yet</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>Create your first team to get started</div>
            </div>
          ) : (
            teams.map(team => (
              <div key={team.id} onClick={() => onSelectTeam(team)} style={glassCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(55,138,221,0.2)', border: '0.5px solid rgba(55,138,221,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#93c5fd', flexShrink: 0 }}>
                    {team.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{team.name}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '1px' }}>{[team.sport, team.level].filter(Boolean).join(' · ')}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
                    {team.clients?.[0]?.count || 0} athletes
                  </span>
                  {team.season && (
                    <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', background: 'rgba(186,117,23,0.2)', color: '#BA7517', border: '0.5px solid rgba(186,117,23,0.3)' }}>
                      {team.season}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)' }}>Individual clients</div>
            <button style={{ fontSize: '11px', color: '#BA7517', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>See all →</button>
          </div>
          {loading ? (
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>Loading...</div>
          ) : clients.length === 0 ? (
            <div style={{ ...glass, padding: '32px', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>No clients yet</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginBottom: '14px' }}>Add your first client to get started</div>
              <button
                onClick={() => onSelectClient('new')}
                style={{ background: '#BA7517', color: '#fff', border: 'none', borderRadius: '8px', padding: '7px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                + Add first client
              </button>
            </div>
          ) : (
            clients.slice(0, 4).map(client => {
              const program = getActiveProgram(client)
              const progress = program ? Math.round((program.week_current / program.week_total) * 100) : 0
              const catStyle = getCategoryColor(client.category)
              return (
                <div key={client.id} onClick={() => onSelectClient(client)} style={glassCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: catStyle.bg, border: '0.5px solid ' + catStyle.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: catStyle.color, flexShrink: 0 }}>
                      {getInitials(client.full_name)}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{client.full_name}</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '1px' }}>{client.sport || getCategoryLabel(client.category)}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', background: catStyle.bg, color: catStyle.color, border: '0.5px solid ' + catStyle.border }}>
                    {getCategoryLabel(client.category)}
                  </span>
                  {program && (
                    <>
                      <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '999px', height: '3px', marginTop: '8px' }}>
                        <div style={{ height: '3px', borderRadius: '999px', background: '#BA7517', width: progress + '%' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px', fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>
                        <span>{program.method} · Wk {program.week_current}/{program.week_total}</span>
                        <span>{progress}%</span>
                      </div>
                    </>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}