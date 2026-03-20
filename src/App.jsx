import React, { useMemo } from 'react';
import Home from './pages/Home.jsx';
import ChatBotAdmin from './components/ChatBotAdmin.jsx';
import Inscripcion from './pages/Inscripcion.jsx';
import SeleccionHorariosNew from './pages/SeleccionHorariosNew.jsx';
import Confirmacion from './pages/Confirmacion.jsx';
import Exito from './pages/Exito.jsx';
import Consulta from './pages/Consulta.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import AdminUsuarios from './pages/AdminUsuarios.jsx';
import AdminDocentes from './pages/AdminDocentes.jsx';
import AdminCrud from './pages/AdminCrud.jsx';
import AdminReubicaciones from './pages/AdminReubicaciones.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminLegacy from './pages/AdminLegacy.jsx';
import SeleccionHorarios from './pages/SeleccionHorarios.jsx';
import ProfesorDashboard from './pages/ProfesorDashboard.jsx';
import ProfesorAsistencias from './pages/ProfesorAsistencias.jsx';
import ProfesorRanking from './pages/ProfesorRanking.jsx';
import ProfesorReportes from './pages/ProfesorReportes.jsx';
import AdminLandingEditor from './pages/AdminLandingEditor.jsx';
import DisciplineDetail from './pages/DisciplineDetail.jsx';
import PoliticaPrivacidad from './pages/PoliticaPrivacidad.jsx';

export default function App() {
  const route = useMemo(() => {
    const rawPath = window.location.pathname || '/';
    const normalized = rawPath.replace(/\/{2,}/g, '/').replace(/\/+$/, '') || '/';

    const disciplineMatch = normalized.match(/^\/disciplina\/([^/]+)$/);
    if (disciplineMatch) {
      return {
        name: 'disciplina-detail',
        slug: decodeURIComponent(disciplineMatch[1]).toLowerCase()
      };
    }

    const routes = new Map([
      ['/', 'home'],
      ['/inscripcion', 'inscripcion'],
      ['/seleccion-horarios-new', 'seleccion-horarios-new'],
      ['/confirmacion', 'confirmacion'],
      ['/exito', 'exito'],
      ['/consulta', 'consulta'],
      ['/admin-login', 'admin-login'],
      ['/admin-panel', 'admin-panel'],
      ['/admin-usuarios', 'admin-usuarios'],
      ['/admin-docentes', 'admin-docentes'],
      ['/admin-crud', 'admin-crud'],
      ['/admin-reubicaciones', 'admin-reubicaciones'],
      ['/admin-dashboard', 'admin-dashboard'],
      ['/admin', 'admin-legacy'],
      ['/seleccion-horarios', 'seleccion-horarios'],
      ['/profesor', 'profesor-dashboard'],
      ['/profesor-dashboard', 'profesor-dashboard'],
      ['/profesor-asistencias', 'profesor-asistencias'],
      ['/profesor-ranking', 'profesor-ranking'],
      ['/profesor-reportes', 'profesor-reportes'],
      ['/admin-landing-editor', 'admin-landing-editor'],
      ['/politica-privacidad', 'politica-privacidad']
    ]);

    return { name: routes.get(normalized) || 'home' };
  }, []);

  if (route.name === 'disciplina-detail') return <DisciplineDetail slug={route.slug} />;
  if (route.name === 'inscripcion') return <Inscripcion />;
  if (route.name === 'politica-privacidad') return <PoliticaPrivacidad />;
  if (route.name === 'seleccion-horarios-new') return <SeleccionHorariosNew />;
  if (route.name === 'confirmacion') return <Confirmacion />;
  if (route.name === 'exito') return <Exito />;
  if (route.name === 'consulta') return <Consulta />;
  if (route.name === 'admin-login') return <AdminLogin />;
  if (route.name === 'seleccion-horarios') return <SeleccionHorarios />;
  if (route.name === 'profesor-dashboard') return <ProfesorDashboard />;
  if (route.name === 'profesor-asistencias') return <ProfesorAsistencias />;
  if (route.name === 'profesor-ranking') return <ProfesorRanking />;
  if (route.name === 'profesor-reportes') return <ProfesorReportes />;

  // Editor de Landing Page — pantalla completa sin chatbot superpuesto
  if (route.name === 'admin-landing-editor') return <AdminLandingEditor />;

  if (route.name === 'home') return <Home />;

  // Para rutas admin, envolver con el chatbot flotante
  const paginaAdmin = {
    'admin-panel': <AdminPanel />,
    'admin-usuarios': <AdminUsuarios />,
    'admin-docentes': <AdminDocentes />,
    'admin-crud': <AdminCrud />,
    'admin-reubicaciones': <AdminReubicaciones />,
    'admin-dashboard': <AdminDashboard />,
    'admin-legacy': <AdminLegacy />,
  }[route.name];

  if (paginaAdmin) {
    return (
      <>
        {paginaAdmin}
        <ChatBotAdmin />
      </>
    );
  }

  return <Home />;
}
