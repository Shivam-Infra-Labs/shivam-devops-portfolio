import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Shivam Kumar Sinha — DevOps & Cloud Infrastructure Portfolio';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

const STACK_TAGS = [
  'Docker & Compose',
  'Kubernetes (Kind)',
  'GitHub Actions CI',
  'Cisco OSPF',
  'Prometheus & Grafana',
];

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          backgroundColor: '#020617',
          backgroundImage:
            'radial-gradient(circle at 80% 18%, rgba(34, 211, 238, 0.16), transparent 45%), radial-gradient(circle at 20% 85%, rgba(52, 211, 153, 0.12), transparent 45%)',
          color: '#f8fafc',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top Row: Monogram & Availability */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '54px',
                height: '54px',
                borderRadius: '9999px',
                border: '2px solid #22d3ee',
                backgroundColor: '#0f172a',
                color: '#67e8f9',
                fontSize: '22px',
                fontWeight: 700,
              }}
            >
              SK
            </div>
            <span
              style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#cbd5e1',
              }}
            >
              Shivam Infra Labs
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 18px',
              borderRadius: '9999px',
              border: '1px solid rgba(52, 211, 153, 0.4)',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              color: '#6ee7b7',
              fontSize: '16px',
              fontWeight: 600,
            }}
          >
            Available for DevOps Roles & Freelance
          </div>
        </div>

        {/* Middle Hero Copy */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <span
            style={{
              fontSize: '22px',
              fontWeight: 600,
              color: '#22d3ee',
              letterSpacing: '0.02em',
            }}
          >
            Shivam Kumar Sinha
          </span>
          <h1
            style={{
              margin: 0,
              fontSize: '60px',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: '#ffffff',
            }}
          >
            DevOps & Cloud Infrastructure
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: '24px',
              lineHeight: 1.4,
              color: '#94a3b8',
              maxWidth: '920px',
            }}
          >
            Containerized workloads, automated Kubernetes CI smoke testing, and Layer-3 network engineering backed by verifiable public repositories.
          </p>
        </div>

        {/* Bottom Stack Tags */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          {STACK_TAGS.map((tag) => (
            <span
              key={tag}
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                border: '1px solid #1e293b',
                backgroundColor: '#0f172a',
                color: '#e2e8f0',
                fontSize: '18px',
                fontWeight: 600,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
