import React, { useState } from 'react';
import {
  BookOpen,
  ArrowRight
} from 'lucide-react';

interface InsightsPageProps {
  selectedSlug?: string;
  onNavigate: (view: string, location?: string) => void;
}

export const InsightsPage: React.FC<InsightsPageProps> = ({ selectedSlug, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'legal' | 'tax' | 'trends' | 'nri'>('all');

  const articles = [
    {
      slug: 'tamil-nadu-karnataka-stamp-duty-guide',
      category: 'tax',
      title: 'State Stamp Duty & Registration Charges: Tamil Nadu & Karnataka (2025-2026)',
      readTime: '6 min read',
      date: 'Updated September 2025',
      summary: 'A definitive breakdown of composite stamp duty slabs, registration fee caps, and municipal surcharges for luxury property registrations.',
      content: `Navigating property acquisition taxes in South India requires an understanding of state-level stamp duty guidelines, guide-line value calculations, and local body surcharges.

1. Tamil Nadu Registration Framework:
- Stamp Duty: 7% on market/guideline value (whichever is higher).
- Transfer Duty (Local Body Surcharge): 2%.
- Registration Fee: 4% of market value.
- Total Effective Outflow: Approximately 11% to 13% of property valuation.

2. Karnataka (Bengaluru) Framework:
- Stamp Duty: 5% on properties valued above ₹45 Lakh.
- Surcharge (Cess): 10% on stamp duty (0.5% effective).
- BMRDA / Municipal Cess: 2% on stamp duty (0.1% effective).
- Registration Fee: 2% of the registered property value.
- Total Effective Outflow: Approximately 7.6% of property value.

Pro-Tip for HNWI Buyers: Ensure your developer quotes include all tripartite agreement drafting fees and that TDS (1% under Section 194-IA) is duly deposited with the Income Tax Department.`
    },
    {
      slug: 'rera-due-diligence-checklist',
      category: 'legal',
      title: 'The 7-Point RERA & Legal Due Diligence Checklist for Luxury Buyers',
      readTime: '8 min read',
      date: 'Updated August 2025',
      summary: 'How to verify RERA escrow account compliance, title link documents for 30 years, and local building sanctioned plans before signing.',
      content: `While RERA (Real Estate Regulatory Authority) has brought unprecedented accountability to Indian real estate, buyers must execute their own independent legal audits.

1. Verify RERA Escrow Account:
Under Section 4(2)(l)(D) of RERA, 70% of collections from allottees must be held in a designated bank escrow account dedicated solely to construction and land costs. Verify that your deposit cheque is drawn directly to this project escrow.

2. Encumbrance Certificate (EC) for 30 Years:
Obtain a Nil Encumbrance Certificate from the sub-registrar office for a continuous period of at least 30 years to ensure no existing mortgages or court attachments exist.

3. Sanctioned Floor Plan vs Built Layout:
Ensure the floor plan shown in promotional brochures exactly matches the sanctioned drawings issued by the local authority (e.g. CMDA / BBMP / MCGM). Unapproved additional floors or altered balconies risk demolition notices.

4. Environmental & Fire Clearances:
High-rise buildings exceeding 15 meters must hold valid Fire NOC and Environmental Clearance (EC) from the State Environment Impact Assessment Authority.`
    },
    {
      slug: 'nri-investment-guide-fema-regulations',
      category: 'nri',
      title: 'NRI Real Estate Investment Guide: FEMA Regulations & Repatriation',
      readTime: '7 min read',
      date: 'Updated July 2025',
      summary: 'Everything Non-Resident Indians need to know regarding NRE/NRO accounts, tax withholding, home loan eligibility, and capital gains repatriation.',
      content: `Foreign Exchange Management Act (FEMA) permits Non-Resident Indians (NRIs) and Overseas Citizens of India (OCIs) to acquire any residential or commercial property in India with zero prior RBI approvals.

1. Permitted Modes of Payment:
All property transactions must be funded via inward remittance from abroad through normal banking channels, or funds held in NRE / FCNR / NRO accounts. Cash payments or traveler's cheques are strictly prohibited.

2. Agricultural Land Restrictions:
NRIs cannot purchase agricultural land, plantation property, or farmhouses unless received through inheritance.

3. Repatriation of Sale Proceeds:
Sale proceeds of up to two residential properties can be fully repatriated overseas under general RBI permission, provided the purchase was funded via foreign remittance. The authorized dealer bank will process repatriation under the $1 Million per financial year scheme upon submission of Form 15CA and 15CB.`
    },
    {
      slug: 'indian-luxury-real-estate-appreciation-trends',
      category: 'trends',
      title: 'Top Micro-Markets Outperforming Inflation: 2025 High-Net-Worth Wealth Report',
      readTime: '5 min read',
      date: 'Updated September 2025',
      summary: 'Analysis of transaction data across ECR Chennai, Worli Mumbai, Indiranagar Bengaluru, and North Goa luxury villas.',
      content: `Over the last 36 months, India's luxury and ultra-luxury residential sectors (properties priced above ₹5 Cr) have outpaced the broader market by nearly 2.4x.

Key Micro-Market CAGR Performance (2022-2025):
- North Goa (Assagao, Anjuna, Aldona): 14.5% annual capital growth driven by high-yielding luxury holiday home demand.
- Hyderabad (Financial District, Jubilee Hills): 13.8% annual growth driven by global IT expansion and high-spec gated townships.
- Bengaluru (East & North corridor): 11.4% driven by tech founder wealth creation and airport expressway infrastructure.
- Chennai (ECR & Boat Club): 9.2% supported by stable domestic industrial conglomerates and scarcity of seafront land.`
    }
  ];

  const filtered = articles.filter(a => activeTab === 'all' || a.category === activeTab);

  const selectedArticle = selectedSlug ? articles.find(a => a.slug === selectedSlug) : null;

  if (selectedArticle) {
    return (
      <div style={{
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        minHeight: '100vh',
        paddingBottom: '5rem'
      }}>
        <div style={{ padding: '0.85rem 1.5rem', backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
          <button
            onClick={() => onNavigate('insights')}
            style={{ background: 'none', border: 'none', color: 'var(--gold-primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
          >
            ← Back to Knowledge Hub
          </button>
        </div>

        <article style={{ maxWidth: '840px', margin: '0 auto', padding: '3rem 1.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.25rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(212, 175, 55, 0.1)',
            color: 'var(--gold-primary)',
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            marginBottom: '1rem'
          }}>
            {selectedArticle.category} Guide
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.25, marginBottom: '0.85rem' }}>
            {selectedArticle.title}
          </h1>

          <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: '2.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border)' }}>
            <span>{selectedArticle.date}</span>
            <span>•</span>
            <span>{selectedArticle.readTime}</span>
          </div>

          <div style={{
            color: 'var(--text-secondary)',
            fontSize: '1.05rem',
            lineHeight: 1.85,
            whiteSpace: 'pre-line'
          }}>
            {selectedArticle.content}
          </div>

          <div style={{
            marginTop: '3rem',
            padding: '2rem',
            borderRadius: '16px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Need Legal Due Diligence Assistance?
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Our in-house legal counsel can review your title deeds and RERA agreements before execution.
              </p>
            </div>
            <button
              onClick={() => onNavigate('contact')}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--gold-primary)',
                color: 'var(--gold-text)',
                fontWeight: 800,
                fontSize: '0.85rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(198, 161, 91, 0.35)',
                transition: 'background-color 250ms ease, transform 200ms ease'
              }}
            >
              Contact Legal Desk
            </button>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      minHeight: '100vh',
      paddingBottom: '5rem'
    }}>
      {/* Hero Header */}
      <div style={{
        padding: '3.5rem 1.5rem 2.5rem',
        background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
        borderBottom: '1px solid var(--border)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.35rem 0.95rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(212, 175, 55, 0.08)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            fontSize: '0.8rem',
            color: 'var(--gold-primary)',
            fontWeight: 700,
            marginBottom: '1rem'
          }}>
            <BookOpen size={14} /> Institutional Legal & Market Intelligence
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
            fontWeight: 800,
            lineHeight: 1.2,
            marginBottom: '0.85rem',
            color: 'var(--text-primary)'
          }}>
            LOKHA Real Estate Intelligence
          </h1>

          <p style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '640px',
            margin: '0 auto'
          }}>
            Comprehensive legal checklists, stamp duty calculators, FEMA guides for NRIs, and micro-market analysis authored by certified real estate attorneys.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.25rem' }}>
        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.35rem' }}>
          {[
            { id: 'all', label: 'All Guides' },
            { id: 'legal', label: 'RERA & Legal Due Diligence' },
            { id: 'tax', label: 'Stamp Duty & Taxation' },
            { id: 'nri', label: 'NRI & FEMA Investments' },
            { id: 'trends', label: 'Market Appreciation Trends' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '0.5rem 1.2rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: activeTab === tab.id ? 'var(--gold-primary)' : 'var(--bg-card)',
                color: activeTab === tab.id ? 'var(--gold-text)' : 'var(--text-secondary)',
                border: `1px solid ${activeTab === tab.id ? 'var(--gold-primary)' : 'var(--border)'}`,
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'background-color 250ms ease, color 250ms ease, border-color 250ms ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '2rem'
        }}>
          {filtered.map(art => (
            <div
              key={art.slug}
              onClick={() => onNavigate(`insight-${art.slug}`)}
              style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-card)',
                transition: 'background-color 250ms ease, border-color 250ms ease, box-shadow 250ms ease, transform 200ms ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = 'var(--gold-primary)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '0.2rem 0.6rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(212, 175, 55, 0.1)',
                  color: 'var(--gold-primary)'
                }}>
                  {art.category}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                  {art.readTime}
                </span>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                {art.title}
              </h3>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, flex: 1 }}>
                {art.summary}
              </p>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '0.85rem',
                borderTop: '1px solid var(--border)'
              }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                  {art.date}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gold-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  Read Full Guide <ArrowRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
