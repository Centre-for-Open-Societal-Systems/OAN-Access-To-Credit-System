'use client';

import { useMotionValue, useReducedMotion, useSpring, type SpringOptions } from 'motion/react';
import * as React from 'react';

/**
 * A number that counts up to its value instead of appearing at it.
 *
 * Adapted from Animate UI's `CountingNumber` primitive (see
 * `vendor/animate-ui/apps/www/registry/primitives/texts/counting-number`), with
 * three changes for this app:
 *
 *  - Thousands separators. Every number this is used on is a count of loans,
 *    applications or birr, and `1240` unseparated is harder to read at a glance
 *    than `1,240`.
 *  - `prefers-reduced-motion` renders the final value immediately.
 *  - The in-view gating is dropped. These sit in dashboard cards that are above
 *    the fold on mount, and an IntersectionObserver per figure earns nothing here.
 *
 * The DOM text is written from a spring subscription rather than through React
 * state: a number ticking at 60fps through `setState` would re-render the whole
 * card on every frame.
 */

const DEFAULT_TRANSITION: SpringOptions = { stiffness: 110, damping: 40 };

export interface CountingNumberProps extends Omit<React.ComponentProps<'span'>, 'children'> {
  value: number;
  /** Where the count starts. */
  from?: number;
  decimalPlaces?: number;
  /** Group thousands (`1,240`). On by default. */
  groupSeparators?: boolean;
  /** Milliseconds to wait before counting. */
  delay?: number;
  transition?: SpringOptions;
}

export function CountingNumber({
  value,
  from = 0,
  decimalPlaces = 0,
  groupSeparators = true,
  delay = 0,
  transition = DEFAULT_TRANSITION,
  style,
  ...props
}: CountingNumberProps) {
  const prefersReducedMotion = useReducedMotion();
  const spanRef = React.useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(from);
  const spring = useSpring(motionValue, transition);

  const format = React.useCallback(
    (n: number) =>
      n.toLocaleString(undefined, {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
        useGrouping: groupSeparators,
      }),
    [decimalPlaces, groupSeparators]
  );

  React.useEffect(() => {
    if (prefersReducedMotion) {
      motionValue.set(value);
      if (spanRef.current) spanRef.current.textContent = format(value);
      return;
    }
    const timeoutId = setTimeout(() => motionValue.set(value), delay);
    return () => clearTimeout(timeoutId);
  }, [value, delay, motionValue, prefersReducedMotion, format]);

  React.useEffect(() => {
    const unsubscribe = spring.on('change', (latest) => {
      if (spanRef.current) spanRef.current.textContent = format(latest);
    });
    return () => unsubscribe();
  }, [spring, format]);

  return (
    <span
      ref={spanRef}
      // Fixed-width digits: without them the figure jitters horizontally as it
      // counts, because proportional digits have different widths.
      style={{ fontVariantNumeric: 'tabular-nums', ...style }}
      {...props}
    >
      {/* The starting figure, formatted the same way — so server output and the
          first client render agree and hydration doesn't warn. Under reduced
          motion that starting figure is updated in useEffect after hydration. */}
      {format(from)}
    </span>
  );
}
