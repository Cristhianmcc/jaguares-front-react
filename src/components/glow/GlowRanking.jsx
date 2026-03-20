import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Sparkles } from "lucide-react";

const API_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:3002"
  : "https://api.jaguarescar.com";

const fallbackRanking = [
  { rank: 1, name: "Valentina Lopez", discipline: "Futbol Femenino", points: 2840 },
  { rank: 2, name: "Matias Gonzalez", discipline: "Basquet", points: 2650 },
  { rank: 3, name: "Camila Rodriguez", discipline: "Voley", points: 2510 },
  { rank: 4, name: "Lucas Fernandez", discipline: "Futbol", points: 2380 },
  { rank: 5, name: "Sofia Martinez", discipline: "Funcional Mixto", points: 2250 },
  { rank: 6, name: "Tomas Herrera", discipline: "Futbol", points: 2100 },
  { rank: 7, name: "Carolina Diaz", discipline: "Mamas Fit", points: 1980 },
  { rank: 8, name: "Nicolas Ruiz", discipline: "Basquet", points: 1870 }
];

const SparkleParticle = ({ index, total }) => {
  const angle = (index / total) * Math.PI * 2;
  const distance = 80 + ((index * 17) % 60);
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;
  const colors = ["hsl(24 95% 53%)", "hsl(35 100% 55%)", "hsl(45 100% 65%)", "hsl(0 0% 100%)", "hsl(15 90% 60%)"];
  const color = colors[index % colors.length];
  const size = 2 + (index % 3);

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 rounded-full pointer-events-none"
      style={{ background: color, width: size, height: size }}
      initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      animate={{
        x: [0, x * 0.6, x, x * 1.3],
        y: [0, y * 0.6, y, y * 1.3 + 30],
        scale: [0, 1.5, 1.2, 0],
        opacity: [1, 1, 0.8, 0]
      }}
      transition={{ duration: 1.5, delay: (index % 5) * 0.08, repeat: Infinity, repeatDelay: 0.8 }}
    />
  );
};

const FireworksOverlay = () => (
  <div className="absolute -inset-16 overflow-visible pointer-events-none z-10">
    {Array.from({ length: 24 }).map((_, i) => (
      <SparkleParticle key={i} index={i} total={24} />
    ))}
  </div>
);

const SideBurst = ({ side = "left" }) => {
  const direction = side === "left" ? -1 : 1;

  return (
    <div className={`absolute top-6 ${side === "left" ? "-left-10" : "-right-10"} pointer-events-none z-20`}>
      {Array.from({ length: 12 }).map((_, i) => {
        const x = direction * (40 + (i % 4) * 22);
        const y = -20 - ((i * 13) % 90);
        const size = 2 + (i % 3);
        const color = ["hsl(24 95% 53%)", "hsl(35 100% 55%)", "hsl(0 0% 100%)"][i % 3];

        return (
          <motion.div
            key={`${side}-${i}`}
            className="absolute rounded-full"
            style={{ width: size, height: size, background: color }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{ x: [0, x], y: [0, y], opacity: [0, 1, 0], scale: [0, 1.3, 0] }}
            transition={{ duration: 0.9, delay: i * 0.04, ease: "easeOut", repeat: Infinity, repeatDelay: 0.65 }}
          />
        );
      })}
    </div>
  );
};

const ChampionFlash = ({ isActive }) => (
  <motion.div
    className="pointer-events-none absolute inset-0 z-0"
    style={{
      background:
        "radial-gradient(circle at 50% 38%, hsla(35 100% 60% / 0.45) 0%, hsla(24 95% 53% / 0.18) 28%, transparent 65%)"
    }}
    initial={{ opacity: 0 }}
    animate={isActive ? { opacity: [0, 1, 0.35, 0.8, 0.15, 0] } : { opacity: 0 }}
    transition={{ duration: 1.7, ease: "easeInOut" }}
  />
);

const PodiumCard = ({ student, position, isActive, isChampionBurst }) => {
  const heights = { 1: "h-64", 2: "h-40", 3: "h-36" };
  const orders = { 1: "order-2", 2: "order-1", 3: "order-3" };
  const podiumTheme = {
    1: {
      badge: "bg-gradient-to-b from-yellow-300 via-yellow-400 to-amber-500 shadow-[0_0_28px_hsla(45_95%_58%_/_0.45)]",
      block: "bg-gradient-to-b from-yellow-300/95 to-amber-500/90 border-yellow-200/40",
      number: "text-amber-100/70",
      medalText: "text-yellow-100"
    },
    2: {
      badge: "bg-gradient-to-b from-slate-200 via-slate-300 to-blue-300 shadow-[0_0_20px_hsla(214_45%_75%_/_0.35)]",
      block: "bg-gradient-to-b from-slate-300/95 to-slate-500/85 border-slate-200/30",
      number: "text-slate-100/70",
      medalText: "text-slate-100"
    },
    3: {
      badge: "bg-gradient-to-b from-amber-500 via-orange-700 to-stone-800 shadow-[0_0_18px_hsla(24_55%_42%_/_0.35)]",
      block: "bg-gradient-to-b from-orange-700/90 to-stone-900/90 border-orange-500/25",
      number: "text-orange-100/65",
      medalText: "text-orange-100"
    }
  };
  const medalLabels = { 1: "#1", 2: "#2", 3: "#3" };

  const entryInitialByPosition = {
    1: { opacity: 0, y: -220, scale: 0.82, rotate: -6 },
    2: { opacity: 0, x: -60, y: 85, scale: 0.9, rotate: -4 },
    3: { opacity: 0, y: 115, scale: 0.88, rotate: 3 }
  };

  const entryAnimateByPosition = {
    1: isActive
      ? {
          opacity: 1,
          y: 0,
          scale: 1,
          rotate: 0,
          x: isChampionBurst ? [0, -5, 5, -3, 3, 0] : 0
        }
      : entryInitialByPosition[1],
    2: isActive
      ? { opacity: 1, x: 0, y: 0, scale: [0.92, 1.04, 1], rotate: [0, -2, 0] }
      : entryInitialByPosition[2],
    3: isActive
      ? { opacity: 1, y: 0, scale: 1, rotate: 0 }
      : entryInitialByPosition[3]
  };

  return (
    <motion.div
      className={`flex flex-col items-center ${orders[position]}`}
      initial={entryInitialByPosition[position]}
      animate={entryAnimateByPosition[position]}
      transition={
        position === 1
          ? { duration: 1.2, ease: [0.18, 0.85, 0.2, 1] }
          : position === 2
            ? { duration: 1.05, ease: [0.22, 1, 0.36, 1] }
            : { duration: 1.15, ease: [0.2, 0.95, 0.25, 1] }
      }
    >
      <motion.div className="relative mb-4" whileHover={{ scale: 1.06 }}>
        {position === 1 && isChampionBurst && <FireworksOverlay />}
        {position === 1 && isChampionBurst && <SideBurst side="left" />}
        {position === 1 && isChampionBurst && <SideBurst side="right" />}
        {position === 1 && isChampionBurst && (
          <motion.div
            className="pointer-events-none absolute -inset-10 rounded-full"
            style={{ background: "radial-gradient(circle, hsla(24 95% 53% / 0.38) 0%, hsla(24 95% 53% / 0.12) 45%, transparent 72%)" }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0.35, 0.85, 0.35], scale: [0.85, 1.25, 0.95] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <div className={`relative flex h-20 w-20 items-center justify-center rounded-full ${podiumTheme[position].badge} font-display text-2xl text-primary-foreground md:h-24 md:w-24`}>
          {student.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
        </div>
        <span className={`absolute -bottom-1 -right-1 rounded-full bg-background/85 px-2 py-0.5 text-xs font-semibold ${podiumTheme[position].medalText}`}>{medalLabels[position]}</span>
        {position === 1 && isChampionBurst && (
          <motion.div className="absolute -top-2 left-1/2 -translate-x-1/2" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: -5 }}>
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          </motion.div>
        )}
      </motion.div>

      <p className="text-center font-semibold text-sm md:text-base">{student.name}</p>
      <p className="text-xs text-muted-foreground">{student.discipline}</p>
      <p className="mt-1 font-display text-2xl text-gradient">{student.points}</p>

      <motion.div
        className={`mt-4 w-28 rounded-t-xl border md:w-36 ${heights[position]} flex items-center justify-center ${podiumTheme[position].block}`}
        initial={{ opacity: 0, scaleY: 0.1, y: 40 }}
        animate={isActive ? { opacity: 1, scaleY: 1, y: 0 } : { opacity: 0, scaleY: 0.1, y: 40 }}
        style={{ transformOrigin: "bottom" }}
        transition={{ duration: 1.05, ease: [0.2, 0.9, 0.2, 1], delay: position === 1 ? 0.15 : 0 }}
      >
        <span className={`font-display text-5xl md:text-6xl ${podiumTheme[position].number}`}>{position}</span>
      </motion.div>
    </motion.div>
  );
};

const GlowRanking = () => {
  const [ranking, setRanking] = useState([]);
  const [podiumPhase, setPodiumPhase] = useState(0);
  const [visibleRows, setVisibleRows] = useState(0);
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.35 });

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/public/ranking`);
        const data = await response.json();
        if (data?.success && Array.isArray(data.ranking) && data.ranking.length > 0) {
          setRanking(data.ranking);
          return;
        }
      } catch (err) {
        console.error("Error fetching ranking:", err);
      }
      setRanking(fallbackRanking);
    };

    fetchRanking();
  }, []);

  const formatName = (fullName) => {
    if (!fullName) return "Alumno";
    const parts = fullName.trim().split(/\s+/);
    if (parts.length <= 1) return parts[0];
    const firstName = parts[0];
    const lastInitial = parts[parts.length - 1][0].toUpperCase();
    return `${firstName} ${lastInitial}.`;
  };

  const normalized = useMemo(() => {
    return ranking.map((r, index) => ({
      rank: index + 1,
      name: formatName(r.nombre_completo || r.nombre_corto || r.name),
      discipline: r.deporte || r.categoria || r.discipline || "General",
      points: Number(r.puntaje_global ?? r.puntos ?? r.points ?? 0)
    }));
  }, [ranking]);

  const top3 = normalized.slice(0, 3);
  const restTop10 = normalized.slice(3, 10);
  const noPodiumTop10 = normalized.slice(0, 10);

  useEffect(() => {
    if (!inView || top3.length !== 3) return;

    const timers = [
      setTimeout(() => setPodiumPhase(1), 280),
      setTimeout(() => setPodiumPhase(2), 1750),
      setTimeout(() => setPodiumPhase(3), 3250),
      setTimeout(() => setPodiumPhase(4), 4100)
    ];

    return () => timers.forEach((id) => clearTimeout(id));
  }, [inView, top3.length]);

  useEffect(() => {
    if (!inView) return;

    const rowsTarget = top3.length === 3 ? restTop10.length : noPodiumTop10.length;
    if (rowsTarget === 0) return;

    if (top3.length === 3 && podiumPhase < 4) {
      setVisibleRows(0);
      return;
    }

    setVisibleRows(0);
    const interval = setInterval(() => {
      setVisibleRows((current) => {
        if (current >= rowsTarget) {
          clearInterval(interval);
          return current;
        }
        return current + 1;
      });
    }, 220);

    return () => clearInterval(interval);
  }, [inView, podiumPhase, top3.length, restTop10.length, noPodiumTop10.length]);

  return (
    <section ref={sectionRef} id="ranking" className="relative overflow-hidden px-6 py-24 md:px-16 lg:px-24">
      <ChampionFlash isActive={podiumPhase >= 4} />
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Tabla de posiciones</p>
          <h2 className="mt-2 font-display text-5xl md:text-7xl uppercase">
            Ranking de <span className="text-gradient">Alumnos</span>
          </h2>
        </motion.div>

        {top3.length === 3 && (
          <motion.div
            className="mb-16 flex items-end justify-center gap-4 md:gap-8"
            animate={podiumPhase >= 4 ? { scale: [1, 1.01, 1], filter: ["brightness(1)", "brightness(1.18)", "brightness(1)"] } : { scale: 1, filter: "brightness(1)" }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
          >
            <PodiumCard student={top3[1]} position={2} isActive={podiumPhase >= 2} isChampionBurst={false} />
            <PodiumCard student={top3[0]} position={1} isActive={podiumPhase >= 3} isChampionBurst={podiumPhase >= 4} />
            <PodiumCard student={top3[2]} position={3} isActive={podiumPhase >= 1} isChampionBurst={false} />
          </motion.div>
        )}

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="grid grid-cols-[60px_1fr_1fr_100px] items-center gap-4 border-b border-border bg-secondary/50 px-6 py-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground md:grid-cols-[80px_1fr_1fr_120px]">
            <span>#</span>
            <span>Alumno</span>
            <span>Disciplina</span>
            <span className="text-right">Puntos</span>
          </div>

          {(top3.length === 3 ? restTop10 : noPodiumTop10).slice(0, visibleRows).map((student, index) => (
            <motion.div
              key={`${student.rank}-${student.name}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className={`grid grid-cols-[60px_1fr_1fr_100px] items-center gap-4 px-6 py-5 transition-colors hover:bg-secondary/30 md:grid-cols-[80px_1fr_1fr_120px] ${index < (top3.length === 3 ? restTop10.length : noPodiumTop10.length) - 1 ? "border-b border-border/50" : ""}`}
            >
              <span className="pl-2 font-display text-xl text-muted-foreground">{student.rank}</span>
              <p className="font-semibold">{student.name}</p>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">{student.discipline}</span>
              <span className="text-right font-display text-2xl text-gradient">{student.points}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GlowRanking;