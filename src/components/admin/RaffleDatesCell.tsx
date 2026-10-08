import { useState, type CSSProperties } from 'react'
import { DayPicker, type DateRange } from 'react-day-picker'
import { es } from 'react-day-picker/locale'
import 'react-day-picker/style.css'
import type { RaffleSchedule } from '../../types/product'
import {
  formatTime,
  getScheduleStatus,
  salesEndsAt,
  todayInMexico,
  type ScheduleStatus,
} from '../../utils/raffleSchedule'

interface RaffleDatesCellProps {
  schedule: RaffleSchedule
  onSave: (schedule: RaffleSchedule) => Promise<void>
}

// Las fechas viajan como 'YYYY-MM-DD'. Se convierten a mano (y no con
// toISOString) para que la zona horaria no mueva el día.
function toDate(value: string | null): Date | undefined {
  if (!value) return undefined
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toDateString(date: Date | undefined): string | null {
  if (!date) return null
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${m}-${d}`
}

const STATUS_LABELS: Record<ScheduleStatus, { label: string; className: string }> = {
  'no-dates': {
    label: 'Oculto (sin fechas)',
    className: 'text-slate-400',
  },
  scheduled: { label: 'Programada', className: 'text-amber-600' },
  'missing-start-time': {
    label: 'Falta hora de inicio',
    className: 'text-red-600',
  },
  'waiting-start-time': {
    label: 'Por abrir venta',
    className: 'text-amber-600',
  },
  'on-sale': { label: 'En venta', className: 'text-green-700' },
  finished: { label: 'Terminada', className: 'text-slate-500' },
}

const shortDate = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric',
  month: 'short',
  year: '2-digit',
})

// "12 oct 26, 10:00" o solo "12 oct 26" si no hay hora.
function formatDay(date: string, time: string | null): string {
  const day = shortDate.format(toDate(date))
  return time ? `${day}, ${formatTime(time)}` : day
}

function isPast(date: Date): boolean {
  return date.getTime() <= Date.now()
}

// Colores del calendario acordes al resto del admin (indigo).
const pickerTheme = {
  '--rdp-accent-color': '#4f46e5',
  '--rdp-accent-background-color': '#e0e7ff',
} as CSSProperties

const timeInputClass =
  'mt-1 block rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-700'

export default function RaffleDatesCell({
  schedule,
  onSave,
}: RaffleDatesCellProps) {
  const [open, setOpen] = useState(false)
  const [range, setRange] = useState<DateRange | undefined>()
  // '' = sin hora: las horas las da el admin, no hay valores por defecto.
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function openPicker() {
    const from = toDate(schedule.startsOn)
    setRange(from ? { from, to: toDate(schedule.endsOn) } : undefined)
    setStartTime(schedule.startTime ? formatTime(schedule.startTime) : '')
    setEndTime(schedule.endTime ? formatTime(schedule.endTime) : '')
    setError(null)
    setOpen(true)
  }

  // Si solo se eligió un día, la rifa empieza y termina ese día.
  const next: RaffleSchedule = {
    startsOn: toDateString(range?.from),
    endsOn: toDateString(range?.to ?? range?.from),
    startTime: startTime || null,
    endTime: endTime || null,
  }

  async function save(clear: boolean) {
    const toSave: RaffleSchedule = clear
      ? { startsOn: null, endsOn: null, startTime: null, endTime: null }
      : next

    if (!clear) {
      const end = salesEndsAt(toSave)
      if (end && isPast(end)) {
        setError('La hora de fin ya pasó. Elige una posterior a la actual.')
        return
      }
      if (
        toSave.startsOn === toSave.endsOn &&
        toSave.startTime &&
        toSave.endTime &&
        toSave.endTime <= toSave.startTime
      ) {
        setError('La hora de fin debe ser después de la hora de inicio.')
        return
      }
    }

    setSaving(true)
    setError(null)
    try {
      await onSave(toSave)
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar.')
    } finally {
      setSaving(false)
    }
  }

  const status = STATUS_LABELS[getScheduleStatus(schedule)]
  const hasDates = Boolean(schedule.startsOn || schedule.endsOn)

  return (
    <>
      <button
        type="button"
        onClick={openPicker}
        className="rounded-md border border-slate-300 px-2 py-1 text-left text-[11px] leading-tight text-slate-700 transition hover:bg-slate-50"
      >
        {hasDates ? (
          <>
            <span className="block">
              {schedule.startsOn
                ? formatDay(schedule.startsOn, schedule.startTime)
                : 'Sin inicio'}
            </span>
            <span className="block">
              {schedule.endsOn
                ? `a ${formatDay(schedule.endsOn, schedule.endTime)}`
                : 'Sin fin'}
            </span>
          </>
        ) : (
          'Elegir fechas'
        )}
      </button>
      <p className={`mt-1 text-[11px] font-medium ${status.className}`}>
        {status.label}
      </p>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={() => !saving && setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Fechas de la rifa"
            className="max-h-full overflow-auto whitespace-normal rounded-2xl bg-white p-5 text-sm shadow-xl"
            style={pickerTheme}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold text-slate-900">
              Fechas de la rifa
            </h2>
            <p className="mt-1 text-slate-500">
              Elige el día de inicio y luego el de fin. El producto se muestra
              en esas fechas, y la compra de boletos se habilita hasta que
              indiques la hora de inicio.
            </p>

            <DayPicker
              mode="range"
              locale={es}
              numberOfMonths={2}
              selected={range}
              onSelect={setRange}
              defaultMonth={range?.from}
              disabled={{ before: toDate(todayInMexico())! }}
              className="mt-3"
            />

            <div className="mt-2 flex flex-wrap gap-6">
              <label className="text-xs font-medium text-slate-600">
                Hora de inicio de venta
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={timeInputClass}
                />
                <span className="mt-1 block font-normal text-slate-400">
                  Sin hora, la compra queda bloqueada.
                </span>
              </label>
              <label className="text-xs font-medium text-slate-600">
                Hora de fin de venta
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={timeInputClass}
                />
                <span className="mt-1 block font-normal text-slate-400">
                  Sin hora, cierra al terminar el día.
                </span>
              </label>
            </div>

            <p className="mt-3 font-medium text-slate-700">
              {next.startsOn && next.endsOn
                ? `${formatDay(next.startsOn, next.startTime)} a ${formatDay(next.endsOn, next.endTime)}`
                : 'Sin fechas seleccionadas'}
            </p>

            {error && (
              <p role="alert" className="mt-2 text-red-600">
                {error}
              </p>
            )}

            <div className="mt-4 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => save(true)}
                disabled={saving || !hasDates}
                className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-40 disabled:hover:no-underline"
              >
                Quitar fechas
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={saving}
                  className="rounded-full border border-slate-300 px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => save(false)}
                  disabled={saving || !range?.from}
                  className="rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
