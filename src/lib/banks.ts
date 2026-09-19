export interface BankOption {
  name: string;
  code: string;
  swift_code: string;
  country: string;
}

export const SUPPORTED_BANKS: BankOption[] = [
  // Malaysia Major Commercial & Islamic Banks
  { name: 'Maybank', code: 'MBB', swift_code: 'MBBEMYKL', country: 'MY' },
  { name: 'CIMB Bank', code: 'CIMB', swift_code: 'CIBBMYKL', country: 'MY' },
  { name: 'Public Bank', code: 'PBB', swift_code: 'PBBEMYKL', country: 'MY' },
  { name: 'RHB Bank', code: 'RHB', swift_code: 'RHBBMYKL', country: 'MY' },
  { name: 'Hong Leong Bank', code: 'HLB', swift_code: 'HLBBMYKL', country: 'MY' },
  { name: 'AmBank', code: 'AMB', swift_code: 'ARBBMYKL', country: 'MY' },
  { name: 'UOB Bank', code: 'UOB', swift_code: 'UOVBMYKL', country: 'MY' },
  { name: 'Bank Rakyat', code: 'BKR', swift_code: 'BKRMMSKL', country: 'MY' },
  { name: 'OCBC Bank', code: 'OCBC', swift_code: 'OCBCMYKL', country: 'MY' },
  { name: 'HSBC Bank', code: 'HSBC', swift_code: 'HBMBMYKL', country: 'MY' },
  { name: 'Bank Islam', code: 'BIMB', swift_code: 'BIMBMYKL', country: 'MY' },
  { name: 'Affin Bank', code: 'AFFIN', swift_code: 'ABBMMYKL', country: 'MY' },
  { name: 'Alliance Bank', code: 'ALLIANCE', swift_code: 'MACBMYKL', country: 'MY' },
  { name: 'Standard Chartered', code: 'SCB', swift_code: 'SCBLMYKX', country: 'MY' },
  { name: 'MBSB Bank', code: 'MBSB', swift_code: 'MBSBMYKL', country: 'MY' },
  { name: 'Citibank', code: 'CITI', swift_code: 'CITIMYKL', country: 'MY' },
  { name: 'Bank Muamalat', code: 'BMMB', swift_code: 'BMMBMYKL', country: 'MY' },
  { name: 'Agrobank', code: 'AGRO', swift_code: 'AGROMYKL', country: 'MY' },
  { name: 'Al Rajhi Bank', code: 'RAJHI', swift_code: 'RJHIMYKL', country: 'MY' },
  { name: 'Bank Simpanan Nasional (BSN)', code: 'BSN', swift_code: 'BSNAMYKL', country: 'MY' },
  { name: 'Kuwait Finance House', code: 'KFH', swift_code: 'KFHBMYKL', country: 'MY' },

  // Singapore & Regional
  { name: 'DBS Bank (Singapore)', code: 'DBS', swift_code: 'DBSSSGSG', country: 'SG' },
  { name: 'OCBC Bank (Singapore)', code: 'OCBC_SG', swift_code: 'OCBCSGSG', country: 'SG' },
  { name: 'UOB Bank (Singapore)', code: 'UOB_SG', swift_code: 'UOVBSGSG', country: 'SG' },
  { name: 'POSB Bank (Singapore)', code: 'POSB', swift_code: 'DBSSSGSG', country: 'SG' },

  // Indonesia
  { name: 'Bank Central Asia (BCA)', code: 'BCA', swift_code: 'CENAIDJA', country: 'ID' },
  { name: 'Bank Mandiri', code: 'MANDIRI', swift_code: 'BMRIIDJA', country: 'ID' },
  { name: 'Bank Rakyat Indonesia (BRI)', code: 'BRI', swift_code: 'BRINIDJA', country: 'ID' },
  { name: 'Bank Negara Indonesia (BNI)', code: 'BNI', swift_code: 'BNINIDJA', country: 'ID' },

  // Thailand
  { name: 'Bangkok Bank', code: 'BBL', swift_code: 'BKKBTHTH', country: 'TH' },
  { name: 'Kasikornbank', code: 'KBANK', swift_code: 'KASITHBK', country: 'TH' },
  { name: 'Siam Commercial Bank (SCB)', code: 'SCB_TH', swift_code: 'SICOTHBK', country: 'TH' },
  { name: 'Krungthai Bank', code: 'KTB', swift_code: 'KRBATHBK', country: 'TH' },
];

/**
 * Finds a bank option by exact or partial name matching.
 */
export function findBankByName(name: string): BankOption | undefined {
  if (!name) return undefined;
  const clean = name.trim().toLowerCase();
  return SUPPORTED_BANKS.find(
    (b) => b.name.toLowerCase() === clean || b.code.toLowerCase() === clean || clean.includes(b.name.toLowerCase())
  );
}

/**
 * Finds a bank option by SWIFT code.
 */
export function findBankBySwift(swiftCode: string): BankOption | undefined {
  if (!swiftCode) return undefined;
  const clean = swiftCode.trim().toUpperCase();
  return SUPPORTED_BANKS.find((b) => b.swift_code.toUpperCase() === clean);
}
