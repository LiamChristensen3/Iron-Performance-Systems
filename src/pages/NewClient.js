import { useState } from 'react'
import { supabase } from '../supabase'

export default function NewClient({ onBack, onSuccess, teamId, teamName }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    full_name: '',
    category: '',
    sport: '',
    position: '',
    age: '',
    height: '',
    weight: '',
    training_age: '',
    goal: '',
    injury_history: '',
    movement_quality: '',
    strength_level: '',
    notes: ''
  })

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('clients').insert({
      coach_id: user.id,
      team_id: teamId || null,
      full_name: form.full_name,
      category: form.category,
      sport: form.sport || null,
      position: form.position || null,
      age: parseInt(form.age) || null,
      height: form.height || null,
      weight: form.weight || null,
      training_age: parseFloat(form.training_age) || null,
      goal: form.goal || null,
      injury_history: form.injury_history || null,
      movement_quality: form.movement_quality || null,
      strength_level: form.strength_level || null,
      notes: form.notes || null
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      onSuccess()
    }
  }

  const categories = [
    { key: 'athlete', label: 'Athlete', sub: 'Sport performance, combine prep', color: 'rgba(55,138,221,0.2)', border: 'rgba(55,138,221,0.4)', text: '#93c5fd' },
    { key: 'bodybuilder', label: 'Bodybuilder', sub: 'Physique, competition prep', color: 'rgba(127,119,221,0.2)', border: 'rgba(127,119,221,0.4)', text: '#c4b5fd' },
    { key: 'genpop', label: 'General population', sub: 'Strength, fat loss, longevity', color: 'rgba(29,158,117,0.2)', border: 'rgba(29,158,117,0.4)', text: '#6ee7b7' },
    { key: 'pt', label: 'PT patient', sub: 'Post-injury, return-to-play', color: 'rgba(216,90,48,0.2)', border: 'rgba(216,90,48,0.4)', text: '#fca5a5' },
  ]

  const movementOptions = ['Elite — clean under fatigue', 'Good — minor compensations', 'Moderate — needs cueing', 'Poor — pattern work needed']
  const strengthOptions = ['Elite — exceeds all standards', 'Advanced — meets all standards', 'Intermediate — meets some', 'Beginner — below standards']
  const steps = ['Identity', 'Assessment', 'Goals', 'Review']

  const glass = {
    background: 'rgba(10,10,10,0.65)',
    border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    backdropFilter: 'blur(12px)',
  }

  const inputStyle = {
    width: '100%',
    background: 'rgba(0,0,0,0.3)',
    border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '10px 14px',
    fontSize: '13px',
    color: '#fff',
    outline: 'none',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '10px',
    fontWeight: 600,
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '6px'
  }

  return (
    <div style={{ padding: '24px', maxWidth: '680px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={onBack} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
          ← Back
        </button>
        <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
          New client
          {teamName && <span style={{ fontSize: '13px', color: '#BA7517', fontWeight: 600, marginLeft: '10px' }}>· {teamName}</span>}
        </h1>
      </div>

      {/* Step bar */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        {steps.map((s, i) => {
          const n = i + 1
          const isDone = n < step
          const isActive = n === step
          return (
            <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, background: isDone ? '#1D9E75' : isActive ? '#BA7517' : 'rgba(255,255,255,0.08)', color: isDone || isActive ? '#fff' : 'rgba(255,255,255,0.3)' }}>
                  {isDone ? '✓' : n}
                </div>
                <span style={{ fontSize: '12px', fontWeight: 500, color: isActive ? '#fff' : 'rgba(255,255,255,0.3)' }}>{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div style={{ width: '32px', height: '1px', background: isDone ? '#1D9E75' : 'rgba(255,255,255,0.1)', margin: '0 10px' }} />
              )}
            </div>
          )
        })}
      </div>

      {error && (
        <div style={{ background: 'rgba(226,75,74,0.15)', border: '0.5px solid rgba(226,75,74,0.3)', borderRadius: '10px', padding: '10px 14px', fontSize: '12px', color: '#fca5a5', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* STEP 1 */}
      {step === 1 && (
        <div style={{ ...glass, padding: '24px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Client identity</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '20px' }}>Start with who they are. Every program decision flows from this.</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Full name *</label>
              <input type="text" value={form.full_name} onChange={e => update('full_name', e.target.value)} placeholder="e.g. Marcus Johnson" style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <div>
                <label style={labelStyle}>Age</label>
                <input type="number" value={form.age} onChange={e => update('age', e.target.value)} placeholder="21" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Height</label>
                <input type="text" value={form.height} onChange={e => update('height', e.target.value)} placeholder='6&apos;1"' style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Weight</label>
                <input type="text" value={form.weight} onChange={e => update('weight', e.target.value)} placeholder="205 lb" style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={labelStyle}>Training age (years)</label>
                <input type="number" value={form.training_age} onChange={e => update('training_age', e.target.value)} placeholder="3" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Sport</label>
                <input type="text" value={form.sport} onChange={e => update('sport', e.target.value)} placeholder="Football" style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Position</label>
              <input type="text" value={form.position} onChange={e => update('position', e.target.value)} placeholder="Wide Receiver" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Client category *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
                {categories.map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => update('category', cat.key)}
                    style={{ textAlign: 'left', padding: '14px', borderRadius: '10px', border: '0.5px solid', borderColor: form.category === cat.key ? cat.border : 'rgba(255,255,255,0.08)', background: form.category === cat.key ? cat.color : 'rgba(255,255,255,0.03)', cursor: 'pointer', transition: 'all 0.15s' }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 700, color: form.category === cat.key ? cat.text : '#fff', marginBottom: '3px' }}>{cat.label}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{cat.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button
              onClick={() => setStep(2)}
              disabled={!form.full_name || !form.category}
              style={{ background: form.full_name && form.category ? '#BA7517' : 'rgba(255,255,255,0.08)', color: form.full_name && form.category ? '#fff' : 'rgba(255,255,255,0.3)', border: 'none', borderRadius: '8px', padding: '9px 18px', fontSize: '12px', fontWeight: 700, cursor: form.full_name && form.category ? 'pointer' : 'not-allowed' }}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div style={{ ...glass, padding: '24px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Physical assessment</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '20px' }}>Movement quality and strength standards determine what this athlete is ready for.</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={labelStyle}>Movement quality</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                {movementOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => update('movement_quality', opt)}
                    style={{ padding: '7px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: '0.5px solid', borderColor: form.movement_quality === opt ? '#BA7517' : 'rgba(255,255,255,0.1)', background: form.movement_quality === opt ? '#BA7517' : 'transparent', color: form.movement_quality === opt ? '#fff' : 'rgba(255,255,255,0.4)', transition: 'all 0.15s' }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Strength level</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                {strengthOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => update('strength_level', opt)}
                    style={{ padding: '7px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: '0.5px solid', borderColor: form.strength_level === opt ? '#BA7517' : 'rgba(255,255,255,0.1)', background: form.strength_level === opt ? '#BA7517' : 'transparent', color: form.strength_level === opt ? '#fff' : 'rgba(255,255,255,0.4)', transition: 'all 0.15s' }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Injury history</label>
              <textarea
                rows={3}
                value={form.injury_history}
                onChange={e => update('injury_history', e.target.value)}
                placeholder="e.g. ACL reconstruction right knee March 2024, fully cleared"
                style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
            <button onClick={() => setStep(1)} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>← Back</button>
            <button onClick={() => setStep(3)} style={{ background: '#BA7517', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 18px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Next →</button>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div style={{ ...glass, padding: '24px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Goals & demands</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '20px' }}>What is this block trying to accomplish? Everything must point in the same direction.</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Primary goal</label>
              <input type="text" value={form.goal} onChange={e => update('goal', e.target.value)} placeholder="e.g. Speed & power transfer for combine prep" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Coach notes (internal only)</label>
              <textarea rows={4} value={form.notes} onChange={e => update('notes', e.target.value)} placeholder="Any additional context, observations, or notes about this client..." style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
            <button onClick={() => setStep(2)} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>← Back</button>
            <button onClick={() => setStep(4)} style={{ background: '#BA7517', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 18px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Review →</button>
          </div>
        </div>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <div style={{ ...glass, padding: '24px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Review profile</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '20px' }}>Confirm everything before saving.</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
            {[
              { label: 'Name', value: form.full_name },
              { label: 'Category', value: form.category },
              { label: 'Age', value: form.age },
              { label: 'Height', value: form.height },
              { label: 'Weight', value: form.weight },
              { label: 'Training age', value: form.training_age ? form.training_age + ' years' : '—' },
              { label: 'Sport', value: form.sport || '—' },
              { label: 'Position', value: form.position || '—' },
              { label: 'Goal', value: form.goal || '—' },
              { label: 'Movement quality', value: form.movement_quality || '—' },
              { label: 'Strength level', value: form.strength_level || '—' },
              { label: 'Team', value: teamName || 'Individual client' },
            ].map(row => (
              <div key={row.label} style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 12px' }}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>{row.label}</div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>{row.value || '—'}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={() => setStep(3)} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>← Back</button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ background: loading ? 'rgba(255,255,255,0.08)' : '#BA7517', color: loading ? 'rgba(255,255,255,0.3)' : '#fff', border: 'none', borderRadius: '8px', padding: '9px 18px', fontSize: '12px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Saving...' : 'Save client'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}