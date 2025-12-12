/**
 * Composant Modal générique réutilisable
 * Uniformise l'apparence et le comportement des modals dans l'application
 */

import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GenericModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    disabled?: boolean;
    loading?: boolean;
    className?: string;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    disabled?: boolean;
  };
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

const sizeMap = {
  sm: "sm:max-w-[400px]",
  md: "sm:max-w-[500px]",
  lg: "sm:max-w-[600px]",
  xl: "sm:max-w-[800px]",
  "2xl": "sm:max-w-[1000px]",
};

/**
 * Composant Modal générique
 * 
 * @example
 * ```tsx
 * <GenericModal
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Confirmer la suppression"
 *   description="Cette action est irréversible"
 *   primaryAction={{
 *     label: "Supprimer",
 *     onClick: handleDelete,
 *     variant: "destructive",
 *     loading: isDeleting,
 *   }}
 *   secondaryAction={{
 *     label: "Annuler",
 *     onClick: () => setIsOpen(false),
 *   }}
 * >
 *   <p>Êtes-vous sûr de vouloir supprimer cet élément ?</p>
 * </GenericModal>
 * ```
 */
export function GenericModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  primaryAction,
  secondaryAction,
  size = "md",
  className,
}: GenericModalProps) {
  const hasDefaultFooter = primaryAction || secondaryAction;
  const showFooter = footer !== undefined ? footer : hasDefaultFooter;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(sizeMap[size], className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="py-4">{children}</div>

        {showFooter && (
          <DialogFooter>
            {footer ? (
              footer
            ) : (
              <>
                {secondaryAction && (
                  <Button
                    variant={secondaryAction.variant || "outline"}
                    onClick={secondaryAction.onClick}
                    disabled={secondaryAction.disabled}
                  >
                    {secondaryAction.label}
                  </Button>
                )}
                {primaryAction && (
                  <Button
                    variant={primaryAction.variant || "default"}
                    onClick={primaryAction.onClick}
                    disabled={primaryAction.disabled || primaryAction.loading}
                    className={primaryAction.className}
                  >
                    {primaryAction.loading && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {primaryAction.label}
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}






