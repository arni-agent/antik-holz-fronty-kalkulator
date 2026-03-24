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
    <main className="min-h-screen bg-[#faf9f6] text-ah-dark">
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <header className="card border-b py-6 px-6 text-center">
          <p className="brand text-xs uppercase tracking-[0.25em] text-ah-text-secondary font-medium">ANTIK-HOLZ Profis</p>
          <h1 className="mt-3 text-4xl italic tracking-wide-sm text-ah-dark font-[var(--font-playfair)]">Kalkulator Frontów</h1>
          <p className="mx-auto mt-4 max-w-3xl text-sm text-ah-text-secondary">
            Kalkulator orientacyjny dla frontów z płyt 3-warstwowych. Otrzymasz natychmiastową estymację netto i brutto (VAT 23%),
            z uwzględnieniem materiału, wykończenia i oklejania.
          </p>
        </header>

        <section className="card mt-8 p-5 sm:p-8">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-2xl italic text-ah-dark font-[var(--font-playfair)]">Konfigurator frontów</h2>
            <button type="button" onClick={addRow} className="ah-button">
              Dodaj front
            </button>
          </div>

          <div className="space-y-4">
            {calculatedRows.map((row, index) => (
              <article key={row.id} className="card p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-medium text-ah-dark">Pozycja {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    className="rounded-lg border border-warmgray px-3 py-1 text-xs uppercase tracking-wide-md text-ah-text-secondary transition-colors hover:border-ah-wood hover:text-ah-dark"
                  >
                    Usuń
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                  <label className="lg:col-span-2 flex flex-col gap-2">
                    <span className="ah-label">Materiał</span>
                    <select
                      value={row.material}
                      onChange={(event) => updateRow(row.id, 'material', event.target.value as FrontItemInput['material'])}
                      className="ah-input"
                    >
                      {defaultPricingConfig.materials.map((material) => (
                        <option key={material.id} value={material.id}>
                          {material.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="ah-label">Szerokość (mm)</span>
                    <input
                      type="number"
                      min={100}
                      value={row.widthMm}
                      onChange={(event) => updateRow(row.id, 'widthMm', Math.max(100, Number(event.target.value) || 100))}
                      className="ah-input"
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="ah-label">Wysokość (mm)</span>
                    <input
                      type="number"
                      min={100}
                      value={row.heightMm}
                      onChange={(event) => updateRow(row.id, 'heightMm', Math.max(100, Number(event.target.value) || 100))}
                      className="ah-input"
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="ah-label">Ilość</span>
                    <input
                      type="number"
                      min={1}
                      value={row.quantity}
                      onChange={(event) => updateRow(row.id, 'quantity', Math.max(1, Number(event.target.value) || 1))}
                      className="ah-input"
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="ah-label">Wykończenie</span>
                    <select
                      value={row.finish}
                      onChange={(event) => updateRow(row.id, 'finish', event.target.value as FrontItemInput['finish'])}
                      className="ah-input"
                    >
                      {defaultPricingConfig.finishes.map((finish) => (
                        <option key={finish.id} value={finish.id}>
                          {finish.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-ah-text-secondary">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={row.edgeBanding}
                      onChange={(event) => updateRow(row.id, 'edgeBanding', event.target.checked)}
                      className="size-4 rounded border-warmgray bg-white text-ah-wood focus:ring-ah-wood"
                    />
                    Oklejanie krawędzi (+{formatCurrency(defaultPricingConfig.edgeBandingPerM2)}/m²)
                  </label>
                </div>

                <dl className="mt-4 grid gap-3 rounded-lg border border-warmgray bg-cream p-4 text-sm sm:grid-cols-4">
                  <div>
                    <dt className="ah-label">Powierzchnia (1 szt.)</dt>
                    <dd className="mt-1 text-base font-semibold text-ah-dark">{formatNumber(row.calc.areaM2)} m²</dd>
                  </div>
                  <div>
                    <dt className="ah-label">Cena netto / m²</dt>
                    <dd className="mt-1 text-base font-semibold text-ah-dark">{formatCurrency(row.calc.unitPricePerM2Net)}</dd>
                  </div>
                  <div>
                    <dt className="ah-label">Cena netto / front</dt>
                    <dd className="mt-1 text-base font-semibold text-ah-dark">{formatCurrency(row.calc.unitFrontNet)}</dd>
                  </div>
                  <div>
                    <dt className="ah-label">Wartość pozycji brutto</dt>
                    <dd className="mt-1 text-base font-semibold text-ah-wood">{formatCurrency(row.calc.lineTotalGross)}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="card p-6">
            <h2 className="text-2xl italic text-ah-dark font-[var(--font-playfair)]">Podsumowanie zamówienia</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-warmgray bg-cream p-4">
                <p className="ah-label">Łączna powierzchnia</p>
                <p className="mt-1 text-2xl font-semibold text-ah-dark">{formatNumber(totals.totalM2)} m²</p>
              </div>
              <div className="rounded-lg border border-warmgray bg-cream p-4">
                <p className="ah-label">Łączne MB obrzeża</p>
                <p className="mt-1 text-2xl font-semibold text-ah-dark">{formatNumber(totals.totalMB)} mb</p>
              </div>
              <div className="rounded-lg border border-warmgray bg-cream p-4">
                <p className="ah-label">Suma netto</p>
                <p key={totals.totalNet.toFixed(2)} className="mt-1 text-2xl font-semibold text-ah-dark">
                  {formatCurrency(totals.totalNet)}
                </p>
              </div>
              <div className="rounded-lg border border-warmgray bg-white p-4">
                <p className="ah-label">Suma brutto (VAT 23%)</p>
                <p key={totals.totalGross.toFixed(2)} className="mt-1 text-2xl font-semibold text-ah-wood">
                  {formatCurrency(totals.totalGross)}
                </p>
              </div>
            </div>
          </div>

          <aside className="card p-6">
            <h2 className="text-2xl italic text-ah-dark font-[var(--font-playfair)]">Formalna wycena</h2>
            <p className="mt-2 text-sm text-ah-text-secondary">
              Potrzebujesz oferty handlowej z terminem realizacji? Wyślij zapytanie bezpośrednio do zespołu ANTIK-HOLZ Profis.
            </p>
            <button type="button" onClick={() => setShowContact((value) => !value)} className="ah-button mt-4 w-full">
              Poproś o formalną wycenę
            </button>

            {showContact ? (
              <form className="mt-4 space-y-3" onSubmit={handleContactSubmit}>
                <input
                  required
                  value={contact.name}
                  onChange={(event) => setContact((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Imię i nazwisko"
                  className="ah-input w-full"
                />
                <input
                  required
                  type="email"
                  value={contact.email}
                  onChange={(event) => setContact((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="E-mail"
                  className="ah-input w-full"
                />
                <input
                  value={contact.phone}
                  onChange={(event) => setContact((prev) => ({ ...prev, phone: event.target.value }))}
                  placeholder="Telefon"
                  className="ah-input w-full"
                />
                <textarea
                  required
                  rows={4}
                  value={contact.message}
                  onChange={(event) => setContact((prev) => ({ ...prev, message: event.target.value }))}
                  placeholder="Dodatkowe informacje: frezy, terminy, projekt..."
                  className="ah-input w-full"
                />
                <button type="submit" className="ah-button w-full">
                  Wyślij zapytanie
                </button>
              </form>
            ) : null}

            {contactStatus ? <p className="mt-3 text-xs text-ah-text-secondary">{contactStatus}</p> : null}
          </aside>
        </section>
      </section>
    </main>
  );
}
