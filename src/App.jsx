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

export default function App() {
  const route = useMemo(() => {
    const rawPath = window.location.pathname || '/';
    const normalized = rawPath.replace(/\/{2,}/g, '/').replace(/\/+$/, '') || '/';

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
      ['/profesor-reportes', 'profesor-reportes']
    ]);

    return routes.get(normalized) || 'home';
  }, []);

  if (route === 'inscripcion') return <Inscripcion />;
  if (route === 'seleccion-horarios-new') return <SeleccionHorariosNew />;
  if (route === 'confirmacion') return <Confirmacion />;
  if (route === 'exito') return <Exito />;
  if (route === 'consulta') return <Consulta />;
  if (route === 'admin-login') return <AdminLogin />;
  if (route === 'seleccion-horarios') return <SeleccionHorarios />;
  if (route === 'profesor-dashboard') return <ProfesorDashboard />;
  if (route === 'profesor-asistencias') return <ProfesorAsistencias />;
  if (route === 'profesor-ranking') return <ProfesorRanking />;
  if (route === 'profesor-reportes') return <ProfesorReportes />;

  if (route === 'home') return <Home />;

  // Para rutas admin, envolver con el chatbot flotante
  const paginaAdmin = {
    'admin-panel': <AdminPanel />,
    'admin-usuarios': <AdminUsuarios />,
    'admin-docentes': <AdminDocentes />,
    'admin-crud': <AdminCrud />,
    'admin-reubicaciones': <AdminReubicaciones />,
    'admin-dashboard': <AdminDashboard />,
    'admin-legacy': <AdminLegacy />,
  }[route];

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
