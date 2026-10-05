import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Github,
  Play,
  ShieldCheck,
  Smartphone,
  Target,
  Trophy,
  Users,
} from 'lucide-react';
import { ActiveTab } from '../Header';

interface CompetitionCenterProps {
  onNavigate: (tab: ActiveTab) => void;
}

const journey = [
  ['1', 'Field', 'Farmer selects a registered field.'],
  ['2', 'Book', 'Request a clearance slot with server-side booking logic.'],
  ['3', 'Machine', 'Dispatch matches work to available machinery in the workflow.'],
  ['4', 'Proof', 'Operator GPS and evidence are captured; verification stays explicit.'],
  ['5', 'Parali', 'Verified residue can enter pooling/offtake workflows.'],
];

const checklist = [
  'Problem and target user are obvious in the first 20 seconds.',
  'Live/demo boundaries are visible instead of hidden in fine print.',
  'No real payment movement or invented settlement claims.',
  'Farmer journey can be demonstrated on a phone-sized viewport.',
  'Technical depth is available without forcing judges through every advanced screen.',
];

export const CompetitionCenter: React.FC<CompetitionCenterProps> = ({ onNavigate }) => (
  <div className="competition-center">
    <section className="competition-hero">
      <div>
        <div className="competition-eyebrow">
          <Trophy className="h-4 w-4" />
          HACKATHON READY BUILD
        </div>
        <h2>One product. Two competition stories.</h2>
        <p>
          NIRDHOOM is the same field-first crop-residue network for both events.
          RIDE sees the startup and incubation opportunity; WarriorHacks sees a
          practical community problem solved with working software.
        </p>
        <div className="competition-actions">
          <button type="button" onClick={() => onNavigate('DEMO_RUNNER')} className="competition-primary">
            <Play className="h-4 w-4" /> Start the 2-minute demo
          </button>
          <button type="button" onClick={() => onNavigate('JUDGE_DEFENSE')} className="competition-secondary">
            <ShieldCheck className="h-4 w-4" /> Open judge Q&A
          </button>
        </div>
      </div>
      <div className="competition-hero-mark" aria-hidden="true">
        <Target className="h-12 w-12" />
        <span>Field → Proof → Offtake</span>
      </div>
    </section>

    <section className="competition-grid">
      <article className="competition-card competition-card-rider">
        <div className="competition-card-top">
          <span className="competition-badge">RIDE HACK ’26</span>
          <Users className="h-5 w-5" />
        </div>
        <h3>Pitch NIRDHOOM as a startup</h3>
        <p>Focus on asset-light rural logistics, incubation potential, market validation and a scalable operating model.</p>
        <ul>
          <li>Problem: seasonal residue clearance is fragmented and time-sensitive.</li>
          <li>Wedge: coordinate existing machinery instead of buying another fleet.</li>
          <li>Moat: field records + operational evidence + verified residue workflows.</li>
          <li>Scale: start in North India, then reuse the workflow in other residue regions.</li>
        </ul>
        <button type="button" onClick={() => onNavigate('JUDGE_DEFENSE')} className="competition-link">
          Prepare the startup defence <ArrowRight className="h-4 w-4" />
        </button>
      </article>

      <article className="competition-card competition-card-warrior">
        <div className="competition-card-top">
          <span className="competition-badge">WARRIORHACKS 2.0</span>
          <Smartphone className="h-5 w-5" />
        </div>
        <h3>Pitch NIRDHOOM as a community solution</h3>
        <p>Lead with a simple farmer problem and prove the workflow works: book pickup, track the machine and verify what happened.</p>
        <ul>
          <li>Impact: reduce friction around non-burning residue management.</li>
          <li>UX: farmer-first words, mobile-sized controls and local-language support.</li>
          <li>Technical craft: Supabase, server-owned booking, GPS/evidence, dispatch and verification.</li>
          <li>Feasibility: clearly separate implemented foundations from pilot dependencies.</li>
        </ul>
        <button type="button" onClick={() => onNavigate('FARMER_ONBOARDING')} className="competition-link">
          Open the farmer workflow <ArrowRight className="h-4 w-4" />
        </button>
      </article>
    </section>

    <section className="competition-section">
      <div className="competition-section-heading">
        <div>
          <div className="competition-eyebrow">THE LIVE DEMO SCRIPT</div>
          <h3>Show the whole value chain without getting lost in the dashboard.</h3>
        </div>
        <span className="competition-time">~2 minutes</span>
      </div>
      <div className="competition-journey">
        {journey.map(([number, title, copy]) => (
          <div key={number} className="competition-step">
            <span>{number}</span>
            <div><strong>{title}</strong><p>{copy}</p></div>
          </div>
        ))}
      </div>
    </section>

    <section className="competition-two-col">
      <div className="competition-section">
        <div className="competition-section-heading">
          <div>
            <div className="competition-eyebrow">SUBMISSION CHECK</div>
            <h3>What the judges should be able to verify</h3>
          </div>
        </div>
        <div className="competition-checklist">
          {checklist.map((item) => <div key={item}><CheckCircle2 className="h-4 w-4" /><span>{item}</span></div>)}
        </div>
      </div>

      <div className="competition-section competition-truth">
        <div className="competition-eyebrow">TRUTH LABELS</div>
        <h3>Never oversell the prototype.</h3>
        <div className="competition-truth-row"><span>Live foundations</span><strong>Supabase auth/data, booking boundaries, Telegram APIs, GPS/evidence primitives</strong></div>
        <div className="competition-truth-row"><span>Demo / illustrative</span><strong>Seeded scenarios, 3D views, indicative economics, simulated payment UI</strong></div>
        <div className="competition-truth-row"><span>Pilot dependencies</span><strong>Cadastral verification, production machine telemetry, external solver/provider operations</strong></div>
        <div className="competition-truth-row"><span>Explicitly disabled</span><strong>Real payment or payout movement</strong></div>
      </div>
    </section>

    <section className="competition-footer-card">
      <div>
        <Github className="h-5 w-5" />
        <div>
          <strong>Submission assets live in the repository</strong>
          <p>Use the RIDE and WarriorHacks submission briefs in <code>docs/</code> as the source of truth for the application copy, demo order and evidence boundaries.</p>
        </div>
      </div>
      <ExternalLink className="h-4 w-4 opacity-60" />
    </section>
  </div>
);
