import { lazy, Suspense, useMemo, useState } from "react";
import { useShiftsStore, useUserStore } from "../store";
import { formatCurrency, formatDate, formatMinutesReadable } from "../utils/formatting";
import { Button, Card, Calendar } from "../components";

const ChartsContainer = lazy(() =>
  import("../components/ChartsContainer").then((module) => ({
    default: module.ChartsContainer,
  })),
);

const getMonthBounds = (date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  return {
    start: `${year}-${String(month + 1).padStart(2, "0")}-01`,
    end: `${year}-${String(month + 1).padStart(2, "0")}-${String(new Date(year, month + 1, 0).getDate()).padStart(2, "0")}`,
  };
};

export default function Statistics() {
  const shifts = useShiftsStore((state: any) => state.shifts);
  const { updateCurrentShift, deleteShift } = useShiftsStore();
  const currency = useUserStore((state: any) => state.settings.currency);
  const fuelTrackingEnabled = useUserStore((state: any) => state.settings.fuelTrackingEnabled);

  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [selectedShiftDate, setSelectedShiftDate] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const monthBounds = useMemo(() => getMonthBounds(), []);
  const periodStart = rangeStart || monthBounds.start;
  const periodEnd = rangeEnd || monthBounds.end;
  const hasCustomRange = Boolean(rangeStart && rangeEnd);

  const periodShifts = useMemo(
    () => shifts
      .filter((shift: any) => shift.date >= periodStart && shift.date <= periodEnd)
      .sort((a: any, b: any) => b.date.localeCompare(a.date)),
    [periodEnd, periodStart, shifts],
  );

  const totals = useMemo(() => periodShifts.reduce(
    (result: any, shift: any) => ({
      income: result.income + shift.totalWithoutTax,
      incomeWithTax: result.incomeWithTax + shift.totalWithTax,
      netProfit: result.netProfit + shift.netProfit,
      minutes: result.minutes + shift.minutes,
      orders: result.orders + shift.zone1 + shift.zone2 + shift.zone3,
      kilometers: result.kilometers + shift.kilometers,
    }),
    { income: 0, incomeWithTax: 0, netProfit: 0, minutes: 0, orders: 0, kilometers: 0 },
  ), [periodShifts]);

  const shiftsByDate = useMemo(
    () => shifts.reduce((result: Record<string, number>, shift: any) => {
      result[shift.date] = shift.totalWithTax;
      return result;
    }, {}),
    [shifts],
  );

  const chartData = useMemo(
    () => [...periodShifts]
      .reverse()
      .map((shift: any) => ({
        date: shift.date,
        income: shift.totalWithoutTax,
        netProfit: shift.netProfit,
        kilometers: shift.kilometers,
      })),
    [periodShifts],
  );

  const incomePerHour = totals.minutes ? (totals.income / totals.minutes) * 60 : 0;
  const incomePerKm = totals.kilometers ? totals.income / totals.kilometers : 0;
  const maxCalendarValue = Math.max(...(Object.values(shiftsByDate) as number[]), 5000);
  const periodTitle = hasCustomRange
    ? `${formatDate(periodStart)} — ${formatDate(periodEnd)}`
    : new Date(`${periodStart}T12:00:00`).toLocaleDateString("ru-RU", { month: "long", year: "numeric" });

  const showStatus = (message: string) => {
    setStatusMessage(message);
    window.setTimeout(() => setStatusMessage(null), 3000);
  };

  const closeActions = () => setSelectedShiftDate(null);

  const handleEditShift = () => {
    const shift = shifts.find((item: any) => item.date === selectedShiftDate);
    if (!shift) return;
    updateCurrentShift(shift);
    closeActions();
    showStatus("Смена загружена. Откройте «Расчёт», чтобы изменить её.");
  };

  const handleDeleteShift = () => {
    if (!selectedShiftDate || !window.confirm(`Удалить смену от ${formatDate(selectedShiftDate)}?`)) return;
    deleteShift(selectedShiftDate);
    closeActions();
    showStatus("Смена удалена.");
  };

  return (
    <div className="min-h-screen bg-white p-4 pb-safe pl-safe pr-safe">
      <main className="mx-auto max-w-md space-y-5">
        <header className="pt-1">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Ваши смены</p>
          <div className="mt-2 flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Статистика</h1>
              <p className="mt-1 text-sm text-slate-500">Доходы, темп работы и история смен.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-right">
              <p className="text-[11px] text-slate-500">Смен</p>
              <p className="text-lg font-semibold tabular-nums text-slate-900">{periodShifts.length}</p>
            </div>
          </div>
        </header>

        <div className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ${statusMessage ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`} aria-live="polite">
          <div className="overflow-hidden">
            {statusMessage && <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700"><span aria-hidden="true">✓</span>{statusMessage}</div>}
          </div>
        </div>

        <Card variant="elevated" className="rounded-2xl border-slate-100 p-4 shadow-sm shadow-slate-900/5">
          <Calendar
            shifts={shiftsByDate}
            rangeStart={rangeStart || undefined}
            rangeEnd={rangeEnd || undefined}
            onRangeChange={(start, end) => {
              setRangeStart(start);
              setRangeEnd(end);
            }}
            maxValue={maxCalendarValue}
          />
        </Card>

        <section className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Выбранный период</p>
              <h2 className="mt-1 capitalize text-sm font-semibold text-slate-900">{periodTitle}</h2>
            </div>
            {hasCustomRange && (
              <button type="button" onClick={() => { setRangeStart(""); setRangeEnd(""); }} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 active:scale-95">
                Сбросить
              </button>
            )}
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">Чтобы выбрать другой период, нажмите начальный и конечный дни в календаре.</p>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-900/5">
            <p className="text-xs text-slate-500">Доход с налогом</p>
            <p className="mt-2 text-xl font-semibold tracking-tight text-red-700">{formatCurrency(totals.incomeWithTax, currency)}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-900/5">
            <p className="text-xs text-slate-500">Чистый доход</p>
            <p className="mt-2 text-xl font-semibold tracking-tight text-green-700">{formatCurrency(totals.income, currency)}</p>
          </div>
          {fuelTrackingEnabled && <div className="col-span-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-900/5">
            <p className="text-xs text-slate-500">После бензина</p>
            <p className={`mt-2 text-xl font-semibold tracking-tight ${totals.netProfit < 0 ? "text-red-700" : "text-slate-900"}`}>{formatCurrency(totals.netProfit, currency)}</p>
          </div>}
        </section>

        <Card variant="elevated" className="rounded-2xl border-slate-100 p-4 shadow-sm shadow-slate-900/5">
          <div className="mb-4 flex items-center justify-between"><h2 className="text-base font-semibold text-slate-900">Итоги</h2><span className="text-xs text-slate-500">за период</span></div>
          <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100">
            {[
              ["Смены", periodShifts.length],
              ["Время", formatMinutesReadable(totals.minutes)],
              ["Заказы", totals.orders],
              ["Километры", `${totals.kilometers} км`],
            ].map(([label, value]) => <div key={String(label)} className="p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-base font-semibold tabular-nums text-slate-900">{value}</p></div>)}
          </div>
          {periodShifts.length > 0 && <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Доход / час</p><p className="mt-1 text-base font-semibold text-slate-900">{formatCurrency(incomePerHour, currency)}</p></div>
            <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Доход / км</p><p className="mt-1 text-base font-semibold text-slate-900">{formatCurrency(incomePerKm, currency)}</p></div>
          </div>}
        </Card>

        <section>
          <div className="mb-3 flex items-center justify-between"><h2 className="text-base font-semibold text-slate-900">Смены</h2><span className="text-xs text-slate-500">{periodShifts.length}</span></div>
          {periodShifts.length ? <div className="space-y-2">
            {periodShifts.map((shift: any) => <button key={shift.date} type="button" onClick={() => setSelectedShiftDate(shift.date)} className="w-full rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm shadow-slate-900/5 transition duration-200 hover:border-slate-200 hover:bg-slate-50 active:scale-[0.99]">
              <div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-slate-900">{formatDate(shift.date)}</p><p className="mt-1 text-xs text-slate-500">{formatMinutesReadable(shift.minutes)} · {shift.zone1 + shift.zone2 + shift.zone3} заказов · {shift.kilometers} км</p></div><p className="text-sm font-semibold text-slate-900">{formatCurrency(shift.totalWithTax, currency)}</p></div>
            </button>)}
          </div> : <Card variant="elevated" className="rounded-2xl border-slate-100 py-8 text-center text-sm text-slate-500 shadow-sm shadow-slate-900/5">Нет смен за выбранный период.</Card>}
        </section>

        <Suspense fallback={<Card variant="elevated" className="rounded-2xl border-slate-100 py-8 text-center text-sm text-slate-500 shadow-sm shadow-slate-900/5">Загружаем графики…</Card>}>
          <ChartsContainer data={chartData} />
        </Suspense>
      </main>

      {selectedShiftDate && <div className="fixed inset-0 z-50 flex items-end bg-slate-950/30 p-0 sm:items-center sm:justify-center sm:p-4" role="dialog" aria-modal="true" aria-label="Действия со сменой" onClick={closeActions}>
        <div className="w-full rounded-t-3xl border border-slate-100 bg-white p-5 shadow-2xl shadow-slate-900/20 animate-slide-up sm:max-w-md sm:rounded-3xl" onClick={(event) => event.stopPropagation()}>
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200 sm:hidden" />
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Смена</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">{formatDate(selectedShiftDate)}</h2>
          <div className="mt-5 space-y-2">
            <Button onClick={handleEditShift} size="lg" className="w-full">Редактировать смену</Button>
            <Button onClick={handleDeleteShift} variant="danger" size="lg" className="w-full">Удалить смену</Button>
            <Button onClick={closeActions} variant="outline" size="lg" className="w-full">Отмена</Button>
          </div>
        </div>
      </div>}
    </div>
  );
}
