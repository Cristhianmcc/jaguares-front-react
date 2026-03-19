export const sportHubDisciplines = [
  {
    slug: "futbol",
    title: "Futbol",
    description: "Entrenamiento tecnico y tactico para todas las edades.",
    longDescription:
      "Nuestra escuela de futbol se enfoca en el desarrollo tecnico, tactico y fisico de cada jugador. Trabajamos con metodologias modernas que priorizan el juego asociado, la toma de decisiones y el fair play.",
    categories: [
      { name: "Pre-Mini", ages: "4 a 6 anos", schedule: ["Martes y Jueves 16:00 - 17:00"] },
      { name: "Mini", ages: "7 a 9 anos", schedule: ["Lunes, Miercoles y Viernes 16:00 - 17:30"] },
      { name: "Infantil", ages: "10 a 12 anos", schedule: ["Lunes, Miercoles y Viernes 17:30 - 19:00"] },
      { name: "Juvenil", ages: "13 a 16 anos", schedule: ["Martes, Jueves y Sabado 18:00 - 19:30"] },
      { name: "Mayor", ages: "+17 anos", schedule: ["Martes y Jueves 20:00 - 21:30", "Sabado 10:00 - 12:00"] }
    ]
  },
  {
    slug: "voley",
    title: "Voley",
    description: "Formacion tecnica de saque, recepcion, armado y remate.",
    longDescription:
      "El voley en Jaguares apunta a la formacion completa del deportista. Desde tecnicas individuales hasta juego en equipo, nuestras clases combinan precision con partidos competitivos.",
    categories: [
      { name: "Iniciacion", ages: "8 a 11 anos", schedule: ["Martes y Jueves 16:00 - 17:00"] },
      { name: "Cadetes", ages: "12 a 15 anos", schedule: ["Lunes, Miercoles y Viernes 17:00 - 18:30"] },
      { name: "Juvenil", ages: "16 a 18 anos", schedule: ["Martes y Jueves 18:30 - 20:00"] },
      { name: "Libre", ages: "+18 anos", schedule: ["Sabado 9:00 - 11:00"] }
    ]
  },
  {
    slug: "basquet",
    title: "Basquet",
    description: "Fundamentos, juego colectivo y preparacion para competir.",
    longDescription:
      "Nuestro programa de basquet esta disenado para desarrollar jugadores completos. Trabajamos fundamentos individuales, sistemas de juego y preparacion fisica especifica.",
    categories: [
      { name: "Mini Basket", ages: "6 a 9 anos", schedule: ["Miercoles y Viernes 16:00 - 17:00"] },
      { name: "Pre-Infantil", ages: "10 a 12 anos", schedule: ["Lunes, Miercoles y Viernes 17:00 - 18:30"] },
      { name: "Cadetes", ages: "13 a 15 anos", schedule: ["Martes, Jueves y Sabado 17:00 - 18:30"] },
      { name: "Juvenil", ages: "16 a 18 anos", schedule: ["Martes y Jueves 19:00 - 20:30"] }
    ]
  },
  {
    slug: "mamas-fit",
    title: "Mamas Fit",
    description: "Rutinas para bienestar, energia y fuerza funcional.",
    longDescription:
      "Mamas Fit es un espacio disenado para madres que quieren mantenerse activas. Las clases combinan funcional, cardio y elongacion en un entorno motivador.",
    categories: [
      { name: "Turno Manana", ages: "Todas las edades", schedule: ["Lunes, Miercoles y Viernes 9:00 - 10:00"] },
      { name: "Turno Tarde", ages: "Todas las edades", schedule: ["Martes y Jueves 15:00 - 16:00"] }
    ]
  },
  {
    slug: "funcional-mixto",
    title: "Funcional Mixto",
    description: "Entrenamiento intenso de fuerza, cardio y movilidad.",
    longDescription:
      "El entrenamiento funcional mixto combina fuerza, cardio, movilidad y coordinacion. Es ideal para mejorar la condicion fisica general en sesiones dinamicas.",
    categories: [
      { name: "Nivel 1 - Principiantes", ages: "+16 anos", schedule: ["Lunes, Miercoles y Viernes 7:00 - 8:00"] },
      { name: "Nivel 2 - Intermedio", ages: "+16 anos", schedule: ["Martes, Jueves y Sabado 8:00 - 9:00"] },
      { name: "Nivel 3 - Avanzado", ages: "+16 anos", schedule: ["Lunes a Viernes 19:00 - 20:00"] }
    ]
  },
  {
    slug: "futbol-femenino",
    title: "Futbol Femenino",
    description: "Desarrollo competitivo del futbol femenino.",
    longDescription:
      "El futbol femenino en Jaguares da espacio de crecimiento a jugadoras de la region. Formamos equipos competitivos con metodologia profesional y valores de equipo.",
    categories: [
      { name: "Infantil", ages: "8 a 12 anos", schedule: ["Martes y Jueves 16:00 - 17:30"] },
      { name: "Juvenil", ages: "13 a 17 anos", schedule: ["Lunes, Miercoles y Viernes 17:30 - 19:00"] },
      { name: "Mayor", ages: "+18 anos", schedule: ["Martes, Jueves y Sabado 19:00 - 20:30"] }
    ]
  }
];

const slugAliases = {
  futbol: "futbol",
  'futbol ': "futbol",
  football: "futbol",
  voley: "voley",
  volley: "voley",
  voleibol: "voley",
  basquet: "basquet",
  basket: "basquet",
  basketball: "basquet",
  'mamas fit': "mamas-fit",
  'mama fit': "mamas-fit",
  mamas: "mamas-fit",
  funcional: "funcional-mixto",
  'funcional mixto': "funcional-mixto",
  'futbol femenino': "futbol-femenino",
  'futbol fem': "futbol-femenino"
};

export function toDisciplineSlug(value) {
  if (!value) return "futbol";

  const raw = String(value).trim().toLowerCase();
  const normalized = raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (slugAliases[normalized]) return slugAliases[normalized];

  const slug = normalized.replace(/\s+/g, "-");
  const valid = sportHubDisciplines.some((item) => item.slug === slug);
  return valid ? slug : "futbol";
}

export function getDisciplineBySlug(slug) {
  return sportHubDisciplines.find((item) => item.slug === slug) || null;
}
