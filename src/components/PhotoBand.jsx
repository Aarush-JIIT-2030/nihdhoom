export default function PhotoBand() {
  return (
    <div className="photo-band">
      <div>
        <img src="/images/punjab_farmer_hero.jpg" alt="Punjab farmer in a field" loading="lazy" />
        <span>Farmer-first</span>
      </div>
      <div>
        <img src="/images/baling_fleet.jpg" alt="Crop residue baling machinery" loading="lazy" />
        <span>Idle machinery, routed</span>
      </div>
      <div>
        <img src="/images/offtake_facility.jpg" alt="Residue offtake facility" loading="lazy" />
        <span>Multiple offtake paths</span>
      </div>
    </div>
  );
}
