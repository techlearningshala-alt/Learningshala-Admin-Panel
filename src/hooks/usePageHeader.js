import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PermissionGuard from "@/components/common/PermissionGuard";
import { useHeader } from "@/context/HeaderContext";

/**
 * Custom hook to manage page header with action button and total count
 * @param {Object} options
 * @param {string} options.buttonText - Text to display on the action button
 * @param {Function} options.onClick - Click handler for the action button
 * @param {number} options.total - Total count to display in header
 * @param {boolean} options.showForm - Whether the form is currently shown
 * @param {string} [options.buttonClassName] - Optional custom className for the button
 */
export function usePageHeader({ buttonText, onClick, total, showForm, buttonClassName }) {
  const { setActionButton, setTotalCount } = useHeader();
  const router = useRouter();
  const onClickRef = useRef(onClick);

  // Keep onClick ref updated
  useEffect(() => {
    onClickRef.current = onClick;
  }, [onClick]);

  useEffect(() => {
    if (!showForm) {
      const defaultClassName = "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white";
      const actionBtn = (
        <PermissionGuard permission="create">
          <Button 
            onClick={() => onClickRef.current()}
            className={buttonClassName || defaultClassName}
          >
            <Plus className="mr-2 h-3 w-5" /> {buttonText}
          </Button>
        </PermissionGuard>
      );
      setActionButton(actionBtn);
      setTotalCount(total);
    } else {
      setActionButton(null);
      setTotalCount(null);
    }

    // Cleanup: clear action button and total count when component unmounts or route changes
    return () => {
      setActionButton(null);
      setTotalCount(null);
    };
  }, [setActionButton, setTotalCount, total, showForm, buttonText, buttonClassName, router.pathname]);
}
