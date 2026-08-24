import { useEffect, useRef, useState } from 'react';

interface UseInViewOptions {
  /** Fraction of the element that must be visible before triggering (0–1). Default: 0.12 */
  threshold?: number;
  /** Once triggered, never un-trigger. Default: true */
  once?: boolean;
  /** Root margin string passed to IntersectionObserver. Default: '0px' */
  rootMargin?: string;
}

/**
 * Lightweight IntersectionObserver hook for scroll-triggered animations.
 *
 * Usage:
 *   const [ref, inView] = useInView();
 *   <div ref={ref} className={`scroll-fade-up ${inView ? 'in-view' : ''}`} />
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: UseInViewOptions = {}
): [React.RefObject<T>, boolean] {
  const { threshold = 0.12, once = true, rootMargin = '0px' } = options;
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If the browser doesn't support IntersectionObserver, just show everything.
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once, rootMargin]);

  return [ref, inView];
}

/**
 * Staggered version: returns multiple refs, each becoming visible with a
 * built-in delay offset so child items animate in sequentially.
 *
 * Usage:
 *   const items = useInViewStagger(4);
 *   items.map(({ ref, inView, delay }, i) => (
 *     <div ref={ref} className={`scroll-fade-up ${inView ? 'in-view' : ''}`}
 *          style={{ transitionDelay: delay }} />
 *   ))
 */
export function useInViewStagger(
  count: number,
  stepMs = 80,
  options: UseInViewOptions = {}
) {
  return Array.from({ length: count }, (_, i) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [ref, inView] = useInView<HTMLDivElement>(options);
    return { ref, inView, delay: `${i * stepMs}ms` };
  });
}
