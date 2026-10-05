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
const burningImage = '/images/parali_burning.jpg';
const farmerPhoneImage = '/images/farmer_phone.jpg';
const circularUseImage = '/images/cbg_mushroom_offtake_1790447167269.jpg';

export function CommandCenter({
  fields, machines, fireEvents, storageYards, buyers, onSelectField, onOpenResidue, onOpenImpact, onNavigate
}: Props) {
  const activeJobs = fields.filter(f => ['SCHEDULED', 'BALING_IN_PROGRESS'].includes(f.status)).length;
  const verified = fields.filter(f => f.status === 'VERIFIED_NON_BURN' || f.is_verified_non_burn).length;
  const machineActive = machines.filter(m => m.status !== 'MAINTENANCE').length;
  const acreage = fields.reduce((sum, f) => sum + (Number(f.acreage) || 0), 0);
  const estimatedResidue = acreage * 1.8; // illustrative planning coefficient; not a measured recovery factor
  const cleared = fields.filter(f => ['CLEARED_PENDING_AUDIT', 'VERIFIED_NON_BURN'].includes(f.status)).length;

  const workflow = [
    { n: '01', title: 'Register the field', text: 'Add the field, location and consent once.', icon: MapPinned, image: farmImage, imageAlt: 'Cultivated field landscape', tab: 'My Fields' },
    { n: '02', title: 'Book clearance', text: 'Request a baler and plan the job around harvest.', icon: CalendarDays, image: balerImage, imageAlt: 'Baler working with crop residue', tab: 'Book Clearance' },
    { n: '03', title: 'Track the operation', text: 'Follow the machine and see the field move through each stage.', icon: Truck, image: fleetImage, imageAlt: 'Agricultural machines moving baled residue', tab: 'Track Clearance' },
    { n: '04', title: 'Prove what happened', text: 'Capture evidence, verify the field and release residue for offtake.', icon: ShieldCheck, image: satelliteImage, imageAlt: 'Satellite view used as verification context', tab: 'Verify' },
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

      {/* FARMER-FIRST QUICK ACTIONS */}
      <section className="home-farmer-actions" aria-label="Quick farmer actions">
        <div className="home-farmer-actions-intro">
          <span className="home-section-kicker">For farmers</span>
          <strong>Start with what you need today.</strong>
          <span>No technical setup. Just choose an action.</span>
        </div>
        <button type="button" onClick={() => onNavigate('FARMER_ONBOARDING')}>
          <MapPinned /><span><b>My field</b><small>Add or view your field</small></span><ChevronRight />
        </button>
        <button type="button" onClick={() => onNavigate('FARMER_ONBOARDING')}>
          <CalendarDays /><span><b>Book clearance</b><small>Plan residue removal</small></span><ChevronRight />
        </button>
        <button type="button" onClick={() => onNavigate('OPS_CONSOLE')}>
          <Truck /><span><b>Track machine</b><small>See today's operation</small></span><ChevronRight />
        </button>
        <button type="button" onClick={onOpenResidue}>
          <Leaf /><span><b>Sell residue</b><small>Explore verified buyers</small></span><ChevronRight />
        </button>
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
                <img src={step.image} alt={step.imageAlt} loading="lazy" />
                <span>{step.n}</span>
              </div>
              <div className="home-workflow-body">
                <Icon className="home-card-icon" />
                <h3>{step.title}</h3>
                <p>{step.text}</p>
                <span className="home-card-link">{step.tab} <ChevronRight /></span>
              </div>
            </button>
          );
        })}
      </section>

      {/* RESEARCH-BACKED STORY: the problem, the field workflow and the utilisation chain */}
      <section className="home-research-story" aria-labelledby="research-story-title">
        <div className="home-research-copy">
          <div className="home-section-kicker">Why this chain matters</div>
          <h2 id="research-story-title">Crop-residue management is a field-to-market problem.</h2>
          <p>
            India’s 2024 Crop Residue Management guidelines call for reducing air pollution and nutrient loss from burning,
            while building supply chains for useful residue through appropriate mechanisation. Recent ICAR work in Punjab also
            highlights demand-driven machinery deployment, digital mapping, baler tracking and viable biomass supply chains.
          </p>
          <div className="home-research-points">
            <div>
              <strong>1. Manage the field</strong>
              <span>Choose an in-situ or collection pathway that fits the crop and field.</span>
            </div>
            <div>
              <strong>2. Coordinate machines</strong>
              <span>Match available machinery and operators to actual local demand.</span>
            </div>
            <div>
              <strong>3. Move verified biomass</strong>
              <span>Aggregate, store and dispatch residue only after the operational record is clear.</span>
            </div>
          </div>
          <div className="home-research-sources">
            <span>Research basis</span>
            <a href="https://agrimachinery.nic.in/Files/Guidelines/Guidelines_CRM2024.pdf" target="_blank" rel="noreferrer">Govt. of India • CRM Guidelines 2024</a>
            <a href="https://icar.gov.in/index.php/en/punjab-stakeholders-forge-integrates-action-agenda-crop-residue-management" target="_blank" rel="noreferrer">ICAR-ATARI Ludhiana • Punjab workshop • 30 Sep 2026</a>
          </div>
        </div>
        <div className="home-research-images">
          <figure className="home-research-image home-research-image-main">
            <img src={burningImage} alt="Crop-residue burning, shown as the problem NIRDHOOM is designed to help manage" loading="lazy" />
            <figcaption>Problem: residue burning</figcaption>
          </figure>
          <figure className="home-research-image home-research-image-phone">
            <img src={farmerPhoneImage} alt="Farmer using a phone for field coordination" loading="lazy" />
            <figcaption>Coordination: farmer-first access</figcaption>
          </figure>
          <figure className="home-research-image home-research-image-circular">
            <img src={circularUseImage} alt="Residue utilisation facility representing downstream demand" loading="lazy" />
            <figcaption>Pathway: utilisation and offtake</figcaption>
          </figure>
        </div>
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
        <div><span>RESIDUE</span><strong>{estimatedResidue.toFixed(1)} t</strong><small>illustrative planning estimate</small></div>
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
