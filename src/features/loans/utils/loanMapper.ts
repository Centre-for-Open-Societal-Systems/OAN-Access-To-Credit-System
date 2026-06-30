export interface RawLoanRow {
  loan_type?: string;
  type?: string;
  purpose_of_loan?: string;
  requested_loan_amount?: string | number;
  requested_amount?: string | number;
  amount?: string | number;
  loan_duration_months?: string | number;
  loan_duration?: string | number;
  nearest_branch_responsible_for_loan_administration?: string;
  nearest_branch?: string;
  primary_crop?: string;
  crop_variety?: string;
  crop_address?: string;
  quantity_requested?: string | number;
  unit_price?: string | number;
  total_seed_cost?: string | number;
  land_size?: string | number;
  expected_yield?: string | number;
  expected_harvest_date?: string;
  fertilizer_used?: string;
  other_farming_activities?: string;
  farmer_group?: string;
  animal_reared?: string;
  farm_equipment?: string;
  farm_size_hectares?: string | number;
  region?: string;
  zone?: string;
  woreda?: string;
  kebele?: string;
  harvest_aggregator_type?: string;
  cooperative_name?: string;
  dap_quantity?: string | number;
  urea_quantity?: string | number;
  fertilizer_unit_price?: string | number;
  total_fertilizer_cost?: string | number;
  agrochemical_type?: string;
  crop_protection_quantity?: string | number;
  crop_protection_unit_price?: string | number;
  total_crop_protection_cost?: string | number;
  selected_input_supplier?: string;
  male_farmer_contribution?: string | number;
  female_farmer_contribution?: string | number;
  crop_insurance_premium?: string | number;
  bank_account_name?: string;
  bank_account_number?: string;
  bank_name?: string;
  bank_swift_code?: string;
  mobile_account_name?: string;
  mobile_payments_number?: string;
  total_amount_borrowing?: string | number;
  tax_id?: string;
  full_name?: string;
  last_name?: string;
  mobile_phone?: string;
  date_of_birth?: string;
  gender?: string;
  id_type?: string;
  id_number?: string;
  language?: string;
  land_size_acres?: string | number;
  farm_id?: string;
  farm_polygon?: string;
  land_acreage?: string | number;
  farm_land_number?: string;
  marital_status?: string;
  size_of_family?: string | number;
  number_of_children?: string | number;
  no_of_females_family?: string | number;
  no_of_males_family?: string | number;
  family_member_owns_land?: string;
  source_of_income?: string;
  education_level?: string;
  total_farmland_landowner?: string | number;
  total_farmland_crop_sharing?: string | number;
  total_farmland_rented?: string | number;
  certification_id?: string;
  certification_photo?: string;
  farmland_size_hectares?: string | number;
  land_ownership_status?: string;
  soil_fertility?: string;
  moisture_levels?: string;
  [key: string]: unknown;
}

export function mapLoanRowToFormFields(row: RawLoanRow): Record<string, unknown> {
  const formFields: Record<string, unknown> = {
    // Step 1: Loan Details
    loanType: row.loan_type || row.type || '',
    loanPurpose: row.purpose_of_loan || '',
    requestedAmount: row.requested_loan_amount || row.requested_amount || row.amount || '',
    loanDuration: row.loan_duration_months || row.loan_duration || '',
    nearestBranch: row.nearest_branch_responsible_for_loan_administration || row.nearest_branch || '',
    primaryCrops: row.primary_crop ? [row.primary_crop] : [],
    cropVariety: row.crop_variety || '',
    cropAddress: row.crop_address || '',
    quantityRequested: row.quantity_requested || '',
    unitPrice: row.unit_price || '',
    totalSeedCost: row.total_seed_cost || '',
    landSize: row.land_size || '',
    expectedYield: row.expected_yield || '',
    expectedHarvestDate: row.expected_harvest_date || '',
    fertilizerUsed: row.fertilizer_used || '',
    otherFarmingActivities: row.other_farming_activities || '',
    farmerGroup: row.farmer_group || '',
    animalReared: row.animal_reared || '',
    farmEquipment: row.farm_equipment || '',
    farmSizeHectares: row.farm_size_hectares || '',
    region: row.region || '',
    zone: row.zone || '',
    woreda: row.woreda || '',
    kebele: row.kebele || '',
    harvestAggregatorType: row.harvest_aggregator_type || '',
    cooperativeName: row.cooperative_name || '',
    dapQuantity: row.dap_quantity || '',
    ureaQuantity: row.urea_quantity || '',
    fertilizerUnitPrice: row.fertilizer_unit_price || '',
    totalFertilizerCost: row.total_fertilizer_cost || '',
    agrochemicalType: row.agrochemical_type || '',
    cropProtectionQuantity: row.crop_protection_quantity || '',
    cropProtectionUnitPrice: row.crop_protection_unit_price || '',
    totalCropProtectionCost: row.total_crop_protection_cost || '',
    selectedInputSupplier: row.selected_input_supplier || '',
    maleFarmerContribution: row.male_farmer_contribution || '',
    femaleFarmerContribution: row.female_farmer_contribution || '',
    cropInsurancePremium: row.crop_insurance_premium || '',

    // Step 2: Bank Details
    bankAccountName: row.bank_account_name || '',
    bankAccount: row.bank_account_number || '',
    bankName: row.bank_name || '',
    bankSwiftCode: row.bank_swift_code || '',
    mobileAccountName: row.mobile_account_name || '',
    mobilePaymentsNumber: row.mobile_payments_number || '',
    totalBorrowingAmount: row.total_amount_borrowing || '',
    taxId: row.tax_id || '',

    // Step 5: Farmer Details
    fullName: row.full_name || '',
    lastName: row.last_name || '',
    mobilePhone: row.mobile_phone || '',
    dateOfBirth: row.date_of_birth || '',
    gender: row.gender || '',
    idType: row.id_type || '',
    idNumber: row.id_number || '',
    language: row.language || '',
    landSizeAcres: row.land_size_acres || '',
    farmId: row.farm_id || '',
    farmPolygon: row.farm_polygon || '',
    landAcreage: row.land_acreage || '',
    farmLandNumber: row.farm_land_number || '',
    maritalStatus: row.marital_status || '',
    sizeOfFamily: row.size_of_family || '',
    numberOfChildren: row.number_of_children || '',
    noOfFemalesFamily: row.no_of_females_family || '',
    noOfMalesFamily: row.no_of_males_family || '',
    familyMemberOwnsLand: row.family_member_owns_land || '',
    sourceOfIncome: row.source_of_income || '',
    educationLevel: row.education_level || '',
    totalFarmlandLandowner: row.total_farmland_landowner || '',
    totalFarmlandCropSharing: row.total_farmland_crop_sharing || '',
    totalFarmlandRented: row.total_farmland_rented || '',
    certificationId: row.certification_id || '',
    certificationPhoto: row.certification_photo || '',
    farmlandSizeHectares: row.farmland_size_hectares || '',
    landOwnershipStatus: row.land_ownership_status || '',
    soilFertility: row.soil_fertility || '',
    moistureLevels: row.moisture_levels || '',
  };

  Object.entries(row).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      formFields[key] = val;
    }
  });

  return formFields;
}
