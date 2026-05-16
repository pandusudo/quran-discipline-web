import { BookOpen, ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { TopBlockedSite } from "./types";

interface TopAttemptedSitesProps {
  sites: TopBlockedSite[];
  filterLabel: string;
}

export function TopAttemptedSites({
  sites,
  filterLabel,
}: TopAttemptedSitesProps) {
  return (
    <Card
      className="rounded-2xl border border-border"
      style={{
        boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between px-6 pt-6 pb-3">
        <div>
          <CardTitle className="text-sm font-semibold text-[#1a1a1a]">
            Most Attempted Sites
          </CardTitle>
          <CardDescription className="text-xs mt-0.5">
            Sites you tried to visit most {filterLabel.toLowerCase()}
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs rounded-lg hover:bg-[#eef5f1] hover:text-[#3d7a5c] transition-colors"
          asChild
        >
          <Link href="/blocked-sites">
            Manage all <ChevronRight className="size-3 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {sites.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <BookOpen className="size-7 opacity-20" />
            <span>
              No blocked attempts recorded {filterLabel.toLowerCase()}.
            </span>
          </div>
        ) : (
          <div className="space-y-1">
            {sites.map((site, index) => (
              <div
                key={site.domain}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150 hover:bg-[#eef5f1]"
              >
                <span className="text-xs text-muted-foreground w-4 shrink-0 text-center">
                  {index + 1}
                </span>
                <div
                  className="flex size-8 items-center justify-center rounded-lg shrink-0 border border-border"
                  style={{ background: "#faf8f4" }}
                >
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "#6ea88a" }}
                  >
                    {site.domain.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-[#1a1a1a]">
                    {site.domain}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {site.context}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-[#1a1a1a]">
                    {site.blockedCount}
                  </p>
                  <p className="text-[10px] text-muted-foreground">attempts</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
