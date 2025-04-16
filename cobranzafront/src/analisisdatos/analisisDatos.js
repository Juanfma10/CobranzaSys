import React, { useState } from 'react';
import styles from './analisisDatos.module.css'; // Importa los estilos (crearemos este archivo luego)

function AnalisisDatos() {
  const [archivoCSV, setArchivoCSV] = useState(null);
  const [datosCSV, setDatosCSV] = useState([]);
  const [error, setError] = useState(null);

  const handleSubirArchivo = (event) => {
    const archivo = event.target.files[0];
    if (archivo && archivo.type === 'text/csv') {
      setArchivoCSV(archivo);
      setError(null);
    } else {
      setArchivoCSV(null);
      setError('Por favor, selecciona un archivo CSV válido.');
      setDatosCSV([]);
    }
  };

  const procesarCSV = () => {
    if (!archivoCSV) {
      setError('Por favor, sube un archivo CSV primero.');
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const contenidoCSV = event.target.result;
      const filas = contenidoCSV.split('\n').map(fila => fila.split(','));
      setDatosCSV(filas);
    };

    reader.onerror = () => {
      setError('Error al leer el archivo CSV.');
      setDatosCSV([]);
    };

    reader.readAsText(archivoCSV);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Análisis de Datos CSV</h2>

      <div className={styles.uploadContainer}>
        <label htmlFor="subirCSV" className={styles.uploadLabel}>
          Seleccionar Archivo CSV
        </label>
        <input
          type="file"
          id="subirCSV"
          accept=".csv"
          onChange={handleSubirArchivo}
          className={styles.uploadInput}
        />
        {archivoCSV && <p className={styles.fileName}>Archivo seleccionado: {archivoCSV.name}</p>}
        {error && <p className={styles.error}>{error}</p>}
      </div>

      {datosCSV.length > 0 && (
        <div className={styles.dataContainer}>
          <h3>Datos del CSV:</h3>
          <table>
            <thead>
              {datosCSV[0] && (
                <tr>
                  {datosCSV[0].map((encabezado, index) => (
                    <th key={index}>{encabezado}</th>
                  ))}
                </tr>
              )}
            </thead>
            <tbody>
              {datosCSV.slice(1).map((fila, index) => (
                <tr key={index}>
                  {fila.map((celda, indexCelda) => (
                    <td key={indexCelda}>{celda}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {archivoCSV && datosCSV.length === 0 && !error && (
        <button className={styles.processButton} onClick={procesarCSV}>
          Procesar CSV
        </button>
      )}
    </div>
  );
}

export default AnalisisDatos