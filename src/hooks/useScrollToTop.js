import { useEffect } from "react";

/**
 * Custom hook to scroll to top when component mounts
 * Use this in form components to ensure they always open at the top
 */
export function useScrollToTop() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
}

