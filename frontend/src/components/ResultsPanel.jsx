import React from 'react';
import RadialGauge from './RadialGauge';
import { 
  ShieldAlert, CheckCircle2, UserCheck, Pill, AlertTriangle, 
  MapPin, ChevronRight, Stethoscope, Info, Sparkles 
} from 'lucide-react';

export default function ResultsPanel({ result, onFindHospitals }) {
  if (!result) return null;

  const { primary_prediction, differentials, matched_symptoms, unmatched_symptoms, disclaimer } = result;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Primary Diagnosis Hero Card */}
      <div className="glass-panel" style={{
        padding: '28px',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(13, 31, 58, 0.9) 100%)',
        border: '1px solid rgba(14, 165, 233, 0.35)',
        boxShadow: '0 12px 40px -10px rgba(14, 165, 233, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        
        {/* Top bar: Badge & Action */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Primary Diagnostic Match
            </span>
            <span style={{
              background: primary_prediction.risk_color === 'red' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: primary_prediction.risk_color === 'red' ? '#fda4af' : '#6ee7b7',
              border: `1px solid ${primary_prediction.risk_color === 'red' ? 'rgba(244, 63, 94, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '6px'
            }}>
              {primary_prediction.risk_level}
            </span>
          </div>

          <button
            onClick={() => onFindHospitals(primary_prediction.recommended_specialist)}
            className="btn-primary"
            style={{ fontSize: '0.85rem', padding: '8px 16px' }}
          >
            <MapPin size={16} />
            <span>Find {primary_prediction.recommended_specialist} Near You</span>
          </button>
        </div>

        {/* Center Grid: Gauge + Disease Info */}
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '28px', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <RadialGauge value={primary_prediction.confidence} size={150} label="Match Probability" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
              {primary_prediction.disease}
            </h2>
            <p style={{ fontSize: '0.925rem', color: '#cbd5e1', lineHeight: '1.6' }}>
              {primary_prediction.description}
            </p>

            {/* Specialist & Medicine badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '4px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'rgba(2, 132, 199, 0.15)', border: '1px solid rgba(2, 132, 199, 0.3)',
                padding: '6px 12px', borderRadius: '8px', fontSize: '0.8125rem'
              }}>
                <UserCheck size={16} color="#60a5fa" />
                <span style={{ color: '#93c5fd' }}>Recommended Specialist:</span>
                <strong style={{ color: '#ffffff' }}>{primary_prediction.recommended_specialist}</strong>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '6px 12px', borderRadius: '8px', fontSize: '0.8125rem'
              }}>
                <Pill size={16} color="#34d399" />
                <span style={{ color: '#a7f3d0' }}>Therapeutic Class:</span>
                <strong style={{ color: '#ffffff' }}>{primary_prediction.medicine_class}</strong>
              </div>
            </div>

          </div>
        </div>

        {/* Actionable Precautions Checklist */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#0EA5E9', letterSpacing: '0.05em' }}>
            Recommended Clinical Precautions & Next Steps
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            {primary_prediction.precautions.map((pre, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.85rem', color: '#e2e8f0', textTransform: 'capitalize' }}>
                  {pre}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Differential Diagnoses & Symptom Breakdown Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        
        {/* Differential Diagnoses Chart */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Stethoscope size={18} color="#0EA5E9" />
              <span>Differential Diagnoses</span>
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Top 5 Probabilities</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {differentials.map((diff, idx) => (
              <div key={idx} style={{
                background: 'rgba(30, 41, 59, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '10px',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: idx === 0 ? '#22d3ee' : '#f1f5f9' }}>
                    {idx + 1}. {diff.disease}
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: idx === 0 ? '#22d3ee' : '#94a3b8' }}>
                    {diff.probability}%
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.max(4, diff.probability)}%`,
                    height: '100%',
                    background: idx === 0 ? 'linear-gradient(90deg, #0EA5E9, #0284C7)' : '#64748b',
                    borderRadius: '3px',
                    transition: 'width 0.8s ease'
                  }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                  <span>{diff.specialist}</span>
                  <span style={{ color: '#64748b' }}>{diff.medicine_class}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Symptoms Correlation Matrix */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={18} color="#0EA5E9" />
            <span>Symptoms Correlation Breakdown</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Recognized features matched against the 132-symptom clinical knowledge base:
            </span>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
              {matched_symptoms.map(s => (
                <div key={s.id} style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  color: '#6ee7b7',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <CheckCircle2 size={12} color="#10b981" />
                  <span>{s.label}</span>
                  <span style={{ fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.2)', padding: '1px 4px', borderRadius: '3px' }}>
                    L{s.severity}
                  </span>
                </div>
              ))}
            </div>

            {unmatched_symptoms.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 600 }}>
                  Unrecognized inputs:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                  {unmatched_symptoms.map((s, idx) => (
                    <span key={idx} style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      color: '#fca5a5',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem'
                    }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Medical Disclaimer Banner */}
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
            Clinical & Legal Notice
          </h4>
          <p style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.5' }}>
            {disclaimer}
          </p>
        </div>
      </div>

    </div>
  );
}
