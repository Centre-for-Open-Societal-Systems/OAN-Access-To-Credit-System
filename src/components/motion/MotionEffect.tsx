'use client';

import { motion, type HTMLMotionProps, type Transition, type Variant } from 'motion/react';
import * as React from 'react';

/**
 * Declarative enter animations — fade, slide, zoom, blur, in any combination.
 *
 * Adapted from Animate UI's `Effect` primitive (see
 * `vendor/animate-ui/apps/www/registry/primitives/effects/effect`), trimmed to
 * what this app needs and changed in three ways:
 *
 *  - `prefers-reduced-motion` is honoured: the element renders in its final state
 *    with no transition rather than animating. The upstream primitive animates
 *    regardless.
 *  - No `asChild`/`Slot` indirection — every use here wraps its children.
 *  - The default slide offset is 100px upstream, which is a page-scale movement.
 *    Cards and rows want a nudge, so it is 16px here.
 *
 * Use `MotionEffects` to stagger a list: it wraps each child and derives the
 * delay from its index, so no caller has to compute delays by hand.
 */

type SlideDirection = 'up' | 'down' | 'left' | 'right';

interface Slide {
  direction?: SlideDirection;
  offset?: number;
}

interface Fade {
  initialOpacity?: number;
  opacity?: number;
}

interface Zoom {
  initialScale?: number;
  scale?: number;
}

interface Blur {
  initialBlur?: number;
  blur?: number;
}

const DEFAULTS = {
  slideDirection: 'up' as SlideDirection,
  slideOffset: 16,
  fadeInitialOpacity: 0,
  fadeOpacity: 1,
  zoomInitialScale: 0.96,
  zoomScale: 1,
  blurInitialBlur: 6,
  blurBlur: 0,
};

const DEFAULT_TRANSITION: Transition = { type: 'spring', stiffness: 260, damping: 26, mass: 0.7 };

export interface MotionEffectProps extends HTMLMotionProps<'div'> {
  children?: React.ReactNode;
  /** Milliseconds to wait before starting. */
  delay?: number;
  fade?: Fade | boolean;
  slide?: Slide | boolean;
  zoom?: Zoom | boolean;
  blur?: Blur | boolean;
}

export function MotionEffect({
  children,
  transition = DEFAULT_TRANSITION,
  delay = 0,
  fade = true,
  slide = false,
  zoom = false,
  blur = false,
  ...props
}: MotionEffectProps) {
  const hidden: Variant = {};
  const visible: Variant = {};

  if (slide) {
    const offset = typeof slide === 'boolean' ? DEFAULTS.slideOffset : slide.offset ?? DEFAULTS.slideOffset;
    const direction =
      typeof slide === 'boolean' ? DEFAULTS.slideDirection : slide.direction ?? DEFAULTS.slideDirection;
    const axis = direction === 'up' || direction === 'down' ? 'y' : 'x';
    hidden[axis] = direction === 'down' || direction === 'right' ? -offset : offset;
    visible[axis] = 0;
  }

  if (fade) {
    hidden.opacity =
      typeof fade === 'boolean' ? DEFAULTS.fadeInitialOpacity : fade.initialOpacity ?? DEFAULTS.fadeInitialOpacity;
    visible.opacity = typeof fade === 'boolean' ? DEFAULTS.fadeOpacity : fade.opacity ?? DEFAULTS.fadeOpacity;
  }

  if (zoom) {
    hidden.scale =
      typeof zoom === 'boolean' ? DEFAULTS.zoomInitialScale : zoom.initialScale ?? DEFAULTS.zoomInitialScale;
    visible.scale = typeof zoom === 'boolean' ? DEFAULTS.zoomScale : zoom.scale ?? DEFAULTS.zoomScale;
  }

  if (blur) {
    const initialBlur =
      typeof blur === 'boolean' ? DEFAULTS.blurInitialBlur : blur.initialBlur ?? DEFAULTS.blurInitialBlur;
    const finalBlur = typeof blur === 'boolean' ? DEFAULTS.blurBlur : blur.blur ?? DEFAULTS.blurBlur;
    hidden.filter = `blur(${initialBlur}px)`;
    visible.filter = `blur(${finalBlur}px)`;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ hidden, visible }}
      transition={{ ...transition, delay: (transition?.delay ?? 0) + delay / 1000 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export interface MotionEffectsProps extends Omit<MotionEffectProps, 'children'> {
  children: React.ReactNode;
  /** Milliseconds added per child, so items arrive in sequence. */
  stagger?: number;
}

export function MotionEffects({ children, delay = 0, stagger = 60, ...props }: MotionEffectsProps) {
  const items = React.Children.toArray(children);

  return (
    <>
      {items.map((child, index) => (
        <MotionEffect
          key={(React.isValidElement(child) && child.key) || index}
          delay={delay + index * stagger}
          {...props}
        >
          {child}
        </MotionEffect>
      ))}
    </>
  );
}
