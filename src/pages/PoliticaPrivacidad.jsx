import React from 'react';

export default function PoliticaPrivacidad() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-white/10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img src="/assets/jaguar.jpg" alt="Logo Jaguares" className="h-10 w-auto object-contain rounded" />
            <span className="text-xl font-black uppercase tracking-wider text-white">JAGUARES</span>
          </a>
          <a href="/inscripcion" className="px-4 py-2 rounded-lg bg-orange-500 text-black font-bold text-sm uppercase hover:bg-orange-400 transition-colors">
            Inscribirse
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2">
          Politica de <span className="text-orange-500">Privacidad</span>
        </h1>
        <p className="text-gray-400 text-sm mb-10">Ultima actualizacion: 20 de marzo de 2026</p>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Responsable del tratamiento de datos</h2>
            <p>
              <strong className="text-white">Escuela Deportiva JAGUARES</strong> (en adelante "JAGUARES" o "la Academia"),
              con domicilio en la ciudad de Lima, Peru, es responsable del tratamiento de los datos
              personales que los usuarios proporcionan a traves de la plataforma web <strong className="text-white">jaguarescar.com</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Datos personales que recopilamos</h2>
            <p className="mb-3">Durante el proceso de inscripcion y uso de la plataforma, recopilamos los siguientes datos:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Nombre completo del alumno/a</li>
              <li>Documento Nacional de Identidad (DNI)</li>
              <li>Fecha de nacimiento</li>
              <li>Sexo</li>
              <li>Telefono de contacto</li>
              <li>Direccion domiciliaria</li>
              <li>Correo electronico (opcional)</li>
              <li>Tipo de seguro medico y condicion medica</li>
              <li>Datos del apoderado (en caso de menores de edad)</li>
              <li>Fotografias de documentos de identidad y foto carnet</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Finalidad del tratamiento</h2>
            <p className="mb-3">Los datos personales son recopilados y tratados con las siguientes finalidades:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Gestionar el proceso de inscripcion a las disciplinas deportivas</li>
              <li>Identificar y registrar a los alumnos en el sistema de la academia</li>
              <li>Asignar horarios y categorias de entrenamiento</li>
              <li>Llevar el control de asistencia y rendimiento deportivo</li>
              <li>Comunicar informacion relevante sobre actividades, horarios y eventos</li>
              <li>Garantizar la seguridad y bienestar de los participantes</li>
              <li>Cumplir con obligaciones legales aplicables</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Base legal</h2>
            <p>
              El tratamiento de los datos personales se realiza con base en el <strong className="text-white">consentimiento 
              expreso</strong> del titular o su apoderado legal, otorgado al momento de la inscripcion, de conformidad 
              con la Ley N.° 29733, Ley de Proteccion de Datos Personales del Peru, y su Reglamento aprobado 
              por Decreto Supremo N.° 003-2013-JUS.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Almacenamiento y seguridad</h2>
            <p>
              Los datos personales son almacenados en servidores seguros con medidas de proteccion tecnicas 
              y organizativas adecuadas para prevenir el acceso no autorizado, la perdida, alteracion o 
              divulgacion indebida de la informacion. El acceso a los datos esta restringido exclusivamente 
              al personal autorizado de la academia.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Comparticion de datos</h2>
            <p>
              JAGUARES <strong className="text-white">no vende, alquila ni comparte</strong> los datos personales de sus 
              alumnos con terceros, salvo en los siguientes casos:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-3">
              <li>Cuando sea requerido por autoridad competente o mandato judicial</li>
              <li>Para cumplir con obligaciones legales o regulatorias</li>
              <li>Con el consentimiento previo del titular de los datos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Derechos del titular</h2>
            <p className="mb-3">
              De acuerdo con la legislacion vigente, el titular de los datos personales tiene derecho a:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong className="text-white">Acceso:</strong> Conocer que datos personales tenemos sobre usted</li>
              <li><strong className="text-white">Rectificacion:</strong> Solicitar la correccion de datos inexactos</li>
              <li><strong className="text-white">Cancelacion:</strong> Solicitar la eliminacion de sus datos cuando ya no sean necesarios</li>
              <li><strong className="text-white">Oposicion:</strong> Oponerse al tratamiento de sus datos en determinadas circunstancias</li>
            </ul>
            <p className="mt-3">
              Para ejercer estos derechos, puede comunicarse al correo electronico o numero de contacto 
              disponibles en la seccion de contacto de nuestra pagina web.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Conservacion de datos</h2>
            <p>
              Los datos personales seran conservados durante el tiempo que el alumno se encuentre 
              inscrito en la academia y por un periodo adicional necesario para cumplir con obligaciones 
              legales o contractuales. Una vez finalizada la relacion, los datos seran eliminados de 
              forma segura.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Menores de edad</h2>
            <p>
              Para la inscripcion de menores de edad, se requiere el consentimiento del padre, madre o 
              apoderado legal, quien sera responsable de autorizar el tratamiento de los datos del menor.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Modificaciones</h2>
            <p>
              JAGUARES se reserva el derecho de actualizar esta Politica de Privacidad en cualquier momento.
              Cualquier cambio sera publicado en esta misma pagina con la fecha de actualizacion correspondiente.
            </p>
          </section>

          <section className="border-t border-white/10 pt-8">
            <p className="text-gray-400 text-sm">
              Al utilizar nuestra plataforma y completar el proceso de inscripcion, usted declara haber 
              leido y aceptado esta Politica de Privacidad.
            </p>
            <p className="text-gray-500 text-sm mt-4">
              Escuela Deportiva JAGUARES — Lima, Peru
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white py-8 border-t border-white/10 mt-12">
        <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img src="/assets/jaguar.jpg" alt="Logo Jaguares" className="h-6 w-auto object-contain rounded" />
            <span className="text-white text-sm font-black uppercase">JAGUARES</span>
          </div>
          <p className="text-gray-400 text-sm">© 2026 JAGUARES. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
