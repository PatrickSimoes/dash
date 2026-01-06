import Image from "next/image";
import { User } from "lucide-react";
import { GaugeChart } from "./GaugeChart";

interface PersonLeadCardProps {
  name: string;
  photo?: string;
  client?: string;
  prospeccao: number;
  negociacao: number;
  concluidos: number;
}

export const PersonLeadCard = ({ name, photo, client, prospeccao, negociacao, concluidos }: PersonLeadCardProps) => {
  const total = prospeccao + negociacao + concluidos;
  const meta = 10; // Meta semanal: 10 concluídos (2 por dia)
  const clientKey = client?.toLowerCase() ?? "";

  const progress = meta > 0 ? concluidos / meta : 0;
  const gaugeColor = progress >= 1 ? "success" : progress >= 0.7 ? "default" : "warning";
  const clientLogo = clientKey.includes("meli")
    ? "/meli-logo.avif"
    : clientKey.includes("femsa")
    ? "/femsa-logo.png"
    : clientKey.includes("cor") || clientKey.includes("3")
    ? "/coracoes-logo.png"
    : null;

  return (
    <div className="bg-card/50 border border-border/100 rounded-2xl p-4 flex flex-col h-full">
      <div className="mb-3 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          {clientLogo ? (
            <div className="rounded-full p-1">
              <Image src={clientLogo} alt={client ?? "Cliente"} width={100} height={100} />
            </div>
          ) : client ? (
            <span className="rounded-full border border-border/100 bg-card/100 px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{client}</span>
          ) : (
            <span className="h-7 w-7" />
          )}
          {photo ? (
            <div className="rounded-full border border-border/100 bg-card/100 p-1">
              <Image src={photo} alt={name} width={150} height={150} className="rounded-full object-cover" />
            </div>
          ) : (
            <div className="rounded-full border border-border/100 bg-card/100 p-1">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/40">
                <User className="h-7 w-7 text-muted-foreground" />
              </div>
            </div>
          )}
          <div className="w-24">
            <GaugeChart value={concluidos} max={meta} label="Meta" color={gaugeColor} />
          </div>
        </div>
        <h3 className="text-base font-bold text-foreground text-center">{name}</h3>
      </div>

      {/* Lead Status Grid */}
      <div className="grid grid-cols-3 gap-2">
        {/* Prospecção Iniciada */}
        <div className="bg-meli/10 border border-meli/30 rounded-xl p-2 text-center">
          <p className="text-xl font-black text-meli">{prospeccao}</p>
          <p className="text-xs text-muted-foreground">Prospecção</p>
        </div>

        {/* Em Negociação */}
        <div className="bg-warning/10 border border-warning/30 rounded-xl p-2 text-center">
          <p className="text-xl font-black text-warning">{negociacao}</p>
          <p className="text-xs text-muted-foreground">Negociação</p>
        </div>

        {/* Concluídos */}
        <div className="bg-success/10 border border-success/30 rounded-xl p-2 text-center">
          <p className="text-xl font-black text-success">{concluidos}</p>
          <p className="text-xs text-muted-foreground">Concluídos</p>
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-border/100 bg-card/100 p-2 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Total</p>
        <p className="text-2xl font-black text-foreground">{total}</p>
      </div>
    </div>
  );
};
