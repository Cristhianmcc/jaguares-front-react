import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Award, Star, Sparkles } from "lucide-react";

const rankings = [
  { rank: 1, name: "Valentina López", discipline: "Fútbol Femenino", points: 2840, icon: Trophy },
  { rank: 2, name: "Matías González", discipline: "Básquet", points: 2650, icon: Medal },
  { rank: 3, name: "Camila Rodríguez", discipline: "Vóley", points: 2510, icon: Medal },
  { rank: 4, name: "Lucas Fernández", discipline: "Fútbol", points: 2380, icon: Award },
  { rank: 5, name: "Sofía Martínez", discipline: "Funcional Mixto", points: 2250, icon: Award },
  { rank: 6, name: "Tomás Herrera", discipline: "Fútbol", points: 2100, icon: Star },
  { rank: 7, name: "Carolina Díaz", discipline: "Mamás Fit", points: 1980, icon: Star },
  { rank: 8, name: "Nicolás Ruiz", discipline: "Básquet", points: 1870, icon: Star },
];

const Firework = ({ delay, x, y }: { delay: number; x: number; y: number }) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{ left: `${x}%`, top: `${y}%` }}
    initial={{ scale: 0, opacity: 1 }}
    animate={{
      scale: [0, 1.5, 0],
      opacity: [1, 0.8, 0],
    }}
    transition={{ duration: 0.8, delay, repeat: Infinity, repeatDelay: 1.2 }}
  >
    <Sparkles className="h-4 w-4 text-primary" />
  </motion.div>
);

const SparkleParticle = ({ index, total = 12 }: { index: number; total?: number }) => {
  const angle = (index / total) * Math.PI * 2;
  const distance = 80 + Math.random() * 60;
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;
  const colors = ["hsl(24 95% 53%)", "hsl(35 100% 55%)", "hsl(45 100% 65%)", "hsl(0 0% 100%)", "hsl(15 90% 60%)"];
  const color = colors[index % colors.length];
  const size = 2 + Math.random() * 3;

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 rounded-full pointer-events-none"
      style={{ background: color, width: size, height: size }}
      initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      animate={{
        x: [0, x * 0.6, x, x * 1.3],
        y: [0, y * 0.6, y, y * 1.3 + 30],
        scale: [0, 1.5, 1.2, 0],
        opacity: [1, 1, 0.8, 0],
      }}
      transition={{
        duration: 1.5,
        delay: Math.random() * 0.4,
        repeat: Infinity,
        repeatDelay: 0.5 + Math.random() * 0.4,
      }}
    />
  );
};

const FireworksOverlay = () => (
  <div className="absolute -inset-16 overflow-visible pointer-events-none z-10">
    {Array.from({ length: 32 }).map((_, i) => (
      <SparkleParticle key={i} index={i} total={32} />
    ))}
    <Firework delay={0} x={15} y={10} />
    <Firework delay={0.15} x={80} y={8} />
    <Firework delay={0.3} x={50} y={3} />
    <Firework delay={0.1} x={5} y={25} />
    <Firework delay={0.4} x={90} y={20} />
    <Firework delay={0.55} x={35} y={15} />
    <Firework delay={0.25} x={65} y={5} />
    <Firework delay={0.7} x={25} y={30} />
    <Firework delay={0.45} x={70} y={28} />
    <Firework delay={0.6} x={45} y={22} />
  </div>
);

const PodiumCard = ({
  student,
  position,
}: {
  student: (typeof rankings)[0];
  position: 1 | 2 | 3;
}) => {
  const [hovered, setHovered] = useState(false);

  const heights: Record<number, string> = { 1: "h-64", 2: "h-40", 3: "h-36" };
  const orders: Record<number, string> = { 1: "order-2", 2: "order-1", 3: "order-3" };
  const badgeColors: Record<number, string> = {
    1: "bg-gradient-primary shadow-glow",
    2: "bg-secondary",
    3: "bg-secondary",
  };
  const medalLabels: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

  return (
    <motion.div
      className={`flex flex-col items-center ${orders[position]}`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: position === 1 ? 0.2 : position === 2 ? 0.1 : 0.3 }}
    >
      {/* Avatar */}
      <motion.div
        className="relative mb-4"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        whileHover={{ scale: 1.1 }}
      >
        {position === 1 && hovered && <FireworksOverlay />}
        <div
          className={`relative flex h-20 w-20 items-center justify-center rounded-full ${badgeColors[position]} font-display text-3xl text-primary-foreground md:h-24 md:w-24`}
        >
          {student.name.split(" ").map((n) => n[0]).join("")}
        </div>
        <span className="absolute -bottom-1 -right-1 text-2xl">{medalLabels[position]}</span>
        {position === 1 && hovered && (
          <motion.div
            className="absolute -top-2 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: -5 }}
          >
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          </motion.div>
        )}
      </motion.div>

      <p className="text-center font-semibold text-sm md:text-base">{student.name}</p>
      <p className="text-xs text-muted-foreground">{student.discipline}</p>
      <p className="mt-1 font-display text-2xl text-gradient">{student.points}</p>

      {/* Podium bar */}
      <motion.div
        className={`mt-4 w-28 rounded-t-xl border border-border bg-card md:w-36 ${heights[position]} flex items-center justify-center`}
        initial={{ height: 0 }}
        whileInView={{ height: "auto" }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <span className="font-display text-5xl text-muted-foreground/30 md:text-6xl">
          {position}
        </span>
      </motion.div>
    </motion.div>
  );
};

const RankingSection = () => {
  const top3 = rankings.slice(0, 3);
  const rest = rankings.slice(3);

  return (
    <section id="ranking" className="px-6 py-24 md:px-16 lg:px-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Tabla de posiciones
          </p>
          <h2 className="mt-2 font-display text-5xl md:text-7xl">
            RANKING DE <span className="text-gradient">ALUMNOS</span>
          </h2>
        </motion.div>

        {/* Podium */}
        <div className="mb-16 flex items-end justify-center gap-4 md:gap-8">
          <PodiumCard student={top3[1]} position={2} />
          <PodiumCard student={top3[0]} position={1} />
          <PodiumCard student={top3[2]} position={3} />
        </div>

        {/* Rest of ranking */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="grid grid-cols-[60px_1fr_1fr_100px] items-center gap-4 border-b border-border bg-secondary/50 px-6 py-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground md:grid-cols-[80px_1fr_1fr_120px]">
            <span>#</span>
            <span>Alumno</span>
            <span>Disciplina</span>
            <span className="text-right">Puntos</span>
          </div>

          {rest.map((student, index) => (
            <motion.div
              key={student.rank}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className={`grid grid-cols-[60px_1fr_1fr_100px] items-center gap-4 px-6 py-5 transition-colors hover:bg-secondary/30 md:grid-cols-[80px_1fr_1fr_120px] ${
                index < rest.length - 1 ? "border-b border-border/50" : ""
              }`}
            >
              <span className="pl-2 font-display text-xl text-muted-foreground">
                {student.rank}
              </span>
              <p className="font-semibold">{student.name}</p>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                {student.discipline}
              </span>
              <span className="text-right font-display text-2xl text-gradient">
                {student.points}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RankingSection;
