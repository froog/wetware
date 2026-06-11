export function makeDraggable(handle, widget) {
  handle.addEventListener('mousedown', e => {
    if (e.target.closest('button')) return;
    e.preventDefault();
    // Computed left/top are the untransformed layout position, so tilted
    // (CSS-rotated) windows keep their lean and don't jump when grabbed —
    // getBoundingClientRect would return the transformed bounds instead.
    const cs = getComputedStyle(widget);
    const ox = parseFloat(cs.left) || 0, oy = parseFloat(cs.top) || 0;
    const sx = e.clientX, sy = e.clientY;
    const onMove = e2 => {
      widget.style.left  = (ox + e2.clientX - sx) + 'px';
      widget.style.top   = (oy + e2.clientY - sy) + 'px';
      widget.style.right = 'auto';
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
  });
}
