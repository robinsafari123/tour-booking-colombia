'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import type { Matcher } from 'react-day-picker';
import { CalendarDays } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface CalendarPickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  allowedDays?: number[] | null;
}

export default function CalendarPicker({ value, onChange, allowedDays }: CalendarPickerProps) {
  const { lang } = useLanguage();
  const [open, setOpen] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const disabled: Matcher[] = [{ before: tomorrow }];
  if (allowedDays && allowedDays.length > 0) {
    const allDays = [0, 1, 2, 3, 4, 5, 6];
    const disabledWeekdays = allDays.filter(d => !allowedDays.includes(d));
    if (disabledWeekdays.length > 0) {
      disabled.push({ dayOfWeek: disabledWeekdays });
    }
  }

  const locale = lang === 'es' ? es : enUS;
  const placeholder = lang === 'es' ? 'Selecciona una fecha' : 'Select a date';
  const formatted = value ? format(value, 'PPP', { locale }) : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className='w-full relative flex items-center pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-left focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent cursor-pointer'
      >
        <CalendarDays className='absolute left-3 w-5 h-5 text-gray-400 pointer-events-none' />
        <span className={formatted ? 'text-gray-700' : 'text-gray-400'}>
          {formatted ?? placeholder}
        </span>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          mode='single'
          selected={value}
          onSelect={(date) => {
            onChange(date);
            setOpen(false);
          }}
          disabled={disabled}
          locale={locale}
        />
      </PopoverContent>
    </Popover>
  );
}
