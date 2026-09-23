import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: 'What is LOKHA?',
      answer: 'LOKHA is a premier real-estate marketplace and ecosystem designed to connect buyers, property owners, corporate tenants, certified RERA advisors, and master developers across India’s high-growth metropolitan corridors with institutional transparency.'
    },
    {
      question: 'Can I buy property through LOKHA?',
      answer: 'Yes. LOKHA features thousands of verified freehold properties, luxury villas, penthouses, plots, and commercial units. You can search by micro-market circle rates, compare up to 4 properties side-by-side, calculate loan EMIs, and book assisted physical site inspections.'
    },
    {
      question: 'Can I rent or lease an executive residence?',
      answer: 'Absolutely. LOKHA offers dedicated Rent and Executive Lease sections catering to luxury residences, corporate expat housing, and boutique serviced accommodation with clear security deposit and tenure terms.'
    },
    {
      question: 'Can I list my own property on LOKHA?',
      answer: 'Yes. Verified property owners can publish residences directly through our Give / List Property wizard. To ensure safety and credibility, owner listings require electricity consumer number and municipal patta verification.'
    },
    {
      question: 'Can real-estate agents and brokers join LOKHA?',
      answer: 'Certified RERA-registered advisors can join LOKHA. We provide accredited profiles, client lead routing, and dedicated listing portfolios to verified professionals while eliminating unauthorized broker duplication.'
    },
    {
      question: 'How are properties verified on LOKHA?',
      answer: 'Every listing undergoes multi-stage verification including document title deed checks, Encumbrance Certificate (EC) verification, RERA license matching, and electricity utility confirmation before receiving the green Verified Badge.'
    },
    {
      question: 'Can I schedule an in-person site visit?',
      answer: 'Yes. Every property page includes a Site Visit scheduler where you select your preferred date and morning/afternoon slot. You receive an immediate calendar confirmation and a dedicated concierge coordination contact.'
    },
    {
      question: 'How do enquiries work on LOKHA?',
      answer: 'When you submit an inquiry, it is dispatched directly to the authenticated owner or developer representative without broker walls. You can track all responses in real time in your personal dashboard.'
    },
    {
      question: 'Is LOKHA available outside India?',
      answer: 'While our primary inventory spans 10 premier Indian metropolitan hubs (Chennai, Bengaluru, Hyderabad, Mumbai, Delhi NCR, Pune, Coimbatore, Kochi, etc.), NRI investors worldwide can discover, inspect, and acquire estates with full foreign inward remittance compliance.'
    }
  ];

  return (
    <section style={{
      padding: '7rem 1.5rem',
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-subtle)'
    }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div className="section-eyebrow" style={{ justifyContent: 'center' }}>
            <HelpCircle size={15} />
            <span>Frequently Asked Questions</span>
          </div>

          <h2 className="editorial-title" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.4rem)' }}>
            Got questions? We've got answers.
          </h2>

          <p className="editorial-sub" style={{ maxWidth: '580px', margin: '0.75rem auto 0' }}>
            Clear explanations regarding our verification criteria, property discovery, listing workflows, and advisory standards.
          </p>
        </div>

        {/* Accordion List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: 'var(--radius-xl)',
                  border: isOpen ? '1px solid var(--border-gold)' : '1px solid var(--border-subtle)',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  boxShadow: isOpen ? 'var(--shadow-sm)' : 'none'
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  style={{
                    width: '100%',
                    padding: '1.5rem 1.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    textAlign: 'left',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-primary)'
                  }}
                >
                  <span style={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.4 }}>
                    {faq.question}
                  </span>

                  <div style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.25s ease',
                    color: isOpen ? 'var(--gold-primary)' : 'var(--text-tertiary)'
                  }}>
                    <ChevronDown size={20} />
                  </div>
                </button>

                <div className={`faq-answer ${isOpen ? 'is-open' : ''}`}>
                  <div className="faq-answer-inner" style={{
                    padding: '0 1.75rem 1.5rem',
                    color: 'var(--text-secondary)',
                    fontSize: '0.925rem',
                    lineHeight: 1.7
                  }}>
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
