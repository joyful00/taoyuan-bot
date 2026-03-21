// src/ui/draggable.ts
export function makeDraggable(
  element: HTMLElement,
  handle?: HTMLElement,
  onClick?: () => void,
) {
  let isDragging = false,
    startX = 0,
    startY = 0,
    initialLeft = 0,
    initialTop = 0;
  const dragHandle = handle || element;

  dragHandle.addEventListener("mousedown", (e) => {
    // 如果点击的是按钮、输入框或下拉框，不触发拖拽
    const target = e.target as HTMLElement;
    if (["BUTTON", "INPUT", "SELECT", "LABEL"].includes(target.tagName)) return;

    isDragging = false;
    startX = e.clientX;
    startY = e.clientY;
    const rect = element.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;

    element.style.transition = "none";
    element.style.right = "auto";
    element.style.left = initialLeft + "px";
    element.style.top = initialTop + "px";

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });

  const onMouseMove = (e: MouseEvent) => {
    const dx = e.clientX - startX,
      dy = e.clientY - startY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) isDragging = true;
    if (isDragging) {
      element.style.left = initialLeft + dx + "px";
      element.style.top = initialTop + dy + "px";
    }
  };

  const onMouseUp = () => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    element.style.transition = "";
    if (!isDragging && onClick) onClick();
  };
}
