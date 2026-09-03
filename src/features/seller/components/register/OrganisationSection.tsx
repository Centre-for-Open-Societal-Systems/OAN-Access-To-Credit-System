import { FormCard } from './FormCard';
import { InputField } from './InputField';

export interface OrganisationFields {
  bank_name: string;
  brand_name: string;
  entity_type: string;
  bank_code: string;
}

interface OrganisationSectionProps {
  fields: OrganisationFields;
  onChange: (fields: Partial<OrganisationFields>) => void;
  errors?: Record<string, string>;
}

export function OrganisationSection({ fields, onChange, errors = {} }: OrganisationSectionProps) {
  return (
    <FormCard title="Organisation" bodyClassName="space-y-5">
      <InputField
        label="Legal entity name"
        required
        placeholder="Enter Legal entity name"
        value={fields.bank_name}
        onChange={(e) => onChange({ bank_name: e.target.value })}
        error={errors.bank_name}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <InputField
          label="Brand / display name"
          placeholder="Enter if different from legal name"
          hint="If different from legal name"
          value={fields.brand_name}
          onChange={(e) => onChange({ brand_name: e.target.value })}
          error={errors.brand_name}
        />
        <InputField
          label="Entity type"
          required
          placeholder="Enter Entity type"
          value={fields.entity_type}
          onChange={(e) => onChange({ entity_type: e.target.value })}
          error={errors.entity_type}
        />
        <InputField
          label="Tax registration number"
          required
          placeholder="Enter Tax registration number"
          hint="Tax Identification number (9-10 characters)"
          maxLength={10}
          value={fields.bank_code}
          onChange={(e) => onChange({ bank_code: e.target.value })}
          error={errors.bank_code}
        />
      </div>
    </FormCard>
  );
}
