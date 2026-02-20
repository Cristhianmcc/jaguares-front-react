import React, { useEffect, useState } from 'react';
import '../styles/animations.css';

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.defer = false;
    script.dataset.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

export default function ProfesorReportes() {
  const [html, setHtml] = useState('');

  useEffect(() => {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
    document.body.className = 'bg-background-light dark:bg-background-dark text-text-main font-display min-h-screen flex flex-col';

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/legacy/profesor-reportes.html');
        const text = await res.text();
        if (!cancelled) {
          const doc = new DOMParser().parseFromString(text, 'text/html');
          setHtml(doc.body.innerHTML);
        }
      } catch (err) {
        if (!cancelled) {
          // eslint-disable-next-line no-console
          console.error(err);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!html) return;

    let cancelled = false;

    (async () => {
      try {
        await loadScript('https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js');
        await loadScript('/legacy/profesor-reportes.js');
        document.dispatchEvent(new Event('DOMContentLoaded'));
      } catch (err) {
        if (!cancelled) {
          // eslint-disable-next-line no-console
          console.error(err);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [html]);

  return <div className="page-root" dangerouslySetInnerHTML={{ __html: html }} />;
}


