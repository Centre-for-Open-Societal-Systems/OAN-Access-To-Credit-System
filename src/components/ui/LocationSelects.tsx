'use client';

import { SelectField } from '@/components/ui/SelectField';
import { logger } from '@/lib/logger';
import { useEffect, useState } from 'react';
import { getAdministrativeAreas, type AdministrativeArea } from '@/lib/api/administrativeAreas';

export interface LocationValue {
  region: string;
  zone: string;
  woreda: string;
  kebele: string;
}

type Level = keyof LocationValue;

interface LocationSelectsProps {
  value: LocationValue;
  /** Always the full set of fields that changed: picking a level clears the ones below it. */
  onChange: (next: Partial<LocationValue>) => void;
  /** Levels that must be filled in; drives the asterisk only, validation stays with the caller. */
  required?: Partial<Record<Level, boolean>>;
  labels?: Partial<Record<Level, string>>;
  errors?: Partial<Record<Level, string | undefined>>;
}

const LEVELS: Level[] = ['region', 'zone', 'woreda', 'kebele'];
const DEFAULT_LABELS: Record<Level, string> = {
  region: 'Region',
  zone: 'Zone',
  woreda: 'Woreda',
  kebele: 'Kebele',
};

/** The children of `parentId` as the cascade below it needs them; `null` parent means "not chosen yet". */
function useAreas(parentId: string | null | undefined): AdministrativeArea[] {
  const [loaded, setLoaded] = useState<{ parent: string | null | undefined; areas: AdministrativeArea[] }>();

  useEffect(() => {
    // `undefined` is the top level; `null` is a parent that has not been picked.
    if (parentId === null) return;
    let cancelled = false;
    getAdministrativeAreas(parentId)
      .then((areas) => { if (!cancelled) setLoaded({ parent: parentId, areas }); })
      .catch((error) => logger.error('getAdministrativeAreas failed', { error }));
    return () => { cancelled = true; };
  }, [parentId]);

  return loaded && loaded.parent === parentId ? loaded.areas : [];
}

/**
 * Cascading Region > Zone > Woreda > Kebele dropdowns.
 *
 * Values are area names, the same strings the backend already stores, so a saved record
 * reloads into the right options without an id being persisted. Renders four fields as a
 * fragment so each form keeps its own grid.
 */
export function LocationSelects({ value, onChange, required = {}, labels = {}, errors = {} }: LocationSelectsProps) {
  const regions = useAreas(undefined);
  const regionId = regions.find((a) => a.area_name === value.region)?.area_id ?? null;
  const zones = useAreas(regionId);
  const zoneId = zones.find((a) => a.area_name === value.zone)?.area_id ?? null;
  const woredas = useAreas(zoneId);
  const woredaId = woredas.find((a) => a.area_name === value.woreda)?.area_id ?? null;
  const kebeles = useAreas(woredaId);

  const areasByLevel: Record<Level, AdministrativeArea[]> = {
    region: regions,
    zone: zones,
    woreda: woredas,
    kebele: kebeles,
  };
  const parentPicked: Record<Level, boolean> = {
    region: true,
    zone: regionId !== null,
    woreda: zoneId !== null,
    kebele: woredaId !== null,
  };

  const pick = (level: Level) => (name: string) => {
    const cleared: Partial<LocationValue> = {};
    for (const lower of LEVELS.slice(LEVELS.indexOf(level) + 1)) cleared[lower] = '';
    onChange({ ...cleared, [level]: name });
  };

  return (
    <>
      {LEVELS.map((level) => {
        const names = areasByLevel[level].map((a) => a.area_name);
        const current = value[level];
        // A saved value the tree does not know (older free-text entry) stays selectable.
        const options = current && !names.includes(current) ? [...names, current] : names;
        const label = labels[level] ?? DEFAULT_LABELS[level];
        return (
          <SelectField
            key={level}
            label={label}
            placeholder={parentPicked[level] ? `Select ${label}` : `Select ${DEFAULT_LABELS[LEVELS[LEVELS.indexOf(level) - 1] as Level]} first`}
            options={options}
            value={current}
            onChange={pick(level)}
            required={!!required[level]}
            error={errors[level]}
            disabled={!parentPicked[level] && !current}
          />
        );
      })}
    </>
  );
}
