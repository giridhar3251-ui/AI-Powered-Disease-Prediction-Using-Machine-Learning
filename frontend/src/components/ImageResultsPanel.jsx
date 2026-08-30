import React from 'react';
import { 
  Sparkles, CheckCircle2, UserCheck, ShieldAlert, 
  MapPin, AlertTriangle, Activity, Camera, RefreshCw 
} from 'lucide-react';
import RadialGauge from './RadialGauge';

export default function ImageResultsPanel({ result, imagePreview, onFindDermatologist, onReset }) {
  if (!result) return null;

  const { title, confidence, probabilities, category, specialist, severity, remedies, precautions, disclaimer } = result;

  const classLabels = {
    acne: 'Acne Vulgaris',
    black_spots: 'Black Spots & Hyperpigmentation',
    puffy_eyes: 'Periorbital Puffiness',
    wrinkles: 'Fine Lines & Wrinkles'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Hero Diagnostic Match Card */}
      <div className="glass-panel" style={{
        padding: '28px',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(13, 31, 58, 0.9) 100%)',
        border: '1px solid rgba(14, 165, 233, 0.35)',
        boxShadow: '0 12px 40px -10px rgba(14, 165, 233, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
              color: '#ffffff', fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px',
              borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.05em'
            }}>
              Dermatological Evaluation
            </span>
            <span style={{
              background: 'rgba(2, 132, 199, 0.15)', color: '#93c5fd',
              border: '1px solid rgba(2, 132, 199, 0.3)', fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '6px'
            }}>
              {category}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {onReset && (
              <button
                onClick={onReset}
                className="btn-secondary"
                style={{ fontSize: '0.85rem', padding: '8px 14px' }}
              >
                <Camera size={16} color="#0EA5E9" />
                <span>Capture Another Image</span>
              </button>
            )}

            <button
              onClick={() => onFindDermatologist('Dermatology')}
              className="btn-primary"
              style={{ fontSize: '0.85rem', padding: '8px 16px' }}
            >
              <MapPin size={16} />
              <span>Find Dermatologist Near You</span>
            </button>
          </div>
        </div>

        {/* Center Grid: Image / Gauge / Info */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'center' }}>
          
          {imagePreview && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                position: 'relative', width: '220px', height: '220px', borderRadius: '16px',
                overflow: 'hidden', border: '2px solid rgba(14, 165, 233, 0.4)',
                boxShadow: '0 0 20px rgba(14, 165, 233, 0.2)'
              }}>
                <img
                  src={imagePreview}
                  alt="Diagnosed Area"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute', bottom: '0', left: '0', right: '0',
                  background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(6px)',
                  padding: '6px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#e2e8f0'
                }}>
                  Scanned ROI
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <RadialGauge value={confidence} size={120} label="Match Score" />
              <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                  {title}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  <UserCheck size={16} color="#0EA5E9" />
                  <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                    Consult: <strong style={{ color: '#ffffff' }}>{specialist}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Multi-Class Probability Bars */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#0EA5E9', letterSpacing: '0.05em' }}>
            Class Probability Distribution
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            {Object.entries(probabilities || {}).map(([key, val]) => (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                  <span style={{ color: '#cbd5e1' }}>{classLabels[key] || key}</span>
                  <span style={{ color: '#22d3ee' }}>{val}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.max(3, val)}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #0EA5E9, #0284C7)',
                    borderRadius: '3px',
                    transition: 'width 0.8s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Remedies & Precautions Split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Recommended Skincare Protocol */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#0EA5E9" />
            <span>Targeted Skincare Guidance</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {remedies?.map((rem, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: '1.5' }}>
                  {rem}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Precautions */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={18} color="#f59e0b" />
            <span>Important Precautions</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {precautions?.map((prec, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <AlertTriangle size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: '1.5' }}>
                  {prec}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Disclaimer */}
      <div style={{
        background: 'rgba(245, 158, 11, 0.08)',
        border: '1px solid rgba(245, 158, 11, 0.25)',
        borderRadius: '12px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px'
      }}>
        <AlertTriangle size={22} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24', marginBottom: '2px' }}>
            Cosmetic Skin Concern Disclaimer
          </h4>
          <p style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.5' }}>
            {disclaimer}
          </p>
        </div>
      </div>

    </div>
  );
}
