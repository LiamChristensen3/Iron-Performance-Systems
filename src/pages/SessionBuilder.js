import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const SYSTEM_PROMPT = "You are the most knowledgeable strength and conditioning coach, sports scientist, physical therapist, exercise physiologist, biomechanist, neurophysiologist, nutritionist, and performance psychologist in existence. You have complete mastery of every major training methodology, peer-reviewed research study, systematic review, meta-analysis, clinical protocol, textbook, and cultural training system ever published or practiced across all of human history. You synthesize all of this knowledge to build individualized, evidence-based, athlete-specific training sessions. When research conflicts, you default to the most recent systematic review or meta-analysis over individual studies, and always err on the side of athlete safety when evidence is unclear. You always explain your reasoning in the rationale field, citing the methodology, research, or protocol you are applying and why. Return ONLY valid JSON with no markdown and no explanation outside the JSON structure."

export default function SessionBuilder() {
  const [clients, setClients] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [selectedDay, setSelectedDay] = useState(0)
  const [view, setView] = useState('planned')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [session, setSession] = useState(null)
  const [sessionNotes, setSessionNotes] = useState('')
  const [actualData, setActualData] = useState({})

  useEffect(() => {
    fetchClients()
  }, [])

  async function fetchClients() {
    setLoading(true)
    const { data } = await supabase
      .from('clients')
      .select('*, programs(*)')
      .order('full_name', { ascending: true })
    setClients(data || [])
    setLoading(false)
  }

  async function generateSession() {
    if (!selectedClient) return
    setGenerating(true)
    setSession(null)

    const activeProgram = selectedClient.programs && selectedClient.programs.find(function(p) { return p.status === 'active' })

    const userPrompt = "Build a complete training session for this athlete. Return ONLY a JSON object with this exact structure: {sessionTitle: string, sessionFocus: string, rationale: string, blocks: [{blockName: string, blockColor: string (one of: amber blue green red purple gray), exercises: [{name: string, sets: string, reps: string, load: string, tempo: string, intensity: string, rpe: string, rest: string, cue: string}]}]}. Athlete: " + selectedClient.full_name + ". Category: " + selectedClient.category + ". Sport: " + (selectedClient.sport || 'General') + ". Training age: " + (selectedClient.training_age || 'Unknown') + " years. Current program: " + (activeProgram ? activeProgram.method : 'No active program') + ". Phase: " + (activeProgram ? activeProgram.phase : 'General training') + ". Goal: " + (selectedClient.goal || 'General fitness') + ". Injury history: " + (selectedClient.injury_history || 'None') + ". Strength level: " + (selectedClient.strength_level || 'Intermediate') + ". Movement quality: " + (selectedClient.movement_quality || 'Good') + ". Day: " + getDayLabel(selectedDay) + ". Build 3-5 blocks appropriate for this athlete and phase. Make it completely specific to this individual."

    try {
      const response = await fetch('/.netlify/functions/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userPrompt }]
        })
      })
      const data = await response.json()
console.log('API response:', JSON.stringify(data))
const text = data.content && data.content[0] ? data.content[0].text : ''
console.log('Text response:', text)
if (!text) throw new Error('Empty response from API')
const jsonStart = text.indexOf('{')
const jsonEnd = text.lastIndexOf('}')
if (jsonStart === -1 || jsonEnd === -1) throw new Error('No JSON found in response')
const clean = text.substring(jsonStart, jsonEnd + 1)
const parsed = JSON.parse(clean)
      setSession(parsed)
      setActualData({})
      setSessionNotes('')
    } catch (e) {
      console.error('Generation error:', e)
    }
    setGenerating(false)
  }

  async function saveSession() {
    if (!session || !selectedClient) return
    const { data: { user } } = await supabase.auth.getUser()
    const activeProgram = selectedClient.programs && selectedClient.programs.find(function(p) { return p.status === 'active' })
    await supabase.from('sessions').insert({
      client_id: selectedClient.id,
      coach_id: user.id,
      program_id: activeProgram ? activeProgram.id : null,
      day_label: getDayLabel(selectedDay),
      focus: session.sessionFocus,
      rationale: session.rationale,
      planned_data: session,
      actual_data: actualData,
      session_notes: sessionNotes,
      session_date: new Date().toISOString().split('T')[0]
    })
    alert('Session saved to ' + selectedClient.full_name + "'s training history.")
  }

  function getDayLabel(idx) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    return days[idx] || 'Day ' + (idx + 1)
  }

  function getInitials(name) {
    return name.split(' ').map(function(n) { return n[0] }).join('').substring(0, 2).toUpperCase()
  }
// eslint-disable-next-line no-unused-vars
  const colorMap = {
    amber: 'bg-amber-950 text-amber-400',
    blue: 'bg-blue-950 text-blue-400',
    green: 'bg-green-950 text-green-400',
    red: 'bg-red-950 text-red-400',
    purple: 'bg-purple-950 text-purple-400',
    gray: 'bg-neutral-800 text-neutral-400'
  }

  const dotMap = {
    amber: 'bg-amber-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    gray: 'bg-neutral-500'
  }

  return (
    <div className="flex h-full">
      <div className="w-56 min-w-56 border-r border-neutral-800 p-4 overflow-y-auto">
        <div className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-3">
          Select athlete
        </div>
        {loading ? (
          <div className="text-xs text-neutral-600">Loading...</div>
        ) : clients.length === 0 ? (
          <div className="text-xs text-neutral-600">No clients yet</div>
        ) : (
          clients.map(function(client) {
            return (
              <button
                key={client.id}
                onClick={function() { setSelectedClient(client); setSession(null); setSelectedDay(0) }}
                className={'w-full flex items-center gap-2 p-2 rounded-xl mb-1 text-left transition-all ' + (selectedClient && selectedClient.id === client.id ? 'bg-amber-950 border border-amber-800' : 'hover:bg-neutral-800')}
              >
                <div className="w-7 h-7 rounded-full bg-neutral-700 flex items-center justify-center text-xs font-semibold text-neutral-200 flex-shrink-0">
                  {getInitials(client.full_name)}
                </div>
                <div>
                  <div className="text-xs font-medium text-white">{client.full_name}</div>
                  <div className="text-xs text-neutral-500">{client.sport || client.category}</div>
                </div>
              </button>
            )
          })
        )}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {!selectedClient ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-sm font-medium text-neutral-400 mb-2">No athlete selected</div>
              <p className="text-xs text-neutral-600">Select an athlete from the sidebar to build their session</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-800 bg-neutral-900">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-xs font-semibold text-neutral-200">
                  {getInitials(selectedClient.full_name)}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{selectedClient.full_name}</div>
                  <div className="text-xs text-neutral-500">
                    {selectedClient.sport || selectedClient.category}
                  </div>
                </div>
              </div>
              <div className="flex bg-neutral-800 rounded-xl p-0.5">
                {['planned', 'actual', 'both'].map(function(v) {
                  return (
                    <button
                      key={v}
                      onClick={function() { setView(v) }}
                      className={'px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ' + (view === v ? 'bg-amber-800 text-amber-50' : 'text-neutral-400 hover:text-white')}
                    >
                      {v}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-800">
              <div className="flex gap-2 flex-wrap">
                {[0, 1, 2, 3, 4, 5, 6].map(function(i) {
                  return (
                    <button
                      key={i}
                      onClick={function() { setSelectedDay(i); setSession(null) }}
                      className={'px-3 py-1.5 rounded-full text-xs font-medium border transition-all ' + (selectedDay === i ? 'bg-amber-800 text-amber-50 border-amber-800' : 'border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500')}
                    >
                      {getDayLabel(i)}
                    </button>
                  )
                })}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={generateSession}
                  disabled={generating}
                  className="bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-amber-50 text-xs font-medium px-4 py-2 rounded-xl transition-all"
                >
                  {generating ? 'Generating...' : 'Generate with AI'}
                </button>
                {session && (
                  <button
                    onClick={saveSession}
                    className="bg-blue-900 hover:bg-blue-800 text-blue-100 text-xs font-medium px-4 py-2 rounded-xl transition-all"
                  >
                    Save session
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {generating && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center mb-4">
                  <div className="text-sm font-medium text-white mb-2">
                    Building {selectedClient.full_name}'s session...
                  </div>
                  <div className="text-xs text-neutral-500">
                    Analyzing phase, sport demands, training age, and goals
                  </div>
                </div>
              )}

              {!session && !generating && (
                <div className="flex items-center justify-center h-48">
                  <div className="text-center">
                    <div className="text-sm text-neutral-400 mb-2">No session built yet</div>
                    <p className="text-xs text-neutral-600 mb-4">
                      Click Generate with AI to build a session for {selectedClient.full_name}
                    </p>
                    <button
                      onClick={generateSession}
                      className="bg-amber-800 hover:bg-amber-900 text-amber-50 text-xs font-medium px-4 py-2 rounded-xl"
                    >
                      Generate with AI
                    </button>
                  </div>
                </div>
              )}

              {session && (
                <>
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 mb-5">
                    <div className="text-xs font-medium text-amber-500 mb-1">{session.sessionTitle}</div>
                    <div className="text-xs text-neutral-400 leading-relaxed">{session.rationale}</div>
                  </div>

                  {session.blocks && session.blocks.map(function(block, bi) {
                    return (
                      <div key={bi} className="mb-5">
                        <div className="flex items-center gap-2 mb-3">
                          <div className={'w-2 h-2 rounded-full ' + (dotMap[block.blockColor] || dotMap.gray)} />
                          <div className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                            {block.blockName}
                          </div>
                        </div>
                        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-neutral-800">
                                <th className="text-left px-4 py-2.5 text-xs font-medium text-neutral-500" style={{width:'22%'}}>Exercise</th>
                                {(view === 'planned' || view === 'both') && (
                                  <>
                                    <th className="text-left px-3 py-2.5 text-xs font-medium text-neutral-500">Sets</th>
                                    <th className="text-left px-3 py-2.5 text-xs font-medium text-neutral-500">Reps</th>
                                    <th className="text-left px-3 py-2.5 text-xs font-medium text-neutral-500">Load</th>
                                    <th className="text-left px-3 py-2.5 text-xs font-medium text-neutral-500">Tempo</th>
                                    <th className="text-left px-3 py-2.5 text-xs font-medium text-neutral-500">Int%</th>
                                    <th className="text-left px-3 py-2.5 text-xs font-medium text-neutral-500">RPE</th>
                                    <th className="text-left px-3 py-2.5 text-xs font-medium text-neutral-500">Rest</th>
                                  </>
                                )}
                                {(view === 'actual' || view === 'both') && (
                                  <>
                                    <th className="text-left px-3 py-2.5 text-xs font-medium text-neutral-500">Act. sets</th>
                                    <th className="text-left px-3 py-2.5 text-xs font-medium text-neutral-500">Act. reps</th>
                                    <th className="text-left px-3 py-2.5 text-xs font-medium text-neutral-500">Act. load</th>
                                  </>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {block.exercises && block.exercises.map(function(ex, ei) {
                                const key = bi + '-' + ei
                                return (
                                  <tr key={ei} className="border-b border-neutral-800 last:border-0">
                                    <td className="px-4 py-3">
                                      <div className="text-xs font-medium text-white">{ex.name}</div>
                                      <div className="text-xs text-neutral-500 italic mt-0.5">{ex.cue}</div>
                                    </td>
                                    {(view === 'planned' || view === 'both') && (
                                      <>
                                        <td className="px-3 py-3 text-xs text-neutral-300">{ex.sets}</td>
                                        <td className="px-3 py-3 text-xs text-neutral-300">{ex.reps}</td>
                                        <td className="px-3 py-3 text-xs text-neutral-300">{ex.load}</td>
                                        <td className="px-3 py-3 text-xs text-neutral-300">{ex.tempo}</td>
                                        <td className="px-3 py-3 text-xs text-neutral-300">{ex.intensity}</td>
                                        <td className="px-3 py-3 text-xs text-neutral-300">{ex.rpe}</td>
                                        <td className="px-3 py-3 text-xs text-neutral-300">{ex.rest}</td>
                                      </>
                                    )}
                                    {(view === 'actual' || view === 'both') && (
                                      <>
                                        <td className="px-3 py-3">
                                          <input
                                            type="text"
                                            placeholder="—"
                                            value={actualData[key] ? actualData[key].sets || '' : ''}
                                            onChange={function(e) {
                                              const val = e.target.value
                                              setActualData(function(prev) {
                                                const updated = Object.assign({}, prev)
                                                updated[key] = Object.assign({}, prev[key], { sets: val })
                                                return updated
                                              })
                                            }}
                                            className="w-14 bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-700"
                                          />
                                        </td>
                                        <td className="px-3 py-3">
                                          <input
                                            type="text"
                                            placeholder="—"
                                            value={actualData[key] ? actualData[key].reps || '' : ''}
                                            onChange={function(e) {
                                              const val = e.target.value
                                              setActualData(function(prev) {
                                                const updated = Object.assign({}, prev)
                                                updated[key] = Object.assign({}, prev[key], { reps: val })
                                                return updated
                                              })
                                            }}
                                            className="w-14 bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-700"
                                          />
                                        </td>
                                        <td className="px-3 py-3">
                                          <input
                                            type="text"
                                            placeholder="—"
                                            value={actualData[key] ? actualData[key].load || '' : ''}
                                            onChange={function(e) {
                                              const val = e.target.value
                                              setActualData(function(prev) {
                                                const updated = Object.assign({}, prev)
                                                updated[key] = Object.assign({}, prev[key], { load: val })
                                                return updated
                                              })
                                            }}
                                            className="w-20 bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-700"
                                          />
                                        </td>
                                      </>
                                    )}
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )
                  })}

                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
                    <div className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-3">
                      Session notes and adjustments
                    </div>
                    <textarea
                      rows={3}
                      value={sessionNotes}
                      onChange={function(e) { setSessionNotes(e.target.value) }}
                      placeholder="Log adjustments, athlete feedback, readiness score, fatigue level..."
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-700 resize-none"
                    />
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}