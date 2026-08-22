import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera, X, UploadCloud, Sparkles, RefreshCw,
  AlertCircle, SwitchCamera, CheckCircle, Zap
} from 'lucide-react';
import { predictSkinImage } from '../api';

/* ─────────────── helpers ─────────────── */
function dataURLtoBlob(dataURL) {
  const [header, data] = dataURL.split(',');
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(data);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

/* ─────────────── component ─────────────── */
export default function ImageUploader({ onAnalysisComplete, onResetResult, imageModelInfo }) {
  // ── state ──
  const [phase, setPhase] = useState('idle'); // idle | camera | preview | analyzing | done
  const [previewUrl, setPreviewUrl] = useState(null);
  const [capturedFile, setCapturedFile] = useState(null);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState('user');
  const [cameraReady, setCameraReady] = useState(false);
  const [scanPulse, setScanPulse] = useState(false);

  // ── refs ──
  const streamRef = useRef(null);        // holds the MediaStream
  const pendingStreamRef = useRef(null); // stream waiting for video node to mount
  const videoNodeRef = useRef(null);     // the actual <video> DOM node (set by callback ref)
  const fileInputRef = useRef(null);

  // ── cleanup on unmount ──
  useEffect(() => { return () => stopStream(); }, []);

  // ── scanning pulse animation ──
  useEffect(() => {
    if (phase === 'camera' && cameraReady) {
      const interval = setInterval(() => setScanPulse(p => !p), 1200);
      return () => clearInterval(interval);
    }
  }, [phase, cameraReady]);

  /* ── stop stream tracks ── */
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    pendingStreamRef.current = null;
    setCameraReady(false);
  }, []);

  /* ── Callback ref for <video> ──
     Fires the instant React mounts/unmounts the video DOM node.
     Stores node in videoNodeRef for capturePhoto, then attaches stream. */
  const videoCallbackRef = useCallback((node) => {
    videoNodeRef.current = node; // always update so capturePhoto can find it
    if (!node) return;           // unmounting
    const stream = pendingStreamRef.current;
    if (!stream) return;
    node.srcObject = stream;
    node.play()
      .then(() => setCameraReady(true))
      .catch(err => console.warn('Video play error:', err));
  }, []);

  /* ── open camera ── */
  const openCamera = useCallback(async (mode = facingMode) => {
    setError(null);
    setCameraReady(false);
    stopStream();
    setPhase('loading'); // show spinner while getUserMedia runs

    // Browsers require HTTPS (or localhost) for camera access
    if (!window.isSecureContext) {
      setPhase('idle');
      const httpsUrl = window.location.href.replace(/^http:/, 'https:');
      setError(`🔒 Camera requires HTTPS. Open: ${httpsUrl}`);
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setPhase('idle');
      setError('🌐 Your browser does not support camera access.');
      return;
    }

    try {
      let stream;
      // Try with ideal constraints first, fall back to bare minimum
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
      } catch {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode }, audio: false });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        }
      }

      streamRef.current = stream;
      pendingStreamRef.current = stream; // videoCallbackRef will pick this up when <video> mounts
      setPhase('camera');                // triggers render → videoCallbackRef fires → stream attached
    } catch (err) {
      stopStream();
      setPhase('idle');
      let msg = 'Could not access the camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = '🔒 Camera permission was denied. In your browser address bar click the 🔒 icon → Site settings → Camera → Allow, then refresh and try again.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = '📷 No camera found on this device. Use "Upload Photo" instead.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        msg = '⚠️ Camera is already in use by another app (Zoom, Teams, etc). Close it and try again.';
      } else if (err.name === 'OverconstrainedError') {
        msg = '⚙️ Camera constraints not supported. Please try again.';
      }
      setError(msg);
    }
  }, [facingMode, stopStream]);

  /* ── switch front/back ── */
  const switchCamera = useCallback(() => {
    const next = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(next);
    openCamera(next);
  }, [facingMode, openCamera]);

  /* ── capture photo from video ── */
  const capturePhoto = useCallback(() => {
    const video = videoNodeRef.current;   // use the stored DOM node
    if (!video || !cameraReady) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');

    // Mirror if front-facing
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataURL = canvas.toDataURL('image/jpeg', 0.92);
    const blob = dataURLtoBlob(dataURL);
    const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });

    stopStream();
    setPreviewUrl(dataURL);
    setCapturedFile(file);
    setPhase('preview');
  }, [cameraReady, facingMode, stopStream]);

  /* ── analyze captured / uploaded image ── */
  const analyzeImage = useCallback(async (file, url) => {
    setPhase('analyzing');
    setError(null);
    try {
      const data = await predictSkinImage(file);
      onAnalysisComplete(data, url);
      setPhase('done');
    } catch (err) {
      setError(err.message || 'AI analysis failed. Please try again.');
      setPhase('preview');
    }
  }, [onAnalysisComplete]);

  /* ── handle file upload ── */
  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }
    stopStream();
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setCapturedFile(file);
    setPhase('preview');
    setError(null);
  }, [stopStream]);

  /* ── reset everything ── */
  const reset = useCallback(() => {
    stopStream();
    setPhase('idle');
    setPreviewUrl(null);
    setCapturedFile(null);
    setError(null);
  }, [stopStream]);

  /* ════════════════════════════════════════
     RENDER
  ════════════════════════════════════════ */
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(9,13,22,0.97) 0%, rgba(13,20,40,0.97) 100%)',
      border: '1px solid rgba(6,182,212,0.2)',
      borderRadius: '20px',
      padding: '28px',
      display: 'flex',
      flexDirection: 'column',
      gap: '22px',
      boxShadow: '0 24px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)'
    }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <span style={{
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>
              AI Skin Disease Detection
            </span>
            <span style={{
              fontSize: '0.68rem', background: 'rgba(6,182,212,0.15)',
              color: '#22d3ee', padding: '3px 8px', borderRadius: '6px',
              fontWeight: 700, WebkitTextFillColor: '#22d3ee'
            }}>
              LIVE CAMERA
            </span>
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
            Open camera → Point at skin → Capture → AI analysis in seconds
          </p>
        </div>
        {imageModelInfo && (
          <div style={{
            fontSize: '0.72rem', background: 'rgba(6,182,212,0.08)',
            border: '1px solid rgba(6,182,212,0.2)', borderRadius: '8px',
            padding: '5px 10px', color: '#94a3b8'
          }}>
            <span style={{ color: '#06b6d4', fontWeight: 700 }}>Model:</span>{' '}
            {imageModelInfo.test_accuracy}% accuracy
          </div>
        )}
      </div>

      {/* ══════════════════════════════════
          PHASE: idle – action cards
      ══════════════════════════════════ */}
      {(phase === 'idle') && (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>

          {/* Live Camera Card */}
          <ActionCard
            id="btn-live-camera"
            icon={<Camera size={28} color="#fff" />}
            iconBg="linear-gradient(135deg, #06b6d4, #3b82f6)"
            iconGlow="rgba(6,182,212,0.5)"
            label="Live Camera"
            sublabel="Open webcam → see preview → capture"
            accent="#06b6d4"
            onClick={() => openCamera(facingMode)}
            featured
          />

          {/* Upload Card */}
          <ActionCard
            id="btn-upload-photo"
            icon={<UploadCloud size={26} color="#cbd5e1" />}
            iconBg="rgba(100,116,139,0.2)"
            label="Upload Photo"
            sublabel="Select a saved image from device"
            accent="#64748b"
            onClick={() => fileInputRef.current?.click()}
          />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
        </div>
      )}

      {/* ══════════════════════════════════
          PHASE: loading – waiting for getUserMedia
      ══════════════════════════════════ */}
      {phase === 'loading' && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: '14px', padding: '60px 20px',
          background: 'rgba(6,182,212,0.04)', borderRadius: '16px',
          border: '1px solid rgba(6,182,212,0.15)'
        }}>
          <RefreshCw size={32} color="#22d3ee" style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#22d3ee' }}>Requesting camera access…</span>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Allow camera permission in your browser if prompted</span>
        </div>
      )}

      {/* ══════════════════════════════════
          PHASE: camera – live viewfinder
      ══════════════════════════════════ */}
      {phase === 'camera' && (
        <div style={{
          position: 'relative',
          borderRadius: '16px',
          overflow: 'hidden',
          background: '#000',
          border: '2px solid rgba(6,182,212,0.5)',
          minHeight: '340px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Loading indicator */}
          {!cameraReady && (
            <div style={{
              position: 'absolute', zIndex: 20,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
              color: '#22d3ee'
            }}>
              <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Starting camera…</span>
            </div>
          )}

          {/* Video element – uses callback ref so stream attaches the instant the node mounts */}
          <video
            ref={videoCallbackRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              maxHeight: '420px',
              objectFit: 'cover',
              display: 'block',
              transform: facingMode === 'user' ? 'scaleX(-1)' : 'none'
            }}
          />

          {/* Scanning reticle overlay */}
          {cameraReady && (
            <div style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Dark vignette */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(ellipse 55% 55% at 50% 50%, transparent 0%, rgba(0,0,0,0.55) 100%)'
              }} />

              {/* Reticle box */}
              <div style={{
                position: 'relative',
                width: '220px',
                height: '220px',
                border: `2px solid ${scanPulse ? 'rgba(6,182,212,1)' : 'rgba(6,182,212,0.55)'}`,
                borderRadius: '20px',
                boxShadow: scanPulse
                  ? '0 0 0 4px rgba(6,182,212,0.15), inset 0 0 0 1px rgba(6,182,212,0.1)'
                  : '0 0 0 1px rgba(6,182,212,0.05)',
                transition: 'border-color 0.6s ease, box-shadow 0.6s ease'
              }}>
                {/* Corner marks */}
                {[
                  { top: -2, left: -2, borderTop: '3px solid #22d3ee', borderLeft: '3px solid #22d3ee', borderRadius: '20px 0 0 0' },
                  { top: -2, right: -2, borderTop: '3px solid #22d3ee', borderRight: '3px solid #22d3ee', borderRadius: '0 20px 0 0' },
                  { bottom: -2, left: -2, borderBottom: '3px solid #22d3ee', borderLeft: '3px solid #22d3ee', borderRadius: '0 0 0 20px' },
                  { bottom: -2, right: -2, borderBottom: '3px solid #22d3ee', borderRight: '3px solid #22d3ee', borderRadius: '0 0 20px 0' }
                ].map((s, i) => (
                  <div key={i} style={{
                    position: 'absolute', width: '22px', height: '22px', ...s
                  }} />
                ))}

                {/* Center label */}
                <div style={{
                  position: 'absolute', bottom: '-32px', left: '50%', transform: 'translateX(-50%)',
                  fontSize: '0.7rem', color: '#22d3ee', fontWeight: 700,
                  background: 'rgba(0,0,0,0.7)', padding: '3px 10px',
                  borderRadius: '20px', whiteSpace: 'nowrap',
                  backdropFilter: 'blur(4px)'
                }}>
                  Point at skin condition
                </div>
              </div>
            </div>
          )}

          {/* Camera label badge top-left */}
          <div style={{
            position: 'absolute', top: '12px', left: '12px', zIndex: 10,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '20px', padding: '4px 12px',
            fontSize: '0.72rem', fontWeight: 700, color: '#e2e8f0',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <Camera size={12} color="#06b6d4" />
            {facingMode === 'user' ? 'Front Camera' : 'Back Camera'}
          </div>

          {/* Front / Back toggle top-right */}
          <div style={{
            position: 'absolute', top: '12px', right: '12px', zIndex: 10,
            display: 'flex', gap: '4px',
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px', padding: '4px'
          }}>
            {/* Front button */}
            <button
              id="btn-front-camera"
              onClick={() => { if (facingMode !== 'user') { setFacingMode('user'); openCamera('user'); } }}
              title="Front camera"
              style={{
                padding: '5px 14px', borderRadius: '20px', border: 'none',
                fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: facingMode === 'user'
                  ? 'linear-gradient(135deg, #06b6d4, #3b82f6)'
                  : 'transparent',
                color: facingMode === 'user' ? '#fff' : '#94a3b8',
                boxShadow: facingMode === 'user' ? '0 0 10px rgba(6,182,212,0.5)' : 'none'
              }}
            >
              Front
            </button>
            {/* Back button */}
            <button
              id="btn-back-camera"
              onClick={() => { if (facingMode !== 'environment') { setFacingMode('environment'); openCamera('environment'); } }}
              title="Back camera"
              style={{
                padding: '5px 14px', borderRadius: '20px', border: 'none',
                fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: facingMode === 'environment'
                  ? 'linear-gradient(135deg, #06b6d4, #3b82f6)'
                  : 'transparent',
                color: facingMode === 'environment' ? '#fff' : '#94a3b8',
                boxShadow: facingMode === 'environment' ? '0 0 10px rgba(6,182,212,0.5)' : 'none'
              }}
            >
              Back
            </button>
          </div>

          {/* Bottom controls */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: 0, right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            zIndex: 10
          }}>
            {/* Switch camera (icon rotate) */}
            <button
              id="btn-switch-camera"
              onClick={switchCamera}
              title="Switch front / back camera"
              style={ctrlBtn}
            >
              <SwitchCamera size={18} color="#e2e8f0" />
            </button>

            {/* Capture shutter */}
            <button
              id="btn-capture"
              onClick={capturePhoto}
              disabled={!cameraReady}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: cameraReady
                  ? 'linear-gradient(135deg, #06b6d4, #3b82f6)'
                  : 'rgba(100,116,139,0.4)',
                border: '4px solid rgba(255,255,255,0.9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: cameraReady ? 'pointer' : 'not-allowed',
                boxShadow: cameraReady ? '0 0 24px rgba(6,182,212,0.7)' : 'none',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
              onMouseDown={e => { if (cameraReady) e.currentTarget.style.transform = 'scale(0.9)'; }}
              onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <Camera size={26} color="#fff" />
            </button>

            {/* Cancel */}
            <button
              id="btn-cancel-camera"
              onClick={reset}
              title="Cancel"
              style={{ ...ctrlBtn, background: 'rgba(239,68,68,0.25)', borderColor: 'rgba(239,68,68,0.4)' }}
            >
              <X size={18} color="#fca5a5" />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════
          PHASE: preview – review captured image
      ══════════════════════════════════ */}
      {phase === 'preview' && previewUrl && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', border: '2px solid rgba(6,182,212,0.4)' }}>
            <img
              src={previewUrl}
              alt="Captured"
              style={{ width: '100%', maxHeight: '360px', objectFit: 'cover', display: 'block' }}
            />
            <div style={{
              position: 'absolute', top: '10px', left: '10px',
              background: 'rgba(6,182,212,0.9)', backdropFilter: 'blur(8px)',
              color: '#fff', fontSize: '0.72rem', fontWeight: 700,
              padding: '4px 10px', borderRadius: '20px'
            }}>
              📸 Image Captured
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {/* Analyze */}
            <button
              id="btn-analyze-ai"
              onClick={() => analyzeImage(capturedFile, previewUrl)}
              style={{
                flex: '1 1 200px',
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                color: '#fff', border: 'none', borderRadius: '12px',
                padding: '13px 20px', fontSize: '0.95rem', fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '8px',
                boxShadow: '0 0 20px rgba(6,182,212,0.4)',
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Zap size={18} />
              Analyze with AI
            </button>

            {/* Retake */}
            <button
              id="btn-retake"
              onClick={() => openCamera(facingMode)}
              style={{
                flex: '0 0 auto',
                background: 'rgba(30,41,59,0.8)',
                color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '12px', padding: '12px 18px',
                fontSize: '0.9rem', fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              <Camera size={16} color="#06b6d4" /> Retake
            </button>

            {/* Cancel */}
            <button
              id="btn-cancel-preview"
              onClick={reset}
              style={{
                flex: '0 0 auto',
                background: 'rgba(239,68,68,0.12)',
                color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '12px', padding: '12px 16px',
                fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <X size={15} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════
          PHASE: analyzing – loading spinner
      ══════════════════════════════════ */}
      {phase === 'analyzing' && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: '20px', padding: '60px 20px',
          background: 'rgba(6,182,212,0.04)', borderRadius: '16px',
          border: '1px solid rgba(6,182,212,0.15)'
        }}>
          {previewUrl && (
            <div style={{ position: 'relative', width: '120px', height: '120px' }}>
              <img
                src={previewUrl}
                alt="Analyzing"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px', opacity: 0.7 }}
              />
              {/* Animated scan line */}
              <div style={{
                position: 'absolute', left: 0, right: 0, height: '3px',
                background: 'linear-gradient(90deg, transparent, #06b6d4, transparent)',
                animation: 'scanLine 1.5s linear infinite'
              }} />
            </div>
          )}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '1rem', fontWeight: 700, color: '#22d3ee',
              display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center'
            }}>
              <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
              AI Analysis in Progress…
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '6px' }}>
              Extracting dermatological features with neural network
            </p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════
          PHASE: done – success nudge
      ══════════════════════════════════ */}
      {phase === 'done' && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
          padding: '32px', background: 'rgba(16,185,129,0.06)',
          borderRadius: '16px', border: '1px solid rgba(16,185,129,0.2)', textAlign: 'center'
        }}>
          <CheckCircle size={40} color="#10b981" />
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#6ee7b7' }}>Analysis Complete!</div>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '4px' }}>Results shown on the right panel.</p>
          </div>
          <button
            id="btn-capture-another"
            onClick={() => {
              reset();
              if (onResetResult) onResetResult();
              setTimeout(() => openCamera(facingMode), 50);
            }}
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              color: '#fff', border: 'none', borderRadius: '10px',
              padding: '10px 22px', fontSize: '0.9rem', fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <Camera size={16} /> Capture Another Image
          </button>
        </div>
      )}

      {/* ── Error Banner ── */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '12px', padding: '14px 16px',
          display: 'flex', alignItems: 'flex-start', gap: '10px',
          color: '#fca5a5', fontSize: '0.85rem'
        }}>
          <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: '1px' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, marginBottom: '6px' }}>{error}</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => openCamera(facingMode)}
                style={smallBtn}
              >
                <Camera size={13} /> Try Camera Again
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={smallBtn}
              >
                <UploadCloud size={13} /> Upload Photo Instead
              </button>
              <button
                onClick={() => setError(null)}
                style={{ ...smallBtn, background: 'rgba(239,68,68,0.2)', borderColor: 'rgba(239,68,68,0.4)', color: '#fca5a5' }}
              >
                <X size={13} /> Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyframe animations injected once */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes scanLine {
          0%   { top: 0; }
          50%  { top: calc(100% - 3px); }
          100% { top: 0; }
        }
      `}</style>
    </div>
  );
}

/* ─────────────── sub-components ─────────────── */

function ActionCard({ id, icon, iconBg, iconGlow, label, sublabel, accent, onClick, featured }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      id={id}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        flex: featured ? '1 1 200px' : '0 1 180px',
        background: featured
          ? (hover ? 'linear-gradient(135deg, rgba(6,182,212,0.25), rgba(59,130,246,0.25))' : 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(59,130,246,0.15))')
          : (hover ? 'rgba(30,41,59,0.7)' : 'rgba(30,41,59,0.5)'),
        border: `1.5px solid ${hover ? accent : (featured ? 'rgba(6,182,212,0.4)' : 'rgba(255,255,255,0.08)')}`,
        borderRadius: '16px',
        padding: '24px 18px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
        transform: hover ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hover
          ? (featured ? `0 12px 32px ${iconGlow || 'rgba(6,182,212,0.25)'}` : '0 8px 20px rgba(0,0,0,0.3)')
          : (featured ? `0 4px 16px ${iconGlow || 'rgba(6,182,212,0.15)'}` : '0 2px 8px rgba(0,0,0,0.2)'),
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
        userSelect: 'none'
      }}
    >
      <div style={{
        width: '58px', height: '58px', borderRadius: '50%',
        background: iconBg || 'rgba(100,116,139,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: iconGlow ? `0 0 20px ${iconGlow}` : 'none',
        transition: 'box-shadow 0.25s ease'
      }}>
        {icon}
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>{label}</div>
        {sublabel && <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '3px' }}>{sublabel}</div>}
      </div>
    </div>
  );
}

/* shared styles */
const ctrlBtn = {
  width: '42px',
  height: '42px',
  borderRadius: '50%',
  background: 'rgba(15,23,42,0.85)',
  border: '1px solid rgba(255,255,255,0.15)',
  backdropFilter: 'blur(10px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', outline: 'none'
};

const smallBtn = {
  background: 'rgba(30,41,59,0.8)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#cbd5e1',
  borderRadius: '8px',
  padding: '5px 10px',
  fontSize: '0.78rem',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: '5px'
};
