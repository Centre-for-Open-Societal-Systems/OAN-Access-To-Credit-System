'use client';


import { DatePickerField } from './DatePickerField';

export interface DateRangeFilterProps {
  // Original interface used by AdvancedFilters components
  dateFrom?: string;
  dateTo?: string;
  quickDate?: string;
  onDateFromChange?: (v: string) => void;
  onDateToChange?: (v: string) => void;
  onQuickDateChange?: (label: string, from: string, to: string) => void;

  // Fallback interface
  fromValue?: string;
  toValue?: string;
  onFromChange?: (val: string) => void;
  onToChange?: (val: string) => void;

  fromLabel?: string;
  toLabel?: string;
  usePortal?: boolean;
  openUpwards?: boolean;
  forcePosition?: 'bottom' | 'top' | undefined;
}

export function DateRangeFilter(props: DateRangeFilterProps) {
  const {
    dateFrom,
    dateTo,
    quickDate,
    onDateFromChange,
    onDateToChange,
    onQuickDateChange,
    fromValue,
    toValue,
    onFromChange,
    onToChange,
    fromLabel = 'From',
    toLabel = 'To',
    usePortal = true,
    openUpwards = false,
    forcePosition
  } = props;

  const actualFrom = dateFrom ?? fromValue ?? '';
  const actualTo = dateTo ?? toValue ?? '';

  const handleFromChange = (val: string) => {
    onDateFromChange?.(val);
    onFromChange?.(val);
  };

  const handleToChange = (val: string) => {
    onDateToChange?.(val);
    onToChange?.(val);
  };

  const formatDate = (date: Date) => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0] || '';
  };

  const handleQuickSelect = (label: string) => {
    const today = new Date();
    // `const` despite being adjusted below: `setDate` mutates the Date in place,
    // it never rebinds the variable.
    const fromDate = new Date();
    const toDate = new Date();

    if (label === 'Today') {
      // both are today
    } else if (label === 'Yesterday') {
      fromDate.setDate(today.getDate() - 1);
      toDate.setDate(today.getDate() - 1);
    } else if (label === 'Last 7 Days') {
      fromDate.setDate(today.getDate() - 6);
    } else if (label === 'Last 30 Days') {
      fromDate.setDate(today.getDate() - 29);
    }

    const fromStr = formatDate(fromDate);
    const toStr = formatDate(toDate);

    if (onQuickDateChange) {
      onQuickDateChange(label, fromStr, toStr);
    } else {
      handleFromChange(fromStr);
      handleToChange(toStr);
    }
  };

  const quickOptions = ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days'];

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          {fromLabel && (
            <label className="text-sm font-medium text-gray-700">
              {fromLabel}
            </label>
          )}
          <DatePickerField
            value={actualFrom}
            onChange={handleFromChange}
            usePortal={usePortal}
            openUpwards={openUpwards}
            forcePosition={forcePosition}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          {toLabel && (
            <label className="text-sm font-medium text-gray-700">
              {toLabel}
            </label>
          )}
          <DatePickerField
            value={actualTo}
            onChange={handleToChange}
            usePortal={usePortal}
            openUpwards={openUpwards}
            align="right"
            forcePosition={forcePosition}
            {...(actualFrom ? { minDate: new Date(actualFrom) } : {})}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {quickOptions.map(option => (
          <button
            key={option}
            onClick={() => handleQuickSelect(option)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors border ${quickDate === option
              ? 'bg-emerald-50 text-[#16A34A] border-[#16A34A]'
              : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-700'
              }`}
          >
            <span className='font-medium'>{option}</span>

          </button>
        ))}
      </div>
    </div>
  );
}
