import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

import classNames from 'classnames';

import styles from './TimeInput.module.scss';

interface TimeInputProps {
  value: number;
  onChange: (minutes: number) => void;
  disabled?: boolean;
  isDraft?: boolean;
}

export interface TimeInputHandle {
  focus: () => void;
}

const MAX_HOURS = 23;
const MAX_MINUTES = 59;

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

const TimeInput = forwardRef<TimeInputHandle, TimeInputProps>(({ value, onChange, disabled, isDraft }, ref) => {
  const hoursRef = useRef<HTMLInputElement>(null);
  const minutesRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      hoursRef.current?.focus();
      hoursRef.current?.select();
    }
  }));

  const [hoursDisplay, setHoursDisplay] = useState(pad(Math.floor(value / 60)));
  const [minutesDisplay, setMinutesDisplay] = useState(pad(value % 60));

  useEffect(() => {
    setHoursDisplay(pad(Math.floor(value / 60)));
    setMinutesDisplay(pad(value % 60));
  }, [value]);

  const commitHours = (raw: string) => {
    const num = clamp(parseInt(raw || '0', 10), 0, MAX_HOURS);
    setHoursDisplay(pad(num));
    onChange(num * 60 + clamp(parseInt(minutesDisplay || '0', 10), 0, MAX_MINUTES));
  };

  const commitMinutes = (raw: string) => {
    const num = clamp(parseInt(raw || '0', 10), 0, MAX_MINUTES);
    setMinutesDisplay(pad(num));
    onChange(clamp(parseInt(hoursDisplay || '0', 10), 0, MAX_HOURS) * 60 + num);
  };

  if (disabled) {
    return <span className={styles.disabledValue}>-- : --</span>;
  }

  return (
    <div className={classNames(styles.wrapper, { [styles.draftWrapper]: isDraft })}>
      <input
        ref={hoursRef}
        className={styles.segment}
        value={hoursDisplay}
        maxLength={2}
        onChange={(e) => {
          const raw = e.target.value.replace(/\D/g, '');
          setHoursDisplay(raw);
          if (raw.length === 2) {
            minutesRef.current?.focus();
            minutesRef.current?.select();
          }
        }}
        onBlur={(e) => commitHours(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && hoursRef.current?.blur()}
        onFocus={(e) => e.target.select()}
      />
      <span className={styles.separator}>:</span>
      <input
        ref={minutesRef}
        className={styles.segment}
        value={minutesDisplay}
        maxLength={2}
        onChange={(e) => {
          const raw = e.target.value.replace(/\D/g, '');
          setMinutesDisplay(raw);
        }}
        onBlur={(e) => commitMinutes(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && minutesRef.current?.blur()}
        onFocus={(e) => e.target.select()}
      />
    </div>
  );
});

export default TimeInput;
