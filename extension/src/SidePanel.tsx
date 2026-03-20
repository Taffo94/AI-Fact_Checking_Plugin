// @ts-nocheck
import React, { useState, useEffect } from 'react';

export const SidePanel = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [videoId, setVideoId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0]?.url;
        if (url && url.includes('v=')) {
          const id = new URL(url).searchParams.get('v');
          if (id && id !== videoId) {
            setVideoId(id);
            analyzeVideo(id);
          }
        }
      });
    }, 2000);
    return () => clearInterval(timer);
  }, [videoId]);

  const analyzeVideo = async (id) => {
    setLoading(true);
    setClaims([]);
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: id }),
      });
      if (!response.ok) throw new Error("Server error: " + response.status);
      const data = await response.json();
      setClaims(data.claims || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', color: 'black', background: 'white', minHeight: '100vh' }}>
      <div style={{ fontSize: '12px', color: '#666', borderBottom: '1px solid #ccc', marginBottom: '10px' }}>
        AI Fact Checking v1.0.8
      </div>
      <h1 style={{ margin: '0 0 10px 0' }}>Analisi Video</h1>
      
      {error && <div style={{ color: 'red', padding: '10px', background: '#fee' }}>Errore: {error}</div>}
      
      {loading ? (
        <p>Sto analizzando il video... attendo risposta dal server locale...</p>
      ) : (
        <div>
          {claims.length === 0 && !error && <p>Nessun claim trovato o analisi non avviata. Clicca il tasto su YouTube o ricarica la pagina.</p>}
          {claims.map((c, i) => (
            <div key={i} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '12px', marginBottom: '10px' }}>
              <div style={{ fontWeight: 'bold', color: c.verdict === 'VERO' ? 'green' : (c.verdict === 'FALSO' ? 'red' : 'orange') }}>
                [{c.verdict}] {c.timestamp}
              </div>
              <div style={{ marginTop: '5px' }}>{c.claim}</div>
              <div style={{ fontSize: '12px', color: '#555', marginTop: '8px', fontStyle: 'italic' }}>{c.explanation}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SidePanel;
