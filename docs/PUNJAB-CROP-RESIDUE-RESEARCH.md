# Punjab crop-residue research notes

**Reviewed:** 27 September 2026  
**Purpose:** Ground NIRDHOOM's product decisions in public evidence. This document is not an operational dataset, a legal opinion, or an agronomic recommendation.

## Evidence snapshot

| Indicator | Reported value | Period / scope | Source and interpretation |
|---|---:|---|---|
| Punjab paddy-stubble fire incidents | 5,114 | 15 Sep–30 Nov 2025; Punjab | CAQM/PIB season-end release. It reports a 53% reduction compared with 2024. These are protocol-based incident counts, not a measure of tonnes burned or field-level service coverage. |
| Punjab paddy-stubble fire incidents | 10,909 | 15 Sep–30 Nov 2024; Punjab | Parliamentary reply and CAQM reporting. Use the same season window when comparing with 2025. |
| Punjab incidents in CAQM annual report | 83,002 (2020) to 10,909 (2024) | Annual report's reported series | CAQM Annual Report 2024–25. The report describes an 87% decline over that span. Historical counts should not be mixed with differently scoped daily or seasonal figures. |
| CRM machinery fleet | About 1.25 lakh planned operational | 2026 season; Punjab | The Indian Express reported the Agriculture Department's plan and also reported a substantial ageing/non-functional equipment challenge. Treat this as a reported plan, not a live inventory or a count of available balers. |
| CRM scheme assistance | 50% for eligible individual machinery; 80% for eligible CHC projects up to ₹30 lakh | Scheme description in PIB, 18 Mar 2025 | Scheme-level description. Eligibility, application windows, ceilings, and current local terms must be verified with the responsible department before display as an offer. |

## What this means for product design

1. **Model service capacity, not just machine counts.** A machine record should distinguish registered, operational, available, assigned, and unavailable states. Availability needs a timestamp and a source.
2. **Make commitments explicit.** A guaranteed clearance date should only be shown when a real operator, service area, capacity, and escalation/penalty arrangement support it. A demo quote must be visibly marked as a demo.
3. **Keep pathways separate.** In-situ operations and ex-situ collection solve different problems. Ex-situ dispatch also needs buyer demand, bale handling, storage, transport, and acceptance criteria.
4. **Use layered verification.** Field polygon provenance, operator evidence, timestamps, and satellite observations are complementary. An absent satellite detection does not prove that no burning occurred; a detection does not independently establish the state of a specific field.
5. **Do not overstate impact.** Public state-level incident reductions cannot be attributed to NIRDHOOM. Report product metrics only from auditable platform records and define the denominator and period.
6. **Show source and freshness.** Every public-data card should show the source, publication/measurement period, and whether it is historical, planned, or live.

## Sources

- [CAQM / Press Information Bureau — Paddy harvesting season 2025 concludes with significant reduction in farm fire incidents across Punjab and Haryana (1 Dec 2025)](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2197201&lang=1&reg=3)
- [Press Information Bureau — Stubble Burning / Crop Residue Management scheme (18 Mar 2025)](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2112397&lang=2&reg=48)
- [CAQM Annual Report 2024–25, section 6.6: Abatement of Air Pollution from Crop Residue Burning](https://caqm.nic.in/WriteReadData/LINKS/7bb814e6-844c-48b9-91cc-aa1909f9a7d8.pdf)
- [The Indian Express — Punjab prepares CRM fleet for the 2026 stubble season; ageing fleet context (September 2026)](https://indianexpress.com/article/cities/chandigarh/record-paddy-area-ageing-crm-fleet-punjab-readies-1-25-lakh-machines-for-stubble-season-10888644/)
- [Press Information Bureau — Parliament question on detection of stubble burning (5 Feb 2026)](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2223752&lang=2&reg=3)

## Limitations and update protocol

- Fire-event counts depend on the monitoring protocol and date window. Do not compare partial-season counts with season-end totals.
- Machinery figures may describe distribution, planned operational capacity, or equipment age; those are not interchangeable.
- Scheme descriptions are time-sensitive and do not guarantee that an individual farmer or operator qualifies.
- Do not use external images unless the repository records a suitable license/permission and attribution. Existing project photographs should also have their provenance checked before public launch.
- Review this note before each harvest season and replace dated figures only after checking the original source.


## Additional research review — 1 October 2026

### Communication and adoption
A June 2026 CEEW study reports that 63% of surveyed respondents said they had not received CRM-related information when needed; 86% had not heard of the Unnat Kisan application, and 78% had not attended CRM training. CEEW describes its 102-farmer survey across four Punjab districts as non-representative, supplemented by focus groups and consultations. Treat these as findings from that study, not estimates for all Punjab farmers.

**Product implications to test:** task-timed opt-in reminders; assisted onboarding and phone support; farmer-tested Punjabi/Hindi language; and short, staged forms that request only information needed for the next action.

Source: [CEEW, How Can Crop Residue Management Communication Drive Behaviour Change? (June 2026)](https://www.ceew.in/publications/how-can-crop-residue-management-communication-drive-Behaviour-change)

### Satellite fire counts and evidence
An August 2026 peer-reviewed study in the *International Journal of Applied Earth Observation and Geoinformation* analyzes cloud cover and satellite overpass timing as limitations in active-fire detection counts in northwest India. A 2025 study evaluates Sentinel-1 radar as a complement to Sentinel-2 optical imagery for burnt-area mapping in Punjab, while noting limitations including rainfall effects and district-level variation.

**Product implications:** store sensor/source, observation time, processing version, geometry, and quality metadata; present detections as observations rather than field-level verdicts; retain human review and a dispute path. Radar/optical fusion should be a separately validated future capability, not a claimed current feature.

Sources:
- [Misra et al., 2026, satellite fire-detection limitations](https://www.sciencedirect.com/science/article/pii/S1569843226003341)
- [Sentinel-1 and Sentinel-2 burnt-area mapping study (2025)](https://www.sciencedirect.com/science/article/abs/pii/S2352938525000679)

### Interface and accessibility
W3C's forms guidance recommends short forms, explicit labels, grouped controls, and clear instructions. Its mobile accessibility guidance covers touch input, small screens, varied input methods, and bright-light settings.

**Product implications:** make the next action obvious; use persistent labels and inline validation; provide clear error/retry states; ensure large touch targets, visible focus, readable contrast, and reduced-motion support; test outdoors and on low-end Android devices and slow networks.

Sources:
- [W3C WAI Forms Tutorial](https://www.w3.org/WAI/tutorials/forms/)
- [W3C WAI Mobile Accessibility](https://www.w3.org/WAI/standards-guidelines/mobile/)

### Research-to-roadmap summary
| Finding / limitation | Product response | Validation |
|---|---|---|
| CRM information may not reach farmers when needed | Opt-in, task-timed reminders and assisted onboarding | Farmer interviews and task-completion tests |
| Satellite counts depend on sensor timing and cloud conditions | Separate detection records from field verification | Compare alerts with documented field reviews |
| Ex-situ pathways depend on logistics and buyer conditions | Capture lot quality, custody, delivery, and acceptance | Validate with operators and actual buyers |
| Mobile use includes small screens, touch, and bright sunlight | Short forms, large controls, readable states, offline-safe flows | Real-device outdoor usability tests |

These sources support design hypotheses and safeguards; they do not establish NIRDHOOM impact, demand, or adoption.
