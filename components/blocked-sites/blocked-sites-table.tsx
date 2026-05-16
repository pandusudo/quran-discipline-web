"use client";

import { useState } from "react";
import { Search, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BlockConfigDialog,
  blockModeOptions,
} from "@/components/blocked-sites";
import type { BlockedSite } from "@/hooks/use-blocked-sites";

const CATEGORY_COLORS: Record<string, string> = {
  "Social Media": "bg-blue-50 text-blue-700 border-blue-200",
  Entertainment: "bg-purple-50 text-purple-700 border-purple-200",
  Communication: "bg-orange-50 text-orange-700 border-orange-200",
  News: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Other: "bg-muted text-muted-foreground",
};

interface BlockedSitesTableProps {
  sites: BlockedSite[];
  onToggle: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSaveConfig: (
    id: string,
    updates: Pick<
      BlockedSite,
      "blockMode" | "timerSeconds" | "unlockDurationMinutes"
    >,
  ) => Promise<void>;
}

export function BlockedSitesTable({
  sites,
  onToggle,
  onDelete,
  onSaveConfig,
}: BlockedSitesTableProps) {
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = sites.filter(
    (s) =>
      s.domain.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async (id: string) => {
    await onDelete(id);
    setDeleteId(null);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-medium">Block List</CardTitle>
            <CardDescription>
              Toggle, manage, or remove blocked sites.
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search sites..."
              className="pl-8 h-8 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="max-h-115">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 pl-6">Active</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead className="hidden sm:table-cell">Category</TableHead>
                <TableHead className="hidden lg:table-cell">
                  Block Mode
                </TableHead>
                <TableHead className="hidden md:table-cell text-right">
                  Blocked
                </TableHead>
                <TableHead className="hidden md:table-cell text-right">
                  Added
                </TableHead>
                <TableHead className="w-20 pr-6" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-10 text-muted-foreground text-sm"
                  >
                    No sites found.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((site) => {
                const modeOption = blockModeOptions.find(
                  (m) => m.value === (site.blockMode ?? "timer"),
                );

                return (
                  <TableRow key={site.id} className="group">
                    <TableCell className="pl-6">
                      <Switch
                        checked={site.enabled}
                        onCheckedChange={() => onToggle(site.id)}
                        aria-label={`Toggle ${site.domain}`}
                      />
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex size-7 items-center justify-center rounded border bg-muted text-xs font-medium">
                          {site.domain.charAt(0).toUpperCase()}
                        </div>
                        <span
                          className={`text-sm font-medium ${!site.enabled ? "text-muted-foreground line-through" : ""}`}
                        >
                          {site.domain}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        variant="outline"
                        className={`text-xs ${CATEGORY_COLORS[site.category] ?? CATEGORY_COLORS["Other"]}`}
                      >
                        {site.category}
                      </Badge>
                    </TableCell>

                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {modeOption?.icon}
                        <span>{modeOption?.label ?? "Timer"}</span>
                        {site.blockMode !== "hard" && (
                          <span className="text-muted-foreground/60">
                            &middot;{" "}
                            {site.blockMode === "timer"
                              ? `${site.timerSeconds ?? 30}s`
                              : "audio"}{" "}
                            / {site.unlockDurationMinutes ?? 5}min
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="hidden md:table-cell text-right text-sm text-muted-foreground">
                      {site.blockedCount}&times;
                    </TableCell>

                    <TableCell className="hidden md:table-cell text-right text-xs text-muted-foreground">
                      {site.addedAt}
                    </TableCell>

                    <TableCell className="pr-6 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <BlockConfigDialog site={site} onSave={onSaveConfig} />

                        <Dialog
                          open={deleteId === site.id}
                          onOpenChange={(o) => !o && setDeleteId(null)}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-muted-foreground hover:text-destructive"
                              onClick={() => setDeleteId(site.id)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Remove {site.domain}?</DialogTitle>
                              <DialogDescription>
                                This will remove <strong>{site.domain}</strong>{" "}
                                from your block list. You can always add it back
                                later.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setDeleteId(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleDelete(site.id)}
                              >
                                Remove
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
