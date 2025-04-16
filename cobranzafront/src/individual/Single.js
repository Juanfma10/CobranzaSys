import React, { useState } from 'react';
import styles from './Single.module.css'; // Importa los estilos

function PaginaDePago() {
  const [nombreCliente, setNombreCliente] = useState('');
  const [fechaMaximaPago, setFechaMaximaPago] = useState('');
  const [fechaPago, setFechaPago] = useState('');
  const [monto, setMonto] = useState('');
  const [registros, setRegistros] = useState([]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const nuevoRegistro = {
      nombreCliente,
      fechaMaximaPago,
      fechaPago,
      monto,
    };
    setRegistros([...registros, nuevoRegistro]);
    // Limpiar el formulario después de agregar
    setNombreCliente('');
    setFechaMaximaPago('');
    setFechaPago('');
    setMonto('');
  };

  const limpiarTabla = () => {
    setRegistros([]); // Establece el array de registros a un array vacío
  };

  const generarCSV = () => {
    if (registros.length === 0) {
      alert('La tabla está vacía. No se puede generar el CSV.');
      return;
    }

    const encabezados = Object.keys(registros[0]).join(',');
    const filas = registros.map(registro => Object.values(registro).join(',')).join('\n');
    const csvDatos = `${encabezados}\n${filas}`;

    const blob = new Blob([csvDatos], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'registros_de_pago.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Información de Pago</h2>
      <div className={styles.contentWrapper}>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div>
            <label htmlFor="nombreCliente" className={styles.label}>Nombre del Cliente:</label>
            <input
              type="text"
              id="nombreCliente"
              value={nombreCliente}
              onChange={(e) => setNombreCliente(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div>
            <label htmlFor="fechaMaximaPago" className={styles.label}>Fecha Máxima de Pago:</label>
            <input
              type="date"
              id="fechaMaximaPago"
              value={fechaMaximaPago}
              onChange={(e) => setFechaMaximaPago(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div>
            <label htmlFor="fechaPago" className={styles.label}>Fecha de Pago:</label>
            <input
              type="date"
              id="fechaPago"
              value={fechaPago}
              onChange={(e) => setFechaPago(e.target.value)}
              className={styles.input}
            />
          </div>

          <div>
            <label htmlFor="monto" className={styles.label}>Monto:</label>
            <input
              type="number"
              id="monto"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <button type="submit" className={styles.button}>Agregar Pago</button>
        </form>
        <div className={styles.tableContainer}>
          <h3>Registros de Pago</h3>
          {registros.length > 0 ? (
            <>
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Fecha Máxima</th>
                    <th>Fecha Pago</th>
                    <th>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {registros.map((registro, index) => (
                    <tr key={index}>
                      <td>{registro.nombreCliente}</td>
                      <td>{registro.fechaMaximaPago}</td>
                      <td>{registro.fechaPago}</td>
                      <td>{registro.monto}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className={styles.tableActions}>
                <button type="button" className={styles.clearButton} onClick={limpiarTabla}>
                  Limpiar Tabla
                </button>
                <button type="button" className={styles.downloadButton} onClick={generarCSV}>
                  Descargar CSV
                </button>
              </div>
            </>
          ) : (
            <p>No hay registros de pago aún.</p>
          )}
        </div>

      </div>
    </div>
  );
}

export default PaginaDePago;