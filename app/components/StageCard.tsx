import Image from "next/image";

interface StageData {
  name: string;
  total: number;
  onTime: number;
  late: number;
}

interface StageCardProps {
  operationName: string;
  stages: StageData[];
  color: "meli" | "femsa" | "coracoes" | "neutral";
}

const colorStyles = {
  meli: {
    border: "border-meli/30",
    bg: "bg-meli/10",
    text: "text-meli",
    glow: "card-glow-meli",
    accent: "bg-meli/15",
    stageBg: "bg-meli/15",
  },
  femsa: {
    border: "border-femsa/50",
    bg: "bg-femsa/12",
    text: "text-femsa",
    glow: "card-glow-femsa",
    accent: "bg-femsa/25",
    stageBg: "bg-femsa/20",
  },
  coracoes: {
    border: "border-coracoes/60",
    bg: "bg-coracoes/18",
    text: "text-coracoes",
    glow: "card-glow-coracoes",
    accent: "bg-coracoes/35",
    stageBg: "bg-coracoes/25",
  },
  neutral: {
    border: "border-border/40",
    bg: "bg-card/40",
    text: "text-foreground",
    glow: "",
    accent: "bg-muted/60",
    stageBg: "bg-muted/30",
  },
};

const logoMap = {
  meli: "/meli-logo.avif",
  femsa: "/femsa-logo.png",
  coracoes: "/coracoes-logo.png",
  neutral: null,
};

export const StageCard = ({ operationName, stages, color }: StageCardProps) => {
  const styles = colorStyles[color];
  const logo = logoMap[color];
  const showTotalStages = new Set(["Pagamento GR", "Análise GR", "Contrato", "Cadastro"]);

  return (
    <div className={`rounded-xl border ${styles.border} ${styles.bg} ${styles.glow} p-3 backdrop-blur-sm`}>
      <div className="mb-3 flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${styles.accent}`}>
          {logo ? (
            <Image src={logo} alt={operationName} width={32} height={32} className="rounded" />
          ) : (
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">OP</span>
          )}
        </div>
        <h3 className={`text-sm font-bold ${styles.text}`}>{operationName}</h3>
      </div>

      <div className="space-y-2">
        {stages.map((stage, index) => (
          <div key={`${stage.name}-${index}`} className={`${styles.stageBg} rounded-lg p-2.5`}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground">{stage.name}</span>
              {showTotalStages.has(stage.name) && (
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${styles.text} ${styles.border} ${styles.bg}`}>
                  {stage.onTime + stage.late}
                </span>
              )}
            </div>
            <div className="flex gap-1.5">
              <div className="flex items-center gap-1.5 rounded bg-success/20 px-2 py-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-success">No prazo</span>
                <span className="text-[11px] font-semibold text-success">{stage.onTime}</span>
              </div>
              <div className="flex items-center gap-1.5 rounded bg-destructive/20 px-2 py-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-destructive">Atrasado</span>
                <span className="text-[11px] font-semibold text-destructive">{stage.late}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
