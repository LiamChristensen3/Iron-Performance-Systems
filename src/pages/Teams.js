import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function Teams({ onSelectTeam }) {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewTeam, setShowNewTeam] = useState(false)
  const [form, setForm] = useState({ name: '', sport: '', level: '', season: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTeams()
  }, [])

  async function fetchTeams() {
    setLoading(true)
    const { data } = await supabase
      .from('teams')
      .select('*, clients(count)')
      .order('created_at', { ascending: false })
    setTeams(data || [])
    setLoading(false)
  }

  async function createTeam() {
    setSaving(true)
    setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('teams').insert({
      coach_id: user.id,
      name: form.name,
      sport: form.sport || null,
      level: form.level || null,
      season: form.season || null,
    })
    if (error) {
      setError(error.message)
      setSaving(false)
    } else {
      setForm({ name: '', sport: '', level: '', season: '' })
      setShowNewTeam(false)
      fetchTeams()
    }
    setSaving(false)
  }

  const seasons = ['Off-season', 'Pre-season', 'In-season', 'Post-season']
  const levels = ['Youth', 'High school', 'College D1', 'College D2', 'College D3', 'Semi-pro', 'Professional']

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-white">Teams</h1>
        <button
          onClick={() => setShowNewTeam(!showNewTeam)}
          className="bg-amber-800 hover:bg-amber-900 text-amber-50 text-sm font-medium px-4 py-2 rounded-xl transition-all"
        >
          + New team
        </button>
      </div>

      {showNewTeam && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 mb-6">
          <div className="text-sm font-medium text-white mb-4">Create new team</div>
          {error && (
            <div className="bg-red-950 border border-red-800 rounded-xl px-4 py-3 text-sm text-red-400 mb-4">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-neutral-400 mb-1.5">Team name *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Wildcats Football"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-700"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1.5">Sport</label>
              <input
                type="text"
                value={form.sport}
                onChange={e => setForm({ ...form, sport: e.target.value })}
                placeholder="e.g. Football"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-700"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1.5">Level</label>
              <select
                value={form.level}
                onChange={e => setForm({ ...form, level: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-700"
              >
                <option value="">Select level</option>
                {levels.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1.5">Season</label>
              <select
                value={form.season}
                onChange={e => setForm({ ...form, season: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-700"
              >
                <option value="">Select season</option>
                {seasons.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={createTeam}
              disabled={saving || !form.name}
              className="bg-amber-800 hover:bg-amber-900 disabled:opacity-40 text-amber-50 text-sm font-medium px-5 py-2.5 rounded-xl transition-all"
            >
              {saving ? 'Saving...' : 'Create team'}
            </button>
            <button
              onClick={() => setShowNewTeam(false)}
              className="text-neutral-400 hover:text-white text-sm px-4 py-2.5 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-sm text-neutral-500">Loading teams...</div>
      ) : teams.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center">
          <div className="text-sm text-neutral-400 mb-2">No teams yet</div>
          <p className="text-xs text-neutral-600 mb-4">Create your first team to start managing a roster</p>
          <button
            onClick={() => setShowNewTeam(true)}
            className="bg-amber-800 hover:bg-amber-900 text-amber-50 text-sm font-medium px-4 py-2 rounded-xl transition-all"
          >
            + Create first team
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {teams.map(team => (
            <button
              key={team.id}
              onClick={() => onSelectTeam(team)}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 text-left hover:border-neutral-600 transition-all w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-950 flex items-center justify-center text-sm font-semibold text-blue-300">
                    {team.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{team.name}</div>
                    <div className="text-xs text-neutral-500">
                      {[team.sport, team.level].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {team.season && (
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-950 text-amber-400 font-medium">
                      {team.season}
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-neutral-800 rounded-xl p-3">
                  <div className="text-xs text-neutral-500 mb-1">Athletes</div>
                  <div className="text-lg font-semibold text-white">
                    {team.clients?.[0]?.count || 0}
                  </div>
                </div>
                <div className="bg-neutral-800 rounded-xl p-3">
                  <div className="text-xs text-neutral-500 mb-1">Level</div>
                  <div className="text-sm font-medium text-white">{team.level || '—'}</div>
                </div>
                <div className="bg-neutral-800 rounded-xl p-3">
                  <div className="text-xs text-neutral-500 mb-1">Sport</div>
                  <div className="text-sm font-medium text-white">{team.sport || '—'}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}