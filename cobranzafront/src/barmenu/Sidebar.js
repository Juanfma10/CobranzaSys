import React, { useState } from 'react';
import './Sidebar.css';
import PaginaDePago from '../individual/Single.js';
import HomePage from '../homepage/homepage.js';
import AnalisisDatos from '../analisisdatos/analisisDatos.js';


const SidebarItem = ({ label, onClick, isActive }) => {
  return (
    <li className={isActive ? 'active' : ''}>
      <button onClick={onClick}>{label}</button>
    </li>
  );
};

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false); // Menú cerrado por defecto
  const [currentPage, setCurrentPage] = useState('inicio');

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleMenuItemClick = (page) => {
    setCurrentPage(page);
    // En Gemini, el menú puede permanecer abierto o cerrarse al seleccionar
    // Aquí lo dejamos abierto por simplicidad, pero puedes cerrarlo si lo deseas:
    // setIsOpen(false);
  };

  const menuItems = [
    { label: 'Inicio', page: 'inicio' },
    { label: 'Ingreso de Pagos', page: 'ingreso de Pagos' },
    { label: 'Analisis de datos', page: 'analisis de Datos' },
    // Agrega más opciones aquí
  ];

  return (
    <div className={`gemini-sidebar-container ${isOpen ? 'open' : 'closed'}`}>
      <button className="gemini-toggle-button" onClick={toggleSidebar}>
        ☰ {/* Icono de menú */}
      </button>
      <nav className={`gemini-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="gemini-logo">
          <span>Sistema de Prediccion</span>
        </div>
        <ul>
          {menuItems.map((item) => (
            <SidebarItem
              key={item.page}
              label={item.label}
              onClick={() => handleMenuItemClick(item.page)}
              isActive={currentPage === item.page}
            />
          ))}
        </ul>
      </nav>
      <main className="gemini-content">
        {currentPage === 'inicio' &&  <HomePage />}
        {currentPage === 'ingreso de Pagos' && <PaginaDePago />}
        {currentPage === 'analisis de Datos' && <AnalisisDatos />}
        {/* Renderiza aquí el contenido basado en currentPage */}
      </main>
    </div>
  );
}

export default Sidebar;