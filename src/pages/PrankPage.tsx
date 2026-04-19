/**
 * Halaman Prank — ditampilkan saat ada akses tidak sah
 * atau percobaan bobol yang terdeteksi
 */
const PrankPage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      color: 'white',
      textAlign: 'center',
      padding: '20px',
    }}>
      <div style={{ fontSize: '80px', marginBottom: '20px' }}>😂</div>
      <h1 style={{
        fontSize: '48px',
        fontWeight: 900,
        color: '#FF7A00',
        marginBottom: '16px',
        letterSpacing: '-1px',
      }}>
        SELAMAT, ANDA KENA PRANK!
      </h1>
      <p style={{
        fontSize: '20px',
        color: '#94a3b8',
        maxWidth: '500px',
        lineHeight: 1.6,
        marginBottom: '32px',
      }}>
        Aktivitas mencurigakan Anda telah terdeteksi dan dicatat.
        IP address, browser, dan waktu akses Anda sudah tersimpan.
      </p>
      <div style={{
        background: '#121826',
        border: '1px solid #1e293b',
        borderRadius: '16px',
        padding: '24px 32px',
        marginBottom: '32px',
        maxWidth: '400px',
        width: '100%',
      }}>
        <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '8px' }}>INFO ANDA YANG TERCATAT:</p>
        <p style={{ color: '#f97316', fontSize: '14px', fontFamily: 'monospace' }}>
          IP: {window.location.hostname}
        </p>
        <p style={{ color: '#f97316', fontSize: '14px', fontFamily: 'monospace' }}>
          Waktu: {new Date().toLocaleString('id-ID')}
        </p>
        <p style={{ color: '#f97316', fontSize: '14px', fontFamily: 'monospace', wordBreak: 'break-all' }}>
          Browser: {navigator.userAgent.substring(0, 60)}...
        </p>
      </div>
      <p style={{ color: '#475569', fontSize: '14px' }}>
        Sistem keamanan SIVILIZE HUB PRO aktif 24/7 🔒
      </p>
    </div>
  );
};

export default PrankPage;
