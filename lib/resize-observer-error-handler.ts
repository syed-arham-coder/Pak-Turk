// Utility function to suppress ResizeObserver errors
export const suppressResizeObserverError = () => {
  const originalError = console.error;
  console.error = (...args) => {
    if (args[0]?.includes?.('ResizeObserver')) {
      return;
    }
    originalError.apply(console, args);
  };
};

// Debounce utility function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};
