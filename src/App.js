import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import ClientProfile from './pages/ClientProfile'
import NewClient from './pages/NewClient'
import Teams from './pages/Teams'
import Roster from './pages/Roster'
import SessionBuilder from './pages/SessionBuilder'

const sportImages = {
  football: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=1600&q=80',
  baseball: 'https://images.unsplash.com/photo-1508344928928-7165b67de128?w=1600&q=80',
  basketball: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1600&q=80',
  soccer: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1600&q=80',
  track: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1600&q=80',
  swimming: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1600&q=80',
  wrestling: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1600&q=80',
  volleyball: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1600&q=80',
  bodybuilder: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80',
  pt: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1600&q=80',
  default: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1600&q=80'
}

function getSportImage(sport, category) {
  if (category === 'pt') return sportImages.pt
  if (category === 'bodybuilder') return sportImages.bodybuilder
  if (!sport) return sportImages.default
  const s = sport.toLowerCase()
  if (s.includes('football')) return sportImages.football
  if (s.includes('baseball')) return sportImages.baseball
  if (s.includes('basketball')) return sportImages.basketball
  if (s.includes('soccer')) return sportImages.soccer
  if (s.includes('track') || s.includes('sprint') || s.includes('100m') || s.includes('200m')) return sportImages.track
  if (s.includes('swim')) return sportImages.swimming
  if (s.includes('wrestl')) return sportImages.wrestling
  if (s.includes('volleyball')) return sportImages.volleyball
  return sportImages.default
}

export default function App() {
  const [session, setSession] = useState(null)
  const [coach, setCoach] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState('dashboard')
  const [selectedClient, setSelectedClient] = useState(null)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [clientSource, setClientSource] = useState('clients')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchCoach(session.user.id)
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchCoach(session.user.id)
      else { setCoach(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function fetchCoach(userId) {
    const { data } = await supabase
      .from('coaches')
      .select('*')
      .eq('id', userId)
      .single()
    setCoach(data)
    setLoading(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    setPage('dashboard')
    setSelectedClient(null)
    setSelectedTeam(null)
  }

  function navigateTo(newPage) {
  if (newPage === 'clients') setSelectedClient(null)
  if (newPage === 'teams') setSelectedTeam(null)
  if (newPage === 'client-profile' && !selectedClient) newPage = 'clients'
  setPage(newPage)
}

  function handleSelectClient(client, source) {
  if (client === 'new') {
    setClientSource('clients')
    setPage('new-client')
  } else if (client === 'new-team') {
    setClientSource('roster')
    setPage('new-client')
  } else if (client && client.id) {
    setSelectedClient(client)
    setClientSource(source || 'clients')
    setPage('client-profile')
  }
}

  function handleSelectTeam(team) {
    if (team && team.id) {
      setSelectedTeam(team)
      setPage('roster')
    } else {
      setPage('teams')
    }
  }

  function handleBackFromProfile() {
    setSelectedClient(null)
    setPage(clientSource === 'dashboard' ? 'dashboard' : clientSource === 'roster' ? 'roster' : 'clients')
  }

  function handleNewClientSuccess() {
    setPage(clientSource === 'roster' ? 'roster' : 'clients')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#555', fontSize: '13px', letterSpacing: '0.05em' }}>LOADING...</div>
      </div>
    )
  }

  if (!session) return <Auth />

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', color: '#BA7517' },
    { key: 'teams', label: 'Teams', color: '#378ADD' },
    { key: 'clients', label: 'Clients', color: '#1D9E75' },
    { key: 'session', label: 'Session builder', color: '#7F77DD' },
  ]

  const bgImage = page === 'client-profile' && selectedClient
    ? getSportImage(selectedClient.sport, selectedClient.category)
    : sportImages.default

  const showBg = page === 'dashboard' || page === 'client-profile'

  function isNavActive(key) {
    if (key === 'clients') return ['clients', 'client-profile', 'new-client'].includes(page)
    if (key === 'teams') return ['teams', 'roster'].includes(page)
    return page === key
  }

  function getPageTitle() {
    switch (page) {
      case 'dashboard': return 'Dashboard'
      case 'clients': return 'Clients'
      case 'client-profile': return selectedClient ? selectedClient.full_name : 'Client'
      case 'new-client': return 'New client'
      case 'teams': return 'Teams'
      case 'roster': return selectedTeam ? selectedTeam.name : 'Roster'
      case 'session': return 'Session builder'
      default: return 'Iron Performance Systems'
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0a0a0a', overflow: 'hidden' }}>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        <div style={{ width: '200px', minWidth: '200px', background: '#0a0a0a', display: 'flex', flexDirection: 'column', borderRight: '0.5px solid #1a1a1a', flexShrink: 0 }}>
          <div style={{ padding: '20px 12px 16px', flex: 1 }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
              <div style={{ width: '32px', height: '32px', background: '#BA7517', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3 9h3M12 9h3M6 9V5l3-2 3 2v4M6 9v4l3 2 3-2V9" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div style={{ lineHeight: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>Iron Performance</div>
                <div style={{ fontSize: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#444', marginTop: '2px' }}>Systems</div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#333', padding: '0 8px', marginBottom: '6px' }}>Workspace</div>
              {navItems.map(item => (
                <button
                  key={item.key}
                  onClick={() => navigateTo(item.key)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '8px', marginBottom: '1px', background: isNavActive(item.key) ? '#1c1400' : 'transparent', border: isNavActive(item.key) ? '0.5px solid #3a2800' : '0.5px solid transparent', cursor: 'pointer', textAlign: 'left' }}
                >
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', fontWeight: 500, color: isNavActive(item.key) ? '#BA7517' : '#666' }}>{item.label}</span>
                </button>
              ))}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#333', padding: '0 8px', marginBottom: '6px' }}>Tools</div>
              {[
                { label: 'Template library', color: '#D85A30' },
                { label: 'Assessments', color: '#555' },
              ].map(item => (
                <button key={item.label} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '8px', marginBottom: '1px', background: 'transparent', border: '0.5px solid transparent', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', fontWeight: 500, color: '#444' }}>{item.label}</span>
                </button>
              ))}
            </div>

            <div>
              <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#333', padding: '0 8px', marginBottom: '6px' }}>Account</div>
              <button style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '8px', background: 'transparent', border: '0.5px solid transparent', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#555', flexShrink: 0 }} />
                <span style={{ fontSize: '12px', fontWeight: 500, color: '#444' }}>Settings</span>
              </button>
              <button onClick={handleSignOut} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '8px', background: 'transparent', border: '0.5px solid transparent', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#555', flexShrink: 0 }} />
                <span style={{ fontSize: '12px', fontWeight: 500, color: '#444' }}>Sign out</span>
              </button>
            </div>
          </div>

          <div style={{ padding: '12px', borderTop: '0.5px solid #1a1a1a' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#1c1400', border: '1px solid #BA7517', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: '#BA7517', flexShrink: 0 }}>
                {coach?.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'LC'}
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#777' }}>{coach?.full_name}</div>
                <div style={{ fontSize: '10px', color: '#444' }}>Head coach</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          {showBg && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
              <img src={bgImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
            </div>
          )}

          <div style={{ position: 'relative', zIndex: 1, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: 'rgba(10,10,10,0.65)', backdropFilter: 'blur(12px)', borderBottom: '0.5px solid rgba(255,255,255,0.08)', padding: '0 24px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
                {getPageTitle()}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, padding: '4px 12px', borderRadius: '999px', background: 'rgba(186,117,23,0.15)', color: '#BA7517', border: '0.5px solid rgba(186,117,23,0.3)' }}>
                  Head coach
                </div>
                <button
                  onClick={() => handleSelectClient('new')}
                  style={{ background: '#BA7517', color: '#fff', border: 'none', borderRadius: '8px', padding: '7px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  + New client
                </button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {page === 'dashboard' && (
                <Dashboard coach={coach} onSelectClient={handleSelectClient} onSelectTeam={handleSelectTeam} />
              )}
              {page === 'clients' && (
                <Clients onSelectClient={handleSelectClient} />
              )}
              {page === 'client-profile' && selectedClient && selectedClient.id && (
  <ClientProfile key={selectedClient.id} client={selectedClient} onBack={handleBackFromProfile} />
)}
              {page === 'new-client' && (
  <NewClient
    onBack={() => setPage(clientSource === 'roster' ? 'roster' : 'clients')}
    onSuccess={handleNewClientSuccess}
    teamId={clientSource === 'roster' && selectedTeam ? selectedTeam.id : null}
    teamName={clientSource === 'roster' && selectedTeam ? selectedTeam.name : null}
  />
)}
              {page === 'teams' && (
                <Teams onSelectTeam={handleSelectTeam} />
              )}
              {page === 'roster' && selectedTeam && selectedTeam.id && (
                <Roster team={selectedTeam} onBack={() => setPage('teams')} onSelectClient={handleSelectClient} />
              )}
              {page === 'session' && (
                <SessionBuilder />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}