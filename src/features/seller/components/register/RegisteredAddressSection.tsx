import { POSTAL_CODE_MAX_LENGTH } from '@/features/seller/constants/field-limits';
import { LocationSelects } from '@/components/ui/LocationSelects';
import { FormCard } from './FormCard';
import { InputField } from './InputField';

export interface RegisteredAddressFields {
  registered_street: string;
  registered_kebele_village: string;
  registered_woreda_district: string;
  registered_zone: string;
  registered_region: string;
  registered_country: string;
  registered_postal_code: string;
  website: string;
}

interface RegisteredAddressSectionProps {
  fields: RegisteredAddressFields;
  onChange: (fields: Partial<RegisteredAddressFields>) => void;
  errors?: Record<string, string>;
}

export function RegisteredAddressSection({ fields, onChange, errors = {} }: RegisteredAddressSectionProps) {
  return (
    <FormCard title="Registered Address" bodyClassName="space-y-5">
      <InputField
        label="Street address"
        required
        placeholder="Enter Street address"
        value={fields.registered_street}
        onChange={(e) => onChange({ registered_street: e.target.value })}
        error={errors.registered_street}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <LocationSelects
          value={{
            region: fields.registered_region,
            zone: fields.registered_zone,
            woreda: fields.registered_woreda_district,
            kebele: fields.registered_kebele_village,
          }}
          onChange={(next) =>
            onChange({
              ...(next.region !== undefined && { registered_region: next.region }),
              ...(next.zone !== undefined && { registered_zone: next.zone }),
              ...(next.woreda !== undefined && { registered_woreda_district: next.woreda }),
              ...(next.kebele !== undefined && { registered_kebele_village: next.kebele }),
            })
          }
          labels={{ woreda: 'Woreda / District', kebele: 'Kebele / Village' }}
          required={{ region: true, zone: true }}
          errors={{ region: errors.registered_region, zone: errors.registered_zone }}
        />
        <InputField
          label="Country"
          required
          placeholder="Enter Country"
          value={fields.registered_country}
          onChange={(e) => onChange({ registered_country: e.target.value })}
          error={errors.registered_country}
        />
        <InputField
          label="Postal code"
          required
          placeholder="Enter Postal code"
          maxLength={POSTAL_CODE_MAX_LENGTH}
          value={fields.registered_postal_code}
          onChange={(e) => onChange({ registered_postal_code: e.target.value })}
          error={errors.registered_postal_code}
        />
        <InputField
          label="Website"
          type="text"
          placeholder="Enter Website"
          hint="Your website - used as your network address - can be added later"
          value={fields.website}
          onChange={(e) => onChange({ website: e.target.value })}
          error={errors.website}
        />
      </div>
    </FormCard>
  );
}
