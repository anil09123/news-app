import { useEffect, useRef, useState } from 'react';

const trailCount = 4;

function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const trailRefs = useRef([]);

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!finePointer || reducedMotion) return undefined;

    setEnabled(true);

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { x: mouse.x, y: mouse.y };
    const trail = Array.from({ length: trailCount }, () => ({ x: mouse.x, y: mouse.y }));
    let frameId;

    document.body.classList.add('has-custom-cursor');

    const interactiveSelector = 'a, button, input, textarea, select, .modal-source-link, .secondary-action';

    const handleMove = (event) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      document.body.classList.remove('cursor-out');
    };

    const handlePointerOver = (event) => {
      if (event.target.closest(interactiveSelector)) {
        document.body.classList.add('cursor-hovering');
      }
    };

    const handlePointerOut = (event) => {
      if (event.target.closest(interactiveSelector)) {
        document.body.classList.remove('cursor-hovering');
      }
    };

    const handleDown = () => document.body.classList.add('cursor-pressed');
    const handleUp = () => document.body.classList.remove('cursor-pressed');
    const handleLeave = () => document.body.classList.add('cursor-out');
    const handleEnter = () => document.body.classList.remove('cursor-out');

    const animate = () => {
      ring.x += (mouse.x - ring.x) * 0.26;
      ring.y += (mouse.y - ring.y) * 0.26;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0) translate(-50%, -50%)`;
      }

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%)`;
      }

      trail.forEach((item, index) => {
        const target = index === 0 ? mouse : trail[index - 1];
        item.x += (target.x - item.x) * 0.18;
        item.y += (target.y - item.y) * 0.18;

        const node = trailRefs.current[index];
        if (node) {
          const size = Math.max(2, 7 - index);
          node.style.width = `${size}px`;
          node.style.height = `${size}px`;
          node.style.transform = `translate3d(${item.x}px, ${item.y}px, 0) translate(-50%, -50%)`;
          node.style.opacity = `${Math.max(0.04, 0.18 - index * 0.035)}`;
        }
      });

      frameId = requestAnimationFrame(animate);
    };

    window.addEventListener('pointermove', handleMove, { passive: true });
    window.addEventListener('pointerdown', handleDown, { passive: true });
    window.addEventListener('pointerup', handleUp, { passive: true });
    window.addEventListener('mouseout', handleLeave, { passive: true });
    window.addEventListener('mouseover', handleEnter, { passive: true });
    document.addEventListener('mouseover', handlePointerOver);
    document.addEventListener('mouseout', handlePointerOut);
    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      document.body.classList.remove('has-custom-cursor', 'cursor-hovering', 'cursor-pressed', 'cursor-out');
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerdown', handleDown);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('mouseout', handleLeave);
      window.removeEventListener('mouseover', handleEnter);
      document.removeEventListener('mouseover', handlePointerOver);
      document.removeEventListener('mouseout', handlePointerOut);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div className="cursor-suite" aria-hidden="true">
      {Array.from({ length: trailCount }).map((_, index) => (
        <span
          key={index}
          className="cursor-trail-dot"
          ref={(node) => {
            trailRefs.current[index] = node;
          }}
        />
      ))}
      <span className="cursor-ring" ref={ringRef} />
      <span className="cursor-dot" ref={dotRef} />
    </div>
  );
}

export default CustomCursor;
