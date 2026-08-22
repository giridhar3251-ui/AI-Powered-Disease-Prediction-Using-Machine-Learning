import React, { useState, useMemo } from 'react';
import { Search, X, Sparkles, Check, Flame, AlertCircle, RefreshCw } from 'lucide-react';

const PRESETS = [
  {
    name: "Common Cold / Flu",
    symptoms: ["continuous_sneezing", "chills", "fatigue", "cough", "headache", "throat_irritation", "runny_nose"]
  },
  {
    name: "GERD / Acid Reflux",
    symptoms: ["stomach_pain", "acidity", "ulcers_on_tongue", "vomiting", "chest_pain"]
  },
  {
    name: "Jaundice / Hepatic",
    symptoms: ["itching", "vomiting", "fatigue", "yellowish_skin", "dark_urine", "abdominal_pain", "yellowing_of_eyes"]
  },
  {
    name: "Skin Allergy / Rash",
    symptoms: ["itching", "skin_rash", "nodal_skin_eruptions", "dischromic _patches"]
  },
  {
    name: "Type 2 Diabetes Signs",
    symptoms: ["fatigue", "weight_loss", "lethargy", "irregular_sugar_level", "excessive_hunger", "polyuria"]
  }
];

export default function SymptomSelector({ symptoms, selectedSymptoms, onToggleSymptom, onClearAll, onAnalyze, loading }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = useMemo(() => {
    const set = new Set(symptoms.map(s => s.category));
    return ['All', ...Array.from(set).sort()];
  }, [symptoms]);

  const filteredSymptoms = useMemo(() => {
    return symptoms.filter(s => {
      const matchSearch = s.label.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase());
      const matchCat = activeCategory === 'All' || s.category === activeCategory;
      return matchSearch && matchCat;
    });
  }, [symptoms, search, activeCategory]);

  const avgSeverity = useMemo(() => {
    if (selectedSymptoms.length === 0) return 0;
    const selectedObjs = symptoms.filter(s => selectedSymptoms.includes(s.id));
    if (selectedObjs.length === 0) return 0;
    const sum = selectedObjs.reduce((acc, cur) => acc + cur.severity, 0);
    return (sum / selectedObjs.length).toFixed(1);
  }, [selectedSymptoms, symptoms]);

  const applyPreset = (preset) => {
    preset.symptoms.forEach(s => {
      if (!selectedSymptoms.includes(s)) {
        onToggleSymptom(s);
      }
    });
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Title & Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Symptom Selection Vocabulary</span>
            <span style={{ fontSize: '0.75rem', background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
              132 Clinical Features
            </span>
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '2px' }}>
            Select patient symptoms or load a diagnostic test case to begin analysis.
          </p>
        </div>

        {selectedSymptoms.length > 0 && (
          <button
            onClick={onClearAll}
            className="btn-secondary"
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            <RefreshCw size={14} />
            <span>Reset Selection</span>
          </button>
        )}
      </div>

      {/* Preset Quick Bundles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em' }}>
          Diagnostic Preset Bundles
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => applyPreset(p)}
              style={{
                background: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#cbd5e1',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#06b6d4';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.color = '#cbd5e1';
              }}
            >
              <Sparkles size={12} color="#06b6d4" />
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Symptoms Dashboard Box */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.9)',
        border: '1px solid rgba(6, 182, 212, 0.2)',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
              Active Patient Profile ({selectedSymptoms.length} selected)
            </span>
            {selectedSymptoms.length > 0 && (
              <span style={{
                fontSize: '0.75rem',
                background: avgSeverity >= 5 ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                color: avgSeverity >= 5 ? '#fda4af' : '#6ee7b7',
                padding: '2px 8px',
                borderRadius: '6px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Flame size={12} />
                Severity Index: {avgSeverity} / 7.0
              </span>
            )}
          </div>
        </div>

        {selectedSymptoms.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
            No symptoms selected yet. Use the category filters below or search to tag symptoms.
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '140px', overflowY: 'auto' }}>
            {selectedSymptoms.map(symId => {
              const obj = symptoms.find(s => s.id === symId);
              const label = obj ? obj.label : symId.replace(/_/g, ' ');
              const sev = obj ? obj.severity : 3;
              return (
                <div
                  key={symId}
                  onClick={() => onToggleSymptom(symId)}
                  className="chip chip-selected"
                  title="Click to remove"
                >
                  <span>{label}</span>
                  <span style={{
                    fontSize: '0.65rem',
                    background: 'rgba(6, 182, 212, 0.3)',
                    borderRadius: '4px',
                    padding: '1px 5px',
                    fontWeight: 700
                  }}>
                    L{sev}
                  </span>
                  <X size={13} style={{ marginLeft: '2px' }} />
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={onAnalyze}
          disabled={selectedSymptoms.length === 0 || loading}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', fontSize: '0.95rem' }}
        >
          {loading ? (
            <>
              <RefreshCw size={18} className="spin-animation" />
              <span>Analyzing Clinical Patterns...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Run AI Diagnostic Analysis ({selectedSymptoms.length} symptoms)</span>
            </>
          )}
        </button>
      </div>

      {/* Search & Category Filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search symptoms (e.g. fever, headache, chest pain, itching)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-control"
            style={{ paddingLeft: '42px', paddingRight: search ? '40px' : '14px' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                border: 'none',
                cursor: 'pointer',
                background: activeCategory === cat ? 'rgba(6, 182, 212, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                color: activeCategory === cat ? '#22d3ee' : '#94a3b8',
                borderBottom: activeCategory === cat ? '2px solid #06b6d4' : '2px solid transparent',
                transition: 'all 0.15s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Symptom Tag Cloud */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        maxHeight: '320px',
        overflowY: 'auto',
        padding: '4px'
      }}>
        {filteredSymptoms.map(sym => {
          const isSelected = selectedSymptoms.includes(sym.id);
          return (
            <div
              key={sym.id}
              onClick={() => onToggleSymptom(sym.id)}
              className={`chip ${isSelected ? 'chip-selected' : 'chip-unselected'}`}
            >
              {isSelected && <Check size={12} color="#22d3ee" />}
              <span>{sym.label}</span>
              <span style={{
                fontSize: '0.65rem',
                color: isSelected ? '#22d3ee' : '#64748b',
                background: isSelected ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                padding: '1px 5px',
                borderRadius: '4px'
              }}>
                L{sym.severity}
              </span>
            </div>
          );
        })}
      </div>

    </div>
  );
}
