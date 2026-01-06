import { TrendingUp, TrendingDown, Car } from "lucide-react";

interface TotalSummaryProps {
  total: number;
  onTime: number;
  late: number;
  lost?: number;
  title?: string;
}

export const TotalSummary = ({ total, onTime, late, lost, title = "Resumo Total" }: TotalSummaryProps) => {
  const onTimePercent = total > 0 ? Math.round((onTime / total) * 100) : 0;
  const latePercent = total > 0 ? Math.round((late / total) * 100) : 0;

  return (
    <div className="bg-card/50 rounded-xl border border-border/50 p-5 backdrop-blur-sm">
      <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">{title}</h3>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Car className="w-5 h-5 text-primary" />
            <span className="text-3xl font-black text-foreground">{total}</span>
          </div>
          <span className="text-xs text-muted-foreground">Total de Carros</span>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-success" />
            <span className="text-3xl font-black text-success">{onTime}</span>
          </div>
          <span className="text-xs text-muted-foreground">No Prazo ({onTimePercent}%)</span>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <TrendingDown className="w-5 h-5 text-destructive" />
            <span className="text-3xl font-black text-destructive">{late}</span>
          </div>
          <span className="text-xs text-muted-foreground">Atrasados ({latePercent}%)</span>
        </div>

        {lost !== undefined && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-3xl font-black text-warning">{lost}</span>
            </div>
            <span className="text-xs text-muted-foreground">Perdidos no mês</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden flex">
        <div className="h-full bg-success transition-all duration-1000" style={{ width: `${onTimePercent}%` }} />
        <div className="h-full bg-destructive transition-all duration-1000" style={{ width: `${latePercent}%` }} />
      </div>
    </div>
  );
};
