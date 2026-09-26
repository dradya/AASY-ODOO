import { useState, useEffect } from 'react';
import { api } from './api';
import './App.css';

function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Check if we are already logged in on page load
  useEffect(() => {
    const checkUser = async () => {
      const data = await api.getCurrentUser();
      if (data?.user) {
        setUser(data.user);
        loadProfile();
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const loadProfile = async () => {
    const data = await api.getProfile();
    if (data?.profile) setProfile(data.profile);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const { ok, data } = await api.login(email, password);
    
    if (ok) {
      setUser(data.user);
      loadProfile();
    } else {
      setError(data.error || 'Login failed');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const data = await api.signup(email, password);
    if (data.error) {
      setError(data.error);
    } else {
      alert('Signup successful! Check your email to verify (or just try logging in if email verification is off).');
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setProfile(null);
  };

  const handleSaveProfile = async () => {
    const newName = prompt('Enter full name:', profile?.full_name || '');
    if (newName !== null) {
      const data = await api.saveProfile({ full_name: newName, company: 'StockSense User' });
      if (data.profile) setProfile(data.profile);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>StockSense</h1>
      
      {!user ? (
        <div style={{ maxWidth: '300px', margin: '0 auto', textAlign: 'left' }}>
          <h2>Login / Signup</h2>
          {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
          
          <form>
            <div style={{ marginBottom: '1rem' }}>
              <label>Email:</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Password:</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={handleLogin}>Login</button>
              <button onClick={handleSignup} type="button">Sign Up</button>
            </div>
          </form>
        </div>
      ) : (
        <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'left', border: '1px solid #ccc', padding: '2rem', borderRadius: '8px' }}>
          <h2>Welcome, {user.email}!</h2>
          <p>You are successfully connected to the Flask + Supabase backend.</p>
          
          <hr style={{ margin: '1.5rem 0' }} />
          
          <h3>Your Profile Data</h3>
          {profile ? (
            <ul>
              <li><strong>Name:</strong> {profile.full_name || 'Not set'}</li>
              <li><strong>Company:</strong> {profile.company || 'Not set'}</li>
              <li><strong>Role:</strong> {profile.role || 'Not set'}</li>
            </ul>
          ) : (
            <p>No profile data found in Supabase.</p>
          )}
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button onClick={handleSaveProfile}>Edit Profile</button>
            <button onClick={handleLogout} style={{ background: '#ff4444', color: 'white' }}>Logout</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
