export const fields = [
  {id:'FIELD-101',farmer:'Gurpreet Singh Brar',phone:'+91 98765 43210',khasra:'Khasra 412/1-2',acres:3.5,crop:'Paddy',variety:'PR-126',harvest:'2026-10-14',deadline:'2026-10-16 18:00',status:'SCHEDULED',village:'Ubhawal',block:'Sangrur',district:'Sangrur',moisture:14.2,payout:5075,machine:'MACH-01',lat:30.2285,lng:75.8214,verified:true,geometry:[{lat:30.231,lng:75.8185},{lat:30.2315,lng:75.824},{lat:30.226,lng:75.8245},{lat:30.2255,lng:75.819}]},
  {id:'FIELD-102',farmer:'Harinder Singh Dhillon',phone:'+91 98141 12345',khasra:'Khasra 78/4',acres:5,crop:'Paddy',variety:'Pusa-44',harvest:'2026-10-24',deadline:'2026-10-26 18:00',status:'REGISTERED',village:'Kheri Chandwan',block:'Sunam',district:'Sangrur',moisture:15.8,payout:6750,lat:30.1264,lng:75.8115,verified:false,geometry:[{lat:30.129,lng:75.808},{lat:30.13,lng:75.815},{lat:30.1235,lng:75.8155},{lat:30.123,lng:75.8085}]},
  {id:'FIELD-103',farmer:'Manpreet Kaur Sandhu',phone:'+91 94632 88990',khasra:'Khasra 219/3',acres:2.5,crop:'Paddy',variety:'Basmati-1509',harvest:'2026-10-11',deadline:'2026-10-13 16:00',status:'BALING_IN_PROGRESS',village:'Bhalwan',block:'Dhuri',district:'Sangrur',moisture:13.5,payout:3625,machine:'MACH-02',lat:30.354,lng:75.852,verified:false,geometry:[{lat:30.3565,lng:75.85},{lat:30.357,lng:75.8555},{lat:30.3515,lng:75.855},{lat:30.351,lng:75.8495}]},
  {id:'FIELD-104',farmer:'Kuldeep Singh Cheema',phone:'+91 98880 77665',khasra:'Khasra 652/9',acres:4.2,crop:'Paddy',variety:'PR-126',harvest:'2026-10-12',deadline:'2026-10-14 18:00',status:'CLEARED_PENDING_AUDIT',village:'Balad Kalan',block:'Bhawanigarh',district:'Sangrur',moisture:14,payout:6090,machine:'MACH-03',lat:30.268,lng:76.035,verified:true,geometry:[{lat:30.271,lng:76.0315},{lat:30.2715,lng:76.0385},{lat:30.265,lng:76.039},{lat:30.2645,lng:76.032}]},
  {id:'FIELD-105',farmer:'Jagtar Singh Grewal',phone:'+91 97790 33441',khasra:'Khasra 890/5',acres:6,crop:'Paddy',variety:'Pusa-44',harvest:'2026-10-28',deadline:'2026-10-30 18:00',status:'VERIFIED_NON_BURN',village:'Ghabdan',block:'Sangrur',district:'Sangrur',moisture:14.8,payout:8100,machine:'MACH-01',lat:30.261,lng:75.891,verified:true,geometry:[{lat:30.264,lng:75.887},{lat:30.265,lng:75.895},{lat:30.258,lng:75.8955},{lat:30.2575,lng:75.8875}]}
];
export const machines = [
  {id:'MACH-01',name:'Baler Unit #14',type:'Claas Markant · 50 HP',owner:'CHC Ubhawal Cooperative',operator:'Balkar Singh',phone:'+91 98720 11223',status:'IDLE',capacity:22,fuel:88,lat:30.235,lng:75.83},
  {id:'MACH-02',name:'Baler Unit #07',type:'New Holland BC5070 · 60 HP',owner:'Dhuri Progressive Farmers FPO',operator:'Satnam Singh',phone:'+91 98150 44556',status:'BALING',capacity:28,fuel:74,lat:30.36,lng:75.86},
  {id:'MACH-03',name:'Baler Unit #22',type:'John Deere 459 · 50 HP',owner:'Avtar Agro Implements',operator:'Preet Mohinder',phone:'+91 94172 99887',status:'IDLE',capacity:20,fuel:92,lat:30.274,lng:76.04},
  {id:'MACH-04',name:'Super Seeder Combo #09',type:'Super Seeder',owner:'Sunam Block Panchayati CHC',operator:'Jaswant Singh',phone:'+91 98881 22334',status:'IDLE',capacity:18,fuel:95,lat:30.135,lng:75.805}
];
export const buyers = [
  {name:'Punjab Agro-Fungi Ltd',use:'Mushroom substrate',price:3850,ceiling:16,tag:'Premium'},
  {name:'Craste Eco-Packaging',use:'Moulded fibre',price:3200,ceiling:14.5,tag:'High demand'},
  {name:'Takachar Mobile Pyrolysis',use:'Biochar',price:2650,ceiling:22,tag:'Local'},
  {name:'Malwa Dairy Cooperative',use:'Treated fodder',price:2400,ceiling:18,tag:'Regional'},
  {name:'Verbio CBG India Plant',use:'CBG feedstock',price:1850,ceiling:20,tag:'Volume'}
];
export const steps=[['BOOKED','Clearance request confirmed'],['MACHINE ASSIGNED','A baler is allocated to your field'],['ON THE WAY','Operator is travelling to the field'],['FIELD CLEARED','Residue baled and lot recorded'],['VERIFICATION','Non-burn evidence is checked'],['PAYMENT','Payout is released']];
export const money=n=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);
