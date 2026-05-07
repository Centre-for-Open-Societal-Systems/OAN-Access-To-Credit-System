import { useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  Globe,
  ShieldAlert,
  Sprout,
  Tractor,
  Users,
} from 'lucide-react';

const roles = [
  {
    id: 'farmer-applicant',
    title: 'Farmer Applicant',
    description: 'Credit assessment, underwriting, approval',
    icon: Tractor,
  },
  {
    id: 'development-agent',
    title: 'Development Agent',
    description: 'Field operations, KYC, and application entry',
    icon: Users,
  },
  {
    id: 'bank-admin',
    title: 'Bank Admin',
    description: 'Credit assessment, underwriting, approval',
    icon: Building2,
  },
];

const activeAgents = [
  { initials: 'AM', tone: 'linear-gradient(135deg, #8bd0f7 0%, #2d6ea8 100%)' },
  { initials: 'SN', tone: 'linear-gradient(135deg, #f4b27e 0%, #d96525 100%)' },
  { initials: 'TK', tone: 'linear-gradient(135deg, #9ed8a7 0%, #4c8c67 100%)' },
];

function App() {
  const [selectedRole, setSelectedRole] = useState(roles[1]);

  return (
    <div className="app-shell">
      <header className="page-frame">
        <div className="header-bar">
          <div className="brand-mark">
            <div className="brand-icon" aria-hidden="true">
              <Sprout size={22} strokeWidth={2.2} />
            </div>
            <div className="brand-copy">
              <span className="brand-title">Open Agri</span>
              <span className="brand-subtitle">Access Credit System</span>
            </div>
          </div>

          <div className="header-actions">
            <button className="header-link header-link--ghost" type="button">
              Login
            </button>
            <button className="header-link header-link--solid" type="button">
              <span>Get Started</span>
              <ArrowRight size={16} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </header>

      <main className="content-wrap">
        <section className="page-frame w-full">
          <div className="card-shell">
            <div className="hero-panel">
              <div className="hero-panel__top">
                <div className="hero-brand">
                  <div className="hero-brand__icon" aria-hidden="true">
                    <BadgeCheck size={20} strokeWidth={2.2} />
                  </div>
                  <span className="hero-brand__name">Open AgriNet</span>
                </div>

                <span className="hero-pill">Field Agent Portal</span>

                <h1 className="hero-title font-display">
                  Empowering Ethiopian
                  <br />
                  Agriculture
                </h1>

                <p className="hero-copy">
                  Facilitating seamless credit access for millions of farmers through
                  data-driven financial infrastructure. Secure, transparent, and resilient.
                </p>
              </div>

              <div className="hero-panel__bottom">
                <div className="avatar-stack" aria-hidden="true">
                  {activeAgents.map((agent, index) => (
                    <span
                      key={agent.initials}
                      className="avatar-stack__item"
                      style={{
                        background: agent.tone,
                        marginLeft: index === 0 ? 0 : '-0.55rem',
                        zIndex: activeAgents.length - index,
                      }}
                    >
                      {agent.initials}
                    </span>
                  ))}
                  <span className="avatar-stack__item avatar-stack__item--count">+2k</span>
                </div>

                <p className="hero-footnote">
                  <span>Active agents in the field today</span>
                </p>
              </div>
            </div>

            <div className="portal-panel">
              <div className="portal-panel__top">
                <div className="portal-panel__locale">
                  <Globe size={14} strokeWidth={2.2} />
                  <span>English</span>
                </div>

                <div className="portal-panel__heading">
                  <h2 className="font-display">Welcome to the Portal</h2>
                  <p>
                    Select your role to access the agricultural credit system network.
                  </p>
                </div>
              </div>

              <div className="connect-banner">
                <div className="connect-banner__icon" aria-hidden="true">
                  <ShieldAlert size={16} strokeWidth={2.25} />
                </div>

                <div className="connect-banner__copy">
                  <strong>Low Connectivity Detected</strong>
                  <p>
                    The system is operating in offline-optimized mode. Some features may sync
                    later.
                  </p>
                </div>
              </div>

              <div className="role-list">
                {roles.map((role) => {
                  const Icon = role.icon;
                  const isActive = selectedRole.id === role.id;

                  return (
                    <button
                      key={role.id}
                      className="role-card"
                      data-active={isActive}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                    >
                      <span className="role-card__icon" aria-hidden="true">
                        <Icon size={18} strokeWidth={2.2} />
                      </span>

                      <span className="role-card__copy">
                        <span className="role-card__title">{role.title}</span>
                        <span className="role-card__description">{role.description}</span>
                      </span>

                      <span className="role-card__radio" aria-hidden="true">
                        {isActive ? <Check size={12} strokeWidth={3} /> : null}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button className="primary-cta" type="button">
                <span>Continue to Sign In</span>
                <ArrowRight size={16} strokeWidth={2.25} />
              </button>

              <p className="signup-line">
                Need a new account? <a href="/">Register here</a>
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="page-frame footer-bar">
        <div className="footer-copy">© 2024 OpenAgriNet Credit Access System. Institutional Grade Security.</div>

        <nav className="footer-links" aria-label="Footer">
          <a href="/">Privacy Policy</a>
          <a href="/">Terms of Service</a>
          <a href="/">Security Disclosure</a>
          <a href="/">Support</a>
        </nav>
      </footer>
    </div>
  );
}

export default App;
