"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import type { BlockedSite } from "@/hooks/use-blocked-sites";
import { BlockModeFields } from "./block-mode-fields";

const CATEGORIES = [
  "Social Media",
  "Entertainment",
  "Communication",
  "News",
  "Other",
] as const;

// Domain validation regex - matches valid domain names
const DOMAIN_REGEX = /^(?!:\/\/)([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;

const isValidDomain = (domain: string): boolean => {
  const trimmed = domain.trim().toLowerCase();
  const withoutProtocol = trimmed.replace(/^(https?:\/\/)?(www\.)?/, "");

  const domainOnly = withoutProtocol.split("/")[0];
  return DOMAIN_REGEX.test(domainOnly);
};

const normalizeDomain = (domain: string): string => {
  const trimmed = domain.trim().toLowerCase();
  const withoutProtocol = trimmed.replace(/^(https?:\/\/)?(www\.)?/, "");
  return withoutProtocol.split("/")[0];
};

interface AddSiteDialogProps {
  onAdd: (
    domain: string,
    category: string,
    blockMode: BlockedSite["blockMode"],
    timerSeconds: number,
    unlockDurationMinutes: number,
  ) => Promise<void>;
}

export function AddSiteDialog({ onAdd }: AddSiteDialogProps) {
  const [open, setOpen] = useState(false);
  const [domain, setDomain] = useState("");
  const [category, setCategory] = useState<string>("Other");
  const [mode, setMode] = useState<BlockedSite["blockMode"]>("timer");
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [unlockMinutes, setUnlockMinutes] = useState(5);
  const [domainError, setDomainError] = useState<string | null>(null);

  const reset = () => {
    setDomain("");
    setCategory("Other");
    setMode("timer");
    setTimerSeconds(30);
    setUnlockMinutes(5);
    setDomainError(null);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) reset();
    setOpen(isOpen);
  };

  const validateDomain = (value: string): boolean => {
    if (!value.trim()) {
      setDomainError("Domain is required");
      return false;
    }
    if (!isValidDomain(value)) {
      setDomainError("Please enter a valid domain (e.g. twitter.com)");
      return false;
    }
    setDomainError(null);
    return true;
  };

  const handleDomainChange = (value: string) => {
    setDomain(value);
    if (domainError) {
      validateDomain(value);
    }
  };

  const handleDomainBlur = () => {
    if (domain.trim()) {
      validateDomain(domain);
    }
  };

  const handleAdd = async () => {
    if (!validateDomain(domain)) return;
    const normalizedDomain = normalizeDomain(domain);
    await onAdd(normalizedDomain, category, mode, timerSeconds, unlockMinutes);
    reset();
    setOpen(false);
  };

  const isValid = domain.trim() && !domainError;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="size-4" />
          Add Site
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md flex flex-col max-h-[90dvh]">
        <DialogHeader>
          <DialogTitle>Add a Blocked Site</DialogTitle>
          <DialogDescription>
            Enter the domain you want to block and configure how it should be
            blocked.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2 overflow-y-auto flex-1">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Domain</label>
              <Input
                placeholder="e.g. twitter.com"
                value={domain}
                onChange={(e) => handleDomainChange(e.target.value)}
                onBlur={handleDomainBlur}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className={domainError ? "border-destructive" : ""}
              />
              {domainError && (
                <p className="text-sm text-destructive">{domainError}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <BlockModeFields
            mode={mode}
            timerSeconds={timerSeconds}
            unlockMinutes={unlockMinutes}
            onModeChange={setMode}
            onTimerSecondsChange={setTimerSeconds}
            onUnlockMinutesChange={setUnlockMinutes}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!isValid}>
            Add Site
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
