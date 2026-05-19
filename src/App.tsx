import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Image as ImageIcon, Zap, Shield, Repeat, Globe, Share2, Copy, Mail, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import DropZone from './components/DropZone';
import ControlPanel from './components/ControlPanel';
import ComparisonView from './components/ComparisonView';
import { useCompression } from './hooks/useCompression';
import type { CompressionSettings } from './hooks/useCompression';
import { translations } from './translations';
import type { Language } from './translations';
import './App.css';

// SEO Component for dynamic Helmet meta tags
const SEO = ({ lang }: { lang: Language }) => {
  const t = translations[lang];
  const location = useLocation();
  const canonicalUrl = `https://bilder-verkleinern.net${location.pathname}`;

  return (
    <Helmet>
      <html lang={lang} dir="ltr" />
      <title>{t.metaTitle}</title>
      <meta name="description" content={t.metaDescription} />
      <meta name="keywords" content={t.metaKeywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={t.metaTitle} />
      <meta property="og:description" content={t.metaDescription} />
      <meta property="og:image" content="https://bilder-verkleinern.net/og-image.png" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={t.metaTitle} />
      <meta name="twitter:description" content={t.metaDescription} />
      <meta name="twitter:image" content="https://bilder-verkleinern.net/og-image.png" />

      <link rel="canonical" href={canonicalUrl} />
      
      {/* Language Alternates for SEO */}
      <link rel="alternate" hrefLang="de" href="https://bilder-verkleinern.net/de" />
      <link rel="alternate" hrefLang="en" href="https://bilder-verkleinern.net/en" />
      <link rel="alternate" hrefLang="ar" href="https://bilder-verkleinern.net/ar" />
      <link rel="alternate" hrefLang="fr" href="https://bilder-verkleinern.net/fr" />
      <link rel="alternate" hrefLang="x-default" href="https://bilder-verkleinern.net/de" />
    </Helmet>
  );
};

// Main Application Content
const AppContent = () => {
  const { lang = 'de' } = useParams<{ lang: string }>();
  const currentLang = (['de', 'en', 'ar', 'fr'].includes(lang) ? lang : 'de') as Language;
  const t = translations[currentLang];
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [settings, setSettings] = useState<CompressionSettings>({
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  });

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { compressImages, isCompressing, results, error, reset } = useCompression();

  useEffect(() => {
    // JSON-LD logic remains same...
  }, [currentLang, t]);

  const handleFilesSelect = (files: File[]) => {
    setSelectedFiles(files);
    reset();
  };

  const handleCompress = () => {
    if (selectedFiles.length > 0) {
      compressImages(selectedFiles, settings);
    }
  };

  const handleStartOver = () => {
    setSelectedFiles([]);
    reset();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t.brand,
          text: t.slogan,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(t.copiedToClipboard);
    }
  };

  const changeLanguage = (newLang: string) => {
    const newPath = location.pathname.replace(`/${currentLang}`, `/${newLang}`);
    navigate(newPath);
  };

  return (
    <div className="app-container">
      <SEO lang={currentLang} />
      
      <nav className="top-nav">
        <Link to={`/${currentLang}`} className="brand-nav">
          <ImageIcon size={24} />
          <span>{t.brand}</span>
        </Link>
        <div className="nav-controls">
          <div className="lang-nav">
            <Globe size={18} />
            <button className={currentLang === 'de' ? 'active' : ''} onClick={() => changeLanguage('de')}>DE</button>
            <button className={currentLang === 'en' ? 'active' : ''} onClick={() => changeLanguage('en')}>EN</button>
          </div>
          <button className="share-btn-nav" onClick={handleShare}>
            <Share2 size={18} />
          </button>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={
          <>
            <header className="app-header">
              <div className="logo-container">
                <ImageIcon className="logo-icon" size={48} />
                <h1>{t.brand}</h1>
              </div>
              <p>{t.slogan}</p>
            </header>

            <main className="app-main">
              {results.length === 0 ? (
                <div className="compression-workflow">
                  <DropZone 
                    onFilesSelect={handleFilesSelect} 
                    translations={{
                      title: t.dropZoneTitle,
                      sub: t.dropZoneSub,
                      hint: t.dropZoneHint
                    }}
                  />
                  
                  {selectedFiles.length > 0 && (
                    <div className="selected-file-info">
                      <span>{t.selected}: <strong>{selectedFiles.length} {selectedFiles.length === 1 ? 'Bild' : 'Bilder'}</strong></span>
                      <button onClick={() => setSelectedFiles([])}>{t.change}</button>
                    </div>
                  )}

                  <ControlPanel 
                    settings={settings}
                    setSettings={setSettings}
                    onCompress={handleCompress}
                    isCompressing={isCompressing}
                    disabled={selectedFiles.length === 0}
                    translations={{
                      title: t.settingsTitle,
                      maxSize: t.maxFileSize,
                      maxWidth: t.maxWidthHeight,
                      compress: t.compressBtn,
                      compressing: t.compressingBtn,
                      forumMode: t.forumMode,
                      forumModeDesc: t.forumModeDesc
                    }}
                  />
                </div>
              ) : (
                <div className="result-workflow">
                  <div className="results-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                    {results.map((res, idx) => (
                      <div key={idx} className="result-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <ComparisonView 
                          result={res} 
                          translations={{
                            complete: t.complete,
                            original: t.original,
                            compressed: t.compressed,
                            download: t.downloadBtn
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="result-actions">
                    <button className="start-over-btn" onClick={handleStartOver}>
                      <Repeat size={18} />
                      {t.compressAnother}
                    </button>
                  </div>
                </div>
              )}

              {error && <div className="error-message">{t[error as keyof typeof t] || error}</div>}

              <section className="features-grid">
                <div className="feature-card">
                  <span title={t.altLightning}><Zap className="feature-icon" /></span>
                  <h3>{t.lightningFast}</h3>
                  <p>{t.lightningFastDesc}</p>
                </div>
                <div className="feature-card">
                  <span title={t.altPrivate}><Shield className="feature-icon" /></span>
                  <h3>{t.oneHundredPrivate}</h3>
                  <p>{t.privacyStatement}</p>
                </div>
                <div className="feature-card">
                  <span title={t.altQuality}><ImageIcon className="feature-icon" /></span>
                  <h3>{t.highQuality}</h3>
                  <p>{t.highQualityDesc}</p>
                </div>
              </section>

              <section className="guide-section">
                <h2>{t.guideTitle}</h2>
                <p className="guide-intro">{t.guideIntro}</p>
                <div className="guide-grid">
                  <div className="guide-card">
                    <h3>{t.guideStep1Title}</h3>
                    <p>{t.guideStep1Content}</p>
                  </div>
                  <div className="guide-card">
                    <h3>{t.guideStep2Title}</h3>
                    <p>{t.guideStep2Content}</p>
                  </div>
                  <div className="guide-card">
                    <h3>{t.guideStep3Title}</h3>
                    <p>{t.guideStep3Content}</p>
                  </div>
                </div>
              </section>

              <section className="faq-section">
                <h2>{t.faqTitle}</h2>
                <div className="faq-list">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <div key={num} className={`faq-item ${openFaq === num ? 'open' : ''}`}>
                      <button className="faq-question" onClick={() => setOpenFaq(openFaq === num ? null : num)}>
                        <span>{t[`faqQ${num}` as keyof typeof t]}</span>
                        {openFaq === num ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      {openFaq === num && (
                        <div className="faq-answer">
                          <p>{t[`faqA${num}` as keyof typeof t]}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {currentLang === 'de' && (
                <section className="seo-content-section">
                  <h2>{t.seoContentTitle}</h2>
                  <div className="seo-text-body">
                    {t.seoContentText?.split('\n\n').map((para, index) => (
                      <p key={index}>{para}</p>
                    ))}
                  </div>
                </section>
              )}
            </main>
          </>
        } />
        
        <Route path="/privacy" element={
          <div className="content-page">
            <Link to={`/${currentLang}`} className="back-btn">← {t.back}</Link>
            <section className="legal-section">
              <h1>{t.privacyPolicy}</h1>
              <p>{t.privacyPolicyContent}</p>
              <div className="privacy-highlight">
                <strong>{t.privacyPolicyLocal}</strong>
              </div>
              <h3>Server-Log-Files</h3>
              <p>{t.privacyPolicyServer}</p>
              <h3>Google AdSense</h3>
              <p>{t.privacyPolicyAdSense}</p>
              <h3>Cloudflare</h3>
              <p>{t.privacyPolicyCloudflare}</p>
              <p>{t.privacyStatement}</p>
            </section>
          </div>
        } />
        
        <Route path="/impressum" element={
          <div className="content-page">
            <Link to={`/${currentLang}`} className="back-btn">← {t.back}</Link>
            <section className="legal-section">
              <h1>{t.impressumTitle}</h1>
              <p>{t.impressumContent}</p>
              <p>
                <strong>{t.impressumOwner}</strong><br />
                {t.impressumAddress}
              </p>
              <p>{t.impressumContact}</p>
              <hr className="my-8" />
              <h3>{t.impressumDisclaimerTitle}</h3>
              <p>{t.impressumDisclaimer}</p>
            </section>
          </div>
        } />
        
        <Route path="/contact" element={
          <div className="content-page">
            <Link to={`/${currentLang}`} className="back-btn">← {t.back}</Link>
            <section className="contact-section">
              <h1>{t.contactUs}</h1>
              <p className="contact-intro">{t.contactIntro}</p>
              <div className="contact-grid">
                <div className="contact-info">
                  <div className="contact-method">
                    <Mail className="contact-icon" />
                    <div>
                      <h3>Email</h3>
                      <p>support@bilder-verkleinern.net</p>
                    </div>
                  </div>
                  <div className="contact-method">
                    <MessageSquare className="contact-icon" />
                    <div>
                      <h3>{t.contactTitle}</h3>
                      <p>support@bilder-verkleinern.net</p>
                    </div>
                  </div>
                </div>
                <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
                  <div className="form-group">
                    <label>{t.contactFormName}</label>
                    <input type="text" placeholder={t.contactFormNamePlaceholder} />
                  </div>
                  <div className="form-group">
                    <label>{t.contactFormEmail}</label>
                    <input type="email" placeholder={t.contactFormEmailPlaceholder} />
                  </div>
                  <div className="form-group">
                    <label>{t.contactFormMessage}</label>
                    <textarea rows={4} placeholder={t.contactFormMessagePlaceholder}></textarea>
                  </div>
                  <button type="submit" className="submit-btn">{t.contactFormSend}</button>
                </form>
              </div>
            </section>
          </div>
        } />
      </Routes>

      <footer className="app-footer">
        <div className="footer-grid">
          <div className="footer-column">
            <h4>{t.brand}</h4>
            <div className="footer-column-links">
              <Link to={`/${currentLang}/`}>{currentLang === 'de' ? 'Bilder verkleinern online' : 'Image Compression'}</Link>
              <Link to={`/${currentLang}/`}>{currentLang === 'de' ? 'Foto komprimieren' : 'Compress Photos'}</Link>
              <Link to={`/${currentLang}/`}>{currentLang === 'de' ? 'Avatar verkleinern' : 'Resize Avatars'}</Link>
            </div>
          </div>
          <div className="footer-column">
            <h4>{currentLang === 'de' ? 'Anwendungsfälle' : 'Use Cases'}</h4>
            <div className="footer-column-links">
              <Link to={`/${currentLang}/`}>{currentLang === 'de' ? 'T4-Forum Bild-Upload' : 'Forum Image Upload'}</Link>
              <Link to={`/${currentLang}/`}>{currentLang === 'de' ? 'Hausgarten Foto-Hilfe' : 'Garden Photo Help'}</Link>
              <Link to={`/${currentLang}/`}>{currentLang === 'de' ? 'E-Mail Bilder optimieren' : 'Optimize Email Images'}</Link>
            </div>
          </div>
          <div className="footer-column">
            <h4>{t.contactUs}</h4>
            <div className="footer-column-links">
              <Link to={`/${currentLang}/privacy`}>{t.privacyPolicy}</Link>
              <Link to={`/${currentLang}/impressum`}>{t.impressum}</Link>
              <Link to={`/${currentLang}/contact`}>{t.contactUs}</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 {t.brand}. {t.privacyStatement}</p>
          <div className="footer-badges">
            <span className="badge">{t.clientSideBadge}</span>
            <span className="badge">{t.noServerUploadsBadge}</span>
            <span className="badge">{t.gdprCompliantBadge}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect from root to /de or detected browser language */}
        <Route path="/" element={<Navigate to="/de" replace />} />
        
        {/* Language-based Routing */}
        <Route path="/:lang/*" element={<AppContent />} />
        
        {/* Fallback for unknown routes */}
        <Route path="*" element={<Navigate to="/de" replace />} />
      </Routes>
    </BrowserRouter>
  );
}


export default App;
