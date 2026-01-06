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
    <div className={`bg-card/50 border rounded-2xl p-5 ${isOnTrack ? "border-success/80" : "border-destructive/30"}`}>
      <div className="flex gap-4">
        <div className="flex items-center justify-center">
          {photo ? (
            <div className="rounded-full border border-border/60 bg-card/60 p-1">
              <Image src={photo} alt={name} width={150} height={150} className="rounded-full object-cover" />
            </div>
          ) : (
            <div className="rounded-full border border-border/60 bg-card/60 p-1">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/40">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-foreground">{name}</h3>
            </div>
            <div className={`text-2xl font-black ${isOnTrack ? "text-success" : "text-destructive"}`}>{successRate}%</div>
          </div>

          <div className="mt-4 space-y-3">
            {clients.map((client) => {
              const onTime = Math.max(client.total - client.outOfSla, 0);
              return (
                <div key={client.name} className="rounded-xl border border-border/60 bg-card/40 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{client.name}</p>
                    {/* <span className="text-xs text-muted-foreground">{client.totalHours}h</span> */}
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <div className="rounded-lg border border-success/30 bg-success/10 p-2 text-center">
                      <p className="text-lg font-black text-success">{onTime}</p>
                      <p className="text-xs text-muted-foreground">No prazo</p>
                    </div>
                    <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-2 text-center">
                      <p className="text-lg font-black text-destructive">{client.outOfSla}</p>
                      <p className="text-xs text-muted-foreground">Atrasados</p>
                    </div>
                    <div className="rounded-lg border border-primary bg-primary/10 p-2 text-center">
                      <p className="text-lg font-black text-primary">{client.total}</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">Perdidos</p>
                    <div className="mt-1 grid grid-cols-2 gap-2 text-center">
                      <div className="rounded-md border border-warning/40 bg-warning/10 px-2 py-1">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Semana</span>
                          <span className="text-sm font-black text-warning">{leadLoss?.week?.[client.name] ?? 0}</span>
                        </div>
                      </div>
                      <div className="rounded-md border border-warning/40 bg-warning/10 px-2 py-1">
                        <div className="flex items-center justify-center gap-2">
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

          <div className="mt-4 rounded-xl border border-border/60 bg-card/60 p-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Em dia</p>
                <p className="text-xl font-black text-success">{noPrazo}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Total</p>
                <p className="text-xl font-black text-foreground">{total}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Atrasados</p>
                <p className="text-xl font-black text-destructive">{atrasados}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
