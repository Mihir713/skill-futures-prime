import type { Contract } from "@/components/ContractCard";

const seed = (n: number) => {
  let x = n;
  return () => { x = (x * 9301 + 49297) % 233280; return x / 233280; };
};

export function makeSeries(start: number, len = 28, vol = 0.05, drift = 0.002, s = 1): number[] {
  const r = seed(s);
  const out: number[] = [start];
  for (let i = 1; i < len; i++) {
    const v = out[i - 1] * (1 + drift + (r() - 0.5) * vol);
    out.push(Math.max(0.01, Math.min(0.99, v)));
  }
  return out;
}

export const featuredContracts: Contract[] = [
  {
    symbol: "RFE-2028",
    title: "RF Engineering — $75k+ by 2028",
    strike: "$75,000 base salary",
    expiry: "Dec 2028",
    probability: 72,
    price: 0.72,
    volume: "$12,430",
    delta: 4.2,
    series: makeSeries(0.55, 32, 0.04, 0.006, 11),
    category: "Hardware",
  },
  {
    symbol: "MTL-2028",
    title: "MATLAB Systems Engineer — $90k+ by 2028",
    strike: "$90,000 base salary",
    expiry: "Dec 2028",
    probability: 61,
    price: 0.61,
    volume: "$8,910",
    delta: 1.8,
    series: makeSeries(0.50, 32, 0.035, 0.004, 23),
    category: "Systems",
  },
  {
    symbol: "CAD-2028",
    title: "CAD Design — $70k+ by 2028",
    strike: "$70,000 base salary",
    expiry: "Dec 2028",
    probability: 18,
    price: 0.18,
    volume: "$2,140",
    delta: -2.1,
    series: makeSeries(0.28, 32, 0.04, -0.004, 7),
    category: "Mechanical",
  },
];

export const marketBoard: Contract[] = [
  ...featuredContracts,
  {
    symbol: "FPGA-2027",
    title: "FPGA Design — $95k+ by 2027",
    strike: "$95,000 base salary",
    expiry: "Dec 2027",
    probability: 84,
    price: 0.84,
    volume: "$24,118",
    delta: 6.7,
    series: makeSeries(0.62, 32, 0.04, 0.008, 41),
    category: "Hardware",
  },
  {
    symbol: "EMB-2028",
    title: "Embedded Systems — $85k+ by 2028",
    strike: "$85,000 base salary",
    expiry: "Dec 2028",
    probability: 69,
    price: 0.69,
    volume: "$11,205",
    delta: 0.9,
    series: makeSeries(0.62, 32, 0.03, 0.003, 53),
    category: "Software",
  },
  {
    symbol: "AIML-2030",
    title: "AI/ML Engineer — $180k+ by 2030",
    strike: "$180,000 TC",
    expiry: "Dec 2030",
    probability: 91,
    price: 0.91,
    volume: "$58,320",
    delta: 0.4,
    series: makeSeries(0.80, 32, 0.02, 0.003, 67),
    category: "AI",
  },
  {
    symbol: "QNT-2029",
    title: "Quant Developer — $220k+ by 2029",
    strike: "$220,000 TC",
    expiry: "Dec 2029",
    probability: 77,
    price: 0.77,
    volume: "$33,540",
    delta: 3.1,
    series: makeSeries(0.60, 32, 0.04, 0.005, 89),
    category: "Finance",
  },
  {
    symbol: "ROB-2029",
    title: "Robotics Engineer — $110k+ by 2029",
    strike: "$110,000 base salary",
    expiry: "Dec 2029",
    probability: 66,
    price: 0.66,
    volume: "$9,780",
    delta: 2.4,
    series: makeSeries(0.55, 32, 0.035, 0.004, 97),
    category: "Hardware",
  },
  {
    symbol: "DEF-2027",
    title: "Defense Tech — $130k+ by 2027",
    strike: "$130,000 TC",
    expiry: "Dec 2027",
    probability: 81,
    price: 0.81,
    volume: "$18,260",
    delta: 5.2,
    series: makeSeries(0.55, 32, 0.045, 0.007, 103),
    category: "DefTech",
  },
  {
    symbol: "BIO-2028",
    title: "Bioinformatics — $95k+ by 2028",
    strike: "$95,000 base salary",
    expiry: "Dec 2028",
    probability: 42,
    price: 0.42,
    volume: "$4,612",
    delta: -0.6,
    series: makeSeries(0.50, 32, 0.04, -0.002, 109),
    category: "Bio",
  },
];

export const aiFeed = [
  { tag: "MACRO", text: "RF engineering demand increasing 28% YoY due to North-American semiconductor reshoring.", time: "2m" },
  { tag: "REGIONAL", text: "Defense-tech hiring velocity rising across Ontario; 1,200 new reqs posted this week.", time: "9m" },
  { tag: "SECTOR", text: "MATLAB-heavy simulation roles outperforming model expectations by +12σ.", time: "21m" },
  { tag: "WARNING", text: "CAD-related labor demand flattening across Tier-2 OEMs; revise CAD-2028 priors downward.", time: "34m" },
  { tag: "ALPHA", text: "FPGA-2027 contract showing 0.84 confidence; oracle convergence above threshold.", time: "1h" },
  { tag: "POLICY", text: "EU AI Act amendments boosting demand for verification engineers; AIML-2030 +0.4%.", time: "2h" },
];

export type LaborRegion = { code: string; name: string; heat: number; delta: number };
export const laborHeatmap: LaborRegion[] = [
  { code: "SF", name: "Bay Area", heat: 0.94, delta: 3.1 },
  { code: "NYC", name: "New York", heat: 0.78, delta: 1.2 },
  { code: "BOS", name: "Boston", heat: 0.71, delta: 2.4 },
  { code: "AUS", name: "Austin", heat: 0.83, delta: 4.6 },
  { code: "SEA", name: "Seattle", heat: 0.76, delta: 0.8 },
  { code: "TOR", name: "Toronto", heat: 0.69, delta: 5.2 },
  { code: "LDN", name: "London", heat: 0.62, delta: 1.7 },
  { code: "BLN", name: "Berlin", heat: 0.58, delta: -0.4 },
  { code: "BLR", name: "Bangalore", heat: 0.81, delta: 2.9 },
  { code: "SGP", name: "Singapore", heat: 0.66, delta: 1.1 },
  { code: "TLV", name: "Tel Aviv", heat: 0.74, delta: 3.4 },
  { code: "TYO", name: "Tokyo", heat: 0.55, delta: -1.2 },
];

export const portfolioHoldings = [
  { symbol: "RFE-2028", qty: 1200, avg: 0.61, mark: 0.72, exposure: "Hardware" },
  { symbol: "FPGA-2027", qty: 800, avg: 0.70, mark: 0.84, exposure: "Hardware" },
  { symbol: "EMB-2028", qty: 950, avg: 0.65, mark: 0.69, exposure: "Software" },
  { symbol: "MTL-2028", qty: 600, avg: 0.58, mark: 0.61, exposure: "Systems" },
  { symbol: "AIML-2030", qty: 300, avg: 0.78, mark: 0.91, exposure: "AI" },
  { symbol: "CAD-2028", qty: 400, avg: 0.31, mark: 0.18, exposure: "Mechanical" },
];

export const credentials = [
  { name: "University Transcript", issuer: "U. of Waterloo", status: "Verified", hash: "0x9af4…2c11" },
  { name: "GitHub Code Analysis", issuer: "AI Oracle v3.2", status: "Verified", hash: "0x71b2…ee08" },
  { name: "Co-op Employment", issuer: "Nokia Networks", status: "Verified", hash: "0x4c0a…1ff7" },
  { name: "FPGA Certification", issuer: "Xilinx / AMD", status: "Verified", hash: "0xa12c…77b0" },
  { name: "Security Clearance", issuer: "Pending", status: "Pending", hash: "—" },
];

export const settlements = [
  { id: "STL-3041", asset: "INTERN-2024", outcome: "YES", payout: "$1,420.00", date: "2025-08-12" },
  { id: "STL-2987", asset: "GPA-3.7-2025", outcome: "YES", payout: "$640.00", date: "2025-06-04" },
  { id: "STL-2811", asset: "PUBLISH-2024", outcome: "NO", payout: "$0.00", date: "2025-04-22" },
  { id: "STL-2603", asset: "HACKATHON-W23", outcome: "YES", payout: "$210.00", date: "2025-01-09" },
];
