import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SymptomSelector from './components/SymptomSelector';
import ResultsPanel from './components/ResultsPanel';
import ImageUploader from './components/ImageUploader';
import ImageResultsPanel from './components/ImageResultsPanel';
import HospitalFinder from './components/HospitalFinder';
import LoginPage from './components/LoginPage';
import { fetchHealth, fetchSymptoms, fetchDistricts, fetchImageModelInfo, predictDisease } from './api';
import { AlertCircle, Stethoscope, Sparkles, UserCheck, ShieldCheck, HeartPulse } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('aegis_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [showLogin, setShowLogin] = useState(false);
  const [activeTab, setActiveTab] = useState('symptoms'); // 'symptoms' | 'skin' | 'hospitals'
  const [backendOnline, setBackendOnline] = useState(false);
  const [symptoms, setSymptoms] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [imageModelInfo, setImageModelInfo] = useState(null);

  // Symptom state
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [symptomResult, setSymptomResult] = useState(null);
  const [symptomLoading, setSymptomLoading] = useState(false);
  const [symptomError, setSymptomError] = useState(null);

  // Skin state
  const [skinResult, setSkinResult] = useState(null);
  const [skinPreview, setSkinPreview] = useState(null);

  // Healthcare search state
  const [targetSpecialty, setTargetSpecialty] = useState('');

  // Initial load
  useEffect(() => {
    async function init() {
      try {
        const health = await fetchHealth();
        setBackendOnline(health.status === 'healthy');
      } catch (e) {
        setBackendOnline(false);
      }

      try {
        const symList = await fetchSymptoms();
        setSymptoms(symList);
      } catch (e) {
        console.error("Symptoms load error:", e);
      }

      try {
        const distData = await fetchDistricts();
        setDistricts(distData.districts || []);
      } catch (e) {
        console.error("Districts load error:", e);
      }

      try {
        const imgInfo = await fetchImageModelInfo();
        setImageModelInfo(imgInfo);
      } catch (e) {
        console.error("Image info error:", e);
      }
    }

    init();
    const interval = setInterval(async () => {
      try {
        const h = await fetchHealth();
        setBackendOnline(h.status === 'healthy');
      } catch {
        setBackendOnline(false);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLoginSuccess = (user, token) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('aegis_user', JSON.stringify(user));
      localStorage.setItem('aegis_token', token);
    } catch (e) {
      console.error("Failed to persist session:", e);
    }
    setShowLogin(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('aegis_user');
      localStorage.removeItem('aegis_token');
    } catch (e) {
      console.error("Failed to clear session:", e);
    }
  };

  const handleToggleSymptom = (symId) => {
    setSelectedSymptoms(prev => 
      prev.includes(symId) ? prev.filter(id => id !== symId) : [...prev, symId]
    );
  };

  const handleClearSymptoms = () => {
    setSelectedSymptoms([]);
    setSymptomResult(null);
    setSymptomError(null);
  };

  const handleAnalyzeSymptoms = async () => {
    if (selectedSymptoms.length === 0) return;
    setSymptomLoading(true);
    setSymptomError(null);
    try {
      const data = await predictDisease(selectedSymptoms, 5);
      setSymptomResult(data);
    } catch (err) {
      setSymptomError(err.message || 'Diagnostic inference failed');
    } finally {
      setSymptomLoading(false);
    }
  };

  const handleSkinAnalysisComplete = (resultData, previewUrl) => {
    setSkinResult(resultData);
    setSkinPreview(previewUrl);
  };

  const handleSkinReset = () => {
    setSkinResult(null);
    setSkinPreview(null);
  };

  const handleFindHospitalsForSpecialty = (specialty) => {
    setTargetSpecialty(specialty);
    setActiveTab('hospitals');
  };

  if (showLogin) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onContinueAsGuest={() => setShowLogin(false)}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        backendStatus={backendOnline}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenLogin={() => setShowLogin(true)}
      />

      <main style={{ flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '24px 20px 48px' }}>
        
        {/* Clinician / Authenticated Banner */}
        {currentUser && (
          <div style={{
            marginBottom: '20px',
            background: 'linear-gradient(90deg, rgba(6, 182, 212, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            borderRadius: '14px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <HeartPulse size={20} color="#22d3ee" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
                    Welcome, {currentUser.name}
                  </span>
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 700, background: 'rgba(6, 182, 212, 0.2)',
                    color: '#22d3ee', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase'
                  }}>
                    {currentUser.role} Portal Active
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {currentUser.title} • {currentUser.institution}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#6ee7b7' }}>
              <ShieldCheck size={16} color="#10b981" />
              <span>Full Diagnostic Access Enabled</span>
            </div>
          </div>
        )}

        {/* Mode: Symptom Diagnostic Console */}
        {activeTab === 'symptoms' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '28px', alignItems: 'start' }}>
            <SymptomSelector
              symptoms={symptoms}
              selectedSymptoms={selectedSymptoms}
              onToggleSymptom={handleToggleSymptom}
              onClearAll={handleClearSymptoms}
              onAnalyze={handleAnalyzeSymptoms}
              loading={symptomLoading}
            />

            <div>
              {symptomError && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '12px', padding: '16px', color: '#fca5a5', marginBottom: '20px',
                  display: 'flex', alignItems: 'center', gap: '10px'
                }}>
                  <AlertCircle size={20} color="#ef4444" />
                  <span>{symptomError}</span>
                </div>
              )}

              {symptomResult ? (
                <ResultsPanel
                  result={symptomResult}
                  onFindHospitals={handleFindHospitalsForSpecialty}
                />
              ) : (
                <div className="glass-panel" style={{
                  padding: '48px 32px', textAlign: 'center', display: 'flex',
                  flexDirection: 'column', alignItems: 'center', gap: '16px', minHeight: '400px', justifyContent: 'center'
                }}>
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '20px',
                    background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Stethoscope size={32} color="#06b6d4" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
                      Diagnostic Results Console Awaiting Input
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', maxWidth: '380px', marginTop: '6px' }}>
                      Select reported symptoms or load a diagnostic test case from the left panel and click <strong>Run AI Diagnostic Analysis</strong>.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mode: Dermatological Image AI */}
        {activeTab === 'skin' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '28px', alignItems: 'start' }}>
            <ImageUploader
              onAnalysisComplete={handleSkinAnalysisComplete}
              onResetResult={handleSkinReset}
              imageModelInfo={imageModelInfo}
            />

            <div>
              {skinResult ? (
                <ImageResultsPanel
                  result={skinResult}
                  imagePreview={skinPreview}
                  onFindDermatologist={handleFindHospitalsForSpecialty}
                  onReset={handleSkinReset}
                />
              ) : (
                <div className="glass-panel" style={{
                  padding: '48px 32px', textAlign: 'center', display: 'flex',
                  flexDirection: 'column', alignItems: 'center', gap: '16px', minHeight: '400px', justifyContent: 'center'
                }}>
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '20px',
                    background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Sparkles size={32} color="#06b6d4" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
                      Dermatological Scanner Standby
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', maxWidth: '380px', marginTop: '6px' }}>
                      Upload a skin photo or click any test sample on the left to run feature extraction across Acne, Hyperpigmentation, Puffy Eyes, and Wrinkles.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mode: Tamil Nadu Hospital & Specialist Finder */}
        {activeTab === 'hospitals' && (
          <HospitalFinder
            initialSpecialty={targetSpecialty}
            districts={districts}
          />
        )}

      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center', padding: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        color: '#64748b', fontSize: '0.75rem', background: 'rgba(9, 13, 22, 0.9)'
      }}>
        AegisMed AI Clinical Intelligence Platform • 132-Symptom Random Forest Classifier • 41 Diseases • 38 TN Districts
      </footer>
    </div>
  );
}
