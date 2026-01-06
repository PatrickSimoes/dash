import Image from "next/image";
import { User } from "lucide-react";

interface PersonDocCardProps {
  name: string;
  photo?: string;
  noPrazo: number;
  atrasados: number;
  total: number;
  leadLoss?: {
    week: Record<string, number>;
    month: Record<string, number>;
  };
  clients: {
    name: string;
    total: number;
    outOfSla: number;
    totalHours: number;
  }[];
}

export const PersonDocCard = ({ name, photo, noPrazo, atrasados, total, clients, leadLoss }: PersonDocCardProps) => {
  const successRate = total > 0 ? Math.round((noPrazo / total) * 100) : 0;
  // const isOnTrack = successRate >= 70;
  const isOnTrack = noPrazo >= atrasados;

  return (
    <div className={`bg-card/50 border rounded-2xl p-4 md:p-5 ${isOnTrack ? "border-success/80" : "border-destructive/30"}`}>
      <div className="flex gap-3 md:gap-4">
        <div className="flex items-center justify-center">
          {photo ? (
            <div className="rounded-full border border-border/60 bg-card/60 p-[2px]">
              <Image src={photo} alt={name} width={120} height={120} className="h-16 w-16 rounded-full object-cover md:h-20 md:w-20" />
            </div>
          ) : (
            <div className="rounded-full border border-border/60 bg-card/60 p-[2px]">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/40 md:h-20 md:w-20">
                <User className="h-7 w-7 text-muted-foreground md:h-8 md:w-8" />
              </div>
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base md:text-lg font-bold text-foreground">{name}</h3>
            </div>
            <div className={`text-xl md:text-2xl font-black ${isOnTrack ? "text-success" : "text-destructive"}`}>{successRate}%</div>
          </div>

          <div className="mt-3 md:mt-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {clients.map((client) => {
                const onTime = Math.max(client.total - client.outOfSla, 0);
                return (
                  <div key={client.name} className="rounded-xl border border-border/60 bg-card/40 p-3 md:p-3.5 h-full">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{client.name}</p>
                      {/* <span className="text-xs text-muted-foreground">{client.totalHours}h</span> */}
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <div className="rounded-lg border border-success/30 bg-success/10 p-2 text-center">
                        <p className="text-base md:text-lg font-black text-success">{onTime}</p>
                        <p className="text-[11px] text-muted-foreground">No prazo</p>
                      </div>
                      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-2 text-center">
                        <p className="text-base md:text-lg font-black text-destructive">{client.outOfSla}</p>
                        <p className="text-[11px] text-muted-foreground">Atrasados</p>
                      </div>
                      <div className="rounded-lg border border-primary bg-primary/10 p-2 text-center">
                        <p className="text-base md:text-lg font-black text-primary">{client.total}</p>
                        <p className="text-[11px] text-muted-foreground">Total</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">Perdidos</p>
                      <div className="mt-1 grid grid-cols-2 gap-2 text-center">
                        <div className="rounded-md border border-warning/40 bg-warning/10 px-2 py-1">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Semana</span>
                            <span className="text-sm font-black text-warning">{leadLoss?.week?.[client.name] ?? 0}</span>
                          </div>
                        </div>
                        <div className="rounded-md border border-warning/40 bg-warning/10 px-2 py-1">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Mes</span>
                            <span className="text-sm font-black text-warning">{leadLoss?.month?.[client.name] ?? 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 md:mt-4 rounded-xl border border-border/60 bg-card/60 p-3">
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] md:text-xs">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Em dia</p>
                <p className="text-lg md:text-xl font-black text-success">{noPrazo}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Total</p>
                <p className="text-lg md:text-xl font-black text-foreground">{total}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Atrasados</p>
                <p className="text-lg md:text-xl font-black text-destructive">{atrasados}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
