'use client';

import { FormEvent, useMemo, useState } from 'react';
import {
  FrontItemInput,
  calculateFront,
  defaultPricingConfig,
  formatCurrency,
  formatNumber
} from '@/lib/pricing';

const createRow = (): FrontItemInput => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
  material: 'standard',
  finish: 'oiled',
  widthMm: 596,
  heightMm: 716,
  quantity: 1,
  edgeBanding: true
});

interface ContactState {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const initialContact: ContactState = {
  name: '',
  email: '',
  phone: '',
  message: ''
};

export default function CalculatorPage() {
  const [rows, setRows] = useState<FrontItemInput[]>([createRow()]);
  const [showContact, setShowContact] = useState(false);
  const [contact, setContact] = useState<ContactState>(initialContact);
  const [contactStatus, setContactStatus] = useState('');

  const calculatedRows = useMemo(() => rows.map((row) => ({ ...row, calc: calculateFront(row) })), [rows]);

  const totals = useMemo(() => {
    return calculatedRows.reduce(
      (acc, row) => {
        acc.totalM2 += row.calc.areaM2 * row.quantity;
        acc.totalMB += row.edgeBanding ? row.calc.runningMeters * row.quantity : 0;
        acc.totalNet += row.calc.lineTotalNet;
        acc.totalGross += row.calc.lineTotalGross;
        return acc;
      },
      { totalM2: 0, totalMB: 0, totalNet: 0, totalGross: 0 }
    );
  }, [calculatedRows]);

  const updateRow = <K extends keyof FrontItemInput>(id: string, key: K, value: FrontItemInput[K]) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  };

  const addRow = () => setRows((prev) => [...prev, createRow()]);

  const removeRow = (id: string) => {
    setRows((prev) => {
      if (prev.length <= 1) {
        return prev;
      }
      return prev.filter((row) => row.id !== id);
    });
  };

  const handleContactSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      ...contact,
      rows,
      totals,
      createdAt: new Date().toISOString()
    };

    try {
      const existing = localStorage.getItem('ahp_quote_requests');
      const parsed = existing ? (JSON.parse(existing) as unknown[]) : [];
      const merged = Array.isArray(parsed) ? [...parsed, payload] : [payload];
      localStorage.setItem('ahp_quote_requests', JSON.stringify(merged));
      setContact(initialContact);
      setContactStatus('Dziękujemy. Zapytanie zostało zapisane i przekazane do dalszej wyceny.');
    } catch {
      setContactStatus('Nie udało się zapisać zapytania lokalnie. Spróbuj ponownie.');
    }
  };

  return (
    <main className="min-h-screen bg-wood-glow text-sand-50">
      <section className="mx-auto max-w-7xl px-4 pb-24 pt-14 sm:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-sand-100/20 bg-wood-950/90 p-8 shadow-panel sm:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(200,154,72,0.18),transparent_42%)]" />
          <p className="relative mb-3 inline-flex rounded-full border border-accent-gold/40 bg-accent-gold/10 px-4 py-1 text-xs uppercase tracking-[0.2em] text-sand-100/90">
            ANTIK-HOLZ Profis
          </p>
          <h1 className="relative max-w-3xl text-3xl font-semibold leading-tight text-sand-50 sm:text-5xl">
            Fronty meblowe ze starego drewna — oblicz cenę
          </h1>
          <p className="relative mt-4 max-w-3xl text-sm text-sand-100/80 sm:text-base">
            Kalkulator orientacyjny dla frontów z płyt 3-warstwowych. Otrzymasz natychmiastową estymację netto i brutto (VAT 23%),
            z uwzględnieniem materiału, wykończenia i oklejania.
          </p>
        </div>

        <section className="mt-8 rounded-3xl border border-sand-100/20 bg-wood-900/80 p-5 shadow-panel sm:p-8">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-sand-50">Konfigurator frontów</h2>
            <button
              type="button"
              onClick={addRow}
              className="rounded-xl border border-accent-gold/50 bg-accent-gold/15 px-4 py-2 text-sm font-medium text-sand-50 transition hover:bg-accent-gold/30"
            >
              + Dodaj front
            </button>
          </div>

          <div className="space-y-4">
            {calculatedRows.map((row, index) => (
              <article key={row.id} className="rounded-2xl border border-sand-100/15 bg-wood-950/70 p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-medium text-sand-50">Pozycja {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    className="rounded-lg border border-sand-100/25 px-3 py-1 text-xs text-sand-100/80 transition hover:border-sand-100/45 hover:text-sand-50"
                  >
                    Usuń
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                  <label className="flex flex-col gap-1 text-sm text-sand-100/90 lg:col-span-2">
                    Materiał
                    <select
                      value={row.material}
                      onChange={(event) => updateRow(row.id, 'material', event.target.value as FrontItemInput['material'])}
                      className="rounded-xl border border-sand-100/20 bg-wood-900 px-3 py-2 text-sand-50 outline-none ring-accent-gold transition focus:ring"
                    >
                      {defaultPricingConfig.materials.map((material) => (
                        <option key={material.id} value={material.id}>
                          {material.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-1 text-sm text-sand-100/90">
                    Szerokość (mm)
                    <input
                      type="number"
                      min={100}
                      value={row.widthMm}
                      onChange={(event) => updateRow(row.id, 'widthMm', Math.max(100, Number(event.target.value) || 100))}
                      className="rounded-xl border border-sand-100/20 bg-wood-900 px-3 py-2 text-sand-50 outline-none ring-accent-gold transition focus:ring"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-sm text-sand-100/90">
                    Wysokość (mm)
                    <input
                      type="number"
                      min={100}
                      value={row.heightMm}
                      onChange={(event) => updateRow(row.id, 'heightMm', Math.max(100, Number(event.target.value) || 100))}
                      className="rounded-xl border border-sand-100/20 bg-wood-900 px-3 py-2 text-sand-50 outline-none ring-accent-gold transition focus:ring"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-sm text-sand-100/90">
                    Ilość
                    <input
                      type="number"
                      min={1}
                      value={row.quantity}
                      onChange={(event) => updateRow(row.id, 'quantity', Math.max(1, Number(event.target.value) || 1))}
                      className="rounded-xl border border-sand-100/20 bg-wood-900 px-3 py-2 text-sand-50 outline-none ring-accent-gold transition focus:ring"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-sm text-sand-100/90">
                    Wykończenie
                    <select
                      value={row.finish}
                      onChange={(event) => updateRow(row.id, 'finish', event.target.value as FrontItemInput['finish'])}
                      className="rounded-xl border border-sand-100/20 bg-wood-900 px-3 py-2 text-sand-50 outline-none ring-accent-gold transition focus:ring"
                    >
                      {defaultPricingConfig.finishes.map((finish) => (
                        <option key={finish.id} value={finish.id}>
                          {finish.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-sand-100/90">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={row.edgeBanding}
                      onChange={(event) => updateRow(row.id, 'edgeBanding', event.target.checked)}
                      className="size-4 rounded border-sand-100/30 bg-wood-900 text-accent-gold focus:ring-accent-gold"
                    />
                    Oklejanie krawędzi (+{formatCurrency(defaultPricingConfig.edgeBandingPerM2)}/m²)
                  </label>
                </div>

                <dl className="mt-4 grid gap-3 rounded-2xl border border-sand-100/15 bg-wood-900/70 p-4 text-sm sm:grid-cols-4">
                  <div>
                    <dt className="text-sand-100/70">Powierzchnia (1 szt.)</dt>
                    <dd className="text-base font-semibold text-sand-50">{formatNumber(row.calc.areaM2)} m²</dd>
                  </div>
                  <div>
                    <dt className="text-sand-100/70">Cena netto / m²</dt>
                    <dd className="text-base font-semibold text-sand-50">{formatCurrency(row.calc.unitPricePerM2Net)}</dd>
                  </div>
                  <div>
                    <dt className="text-sand-100/70">Cena netto / front</dt>
                    <dd className="text-base font-semibold text-sand-50">{formatCurrency(row.calc.unitFrontNet)}</dd>
                  </div>
                  <div>
                    <dt className="text-sand-100/70">Wartość pozycji brutto</dt>
                    <dd className="text-base font-semibold text-accent-gold">{formatCurrency(row.calc.lineTotalGross)}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-3xl border border-sand-100/20 bg-wood-900/80 p-6 shadow-panel">
            <h2 className="text-xl font-semibold text-sand-50">Podsumowanie zamówienia</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-sand-100/15 bg-wood-950/80 p-4">
                <p className="text-sm text-sand-100/70">Łączna powierzchnia</p>
                <p className="mt-1 text-2xl font-semibold text-sand-50">{formatNumber(totals.totalM2)} m²</p>
              </div>
              <div className="rounded-2xl border border-sand-100/15 bg-wood-950/80 p-4">
                <p className="text-sm text-sand-100/70">Łączne MB obrzeża</p>
                <p className="mt-1 text-2xl font-semibold text-sand-50">{formatNumber(totals.totalMB)} mb</p>
              </div>
              <div className="rounded-2xl border border-sand-100/15 bg-wood-950/80 p-4">
                <p className="text-sm text-sand-100/70">Suma netto</p>
                <p key={totals.totalNet.toFixed(2)} className="mt-1 text-2xl font-semibold text-sand-50 animate-softPulse">
                  {formatCurrency(totals.totalNet)}
                </p>
              </div>
              <div className="rounded-2xl border border-accent-gold/30 bg-accent-gold/10 p-4">
                <p className="text-sm text-sand-100/70">Suma brutto (VAT 23%)</p>
                <p key={totals.totalGross.toFixed(2)} className="mt-1 text-2xl font-semibold text-accent-gold animate-softPulse">
                  {formatCurrency(totals.totalGross)}
                </p>
              </div>
            </div>
          </div>

          <aside className="rounded-3xl border border-sand-100/20 bg-wood-900/80 p-6 shadow-panel">
            <h2 className="text-xl font-semibold text-sand-50">Formalna wycena</h2>
            <p className="mt-2 text-sm text-sand-100/80">
              Potrzebujesz oferty handlowej z terminem realizacji? Wyślij zapytanie bezpośrednio do zespołu ANTIK-HOLZ Profis.
            </p>
            <button
              type="button"
              onClick={() => setShowContact((value) => !value)}
              className="mt-4 w-full rounded-xl border border-accent-gold/60 bg-accent-gold/20 px-4 py-3 text-sm font-semibold text-sand-50 transition hover:bg-accent-gold/35"
            >
              Poproś o formalną wycenę
            </button>

            {showContact ? (
              <form className="mt-4 space-y-3" onSubmit={handleContactSubmit}>
                <input
                  required
                  value={contact.name}
                  onChange={(event) => setContact((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Imię i nazwisko"
                  className="w-full rounded-xl border border-sand-100/25 bg-wood-950 px-3 py-2 text-sm text-sand-50 outline-none ring-accent-gold transition focus:ring"
                />
                <input
                  required
                  type="email"
                  value={contact.email}
                  onChange={(event) => setContact((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="E-mail"
                  className="w-full rounded-xl border border-sand-100/25 bg-wood-950 px-3 py-2 text-sm text-sand-50 outline-none ring-accent-gold transition focus:ring"
                />
                <input
                  value={contact.phone}
                  onChange={(event) => setContact((prev) => ({ ...prev, phone: event.target.value }))}
                  placeholder="Telefon"
                  className="w-full rounded-xl border border-sand-100/25 bg-wood-950 px-3 py-2 text-sm text-sand-50 outline-none ring-accent-gold transition focus:ring"
                />
                <textarea
                  required
                  rows={4}
                  value={contact.message}
                  onChange={(event) => setContact((prev) => ({ ...prev, message: event.target.value }))}
                  placeholder="Dodatkowe informacje: frezy, terminy, projekt..."
                  className="w-full rounded-xl border border-sand-100/25 bg-wood-950 px-3 py-2 text-sm text-sand-50 outline-none ring-accent-gold transition focus:ring"
                />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-accent-gold px-4 py-3 text-sm font-semibold text-wood-950 transition hover:brightness-110"
                >
                  Wyślij zapytanie
                </button>
              </form>
            ) : null}

            {contactStatus ? <p className="mt-3 text-xs text-sand-100/90">{contactStatus}</p> : null}
          </aside>
        </section>
      </section>
    </main>
  );
}
