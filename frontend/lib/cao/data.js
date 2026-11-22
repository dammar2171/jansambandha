export const proposals = [
 {id:'PRJ-2083-014',title:'Ward 4 Drinking Water Supply',ward:'Ward 4',category:'Water supply',budget:4500000,score:91,status:'Awaiting CAO',submitted:'18 Nov 2026',demand:128,affected:6200,assembly:'MEA-2083-045',meeting:'20 Oct 2026',conditions:'Complete within 8 months',department:'Water Supply Department',review:'Technically feasible',reviewer:'Er. Suman Joshi',priority:'High'},
 {id:'PRJ-2083-011',title:'Ward 2 Road Improvement',ward:'Ward 2',category:'Roads',budget:3200000,score:78,status:'Awaiting CAO',submitted:'16 Nov 2026',demand:86,affected:4100,assembly:'MEA-2083-041',meeting:'20 Oct 2026',conditions:'Drainage must be included',department:'Infrastructure Department',review:'Feasibility confirmed',reviewer:'Er. Nisha Bista',priority:'High'},
 {id:'PRJ-2083-009',title:'Community Park Renovation',ward:'Ward 7',category:'Public space',budget:1800000,score:62,status:'Returned',submitted:'12 Nov 2026',demand:34,affected:1900,assembly:'Pending',meeting:'—',conditions:'—',department:'Urban Development',review:'Revise cost estimate',reviewer:'Er. Nisha Bista',priority:'Medium'},
];
export const projects = [
 {id:'PRJ-2083-014',title:'Ward 4 Drinking Water Supply',ward:'Ward 4',department:'Water Supply Department',contractor:'Kailash Construction',status:'Ongoing',budget:4500000,approved:4500000,contracted:4200000,spent:1890000,reported:75,verified:58,quality:'Needs improvement',due:'15 Jun 2027'},
 {id:'PRJ-2083-011',title:'Ward 2 Road Improvement',ward:'Ward 2',department:'Infrastructure Department',contractor:'Seti Builders',status:'Ongoing',budget:3200000,approved:3200000,contracted:3050000,spent:1220000,reported:48,verified:45,quality:'Good',due:'30 May 2027'},
 {id:'PRJ-2083-009',title:'Community Park Renovation',ward:'Ward 7',department:'Urban Development',contractor:'Unassigned',status:'Planning',budget:1800000,approved:0,contracted:0,spent:0,reported:0,verified:0,quality:'Not inspected',due:'—'},
 {id:'PRJ-2083-006',title:'Ward 1 Health Post Upgrade',ward:'Ward 1',department:'Health Department',contractor:'Mahakali Infra',status:'Completed',budget:2700000,approved:2700000,contracted:2580000,spent:2510000,reported:100,verified:100,quality:'Good',due:'28 Oct 2026'},
];
export const users = [
 {name:'Kamala Rawal',email:'cao@kailali.gov.np',role:'CAO',scope:'Municipality',status:'Active',last:'Today, 09:42'},
 {name:'Ramesh Bhatta',email:'admin@kailali.gov.np',role:'General Admin',scope:'Municipality',status:'Active',last:'Today, 08:16'},
 {name:'Dhan Bahadur',email:'ward4@kailali.gov.np',role:'Ward Chair',scope:'Ward 4',status:'Active',last:'Yesterday'},
 {name:'Suman Joshi',email:'suman@kailali.gov.np',role:'Department',scope:'Water Supply',status:'Active',last:'Today, 10:02'},
 {name:'Kailash Construction',email:'office@kailash.com',role:'Contractor',scope:'Assigned projects',status:'Suspended',last:'12 Nov 2026'},
 {name:'Ram Sharma',email:'ram@email.com',role:'Citizen',scope:'Ward 4',status:'Active',last:'Today, 07:54'},
];
export const departments = [
 {name:'Water Supply Department',head:'Er. Suman Joshi',staff:8,projects:4,inspections:12,open:2},
 {name:'Infrastructure Department',head:'Er. Nisha Bista',staff:11,projects:6,inspections:18,open:1},
 {name:'Health Department',head:'Dr. Mina Rawal',staff:6,projects:2,inspections:5,open:0},
 {name:'Urban Development',head:'Er. Prakash Chand',staff:5,projects:3,inspections:4,open:1},
];
export const audit = [
 ['22 Nov 2026, 10:14','Kamala Rawal','Project approval','PRJ-2083-014','Approved administrative stage'],
 ['22 Nov 2026, 09:42','Ramesh Bhatta','User status changed','USR-005','Active → Suspended'],
 ['21 Nov 2026, 16:08','Kamala Rawal','Delegation created','DEL-003','Approval authority · 20–25 Nov'],
 ['21 Nov 2026, 14:32','Er. Suman Joshi','Inspection submitted','PRJ-2083-014','Verified progress: 58%'],
 ['20 Nov 2026, 11:05','Dhan Bahadur','Proposal submitted','PRJ-2083-011','Submitted to CAO'],
];
export const money = n => 'NPR ' + Number(n).toLocaleString('en-IN');
