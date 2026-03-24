export const VAT_RATE = 0.23;

export type MaterialType = 'standard' | 'premium' | 'exclusive';
export type FinishType = 'oiled' | 'brushed_oiled' | 'uv_matte';

export interface MaterialOption {
  id: MaterialType;
  label: string;
  basePricePerM2: number;
  description: string;
}

export interface FinishOption {
  id: FinishType;
  label: string;
  surchargePerM2: number;
}

export interface PricingConfig {
  edgeBandingPerM2: number;
  cuttingPerM2: number;
  materials: MaterialOption[];
  finishes: FinishOption[];
}

export interface FrontItemInput {
  id: string;
  material: MaterialType;
  finish: FinishType;
  widthMm: number;
  heightMm: number;
  quantity: number;
  edgeBanding: boolean;
}

export interface CalculatedFront {
  id: string;
  areaM2: number;
  runningMeters: number;
  unitPricePerM2Net: number;
  unitFrontNet: number;
  lineTotalNet: number;
  lineTotalGross: number;
}

export const defaultPricingConfig: PricingConfig = {
  edgeBandingPerM2: 118,
  cuttingPerM2: 59,
  materials: [
    {
      id: 'standard',
      label: 'Iglaste (sosna z odzysku)',
      basePricePerM2: 599,
      description: 'Fronty ze starej sosny iglastej, naturalny rustykalny charakter.'
    },
    {
      id: 'premium',
      label: 'Olchowe (olcha z odzysku)',
      basePricePerM2: 699,
      description: 'Fronty z olchy z odzysku, ciepły odcień i delikatna struktura.'
    }
  ],
  finishes: [
    {
      id: 'oiled',
      label: 'Olejowanie (w cenie)',
      surchargePerM2: 0
    },
    {
      id: 'brushed_oiled',
      label: 'Szczotkowanie + olejowanie',
      surchargePerM2: 50
    },
    {
      id: 'uv_matte',
      label: 'Lakier UV mat',
      surchargePerM2: 120
    }
  ]
};

export const mmToMeters = (valueMm: number) => valueMm / 1000;

export const calculateAreaM2 = (widthMm: number, heightMm: number) =>
  (widthMm * heightMm) / 1_000_000;

export const calculateRunningMeters = (widthMm: number, heightMm: number) =>
  2 * (mmToMeters(widthMm) + mmToMeters(heightMm));

const findMaterial = (material: MaterialType, config: PricingConfig) =>
  config.materials.find((item) => item.id === material);

const findFinish = (finish: FinishType, config: PricingConfig) =>
  config.finishes.find((item) => item.id === finish);

export const calculateFront = (
  input: FrontItemInput,
  config: PricingConfig = defaultPricingConfig
): CalculatedFront => {
  const material = findMaterial(input.material, config);
  const finish = findFinish(input.finish, config);

  if (!material || !finish) {
    throw new Error('Nieprawidłowa konfiguracja materiału lub wykończenia.');
  }

  const areaM2 = calculateAreaM2(input.widthMm, input.heightMm);
  const runningMeters = calculateRunningMeters(input.widthMm, input.heightMm);

  const unitPricePerM2Net =
    material.basePricePerM2 +
    config.cuttingPerM2 +
    finish.surchargePerM2 +
    (input.edgeBanding ? config.edgeBandingPerM2 : 0);

  const unitFrontNet = areaM2 * unitPricePerM2Net;
  const lineTotalNet = unitFrontNet * input.quantity;
  const lineTotalGross = lineTotalNet * (1 + VAT_RATE);

  return {
    id: input.id,
    areaM2,
    runningMeters,
    unitPricePerM2Net,
    unitFrontNet,
    lineTotalNet,
    lineTotalGross
  };
};

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    maximumFractionDigits: 2
  }).format(value);

export const formatNumber = (value: number, digits = 2) =>
  new Intl.NumberFormat('pl-PL', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(value);
