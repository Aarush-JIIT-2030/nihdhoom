import { motion } from 'motion/react';
import {
  Activity, ArrowRight, CalendarDays, CheckCircle2, Factory, Leaf, Map,
  MapPinned, ShieldCheck, Truck, Wheat, Users, CircleDollarSign, Camera,
  Satellite, ChevronRight
} from 'lucide-react';
import { Field, Machine, BurnEvent, StorageYard, Buyer } from '../../types';
import { OpsMap } from '../OpsConsole/OpsMap';
import { Spotlight } from '../Animated/Spotlight';

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

const heroImage = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Paddy_fields_in_Batala%2C_Gurdaspur%2C_Punjab.jpg/1280px-Paddy_fields_in_Batala%2C_Gurdaspur%2C_Punjab.jpg';
const farmImage = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Paddy_fields_in_Batala%2C_Gurdaspur%2C_Punjab.jpg/1280px-Paddy_fields_in_Batala%2C_Gurdaspur%2C_Punjab.jpg';
const balerImage = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Tractor_with_baler.jpg/1280px-Tractor_with_baler.jpg';
const fleetImage = 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Agriculture_in_India_tractor_farming_Punjab_preparing_field_for_a_wheat_crop_without_burning_previous_crop_stalk.jpg';
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
  const residueLots = fields.filter((f) => Boolean(f.residue_lot_id)).length;
  const cleared = fields.filter(f => ['CLEARED_PENDING_AUDIT', 'VERIFIED_NON_BURN'].includes(f.status)).length;

  const workflow = [
    { n: '01', title: 'Register the field', text: 'Add the field, location and consent once.', icon: MapPinned, image: farmImage, imageAlt: 'Cultivated field landscape', tab: 'My Fields' },
    { n: '02', title: 'Book clearance', text: 'Request a baler and plan the job around harvest.', icon: CalendarDays, image: balerImage, imageAlt: 'Baler working with crop residue', tab: 'Book Clearance' },
    { n: '03', title: 'Track the operation', text: 'Follow the machine and see the field move through each stage.', icon: Truck, image: fleetImage, imageAlt: 'Agricultural machines moving baled residue', tab: 'Track Clearance' },
    { n: '04', title: 'Prove what happened', text: 'Capture evidence and verify the field without overstating what remote sensing can prove.', icon: ShieldCheck, image: satelliteImage, imageAlt: 'Satellite view used as verification context', tab: 'Verify' },
    { n: '05', title: 'Move the residue', text: 'Create a verified lot, pool it and connect it to real buyer demand.', icon: Leaf, image: circularUseImage, imageAlt: 'Biomass utilisation facility', tab: 'Parali Market' },
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
        <Spotlight className="home-hero-spotlight" fill="#f2a900" />
        <img src={heroImage} alt="Paddy fields in Batala, Gurdaspur, Punjab" className="home-hero-image" decoding="async" fetchPriority="high" />
        <div className="home-hero-overlay" />
        <div className="home-hero-content">
          <div className="home-eyebrow"><Leaf className="h-4 w-4" /> FIELD CLEARANCE COORDINATION • NIRDHOOM</div>
          <h1>When harvest ends,<br /><span>who clears the field?</span></h1>
          <p>NIRDHOOM connects the farmer request to available machine capacity, field evidence and the next residue pathway — so the messy middle becomes visible and actionable.</p>
          <div className="home-actions">
            <button onClick={() => onNavigate('FARMER_ONBOARDING')} className="home-primary">Book parali pickup <ArrowRight className="h-4 w-4" /></button>
            <button onClick={() => onNavigate('OPS_CONSOLE')} className="home-secondary"><Map className="h-4 w-4" /> Track today's operation</button>
          </div>
          <div className="home-trust-row">
            <span><CheckCircle2 /> Evidence before impact</span>
            <span><Map /> Field-level provenance</span>
            <span><Truck /> Machine-linked operations</span>
          </div>
          <a className="home-photo-credit" href="https://commons.wikimedia.org/wiki/File:Paddy_fields_in_Batala,_Gurdaspur,_Punjab.jpg" target="_blank" rel="noreferrer">Photo: Rohitjahnavi / Wikimedia Commons · CC BY-SA 3.0 ↗</a>
        </div>
      </section>

      {/* RESEARCH-BACKED GAP: why another booking app is not enough */}
      <section className="home-gap-story" aria-labelledby="home-gap-title">
        <div className="home-gap-heading">
          <div>
            <div className="home-section-kicker">The gap we are attacking</div>
            <h2 id="home-gap-title">The machinery exists. The coordination layer is weak.</h2>
          </div>
          <p>Recent CEEW research points to a practical adoption gap: farmers and machinery centres still rely heavily on informal, phone-based coordination. NIRDHOOM is designed around that missing operational layer.</p>
        </div>
        <div className="home-gap-grid">
          <article><strong>86%</strong><span>of surveyed Punjab farmers had never heard of the Unnat Kisan machinery app.</span><small>CEEW, 2026 survey • 102 farmers</small></article>
          <article><strong>1%</strong><span>of farmers in a cited Punjab study reported using digital machinery-rental apps.</span><small>CEEW, 2025/2026 synthesis</small></article>
          <article><strong>15%</strong><span>of farmers practising in-situ CRM accessed CHC services in the cited CEEW research.</span><small>CEEW, 2025 CHC study</small></article>
          <article><strong>45%</strong><span>of surveyed CHCs offering in-situ rental reported packaged machine + tractor + driver services.</span><small>CEEW, 2025 CHC study</small></article>
        </div>
        <div className="home-gap-answer">
          <div><b>NIRDHOOM's response</b><span>Farmer request → capacity match → route → field evidence → verified residue.</span></div>
          <a href="https://www.ceew.in/publications/improving-access-to-crop-residue-management-solutions-with-custom-hiring-centres-in-agriculture" target="_blank" rel="noreferrer">Read the CEEW CHC research ↗</a>
          <a href="https://www.ceew.in/publications/how-can-punjab-adopt-crop-residue-management-methods-and-tackle-paddy-stubble-burning?page=1" target="_blank" rel="noreferrer">Read the Punjab adoption research ↗</a>
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
            <button type="button" key={step.n} onClick={() => onNavigate(step.tab === 'My Fields' ? 'FIELD_JOBS' : step.tab === 'Book Clearance' ? 'FARMER_ONBOARDING' : step.tab === 'Track Clearance' ? 'OPS_CONSOLE' : step.tab === 'Parali Market' ? 'RESIDUE_POOLS' : 'SATELLITE_AUDIT')} className="home-workflow-card text-left">
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

      <section className="home-field-stories" aria-labelledby="field-stories-title">
        <div className="home-field-stories-heading">
          <div>
            <div className="home-section-kicker">In the field</div>
            <h2 id="field-stories-title">Real agriculture, not stock illustrations.</h2>
          </div>
          <p>These images are sourced from Wikimedia Commons and credited to their authors. They show the real landscape and operating context NIRDHOOM is designed for.</p>
        </div>
        <div className="home-field-stories-grid">
          <figure>
            <img src="https://commons.wikimedia.org/wiki/Special:Redirect/file/Paddy_fields_in_Batala%2C_Gurdaspur%2C_Punjab.jpg?width=1280" alt="Paddy fields in Batala, Gurdaspur, Punjab" loading="lazy" />
            <figcaption><span>Punjab field context</span><a href="https://commons.wikimedia.org/wiki/File:Paddy_fields_in_Batala,_Gurdaspur,_Punjab.jpg" target="_blank" rel="noreferrer">Rohitjahnavi · CC BY-SA 3.0 ↗</a></figcaption>
          </figure>
          <figure>
            <img src="https://commons.wikimedia.org/wiki/Special:Redirect/file/Agriculture_in_India_tractor_farming_Punjab_preparing_field_for_a_wheat_crop_without_burning_previous_crop_stalk.jpg?width=1280" alt="Tractor preparing a Punjab field without burning previous crop residue" loading="lazy" />
            <figcaption><span>Residue-aware field preparation</span><a href="https://commons.wikimedia.org/wiki/File:Agriculture_in_India_tractor_farming_Punjab_preparing_field_for_a_wheat_crop_without_burning_previous_crop_stalk.jpg" target="_blank" rel="noreferrer">CIAT / Neil Palmer · CC BY 2.0 ↗</a></figcaption>
          </figure>
          <figure>
            <img src="https://commons.wikimedia.org/wiki/Special:Redirect/file/Manav_Vikas_Sansthan_on_Crop_residue_management.jpg?width=1280" alt="Crop residue management training in Punjab" loading="lazy" />
            <figcaption><span>Crop-residue management</span><a href="https://commons.wikimedia.org/wiki/File:Manav_Vikas_Sansthan_on_Crop_residue_management.jpg" target="_blank" rel="noreferrer">Singhbrarraj636 · CC BY-SA 4.0 ↗</a></figcaption>
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
        <div><span>RESIDUE</span><strong>{residueLots}</strong><small>linked residue lots</small></div>
        <div><span>VERIFIED</span><strong>{verified}</strong><small>verified non-burn fields</small></div>
      </section>

      <section className="home-product-status" aria-label="Operational status">
        <div>
          <span className="home-section-kicker">Today</span>
          <strong>One place for the next field action.</strong>
          <small>Use the live workflow surfaces below instead of a presentation flow.</small>
        </div>
        <div className="home-status-grid">
          {[
            { icon: MapPinned, value: fields.length, label: 'fields', tab: 'FIELD_JOBS' },
            { icon: Truck, value: activeJobs, label: 'active jobs', tab: 'OPS_CONSOLE' },
            { icon: Leaf, value: residueLots, label: 'residue lots', tab: 'RESIDUE_POOLS' },
            { icon: ShieldCheck, value: verified, label: 'verified fields', tab: 'SATELLITE_AUDIT' },
          ].map(({ icon: Icon, value, label, tab }, index) => (
            <motion.button
              key={label}
              type="button"
              onClick={() => onNavigate(tab)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon /><span><b>{value}</b><small>{label}</small></span>
            </motion.button>
          ))}
        </div>
      </section>
    </div>
  );
}
