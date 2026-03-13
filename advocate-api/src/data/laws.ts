export const stateLaws: Record<string, Record<string, string[]>> = {
  CA: {
    deposit: [
      'California Civil Code § 1950.5: Landlord must return deposit within 21 days',
      'Maximum deposit is 2 months rent (unfurnished) or 3 months (furnished)',
      'Itemized written statement required for any deductions',
      'Landlord forfeits right to deductions if itemization not sent on time',
    ],
    charges: [
      'California Business and Professions Code § 17200: Unfair business practices',
      'California Automatic Renewal Law (BPC § 17600): Must provide clear cancellation method',
      'CFPB Regulation E: Unauthorized electronic fund transfers must be disputed within 60 days',
    ],
    travel: [
      'DOT Rule: Airlines must refund cash (not vouchers) for cancelled flights',
      'California Passenger Rights apply to trips originating in CA',
    ],
    invoice: [
      'California Civil Code § 3289: 10% prejudgment interest on unpaid invoices',
      'Small claims court: up to $12,500 (individuals)',
    ],
    product: [
      'California Song-Beverly Consumer Warranty Act: Strong lemon law protections',
      'California Civil Code § 1792: Implied warranty of merchantability on all products',
    ],
  },
  TX: {
    deposit: [
      'Texas Property Code § 92.103: Landlord must return deposit within 30 days',
      'Written itemized list required for any deductions',
      'Texas Property Code § 92.109: Landlord liable for 3x deposit amount + $100 + attorney fees if wrongfully withheld',
    ],
    charges: [
      'Texas Business and Commerce Code § 17.46: Deceptive trade practices',
      'CFPB Regulation E applies federally for electronic transfers',
    ],
    travel: [
      'DOT Rule: Airlines must refund cash for cancelled flights',
      'DOT 24-hour cancellation policy: Full refund if booked 7+ days before departure',
    ],
    invoice: [
      'Texas Finance Code § 302.002: 6% annual interest on unpaid invoices',
      'Small claims court: up to $20,000',
    ],
    product: [
      'Texas Deceptive Trade Practices-Consumer Protection Act (DTPA)',
      'Texas lemon law applies to new vehicles under warranty',
    ],
  },
  NY: {
    deposit: [
      'New York GOL § 7-108: Return within 14 days (NYC) or 30 days (rest of NY)',
      'Maximum deposit is 1 month rent in NYC',
      'Interest required on deposits held over 1 year',
      'Landlord must provide itemized statement of deductions',
    ],
    charges: [
      'New York General Business Law § 349: Deceptive acts and practices — statutory damages $50 minimum',
      'NY Automatic Renewal Law: Requires clear notice before renewal',
      'CFPB Regulation E applies federally',
    ],
    travel: [
      'DOT Rule: Airlines must refund cash for cancelled or significantly delayed flights',
      'NYC Consumer Protection Law provides additional protections',
    ],
    invoice: [
      'New York CPLR § 5004: 9% annual interest on unpaid judgments',
      'Small claims court: up to $10,000 (NYC) or $5,000 (other courts)',
    ],
    product: [
      'New York UCC Article 2: Implied warranty of merchantability',
      'New York lemon law: New vehicles with substantial defects within 18,000 miles or 2 years',
    ],
  },
  FL: {
    deposit: [
      'Florida Statute § 83.49: Landlord must return deposit within 15 days if no objections, 30 days if claiming deductions',
      'Must send written notice of claims within 30 days or forfeits deductions',
    ],
    charges: [
      'Florida Deceptive and Unfair Trade Practices Act (FDUTPA): Actual damages + attorney fees',
      'CFPB Regulation E applies federally',
    ],
    travel: [
      'DOT Rule: Airlines must refund cash for cancelled flights',
      'Florida Consumer Protection laws apply to travel packages',
    ],
    invoice: [
      'Florida Statute § 55.03: Judgment interest rate set annually by CFO',
      'Small claims court: up to $8,000',
    ],
    product: [
      'Florida Lemon Law: New vehicles with 3 or more repair attempts for same defect',
      'Florida UCC Article 2: Implied warranties apply to consumer purchases',
    ],
  },
  IL: {
    deposit: [
      'Chicago RLTO: Landlord must return deposit within 30 days',
      'Chicago landlords must pay interest on deposits held over 6 months',
      'Violation allows tenant to sue for 2x deposit + attorney fees',
    ],
    charges: [
      'Illinois Consumer Fraud and Deceptive Business Practices Act',
      'CFPB Regulation E applies federally',
    ],
    invoice: ['Small claims court: up to $10,000'],
    travel: ['DOT Rule: Airlines must refund cash for cancelled flights'],
    product: ['Illinois UCC Article 2 implied warranties', 'Illinois New Vehicle Buyer Protection Act'],
  },
  WA: {
    deposit: [
      'Washington RCW 59.18.280: Landlord must return deposit within 30 days',
      'Itemized statement required with receipts for deductions over $10',
      'Tenant entitled to 2x damages if deposit wrongfully withheld',
    ],
    charges: [
      'Washington Consumer Protection Act (CPA): Treble damages for willful violations',
      'CFPB Regulation E applies federally',
    ],
    invoice: ['Small claims court: up to $10,000'],
    travel: ['DOT Rule: Airlines must refund cash for cancelled flights'],
    product: ['Washington Product Liability Act', 'Washington lemon law protections'],
  },
  FEDERAL: {
    deposit: [
      'Federal law does not directly regulate residential security deposits — state law applies',
      'CFPB complaint available at consumerfinance.gov/complaint for federally regulated banks',
      'If landlord is a corporation, FTC may have jurisdiction over deceptive practices',
    ],
    charges: [
      'CFPB Regulation E (Electronic Fund Transfer Act): Unauthorized electronic transfers must be reported within 60 days',
      'Fair Credit Billing Act (FCBA): Credit card disputes must be filed within 60 days of statement',
      'FTC Act Section 5: Prohibits unfair or deceptive acts in commerce',
      'Restore Online Shoppers Confidence Act (ROSCA): Prohibits negative option marketing tricks',
    ],
    travel: [
      'DOT Rule (14 CFR Part 259.7): Airlines must provide full refund for cancelled flights — no vouchers required',
      'DOT 24-hour risk-free cancellation: Full refund if cancelled within 24 hours of booking (7+ days before departure)',
      'EU Regulation EC 261/2004: Applies to flights departing from EU airports',
      'DOT requires compensation for involuntary bumping from oversold flights',
    ],
    invoice: [
      'Uniform Commercial Code (UCC) Article 2: Governs commercial sales contracts',
      'Small claims court available in all states: Amounts vary $2,500-$25,000 by state',
      'Freelance isn\'t Free Act (NY, IL, others): Written contracts required for work over $250',
    ],
    product: [
      'Magnuson-Moss Warranty Act: Governs written warranties on consumer products sold in the US',
      'FTC Mail Order Rule: Right to full refund if product not shipped within promised time',
      'Consumer Product Safety Act: CPSC handles dangerous/defective products',
    ],
  },
}

export function getLawsForCase(state: string, category: string): string[] {
  const stateLawSet = stateLaws[state] || {}
  const federalSet = stateLaws['FEDERAL'] || {}
  const categoryLaws = stateLawSet[category] || []
  const federalLaws = federalSet[category] || []
  // State laws first, then federal laws
  return [...categoryLaws, ...federalLaws]
}

// ── India law database ──────────────────────────────────────────────────────

export const indiaLaws: Record<string, string[]> = {
  ecommerce: [
    'Consumer Protection Act 2019, Section 2(34): E-commerce entity liable for deficiency of service',
    'Consumer Protection (E-Commerce) Rules 2020: Refund mandatory within 7 days of return pickup',
    'Consumer Protection Act 2019, Section 35: File complaint at District Consumer Commission (free to file, no lawyer needed)',
    'IT Act 2000, Section 43A: Compensation for negligence causing wrongful loss to consumer data',
  ],
  banking: [
    'RBI Banking Ombudsman Scheme 2021: Free, binding resolution within 30 days, up to ₹20 lakh compensation',
    'RBI Circular 2017 (DBR.No.Leg.BC.78): Zero customer liability for unauthorized transactions reported within 3 days',
    'Payment and Settlement Systems Act 2007: Bank liable for UPI/NEFT fraud if customer not negligent',
    'Credit Information Companies Regulation Act 2005: Bank must correct credit report errors within 30 days',
  ],
  realestate: [
    'RERA Act 2016, Section 18: Builder must refund entire amount + interest (SBI MCLR + 2%) for project delays',
    'RERA Act 2016, Section 31: Complaint at State RERA Authority — file online, no lawyer required',
    'RERA Act 2016, Section 40: Penalty up to 10% of project cost for violations',
    'Consumer Protection Act 2019: Consumer Forum jurisdiction available alongside RERA for builder disputes',
  ],
  telecom: [
    'TRAI Act 1997: File complaint at consumercomplaints.trai.gov.in',
    'Telecom Consumer Protection Regulations 2012: Billing disputes must be resolved within 30 days',
    'TRAI Quality of Service Regulations 2017: Service failure entitles proportional refund of charges',
    'Consumer Protection Act 2019: Consumer Forum jurisdiction for all telecom disputes',
  ],
  insurance: [
    'Insurance Ombudsman Rules 2017: Free, binding resolution within 90 days (claims up to ₹30 lakh)',
    'IRDAI (Protection of Policyholders Interests) Regulations 2017: Claim decision mandatory within 30 days',
    'Consumer Protection Act 2019: Consumer Forum for compensation beyond claim amount + mental agony',
    'IRDAI Circular 2015/436: Insurer cannot reject claim for pre-existing disease not declared at inception',
  ],
  employer: [
    'Payment of Wages Act 1936: Wages must be paid by 7th of following month (10th if over 1000 employees)',
    'Employees Provident Funds Act 1952: EPF must be deposited within 15 days — file complaint at epfindia.gov.in',
    'Industrial Disputes Act 1947, Section 25F: Wrongful termination without notice — file at Labour Commissioner',
    'Maternity Benefit Act 1961: 26 weeks mandatory maternity leave — employer cannot deny or terminate',
  ],
  government: [
    'Right to Information Act 2005, Section 6: File RTI online at rtionline.gov.in (fee: ₹10)',
    'RTI Act 2005, Section 7: Response mandatory within 30 days (48 hours for matters affecting life or liberty)',
    'RTI Act 2005, Section 19: First appeal to senior officer if no reply within 30 days — free',
    'RTI Act 2005, Section 18: Second appeal to Central/State Information Commission — free, binding',
  ],
  consumer: [
    'Consumer Protection Act 2019, Section 35: District Consumer Commission — disputes up to ₹1 crore (free to file)',
    'Consumer Protection Act 2019, Section 47: State Commission — ₹1 crore to ₹10 crore',
    'Consumer Protection Act 2019, Section 57: National Commission — above ₹10 crore',
    'Limitation period: 2 years from date of cause of action to file complaint',
    'Standard compensation: Refund + interest + ₹10,000–₹50,000 for mental agony (Consumer Forum awards)',
  ],
  general: [
    'Consumer Protection Act 2019: Covers all goods and services — District Consumer Forum is free to file',
    'RBI Banking Ombudsman Scheme 2021: All bank and UPI disputes — free, resolves in 30 days',
    'RERA Act 2016: All registered real estate projects — builder delays entitle full refund + interest',
    'RTI Act 2005: Any government information available — file online at rtionline.gov.in for ₹10',
  ],
}

/**
 * Get laws for a given country and category.
 * For US, delegates to the existing state-based getLawsForCase.
 * For India, returns from indiaLaws.
 */
export function getLawsForCountry(country: string, category: string): string[] {
  if (country === 'IN') {
    return indiaLaws[category] || indiaLaws['general'] || []
  }
  // For US (and default): return federal laws for the category
  return stateLaws['FEDERAL'][category] || []
}
