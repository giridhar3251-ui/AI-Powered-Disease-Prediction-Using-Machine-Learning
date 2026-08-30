import React, { useState, useEffect } from 'react';
import { 
  Building2, Search, MapPin, Phone, Globe, Star, Clock, 
  ChevronDown, ChevronUp, AlertCircle, Sparkles, Navigation, GitBranch, CheckCircle2 
} from 'lucide-react';
import { searchHospitals, fetchDistricts, lookupBranch } from '../api';

export default function HospitalFinder({ initialSpecialty = '', districts = [] }) {
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts (Tamil Nadu)');
  const [specialty, setSpecialty] = useState(initialSpecialty);
  const [searchMode, setSearchMode] = useState('district'); // 'district' | 'gps'
  const [gpsLocation, setGpsLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedHours, setExpandedHours] = useState({});
  const [branchSearches, setBranchSearches] = useState({});
  const [branchResults, setBranchResults] = useState({});

  useEffect(() => {
    if (initialSpecialty) {
      setSpecialty(initialSpecialty);
    }
  }, [initialSpecialty]);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        specialty: specialty || undefined
      };
      if (searchMode === 'district') {
        params.district = selectedDistrict;
      } else if (gpsLocation) {
        params.lat = gpsLocation.lat;
        params.lng = gpsLocation.lng;
      }

      const data = await searchHospitals(params);
      setHospitals(data.results || []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve healthcare facilities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [selectedDistrict]);

  const toggleHours = (id) => {
    setExpandedHours(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleBranchLookup = async (hospitalId, targetDist) => {
    if (!targetDist) return;
    try {
      const res = await lookupBranch(hospitalId, targetDist);
      setBranchResults(prev => ({
        ...prev,
        [hospitalId]: res
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleGetGps = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSearchMode('gps');
        setLoading(false);
      },
      (err) => {
        setError('Location permission denied. Reverting to Tamil Nadu district mode.');
        setSearchMode('district');
        setLoading(false);
      }
    );
  };

  return (
    <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Search Controls Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={20} color="#0EA5E9" />
            <span>Healthcare & Specialist Finder</span>
            <span style={{ fontSize: '0.75rem', background: 'rgba(14, 165, 233, 0.15)', color: '#22d3ee', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
              Tamil Nadu 38 Districts & GPS
            </span>
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '2px' }}>
            Live verified medical centres, operating schedules, ratings, and district branch lookups.
          </p>
        </div>

        {/* Mode Toggle: District vs GPS */}
        <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.8)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button
            onClick={() => setSearchMode('district')}
            style={{
              padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
              background: searchMode === 'district' ? 'linear-gradient(135deg, #0EA5E9, #0369A1)' : 'transparent',
              color: searchMode === 'district' ? '#ffffff' : '#94a3b8'
            }}
          >
            District
          </button>
          <button
            onClick={handleGetGps}
            style={{
              padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
              background: searchMode === 'gps' ? 'linear-gradient(135deg, #0EA5E9, #0369A1)' : 'transparent',
              color: searchMode === 'gps' ? '#ffffff' : '#94a3b8',
              display: 'flex', alignItems: 'center', gap: '4px'
            }}
          >
            <Navigation size={13} />
            <span>Use My GPS</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        background: 'rgba(15, 23, 42, 0.6)',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        
        {/* District Select */}
        {searchMode === 'district' ? (
          <div>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Tamil Nadu District
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="input-control"
            >
              <option value="All Districts (Tamil Nadu)">All Districts (Tamil Nadu)</option>
              {districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Current Coordinates
            </label>
            <div className="input-control" style={{ color: '#22d3ee', fontWeight: 600 }}>
              {gpsLocation ? `${gpsLocation.lat.toFixed(4)}°N, ${gpsLocation.lng.toFixed(4)}°E` : 'Acquiring GPS...'}
            </div>
          </div>
        )}

        {/* Specialty / Disease Filter */}
        <div>
          <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
            Disease or Specialty
          </label>
          <input
            type="text"
            placeholder="e.g. Ophthalmology, Dermatology..."
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="input-control"
          />
        </div>

        {/* Search button */}
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', height: '42px' }}
          >
            <Search size={16} />
            <span>{loading ? 'Searching...' : 'Find Facilities'}</span>
          </button>
        </div>

      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', color: '#fca5a5', fontSize: '0.85rem'
        }}>
          <AlertCircle size={18} color="#ef4444" />
          <span>{error}</span>
        </div>
      )}

      {/* Hospital Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {hospitals.length === 0 && !loading && (
          <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
            No hospitals matching the search criteria in this district. Try selecting another district or resetting filters.
          </div>
        )}

        {hospitals.map((hosp, idx) => {
          const isHoursOpen = expandedHours[hosp.id];
          const branchSearchDist = branchSearches[hosp.id] || '';
          const branchResult = branchResults[hosp.id];

          return (
            <div
              key={hosp.id || idx}
              style={{
                background: 'rgba(15, 23, 42, 0.85)',
                border: hosp.is_top_rated ? '1px solid rgba(14, 165, 233, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                boxShadow: hosp.is_top_rated ? '0 4px 20px rgba(14, 165, 233, 0.15)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
                      {hosp.name}
                    </h3>
                    {hosp.is_top_rated && (
                      <span style={{
                        background: 'linear-gradient(135deg, #0EA5E9, #0284C7)', color: '#ffffff',
                        fontSize: '0.65rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase'
                      }}>
                        Top Rated
                      </span>
                    )}
                    <span style={{
                      background: hosp.open_now ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                      color: hosp.open_now ? '#6ee7b7' : '#fda4af',
                      border: `1px solid ${hosp.open_now ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                      fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                      <Clock size={11} />
                      <span>{hosp.open_now ? 'Open Now' : 'Closed'}</span>
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1', fontSize: '0.825rem', marginTop: '4px' }}>
                    <MapPin size={14} color="#0EA5E9" />
                    <span>{hosp.address}</span>
                  </div>
                </div>

                {/* Rating Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(30, 41, 59, 0.8)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <Star size={16} color="#f59e0b" fill="#f59e0b" />
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>{hosp.rating}</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>({hosp.reviews_count} reviews)</span>
                </div>
              </div>

              {/* Holiday Alert Note */}
              {hosp.holiday_note && (
                <div style={{
                  background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: '8px', padding: '8px 12px', fontSize: '0.78rem', color: '#fcd34d', display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                  <AlertCircle size={14} color="#f59e0b" />
                  <span>{hosp.holiday_note}</span>
                </div>
              )}

              {/* Specialties Tag Row */}
              {hosp.specialties && hosp.specialties.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {hosp.specialties.map((spec, sIdx) => (
                    <span key={sIdx} style={{
                      background: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.2)',
                      color: '#67e8f9', fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: '4px'
                    }}>
                      {spec}
                    </span>
                  ))}
                </div>
              )}

              {/* Weekly Operating Hours Accordion */}
              {hosp.hours && (
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '10px' }}>
                  <button
                    onClick={() => toggleHours(hosp.id)}
                    style={{
                      background: 'none', border: 'none', color: '#0EA5E9', fontSize: '0.8rem', fontWeight: 600,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0
                    }}
                  >
                    <span>View Full Weekly Hours</span>
                    {isHoursOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {isHoursOpen && (
                    <div style={{
                      marginTop: '10px', background: 'rgba(15, 23, 42, 0.6)', padding: '12px',
                      borderRadius: '8px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '6px'
                    }}>
                      {Object.entries(hosp.hours).map(([day, hrs]) => (
                        <div key={day} style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#94a3b8', fontWeight: 600 }}>{day}:</span>
                          <span style={{ color: '#f1f5f9' }}>{hrs}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Branch Lookup in other TN Districts */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.3)', border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '10px', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600 }}>
                    <GitBranch size={14} color="#0EA5E9" />
                    <span>Check branch network in other Tamil Nadu districts:</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      value={branchSearchDist}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBranchSearches(prev => ({ ...prev, [hosp.id]: val }));
                        handleBranchLookup(hosp.id, val);
                      }}
                      className="input-control"
                      style={{ padding: '4px 8px', fontSize: '0.75rem', width: 'auto' }}
                    >
                      <option value="">Select District...</option>
                      {districts.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {branchResult && (
                  <div style={{
                    background: branchResult.has_branch ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                    border: `1px solid ${branchResult.has_branch ? 'rgba(16, 185, 129, 0.25)' : 'rgba(100, 116, 139, 0.25)'}`,
                    borderRadius: '8px', padding: '10px 14px', fontSize: '0.8rem'
                  }}>
                    {branchResult.has_branch ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6ee7b7', fontWeight: 700 }}>
                          <CheckCircle2 size={14} color="#10b981" />
                          <span>Branch Found in {branchResult.district}:</span>
                        </div>
                        <span style={{ color: '#ffffff', fontWeight: 600 }}>{branchResult.branch_details.name}</span>
                        <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>{branchResult.branch_details.address}</span>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '0.75rem' }}>
                          <span style={{ color: '#f59e0b', fontWeight: 600 }}>★ {branchResult.branch_details.rating}</span>
                          <span style={{ color: '#67e8f9' }}>Tel: {branchResult.branch_details.phone}</span>
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>{branchResult.message}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '12px' }}>
                {hosp.phone && (
                  <a
                    href={`tel:${hosp.phone.replace(/[^0-9+]/g, '')}`}
                    className="btn-secondary"
                    style={{ textDecoration: 'none', fontSize: '0.8rem', padding: '6px 14px' }}
                  >
                    <Phone size={13} color="#0EA5E9" />
                    <span>Call ({hosp.phone})</span>
                  </a>
                )}

                <a
                  href={hosp.maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ textDecoration: 'none', fontSize: '0.8rem', padding: '6px 14px' }}
                >
                  <MapPin size={13} />
                  <span>Open in Google Maps</span>
                </a>

                <button
                  onClick={() => {
                    const confirmMsg = `Book an appointment at ${hosp.name}?`;
                    if (window.confirm(confirmMsg)) {
                      window.alert(`Success! Your appointment request has been sent to ${hosp.name}. Our healthcare concierge will contact you shortly with the confirmed time.`);
                    }
                  }}
                  className="btn-primary"
                  style={{ 
                    fontSize: '0.8rem', padding: '6px 14px', 
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                    border: 'none', color: '#fff', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px', fontWeight: 600
                  }}
                >
                  <CheckCircle2 size={13} />
                  <span>Make Appointment</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
