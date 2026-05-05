import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function Roster({ team, onBack, onSelectClient }) {
  const [athletes, setAthletes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('roster')

useEffect(() => {
    fetchAthletes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team.id])

  async function fetchAthletes() {
    setLoading(true)
    const { data } = await supabase
      .from('clients')
      .select('*, programs(*)')
      .eq('team_id', team.id)
      .order('full_name', { ascending: true })
    setAthletes(data || [])
    setLoading(false)
  }

  const positionGroups = {
    skill: ['WR', 'RB', 'QB', 'TE', 'FB'],
    linemen: ['OL', 'DL', 'DE', 'DT', 'NT'],
    linebackers: ['LB', 'ILB', 'OLB', 'MLB'],
    dbs: ['DB', 'CB', 'S', 'SS', 'FS'],
  }

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'skill', label: 'Skill' },
    { key: 'linemen', label: 'Linemen' },
    { key: 'linebackers', label: 'LBs' },
    { key: 'dbs', label: 'DBs' },
    { key: 'rehab', label: 'Rehab' },
  ]

  const filtered = athletes.filter(a => {
    const matchesSearch = a.full_name.toLowerCase().includes(search.toLowerCase())
    if (!matchesSearch) return false
    if (filter === 'all') return true
    if (filter === 'rehab') return a.category === 'pt'
    const positions = positionGroups[filter] || []
    return positions.includes(a.position)
  })

  function getActiveProgram(client) {
    if (!client.programs || client.programs.length === 0) return null
    return client.programs.find(p => p.status === 'active') || client.programs[0]
  }

  function getProgress(program) {
    if (!program) return 0
    return Math.round((program.week_current / program.week_total) * 100)
  }

  function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={onBack} className="text-neutral-500 hover:text-white text-sm transition-colors">
          ← Teams
        </button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">{team.name}</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {[team.sport, team.level, team.season].filter(Boolean).join(' · ')}
          </p>
        </div>
        <button
          onClick={() => onSelectClient('new-team', team)}
          className="bg-amber-800 hover:bg-amber-900 text-amber-50 text-sm font-medium px-4 py-2 rounded-xl transition-all"
        >
          + Add athlete
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-neutral-900 border border-neutral-800 rounded-xl p-1 w-fit">
        {['roster', 'staff', 'schedule'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              tab === t ? 'bg-amber-800 text-amber-50' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'roster' && (
        <>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <input
              type="text"
              placeholder="Search athletes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-700 w-56"
            />
            <div className="flex gap-2 flex-wrap">
              {filters.map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    filter === f.key
                      ? 'bg-amber-800 text-amber-50 border-amber-800'
                      : 'border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500'
                  }`}
                >
                  {f.label}
                </button>
              ))}
              <span className="text-xs text-neutral-600 self-center">
                {filtered.length} of {athletes.length} athletes
              </span>
            </div>
          </div>

          {loading ? (
            <div className="text-sm text-neutral-500">Loading roster...</div>
          ) : filtered.length === 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center">
              <div className="text-sm text-neutral-400 mb-2">
                {athletes.length === 0 ? 'No athletes on this roster yet' : 'No athletes match this filter'}
              </div>
              {athletes.length === 0 && (
                <button
                  onClick={() => onSelectClient('new-team', team)}
                  className="mt-3 bg-amber-800 hover:bg-amber-900 text-amber-50 text-sm font-medium px-4 py-2 rounded-xl transition-all"
                >
                  + Add first athlete
                </button>
              )}
            </div>
          ) : (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-800">
                    <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider text-neutral-500">Athlete</th>
                    <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider text-neutral-500">Pos</th>
                    <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider text-neutral-500">Height</th>
                    <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider text-neutral-500">Weight</th>
                    <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider text-neutral-500">Current block</th>
                    <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider text-neutral-500">Progress</th>
                    <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider text-neutral-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(athlete => {
                    const program = getActiveProgram(athlete)
                    const progress = getProgress(program)
                    return (
                      <tr
                        key={athlete.id}
                        onClick={() => onSelectClient(athlete)}
                        className="border-b border-neutral-800 last:border-0 hover:bg-neutral-800 cursor-pointer transition-all"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-xs font-semibold text-neutral-200 flex-shrink-0">
                              {getInitials(athlete.full_name)}
                            </div>
                            <div className="text-sm font-medium text-white">{athlete.full_name}</div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs px-2 py-1 rounded-full bg-neutral-800 text-neutral-400">
                            {athlete.position || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-neutral-400">{athlete.height || '—'}</td>
                        <td className="px-5 py-4 text-sm text-neutral-400">{athlete.weight || '—'}</td>
                        <td className="px-5 py-4 text-sm text-neutral-400">
                          {program ? `${program.method} · Wk ${program.week_current}/${program.week_total}` : '—'}
                        </td>
                        <td className="px-5 py-4">
                          {program ? (
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-1.5 bg-neutral-700 rounded-full overflow-hidden min-w-16">
                                <div className="h-1.5 rounded-full bg-amber-600" style={{ width: `${progress}%` }} />
                              </div>
                              <span className="text-xs text-neutral-400">{progress}%</span>
                            </div>
                          ) : (
                            <span className="text-xs text-neutral-600">No program</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            athlete.category === 'pt'
                              ? 'bg-red-950 text-red-400'
                              : program
                              ? 'bg-green-950 text-green-400'
                              : 'bg-neutral-800 text-neutral-500'
                          }`}>
                            {athlete.category === 'pt' ? 'Rehab' : program ? 'Active' : 'No program'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === 'staff' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center">
          <div className="text-sm text-neutral-400 mb-2">Coaching staff</div>
          <p className="text-xs text-neutral-600">Staff management coming in the next update</p>
        </div>
      )}

      {tab === 'schedule' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center">
          <div className="text-sm text-neutral-400 mb-2">Team schedule</div>
          <p className="text-xs text-neutral-600">Team calendar and game schedule coming in the next update</p>
        </div>
      )}
    </div>
  )
}