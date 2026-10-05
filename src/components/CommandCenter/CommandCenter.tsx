import {
  Activity, ArrowRight, CalendarDays, CheckCircle2, Factory, Leaf, Map,
  MapPinned, ShieldCheck, Truck, Wheat, Users, CircleDollarSign, Camera,
  Satellite, ChevronRight
} from 'lucide-react';
import { Field, Machine, BurnEvent, StorageYard, Buyer } from '../../types';
import { OpsMap } from '../OpsConsole/OpsMap';

interface Props {
  fields: Field[];
  machines: Machine[];
  fireEvents: BurnEvent[];
  storageYards: StorageYard[];
  buyers: Buyer[];
  onSelectField: (field: Field) => void;
  onOpenResidue: () => void;
  onOpenImpact: () => void;
  onNavigate: (tab: string) => void;
}

const heroImage = '/images/punjab_farmer_hero.jpg';
const farmImage = '/images/punjab_farm_hero.jpg';
const balerImage = '/images/baler_machine.jpg';
const fleetImage = '/images/baling_dispatch_fleet_1790447115856.jpg';
const offtakeImage = '/images/offtake_facility.jpg';
const satelliteImage = '/images/satellite_firms.jpg';

export function CommandCenter({
  fields, machines, fireEvents, storageYards, buyers, onSelectField, onOpenResidue, onOpenImpact, onNavigate
}: Props) {
  const activeJobs = fields.filter(f => ['SCHEDULED', 'BALING_IN_PROGRESS'].includes(f.status)).length;
  const verified = fields.filter(f => f.status === 'VERIFIED_NON_BURN' || f.is_verified_non_burn).length;
  const machineActive = machines.filter(m => m.status !== 'MAINTENANCE').length;
  const acreage = fields.reduce((sum, f) => sum + (Number(f.acreage) || 0), 0);
  const estimatedResidue = acreage * 1.8;
  const cleared = fields.filter(f => ['CLEARED_PENDING_AUDIT', 'VERIFIED_NON_BURN'].includes(f.status)).length;

  const workflow = [
    { n: '01', title: 'Register the field', text: 'Add the field, location and consent once.', icon: MapPinned, image: farmImage, tab: 'My Fields' },
    { n: '02', title: 'Book clearance', text: 'Request a baler and plan the job around harvest.', icon: CalendarDays, image: balerImage, tab: 'Book Clearance' },
    { n: '03', title: 'Track the operation', text: 'Follow the machine and see the field move through each stage.', icon: Truck, image: fleetImage, tab: 'Track Clearance' },
    { n: '04', title: 'Prove what happened', text: 'Capture evidence, verify the field and release residue for offtake.', icon: ShieldCheck, image: satelliteImage, tab: 'Verify' },
  ];

  const audiences = [
    { title: 'For farmers', text: 'Simple field registration, clearance booking and status updates.', icon: Wheat, accent: 'green', tab: 'FARMER_ONBOARDING' },
    { title: 'For CHCs & operators', text: 'Jobs, routes, machines, evidence and completion in one workflow.', icon: Factory, accent: 'sky', tab: 'FIELD_JOBS' },
    { title: 'For buyers', text: 'Verified residue supply with field provenance and predictable dispatch.', icon: CircleDollarSign, accent: 'wheat', tab: 'OFFTAKE_AUCTION' },
    { title: 'For verification teams', text: 'Evidence-first audit trails before impact is counted.', icon: Satellite, accent: 'soil', tab: 'SATELLITE_AUDIT' },
  ];

  return (
    <div className="field-page field-home pb-12">
      {/* HERO: visual story first */}
      <section className="home-hero">
        <img src={heroImage} alt="Farmer and field in Punjab" className="home-hero-image" />
        <div className="home-hero-overlay" />
        <div className="home-hero-content">
          <div className="home-eyebrow"><Leaf className="h-4 w-4" /> NIRDHOOM • Field-first crop residue network</div>
          <h1>Turn crop residue<br /><span>into a managed resource.</span></h1>
          <p>From the field to the baler, from evidence to verified residue, and from residue to the right buyer — NIRDHOOM connects the whole journey.</p>
          <div className="home-actions">
            <button onClick={onOpenResidue} className="home-primary">Explore residue & buyers <ArrowRight className="h-4 w-4" /></button>
            <button onClick={onOpenImpact} className="home-secondary"><ShieldCheck className="h-4 w-4" /> See how verification works</button>
          </div>
          <div className="home-trust-row">
            <span><CheckCircle2 /> Evidence before impact</span>
            <span><Map /> Field-level provenance</span>
            <span><Truck /> Machine-linked operations</span>
          </div>
        </div>
      </section>

      {/* QUICK CONTEXT: plain language, no dashboard overload */}
      <section className="home-intro">
        <div>
          <div className="home-section-kicker">One connected journey</div>
          <h2>What happens to a field after harvest?</h2>
        </div>
        <p>NIRDHOOM makes the messy middle visible: who requested clearance, which machine is working, what evidence was captured, what residue was actually verified, and where it can go next.</p>
      </section>

      {/* FOUR-STAGE VISUAL WORKFLOW */}
      <section className="home-workflow">
        {workflow.map((step) => {
          const Icon = step.icon;
          return (
            <button type="button" key={step.n} onClick={() => onNavigate(step.tab === 'My Fields' ? 'FIELD_JOBS' : step.tab === 'Book Clearance' ? 'FARMER_ONBOARDING' : step.tab === 'Track Clearance' ? 'OPS_CONSOLE' : 'SATELLITE_AUDIT')} className="home-workflow-card text-left">
              <div className="home-workflow-image">
                <img src={step.image} alt="" loading="lazy" />
                <span>{step.n}</span>
              </div>
              <div className="home-workflow-body">
                <Icon className="home-card-icon" />
                <h3>{step.title}</h3>
                <p>{step.text}</p>
                <span className="home-card-link">{step.tab} <ChevronRight /></span>
              </div>
            </article>
          );
        })}
      </section>

      {/* LIVE PRODUCT LAYER */}
      <section className="home-product-layer">
        <div className="home-layer-copy">
          <div className="home-section-kicker">The operational layer</div>
          <h2>See the field, machine and evidence together.</h2>
          <p>The map is not the product by itself. It is one layer of a deeper workflow that connects fields, machines, verification and residue movement.</p>
          <div className="home-mini-grid">
            <div><MapPinned /><strong>{fields.length}</strong><span>registered fields</span></div>
            <div><Truck /><strong>{activeJobs}</strong><span>active jobs</span></div>
            <div><Factory /><strong>{machineActive}</strong><span>available machines</span></div>
            <div><ShieldCheck /><strong>{verified}</strong><span>verified fields</span></div>
          </div>
        </div>
        <div className="home-map-card">
          <div className="home-map-header">
            <div><span>LIVE FIELD VIEW</span><strong>Operations map</strong></div>
            <span className="home-live-pill"><i /> Connected records</span>
          </div>
          <OpsMap fields={fields} machines={machines} fireEvents={fireEvents} storageYards={storageYards} buyers={buyers} selectedField={null} onSelectField={onSelectField} activeRoutePolyline={[]} />
        </div>
      </section>

      {/* ROLE LAYER */}
      <section className="home-role-section">
        <div className="home-section-kicker">One platform, different jobs</div>
        <div className="home-role-heading"><h2>Everyone sees what they need.</h2><p>Keep the farmer experience simple while giving operators, buyers and verification teams the depth they need.</p></div>
        <div className="home-role-grid">
          {audiences.map(({ title, text, icon: Icon, accent, tab }) => (
            <button key={title} type="button" onClick={() => onNavigate(tab)} className={`home-role-card ${accent} text-left`}>
              <span className="home-role-icon"><Icon /></span>
              <h3>{title}</h3>
              <p>{text}</p>
              <span className="home-card-link">Open workspace <ChevronRight /></span>
            </button>
          ))}
        </div>
      </section>

      {/* VALUE / OFFTAKE STORY */}
      <section className="home-split-story">
        <div className="home-story-image"><img src={offtakeImage} alt="Residue offtake facility" loading="lazy" /></div>
        <div className="home-story-copy">
          <div className="home-section-kicker">Residue becomes supply</div>
          <h2>Don't stop at clearance.</h2>
          <p>Once a field is cleared, NIRDHOOM carries the verified residue forward into pooling, buyer demand and dispatch planning.</p>
          <div className="home-value-list">
            <div><Leaf /><span><b>Pool</b> residue by quality, location and readiness.</span></div>
            <div><Users /><span><b>Match</b> supply to buyer requirements.</span></div>
            <div><Truck /><span><b>Dispatch</b> material with operational context.</span></div>
          </div>
          <button onClick={onOpenResidue} className="home-text-button">Open residue market <ArrowRight /></button>
        </div>
      </section>

      {/* EVIDENCE STORY */}
      <section className="home-evidence">
        <div className="home-evidence-image"><img src={satelliteImage} alt="Satellite observation and field monitoring" loading="lazy" /></div>
        <div className="home-evidence-copy">
          <div className="home-section-kicker">Trust layer</div>
          <h2>Evidence first. Impact second.</h2>
          <p>Planned residue is not treated as verified impact. NIRDHOOM links operational evidence, field status and verification before downstream claims are made.</p>
          <div className="home-evidence-points">
            <span><Camera /> Photo evidence</span>
            <span><Map /> Field geometry</span>
            <span><Satellite /> Satellite context</span>
            <span><CheckCircle2 /> Verification review</span>
          </div>
          <button onClick={onOpenImpact} className="home-text-button">Open impact & research <ArrowRight /></button>
        </div>
      </section>

      {/* SIMPLE NUMBERS, NOT A WALL OF KPIs */}
      <section className="home-proof">
        <div><span>FIELD NETWORK</span><strong>{fields.length}</strong><small>registered fields</small></div>
        <div><span>OPERATIONS</span><strong>{cleared}</strong><small>cleared fields</small></div>
        <div><span>RESIDUE</span><strong>{estimatedResidue.toFixed(1)} t</strong><small>estimated from registered acreage</small></div>
        <div><span>VERIFIED</span><strong>{verified}</strong><small>verified non-burn fields</small></div>
      </section>

      {/* FINAL NAVIGATION LAYER */}
      <section className="home-bottom-cta">
        <div><div className="home-section-kicker">Go deeper</div><h2>A simple front door. A deep product underneath.</h2><p>Start with your field, then move into operations, evidence, residue, offtake and impact when you need more detail.</p></div>
        <div className="home-cta-links">
          <span><MapPinned /> My Fields</span><span><CalendarDays /> Book Clearance</span><span><Truck /> Track Clearance</span><span><Leaf /> Residue Market</span><span><ShieldCheck /> Verify</span><span><Activity /> Impact & Research</span>
        </div>
      </section>
    </div>
  );
}
