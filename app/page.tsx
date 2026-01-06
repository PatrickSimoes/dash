"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Clock, Users, Flag, Pause, Play, Maximize2, Minimize2 } from "lucide-react";
import { PersonLeadCard } from "./components/PersonLeadCard";
import { PersonDocCard } from "./components/PersonDocCard";
import { StageCard } from "./components/StageCard";
import { TotalSummary } from "./components/TotalSummary";
import { cn } from "./lib/utils";

const rotationMs = 20000;
const pageRotationMs = 7000;
const liberacaoSlaHours = 48;

type ElementSize = { width: number; height: number };

const useViewportSize = () => {
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return size;
};

const useElementSize = <T extends HTMLElement>() => {
  const [node, setNode] = useState<T | null>(null);
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });

  const ref = useCallback((element: T | null) => {
    setNode(element);
  }, []);

  useEffect(() => {
    if (!node) return;
    const updateSize = () => {
      const { width, height } = node.getBoundingClientRect();
      setSize({ width, height });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  return { ref, size };
};

const getSafeHeight = (measured: number, fallback: number, buffer = 16) => {
  const base = Number.isFinite(measured) && measured > 0 ? measured : fallback;
  return Math.ceil(base) + buffer;
};

type CloserItem = {
  name: string;
  photo?: string;
  client?: string;
  prospeccao: number;
  negociacao: number;
  concluidos: number;
};

type DocItem = {
  name: string;
  photo?: string;
  total: number;
  outOfSla: number;
  totalHours: number;
  clients: {
    name: string;
    total: number;
    outOfSla: number;
    totalHours: number;
  }[];
};

type SonarDocClientSummary = {
  total: number;
  totalHours: number;
  outOfSla: number;
};

type SonarDocAdmSummary = {
  id: number;
  username: string;
  photo?: string;
  clients: Record<string, SonarDocClientSummary>;
  total: number;
  totalHours: number;
  outOfSla: number;
};

type LeadLossDocSummary = {
  week: { total: number; byOperation: Record<string, number> };
  month: { total: number; byOperation: Record<string, number> };
};

type CrmDocumentation = {
  documentationData: SonarDocAdmSummary[];
  leadLossDoc: LeadLossDocSummary;
};

type AdmLiberacaoSummary = {
  tasks: { taskId: string; status: string; hoursInStatuses: number; client: string }[];
  byOperation: Record<string, { total: number; percent: number }>;
  onboardingTotal: number;
  onboardingByOperation: Record<string, number>;
  liberacaoPrimeiraEscala: { total: number; byOperation: Record<string, number> };
};

const screens = [
  {
    key: "closer",
    title: "Closer",
    subtitle: "Meta s.",
  },
  {
    key: "documentacao",
    title: "Documentação",
    subtitle: "No prazo vs atrasados por pessoa.",
  },
  {
    key: "liberacao",
    title: "Liberação",
    subtitle: "Etapas administrativas em tempo real.",
  },
];

const ScreenHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="flex flex-col gap-1">
    <div>
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
  </div>
);

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [closerPage, setCloserPage] = useState(0);
  const [docPage, setDocPage] = useState(0);
  const [liberacaoPage, setLiberacaoPage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [closerTeam, setCloserTeam] = useState<CloserItem[]>([]);
  const [closerError, setCloserError] = useState(false);
  const [docTeam, setDocTeam] = useState<DocItem[]>([]);
  const [docError, setDocError] = useState(false);
  const [leadLossDoc, setLeadLossDoc] = useState<LeadLossDocSummary | null>(null);
  const [admLiberacao, setAdmLiberacao] = useState<AdmLiberacaoSummary | null>(null);
  const [admError, setAdmError] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const viewport = useViewportSize();
  const { ref: leadGridRef, size: leadGridSize } = useElementSize<HTMLDivElement>();
  const { ref: leadCardRef, size: leadCardSize } = useElementSize<HTMLDivElement>();
  const { ref: docGridRef, size: docGridSize } = useElementSize<HTMLDivElement>();
  const { ref: docCardRef, size: docCardSize } = useElementSize<HTMLDivElement>();
  const { ref: liberacaoGridRef, size: liberacaoGridSize } = useElementSize<HTMLDivElement>();
  const { ref: liberacaoCardRef, size: liberacaoCardSize } = useElementSize<HTMLDivElement>();

  useEffect(() => {
    const updateFullscreen = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    updateFullscreen();
    document.addEventListener("fullscreenchange", updateFullscreen);
    return () => document.removeEventListener("fullscreenchange", updateFullscreen);
  }, []);

  const handleFullscreenToggle = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Falha ao alternar fullscreen", error);
    }
  }, []);

  const handleScreenChange = useCallback(
    (nextIndex: number) => {
      setActiveIndex(nextIndex);
      if (nextIndex === 0) setCloserPage(0);
      if (nextIndex === 1) setDocPage(0);
      if (nextIndex === 2) setLiberacaoPage(0);
    },
    [setActiveIndex, setCloserPage, setDocPage, setLiberacaoPage]
  );

  useEffect(() => {
    if (!autoRotate) return;
    const interval = window.setInterval(() => {
      handleScreenChange((activeIndex + 1) % screens.length);
    }, rotationMs);

    return () => window.clearInterval(interval);
  }, [autoRotate, activeIndex, handleScreenChange]);

  useEffect(() => {
    const controller = new AbortController();

    const loadCloser = async () => {
      try {
        const response = await fetch(`${baseUrl}/crm/sonar-dash-closer`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          setCloserError(true);
          return;
        }
        const data = (await response.json()) as Array<{
          id: number;
          username: string;
          photo?: string;
          client: string;
          tasks: { taskId: string; status: string }[];
        }>;

        const mapped = data.map((item) => {
          const counts = item.tasks.reduce(
            (acc, task) => {
              const status = task.status.toLowerCase();
              if (status.includes("prospec")) acc.prospeccao += 1;
              else if (status.includes("negoc")) acc.negociacao += 1;
              else if (status.includes("concl") || status.includes("feito")) acc.concluidos += 1;
              return acc;
            },
            { prospeccao: 0, negociacao: 0, concluidos: 0 }
          );

          return {
            name: item.username,
            photo: item.photo,
            client: item.client,
            ...counts,
          };
        });

        if (mapped.length > 0) {
          setCloserTeam(mapped);
          setCloserError(false);
        } else {
          setCloserTeam([]);
          setCloserError(true);
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Erro ao carregar closers", error);
          setCloserError(true);
        }
      }
    };

    loadCloser();
    const refresh = window.setInterval(loadCloser, 30000);

    return () => {
      controller.abort();
      window.clearInterval(refresh);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadDocs = async () => {
      try {
        const response = await fetch(`${baseUrl}/crm/sonar-dash-documentation`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          setDocError(true);
          return;
        }
        const data = (await response.json()) as CrmDocumentation;
        const mapped = (data.documentationData ?? []).map((item) => ({
          name: item.username,
          photo: item.photo,
          total: item.total,
          outOfSla: item.outOfSla,
          totalHours: item.totalHours,
          clients: Object.entries(item.clients ?? {}).map(([name, summary]) => ({
            name,
            total: summary.total,
            outOfSla: summary.outOfSla,
            totalHours: summary.totalHours,
          })),
        }));

        setLeadLossDoc(data.leadLossDoc ?? null);

        if (mapped.length > 0) {
          setDocTeam(mapped);
          setDocError(false);
        } else {
          setDocTeam([]);
          setDocError(true);
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Erro ao carregar documentação", error);
          setDocError(true);
        }
      }
    };

    loadDocs();
    const refresh = window.setInterval(loadDocs, 30000);

    return () => {
      controller.abort();
      window.clearInterval(refresh);
    };
  }, [baseUrl]);

  useEffect(() => {
    const controller = new AbortController();

    const loadAdmLiberacao = async () => {
      try {
        const response = await fetch(`${baseUrl}/crm/sonar-dash-adm-liberacao`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          setAdmError(true);
          return;
        }

        const data = (await response.json()) as AdmLiberacaoSummary;
        setAdmLiberacao(data);
        setAdmError(false);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Erro ao carregar ADM - Liberação", error);
          setAdmError(true);
        }
      }
    };

    loadAdmLiberacao();
    const refresh = window.setInterval(loadAdmLiberacao, 30000);

    return () => {
      controller.abort();
      window.clearInterval(refresh);
    };
  }, [baseUrl]);

  const leadTotals = useMemo(() => {
    return closerTeam.reduce(
      (acc, item) => ({
        prospeccao: acc.prospeccao + item.prospeccao,
        negociacao: acc.negociacao + item.negociacao,
        concluidos: acc.concluidos + item.concluidos,
      }),
      { prospeccao: 0, negociacao: 0, concluidos: 0 }
    );
  }, [closerTeam]);

  const docTotals = useMemo(() => {
    return docTeam.reduce(
      (acc, item) => ({
        noPrazo: acc.noPrazo + Math.max(item.total - item.outOfSla, 0),
        atrasados: acc.atrasados + item.outOfSla,
        total: acc.total + item.total,
        totalHours: acc.totalHours + item.totalHours,
      }),
      { noPrazo: 0, atrasados: 0, total: 0, totalHours: 0 }
    );
  }, [docTeam]);
  const isSingleDocCard = docTeam.length === 1;

  const admTotals = useMemo(() => {
    const tasks = admLiberacao?.tasks ?? [];
    return tasks.reduce(
      (acc, task) => {
        const onTime = task.hoursInStatuses <= liberacaoSlaHours;
        return {
          total: acc.total + 1,
          onTime: acc.onTime + (onTime ? 1 : 0),
          late: acc.late + (onTime ? 0 : 1),
        };
      },
      { total: 0, onTime: 0, late: 0 }
    );
  }, [admLiberacao]);

  const liberacaoStages = useMemo(() => {
    const tasks = admLiberacao?.tasks ?? [];
    const stageOrder = ["Pagamento GR", "Análise GR", "Contrato", "Cadastro"];

    const normalizeStage = (status: string) => {
      const text = status.toLowerCase();
      if (text.includes("pag")) return "Pagamento GR";
      if (text.includes("anal")) return "Análise GR";
      if (text.includes("contr")) return "Contrato";
      if (text.includes("cad")) return "Cadastro";
      if (text.includes("aguard") && text.includes("escala")) return "Aguardando primeira escala";
      if (text.includes("motorista")) return "Motorista ativo";
      return status;
    };

    const resolveColor = (operation: string) => {
      const key = operation.toLowerCase();
      if (key.includes("meli") || key.includes("mercado")) return "meli" as const;
      if (key.includes("femsa")) return "femsa" as const;
      if (key.includes("cora") || key.includes("3")) return "coracoes" as const;
      return "neutral" as const;
    };

    const operationMap = new Map<
      string,
      {
        color: "meli" | "femsa" | "coracoes" | "neutral";
        stages: Record<string, { total: number; onTime: number; late: number }>;
      }
    >();

    const operationNames = new Set<string>([
      ...Object.keys(admLiberacao?.byOperation ?? {}),
      ...Object.keys(admLiberacao?.onboardingByOperation ?? {}),
      ...Object.keys(admLiberacao?.liberacaoPrimeiraEscala?.byOperation ?? {}),
    ]);

    operationNames.forEach((operation) => {
      if (!operationMap.has(operation)) {
        operationMap.set(operation, { color: resolveColor(operation), stages: {} });
      }
    });

    tasks.forEach((task) => {
      const operation = String(task.client ?? "Operacao");
      const stageName = normalizeStage(task.status);
      const onTime = task.hoursInStatuses <= liberacaoSlaHours;
      const existing = operationMap.get(operation) ?? { color: resolveColor(operation), stages: {} };
      const stage = existing.stages[stageName] ?? { total: 0, onTime: 0, late: 0 };
      existing.stages[stageName] = {
        total: stage.total + 1,
        onTime: stage.onTime + (onTime ? 1 : 0),
        late: stage.late + (onTime ? 0 : 1),
      };
      operationMap.set(operation, existing);
    });

    const orderPriority = ["Mercado Livre", "Femsa", "3Corações"];
    return Array.from(operationMap.entries())
      .sort(([a], [b]) => {
        const aIndex = orderPriority.findIndex((name) => a.toLowerCase().includes(name.toLowerCase()));
        const bIndex = orderPriority.findIndex((name) => b.toLowerCase().includes(name.toLowerCase()));
        if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      })
      .map(([operationName, payload]) => {
        const stages = stageOrder.map((stage) => ({
          name: stage,
          total: payload.stages[stage]?.total ?? 0,
          onTime: payload.stages[stage]?.onTime ?? 0,
          late: payload.stages[stage]?.late ?? 0,
        }));

        return {
          operationName,
          color: payload.color,
          stages,
        };
      });
  }, [admLiberacao]);

  const isShortHeight = viewport.height > 0 && viewport.height <= 900;
  const leadColumns = viewport.width >= 1024 ? 3 : viewport.width >= 768 ? 2 : 1;
  const docColumns = isSingleDocCard ? 1 : viewport.width >= 1024 ? 2 : 1;
  const liberacaoColumns = viewport.width >= 1024 ? 3 : 1;
  const gridGap = isShortHeight ? 12 : 16;

  const leadCardHeight = getSafeHeight(leadCardSize.height, 280);
  const leadRows = Math.max(1, Math.floor((leadGridSize.height + gridGap) / (leadCardHeight + gridGap)));
  const leadPageSize = Math.max(1, Math.max(leadRows * leadColumns, closerTeam.length));
  const closerPageCount = Math.max(1, Math.ceil(closerTeam.length / leadPageSize));
  const safeCloserPage = closerPage % closerPageCount;
  const closerPageItems = closerTeam.slice(safeCloserPage * leadPageSize, safeCloserPage * leadPageSize + leadPageSize);

  const docCardHeight = getSafeHeight(docCardSize.height, 420);
  const docRows = Math.max(1, Math.floor((docGridSize.height + gridGap) / (docCardHeight + gridGap)));
  const docPageSize = Math.max(1, Math.min(docRows * docColumns, 2));
  const docPageCount = Math.max(1, Math.ceil(docTeam.length / docPageSize));
  const safeDocPage = docPage % docPageCount;
  const docPageItems = docTeam.slice(safeDocPage * docPageSize, safeDocPage * docPageSize + docPageSize);

  const liberacaoCardHeight = getSafeHeight(liberacaoCardSize.height, 320);
  const liberacaoRows = Math.max(1, Math.floor((liberacaoGridSize.height + gridGap) / (liberacaoCardHeight + gridGap)));
  const liberacaoPageSize = Math.max(1, liberacaoRows * liberacaoColumns);
  const liberacaoPageCount = Math.max(1, Math.ceil(liberacaoStages.length / liberacaoPageSize));
  const safeLiberacaoPage = liberacaoPage % liberacaoPageCount;
  const liberacaoPageItems = liberacaoStages.slice(
    safeLiberacaoPage * liberacaoPageSize,
    safeLiberacaoPage * liberacaoPageSize + liberacaoPageSize
  );

  useEffect(() => {
    if (!autoRotate) return;
    const interval = window.setInterval(() => {
      if (activeIndex === 0 && closerPageCount > 1) {
        setCloserPage((prev) => (prev + 1) % closerPageCount);
        return;
      }
      if (activeIndex === 1 && docPageCount > 1) {
        setDocPage((prev) => (prev + 1) % docPageCount);
        return;
      }
      if (activeIndex === 2 && liberacaoPageCount > 1) {
        setLiberacaoPage((prev) => (prev + 1) % liberacaoPageCount);
      }
    }, pageRotationMs);

    return () => window.clearInterval(interval);
  }, [autoRotate, activeIndex, closerPageCount, docPageCount, liberacaoPageCount]);

  return (
    <div className="relative grid h-[100dvh] grid-rows-[auto_1fr] overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(74,163,255,0.22),_transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_75%,_rgba(44,91,171,0.22),_transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,_rgba(20,38,84,0.45),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(8,18,40,0.75),_rgba(10,14,27,0.6))] screen-glow" />
      </div>

      <header className={cn("relative z-10 px-6 lg:px-8", isShortHeight ? "pt-2" : "pt-4")}>
        <div className={cn("grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2", isShortHeight ? "mt-2" : "mt-3")}>
          <div className="flex items-center">
            <button
              type="button"
              onClick={handleFullscreenToggle}
              className="rounded-full border border-border/40 bg-card/20 p-2 text-muted-foreground transition hover:border-border/60 hover:text-foreground"
              aria-pressed={isFullscreen}
              aria-label={isFullscreen ? "Sair de tela cheia" : "Entrar em tela cheia"}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {screens.map((screen, index) => (
              <button
                key={screen.key}
                type="button"
                onClick={() => handleScreenChange(index)}
                className={cn(
                  "relative flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider transition",
                  index === activeIndex ? "border-primary/40 bg-primary/10 text-primary" : "border-border/60 bg-card/40 text-muted-foreground hover:text-foreground"
                )}
                aria-pressed={index === activeIndex}
              >
                <span>{screen.title}</span>
                <span className={cn("h-1.5 w-1.5 rounded-full", index === activeIndex ? "bg-primary" : "bg-muted-foreground")} />
              </button>
            ))}
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setAutoRotate((prev) => !prev)}
              className="rounded-full border border-border/40 bg-card/20 p-2 text-muted-foreground transition hover:border-border/60 hover:text-foreground"
              aria-pressed={!autoRotate}
              aria-label={autoRotate ? "Pausar rotacao de telas" : "Retomar rotacao de telas"}
            >
              {autoRotate ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className={cn("relative z-10 h-full min-h-0 px-6 lg:px-12", isShortHeight ? "pb-4 pt-3" : "pb-8 pt-4")}>
        <div className="relative h-full min-h-0">
          <section className={cn("absolute inset-0 transition-all duration-700", activeIndex === 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 pointer-events-none")}>
            <div className={cn("flex h-full flex-col", isShortHeight ? "gap-3" : "gap-4")}>
              <div className={cn("flex flex-col lg:flex-row lg:items-end lg:justify-between", isShortHeight ? "gap-3" : "gap-4")}>
                <ScreenHeader title={screens[0].title} subtitle={screens[0].subtitle} />
                <div className={cn("grid w-full max-w-xl grid-cols-3", isShortHeight ? "gap-2" : "gap-3")}>
                  {[
                    { label: "Meta", value: 10, tone: "meli" },
                    { label: "Concluídos", value: leadTotals.concluidos, tone: "success" },
                    { label: "%", value: ((leadTotals.concluidos / 10) * 100).toFixed(2), tone: "success" },
                  ].map((item, index) => (
                    <div
                      key={item.label}
                      className={cn(
                        "rounded-2xl border bg-card/60 text-center backdrop-blur-sm",
                        isShortHeight ? "p-2" : "p-3",
                        item.tone === "meli" && "border-meli/50",
                        item.tone === "warning" && "border-warning/50",
                        item.tone === "success" && "border-success/50",
                        "fade-up"
                      )}
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{item.label}</p>
                      <p
                        className={cn(
                          "text-2xl font-black",
                          item.tone === "meli" && "text-meli",
                          item.tone === "warning" && "text-warning",
                          item.tone === "success" && "text-success"
                        )}
                      >
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 min-h-0">
                {closerError ? (
                  <div className="flex h-full min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border border-border/60 bg-card/50 text-center">
                    <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Dados nao encontrados</p>
                    <p className="text-2xl font-semibold text-foreground">Verifique a API do Closer</p>
                  </div>
                ) : (
                  <div ref={leadGridRef} className={cn("grid h-full content-start md:grid-cols-2 lg:grid-cols-3", isShortHeight ? "gap-3" : "gap-4")}>
                    {closerPageItems.map((person, index) => (
                      <div
                        key={person.name}
                        ref={index === 0 ? leadCardRef : undefined}
                        className="fade-up"
                        style={{ animationDelay: `${index * 90}ms` }}
                      >
                        <PersonLeadCard {...person} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className={cn("absolute inset-0 transition-all duration-700", activeIndex === 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 pointer-events-none")}>
            <div className={cn("flex h-full flex-col", isShortHeight ? "gap-3" : "gap-4")}>
              <div className={cn("flex flex-col lg:flex-row lg:items-end lg:justify-between", isShortHeight ? "gap-3" : "gap-4")}>
                <ScreenHeader title={screens[1].title} subtitle={screens[1].subtitle} />
                <div className={cn("flex flex-wrap", isShortHeight ? "gap-2" : "gap-3")}>
                  <div className={cn("rounded-2xl border border-success/30 bg-card/60 text-center backdrop-blur-sm fade-up", isShortHeight ? "px-3 py-2" : "px-4 py-3")}>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">No prazo</p>
                    <p className="text-2xl font-black text-success">{docTotals.noPrazo}</p>
                  </div>
                  <div className={cn("rounded-2xl border border-destructive/30 bg-card/60 text-center backdrop-blur-sm fade-up", isShortHeight ? "px-3 py-2" : "px-4 py-3")}>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Atrasados</p>
                    <p className="text-2xl font-black text-destructive">{docTotals.atrasados}</p>
                  </div>
                  <div className={cn("rounded-2xl border border-border/50 bg-card/60 text-center backdrop-blur-sm fade-up", isShortHeight ? "px-3 py-2" : "px-4 py-3")}>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Total</p>
                    <p className="text-2xl font-black text-foreground">{docTotals.total}</p>
                  </div>
                </div>
              </div>

              {docError ? (
                <div className="flex flex-1 min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border border-border/60 bg-card/50 text-center">
                  <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Dados nao encontrados</p>
                  <p className="text-2xl font-semibold text-foreground">Verifique a API da Documentacao</p>
                </div>
              ) : (
                <div className={cn("flex flex-1 min-h-0 flex-col", isShortHeight ? "gap-3" : "gap-4")}>
                  <div ref={docGridRef} className={cn("grid h-full content-start", isSingleDocCard ? "lg:grid-cols-1" : "lg:grid-cols-2", isShortHeight ? "gap-3" : "gap-4")}>
                    {docPageItems.map((person, index) => (
                      <div
                        key={person.name}
                        ref={index === 0 ? docCardRef : undefined}
                        className={cn("fade-up w-full", isSingleDocCard && "mx-auto max-w-2xl")}
                        style={{ animationDelay: `${index * 90}ms` }}
                      >
                        <PersonDocCard
                          name={person.name}
                          photo={person.photo}
                          total={person.total}
                          noPrazo={Math.max(person.total - person.outOfSla, 0)}
                          atrasados={person.outOfSla}
                          leadLoss={leadLossDoc ? { week: leadLossDoc.week.byOperation, month: leadLossDoc.month.byOperation } : undefined}
                          clients={person.clients}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className={cn("absolute inset-0 transition-all duration-700", activeIndex === 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 pointer-events-none")}>
            <div className={cn("flex h-full flex-col", isShortHeight ? "gap-3" : "gap-4")}>
              <div className={cn("flex flex-col lg:flex-row lg:items-end lg:justify-between", isShortHeight ? "gap-3" : "gap-4")}>
                <ScreenHeader title="ADM - Liberação" subtitle={screens[2].subtitle} />
                <div className={cn("grid w-full max-w-3xl grid-cols-1 sm:grid-cols-4", isShortHeight ? "gap-2" : "gap-3")}>
                  <div className={cn("rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm fade-up", isShortHeight ? "px-3 py-2" : "px-4 py-3")}>
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Onboarding</p>
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <p className="mt-2 text-2xl font-black text-foreground">{admLiberacao?.onboardingTotal ?? 0}</p>
                  </div>
                  <div className={cn("rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm fade-up", isShortHeight ? "px-3 py-2" : "px-4 py-3")}>
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Primeira Escala</p>
                      <Flag className="h-4 w-4 text-primary" />
                    </div>
                    <p className="mt-2 text-2xl font-black text-foreground">{admLiberacao?.liberacaoPrimeiraEscala?.total ?? 0}</p>
                  </div>
                  <div className={cn("rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm fade-up", isShortHeight ? "px-3 py-2" : "px-4 py-3")}>
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Total</p>
                    </div>
                    <p className="mt-2 text-2xl font-black text-foreground">{admTotals.total}</p>
                  </div>
                  <div className={cn("rounded-2xl border border-warning/30 bg-card/60 backdrop-blur-sm fade-up", isShortHeight ? "px-3 py-2" : "px-4 py-3")}>
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Prazo</p>
                      <Clock className="h-4 w-4 text-warning" />
                    </div>
                    <p className="mt-2 text-2xl font-black text-warning">{liberacaoSlaHours}h</p>
                  </div>
                </div>
              </div>

              {admError ? (
                <div className="flex flex-1 min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border border-border/60 bg-card/50 text-center">
                  <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Dados nao encontrados</p>
                  <p className="text-2xl font-semibold text-foreground">Verifique a API de Liberação</p>
                </div>
              ) : (
                <div className={cn("flex flex-1 min-h-0 flex-col", isShortHeight ? "gap-3" : "gap-4")}>
                  <div ref={liberacaoGridRef} className={cn("grid flex-1 min-h-0 content-start lg:grid-cols-3", isShortHeight ? "gap-3" : "gap-4")}>
                    {liberacaoPageItems.map((operation, index) => (
                      <div
                        key={operation.operationName}
                        ref={index === 0 ? liberacaoCardRef : undefined}
                        className="fade-up"
                        style={{ animationDelay: `${index * 90}ms` }}
                      >
                        <StageCard {...operation} />
                      </div>
                    ))}
                  </div>

                  <div className="rounded-3xl border border-border/50 bg-card/30 p-4 backdrop-blur-sm">
                    <TotalSummary total={admTotals.total} onTime={admTotals.onTime} late={admTotals.late} title="Resumo geral - Liberação" />
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
