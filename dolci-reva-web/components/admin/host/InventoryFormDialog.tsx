"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type InventoryField =
  | {
      name: string;
      label: string;
      type: "text" | "number";
      required?: boolean;
      placeholder?: string;
    }
  | {
      name: string;
      label: string;
      type: "select";
      required?: boolean;
      options: Array<{ value: string; label: string }>;
    }
  | {
      name: string;
      label: string;
      type: "checkbox";
    };

interface InventoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  fields: InventoryField[];
  initialValues?: Record<string, string | number | boolean | null | undefined>;
  isLoading?: boolean;
  onSubmit: (values: Record<string, string | number | boolean | null>) => void;
}

export function InventoryFormDialog({
  open,
  onOpenChange,
  title,
  fields,
  initialValues,
  isLoading,
  onSubmit,
}: InventoryFormDialogProps) {
  const [values, setValues] = useState<Record<string, string | number | boolean | null>>({});

  useEffect(() => {
    if (!open) return;
    const next: Record<string, string | number | boolean | null> = {};
    fields.forEach((field) => {
      const initial = initialValues?.[field.name];
      if (field.type === "checkbox") {
        next[field.name] = initial !== undefined ? Boolean(initial) : true;
      } else if (field.type === "number") {
        next[field.name] =
          initial !== undefined && initial !== null && initial !== ""
            ? Number(initial)
            : "";
      } else if (field.type === "select") {
        next[field.name] =
          initial !== undefined && initial !== null
            ? String(initial)
            : field.options[0]?.value || "";
      } else {
        next[field.name] =
          initial !== undefined && initial !== null ? String(initial) : "";
      }
    });
    setValues(next);
  }, [open, fields, initialValues]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const payload: Record<string, string | number | boolean | null> = {};
            fields.forEach((field) => {
              const raw = values[field.name];
              if (field.type === "number") {
                payload[field.name] =
                  raw === "" || raw === null || raw === undefined
                    ? null
                    : Number(raw);
              } else if (field.type === "checkbox") {
                payload[field.name] = Boolean(raw);
              } else {
                payload[field.name] = raw === "" ? null : String(raw ?? "");
              }
            });
            onSubmit(payload);
          }}
        >
          {fields.map((field) => (
            <div key={field.name} className="space-y-1.5">
              {field.type !== "checkbox" ? (
                <Label className="text-sm font-semibold text-slate-800">
                  {field.label}
                  {"required" in field && field.required ? (
                    <span className="text-red-500"> *</span>
                  ) : null}
                </Label>
              ) : null}

              {field.type === "text" || field.type === "number" ? (
                <Input
                  type={field.type}
                  required={field.required}
                  placeholder={field.placeholder}
                  value={
                    values[field.name] === null || values[field.name] === undefined
                      ? ""
                      : String(values[field.name])
                  }
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      [field.name]: e.target.value,
                    }))
                  }
                  className="h-11 rounded-none border-slate-200"
                />
              ) : null}

              {field.type === "select" ? (
                <Select
                  value={String(values[field.name] ?? "")}
                  onValueChange={(v) =>
                    setValues((prev) => ({ ...prev, [field.name]: v }))
                  }
                >
                  <SelectTrigger className="!h-11 w-full rounded-none border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}

              {field.type === "checkbox" ? (
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={Boolean(values[field.name])}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        [field.name]: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 accent-[#f08400]"
                  />
                  {field.label}
                </label>
              ) : null}
            </div>
          ))}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-none"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-none bg-[#f08400] text-white hover:bg-[#d87200]"
            >
              {isLoading ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
