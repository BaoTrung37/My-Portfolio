// Polyfill matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Polyfill scrollTo
window.scrollTo = () => {};

// Polyfill ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Custom Jest DOM matchers
expect.extend({
  toBeInTheDocument(received: HTMLElement | null) {
    const pass = Boolean(
      received &&
      (received.ownerDocument?.body.contains(received) ||
       document.body.contains(received))
    );
    return {
      pass,
      message: () =>
        pass
          ? `expected element not to be in document, but it was found`
          : `expected element to be in document, but received ${received}`,
    };
  },

  toHaveAttribute(received: HTMLElement, attr: string, expectedValue?: string) {
    const hasAttr = received && typeof received.hasAttribute === 'function' && received.hasAttribute(attr);
    const actualValue = hasAttr ? received.getAttribute(attr) : null;
    const pass = Boolean(
      hasAttr && (expectedValue === undefined || actualValue === expectedValue)
    );
    return {
      pass,
      message: () =>
        pass
          ? `expected element not to have attribute '${attr}' with value '${expectedValue}'`
          : `expected element to have attribute '${attr}' with value '${expectedValue}', but got '${actualValue}'`,
    };
  },

  toHaveTextContent(received: HTMLElement, expected: string | RegExp) {
    const text = received ? received.textContent || '' : '';
    const pass = typeof expected === 'string' ? text.includes(expected) : expected.test(text);
    return {
      pass,
      message: () =>
        pass
          ? `expected element not to contain text '${expected}'`
          : `expected element to contain text '${expected}', but got '${text}'`,
    };
  },

  toBeDisabled(received: HTMLElement) {
    const pass = Boolean(
      (received as any).disabled || received.hasAttribute('disabled')
    );
    return {
      pass,
      message: () =>
        pass
          ? `expected element not to be disabled`
          : `expected element to be disabled`,
    };
  },

  toHaveValue(received: HTMLInputElement | HTMLTextAreaElement, expected: any) {
    const pass = received && received.value === String(expected);
    return {
      pass,
      message: () =>
        pass
          ? `expected element not to have value '${expected}'`
          : `expected element to have value '${expected}', but got '${received?.value}'`,
    };
  },
});
