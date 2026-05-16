import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, ShieldOff } from "lucide-react";

interface BlockedStatCardsProps {
  total: number;
  enabled: number;
}

export function BlockedStatCards({ total, enabled }: BlockedStatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Total Sites
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">{total}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-primary" /> Active Blocks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">{enabled}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <ShieldOff className="size-3.5 text-muted-foreground" /> Paused
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">{total - enabled}</p>
        </CardContent>
      </Card>
    </div>
  );
}
