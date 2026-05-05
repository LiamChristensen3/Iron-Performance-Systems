import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

function ProfileContent({ client, onBack }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [programs, setPrograms] = useState([])
  const [nutrition, setNutrition] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editingNutrition, setEditingNutrition] = useState(false)
  const [nutritionForm, setNutritionForm] = useState({
    title: '', calories: '', protein: '', carbs: '', fats: '',
    meals: { breakfast: '', lunch: '', dinner: '', snacks: '' },
    notes: ''
  })

 useEffect(() => {
  fetchClientData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [client.id])

  async function fetchClientData() {
    setLoading(true)
    const [{ data: programsData }, { data: nutritionData }] = await Promise.all([
      supabase.from('programs').select('*').eq('client_id', client.id).order('created_at', { ascending: false }),
      supabase.from('nutrition_plans').select('*').eq('client_id', client.id).eq('status', 'active').single(),
    ])
    setPrograms(programsData || [])
    setNutrition(nutritionData || null)
    if (nutritionData) {
      setNutritionForm({
        title: nutritionData.title || '',
        calories: nutritionData.calories || '',
        protein: nutritionData.protein || '',
        carbs: nutritionData.carbs || '',
        fats: nutritionData.fats || '',
        meals: nutritionData.meals || { breakfast: '', lunch: '', dinner: '', snacks: '' },
        notes: nutritionData.notes || ''
      })
    }
    setLoading(false)
  }

  async function saveNutrition() {
    const { data: { user } } = await supabase.auth.getUser()
    const payload = {
      client_id: client.id,
      coach_id: user.id,
      title: nutritionForm.title,
      calories: parseInt(nutritionForm.calories) || null,
      protein: parseInt(nutritionForm.protein) || null,
      carbs: parseInt(nutritionForm.carbs) || null,
      fats: parseInt(nutritionForm.fats) || null,
      meals: nutritionForm.meals,
      notes: nutritionForm.notes,
      status: 'active'
    }
    if (nutrition) {
      await supabase.from('nutrition_plans').update(payload).eq('id', nutrition.id)
    } else {
      await supabase.from('nutrition_plans').insert(payload)
    }
    setEditingNutrition(false)
    await fetchClientData()
  }

  function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  function getCategoryLabel(cat) {
    switch (cat) {
      case 'genpop': return 'Gen pop'
      case 'pt': return 'PT patient'
      default: return cat.charAt(0).toUpperCase() + cat.slice(1)
    }
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

  const activeProgram = programs.find(p => p.status === 'active') || programs[0]
  const progress = activeProgram ? Math.round((activeProgram.week_current / activeProgram.week_total) * 100) : 0
  const catStyle = getCategoryColor(client.category)

  const glass = {
    background: 'rgba(10,10,10,0.55)',
    border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    backdropFilter: 'blur(12px)',
  }

  const inputStyle = {
    width: '100%',
    background: 'rgba(0,0,0,0.3)',
    border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '9px 12px',
    fontSize: '12px',
    color: '#fff',
    outline: 'none',
  }

  const tabs = ['overview', 'programs', 'nutrition', 'history']

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <button
        onClick={onBack}
        style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '16px', fontWeight: 500 }}
      >
        ← Back
      </button>

      <div style={{ ...glass, padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: catStyle.bg, border: '1.5px solid ' + catStyle.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700, color: catStyle.color, flexShrink: 0 }}>
              {getInitials(client.full_name)}
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', letterSpacing: '-0.01em', marginBottom: '6px' }}>{client.full_name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 9px', borderRadius: '999px', background: catStyle.bg, color: catStyle.color, border: '0.5px solid ' + catStyle.border }}>
                  {getCategoryLabel(client.category)}
                </span>
                {client.sport && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{client.sport}</span>}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { label: 'Height', value: client.height },
              { label: 'Weight', value: client.weight },
              { label: 'Training age', value: client.training_age ? client.training_age + ' yrs' : null },
            ].filter(m => m.value).map(m => (
              <div key={m.label} style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{m.label}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2px', marginBottom: '20px', background: 'rgba(10,10,10,0.4)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '3px', width: 'fit-content', backdropFilter: 'blur(12px)' }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ padding: '7px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: 'none', background: activeTab === tab ? '#BA7517' : 'transparent', color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.4)', textTransform: 'capitalize', transition: 'all 0.15s' }}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>Loading...</div>
      ) : (
        <>
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div style={{ ...glass, padding: '16px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', marginBottom: '12px' }}>Profile</div>
                  {[
                    { label: 'Goal', value: client.goal },
                    { label: 'Age', value: client.age },
                    { label: 'Movement quality', value: client.movement_quality },
                    { label: 'Strength level', value: client.strength_level },
                    { label: 'Injury history', value: client.injury_history },
                  ].filter(r => r.value).map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '0.5px solid rgba(255,255,255,0.06)', fontSize: '12px' }}>
                      <span style={{ color: 'rgba(255,255,255,0.4)' }}>{row.label}</span>
                      <span style={{ color: '#fff', fontWeight: 600, textAlign: 'right', maxWidth: '55%' }}>{row.value}</span>
                    </div>
                  ))}
                </div>
                {client.notes && (
                  <div style={{ ...glass, padding: '16px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', marginBottom: '10px' }}>Coach notes</div>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>{client.notes}</p>
                  </div>
                )}
              </div>
              <div>
                {activeProgram ? (
                  <div style={{ ...glass, padding: '16px', marginBottom: '12px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', marginBottom: '12px' }}>Current program</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{activeProgram.title}</div>
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '999px', background: 'rgba(29,158,117,0.2)', color: '#6ee7b7', border: '0.5px solid rgba(29,158,117,0.3)', fontWeight: 600 }}>Active</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '10px' }}>{activeProgram.method} · Week {activeProgram.week_current} of {activeProgram.week_total}</div>
                    <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '999px', height: '4px', overflow: 'hidden', marginBottom: '4px' }}>
                      <div style={{ height: '4px', borderRadius: '999px', background: '#BA7517', width: progress + '%' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>
                      <span>Progress</span><span>{progress}%</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ ...glass, padding: '24px', textAlign: 'center', marginBottom: '12px' }}>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>No active program</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>Build a program for this client</div>
                  </div>
                )}
                {nutrition && (
                  <div style={{ ...glass, padding: '16px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', marginBottom: '12px' }}>Nutrition snapshot</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '6px', marginBottom: '10px' }}>
                      {[
                        { label: 'Calories', value: nutrition.calories, unit: 'kcal', color: '#BA7517' },
                        { label: 'Protein', value: nutrition.protein, unit: 'g', color: '#93c5fd' },
                        { label: 'Carbs', value: nutrition.carbs, unit: 'g', color: '#6ee7b7' },
                        { label: 'Fats', value: nutrition.fats, unit: 'g', color: '#c4b5fd' },
                      ].map(m => (
                        <div key={m.label} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginBottom: '3px', fontWeight: 600 }}>{m.label}</div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: m.color }}>{m.value || '—'}</div>
                          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)' }}>{m.unit}</div>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setActiveTab('nutrition')} style={{ fontSize: '11px', color: '#BA7517', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
                      View full plan →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'programs' && (
            <div>
              {programs.length === 0 ? (
                <div style={{ ...glass, padding: '48px', textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>No programs yet</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>Build the first program for this client</div>
                </div>
              ) : (
                programs.map(program => (
                  <div key={program.id} style={{ ...glass, padding: '16px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{program.title}</div>
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '999px', background: program.status === 'active' ? 'rgba(29,158,117,0.2)' : 'rgba(255,255,255,0.08)', color: program.status === 'active' ? '#6ee7b7' : 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                        {program.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '10px' }}>
                      {program.method} · {program.phase} · Week {program.week_current} of {program.week_total}
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '999px', height: '3px', overflow: 'hidden', marginBottom: '4px' }}>
                      <div style={{ height: '3px', borderRadius: '999px', background: '#BA7517', width: Math.round((program.week_current / program.week_total) * 100) + '%' }} />
                    </div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>
                      Started {new Date(program.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'nutrition' && (
            <div>
              {!editingNutrition && !nutrition && (
                <div style={{ ...glass, padding: '48px', textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>No nutrition plan yet</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginBottom: '16px' }}>Create a nutrition plan for this client</div>
                  <button onClick={() => setEditingNutrition(true)} style={{ background: '#BA7517', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                    + Create nutrition plan
                  </button>
                </div>
              )}
              {!editingNutrition && nutrition && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{nutrition.title}</div>
                    <button onClick={() => setEditingNutrition(true)} style={{ fontSize: '11px', color: '#BA7517', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Edit plan</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '16px' }}>
                    {[
                      { label: 'Calories', value: nutrition.calories, unit: 'kcal', bg: 'rgba(186,117,23,0.2)', color: '#BA7517', border: 'rgba(186,117,23,0.3)' },
                      { label: 'Protein', value: nutrition.protein, unit: 'g', bg: 'rgba(55,138,221,0.2)', color: '#93c5fd', border: 'rgba(55,138,221,0.3)' },
                      { label: 'Carbs', value: nutrition.carbs, unit: 'g', bg: 'rgba(29,158,117,0.2)', color: '#6ee7b7', border: 'rgba(29,158,117,0.3)' },
                      { label: 'Fats', value: nutrition.fats, unit: 'g', bg: 'rgba(127,119,221,0.2)', color: '#c4b5fd', border: 'rgba(127,119,221,0.3)' },
                    ].map(m => (
                      <div key={m.label} style={{ background: m.bg, border: '0.5px solid ' + m.border, borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', color: m.color, opacity: 0.7, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{m.label}</div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: m.color }}>{m.value || '—'}</div>
                        <div style={{ fontSize: '10px', color: m.color, opacity: 0.5 }}>{m.unit}</div>
                      </div>
                    ))}
                  </div>
                  {nutrition.meals && (
                    <div style={{ ...glass, padding: '16px', marginBottom: '12px' }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', marginBottom: '12px' }}>Meal plan</div>
                      {Object.entries(nutrition.meals).map(([meal, content]) => content && (
                        <div key={meal} style={{ padding: '10px 0', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'capitalize', marginBottom: '4px', letterSpacing: '0.06em' }}>{meal}</div>
                          <div style={{ fontSize: '12px', color: '#fff', fontWeight: 500 }}>{content}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {nutrition.notes && (
                    <div style={{ ...glass, padding: '16px' }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', marginBottom: '10px' }}>Notes</div>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>{nutrition.notes}</p>
                    </div>
                  )}
                </div>
              )}
              {editingNutrition && (
                <div style={{ ...glass, padding: '20px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '20px' }}>
                    {nutrition ? 'Edit nutrition plan' : 'Create nutrition plan'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Plan title</label>
                      <input type="text" value={nutritionForm.title} onChange={e => setNutritionForm({ ...nutritionForm, title: e.target.value })} placeholder="e.g. Off-season bulk plan" style={inputStyle} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px' }}>
                      {['calories', 'protein', 'carbs', 'fats'].map(field => (
                        <div key={field}>
                          <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>{field}</label>
                          <input type="number" value={nutritionForm[field]} onChange={e => setNutritionForm({ ...nutritionForm, [field]: e.target.value })} placeholder="0" style={inputStyle} />
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Meal plan</div>
                    {['breakfast', 'lunch', 'dinner', 'snacks'].map(meal => (
                      <div key={meal}>
                        <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>{meal}</label>
                        <textarea rows={2} value={nutritionForm.meals[meal]} onChange={e => setNutritionForm({ ...nutritionForm, meals: { ...nutritionForm.meals, [meal]: e.target.value } })} style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }} />
                      </div>
                    ))}
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Additional notes</label>
                      <textarea rows={3} value={nutritionForm.notes} onChange={e => setNutritionForm({ ...nutritionForm, notes: e.target.value })} style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={saveNutrition} style={{ background: '#BA7517', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 18px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Save plan</button>
                      <button onClick={() => setEditingNutrition(false)} style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', border: 'none', borderRadius: '8px', padding: '9px 18px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div style={{ ...glass, padding: '48px', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>Program history</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>Past programs and session logs will appear here</div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function ClientProfile({ client, onBack }) {
  if (!client || !client.id) return null
  return <ProfileContent client={client} onBack={onBack} />
}