export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  textContent?: string
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (textContent) element.textContent = textContent;
  return element;
}

export function setHTML(element: HTMLElement, html: string): void {
  element.innerHTML = html;
}

export function addClass(element: HTMLElement, ...classNames: string[]): void {
  element.classList.add(...classNames);
}

export function removeClass(
  element: HTMLElement,
  ...classNames: string[]
): void {
  element.classList.remove(...classNames);
}

export function toggleClass(
  element: HTMLElement,
  className: string,
  force?: boolean
): void {
  element.classList.toggle(className, force);
}
