import React, { useState, useRef } from 'react';
import styles from './analisisDatos.module.css';

function AnalisisDatos() {
  const fileInputRef = useRef(null);
  const [archivoCSV, setArchivoCSV] = useState(null);
  const [datosCSVOriginal, setDatosCSVOriginal] = useState([]);
  const [datosCSVMostrar, setDatosCSVMostrar] = useState([]);
  const [error, setError] = useState(null);
  const [filasModificadas, setFilasModificadas] = useState([]);
  const [isFileSelectedAndProcessed, setIsFileSelectedAndProcessed] = useState(false);

  const handleSubirArchivo = (event) => {
    const archivo = event.target.files[0];
    if (archivo && archivo.type === 'text/csv') {
      setArchivoCSV(archivo);
      setError(null);
      setIsFileSelectedAndProcessed(false); // Restablecer el indicador al seleccionar un nuevo archivo
    } else {
      setArchivoCSV(null);
      setError('Por favor, selecciona un archivo CSV válido.');
      setDatosCSVOriginal([]);
      setDatosCSVMostrar([]);
      setFilasModificadas([]);
      setIsFileSelectedAndProcessed(false);
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
      setDatosCSVOriginal(filas);
      setDatosCSVMostrar(filas);
      setFilasModificadas([]);
      setIsFileSelectedAndProcessed(true); // Establecer el indicador después del procesamiento exitoso
    };

    reader.onerror = () => {
      setError('Error al leer el archivo CSV.');
      setDatosCSVOriginal([]);
      setDatosCSVMostrar([]);
      setFilasModificadas([]);
      setIsFileSelectedAndProcessed(false);
    };

    reader.readAsText(archivoCSV);
  };

  const handlePreProcesamiento = () => {   if (!datosCSVOriginal || datosCSVOriginal.length <= 1) {
    alert('No hay datos para pre-procesar.');
    return;
  }

  const encabezados = datosCSVOriginal[0].map(header => header.toLowerCase());
  const indiceFechaPago = encabezados.indexOf('fechapago');
  const indiceFechaMaximaPago = encabezados.indexOf('fechamaximapago');
  const nuevosFilasModificadas = [];

  if (indiceFechaPago === -1 || indiceFechaMaximaPago === -1) {
    alert('Las columnas "fechapago" o "fechaMaximaPago" no se encontraron en el archivo CSV.');
    return;
  }

  const nuevosDatosCSVMostrar = datosCSVOriginal.map((fila, index) => {
    if (index === 0) return [...fila];

    const nuevaFila = [...fila];
    let modificada = false;
    if (nuevaFila[indiceFechaPago] === undefined || nuevaFila[indiceFechaPago].trim() === '') {
      nuevaFila[indiceFechaPago] = nuevaFila[indiceFechaMaximaPago];
      modificada = true;
    }

    if (modificada) {
      nuevosFilasModificadas.push({
        original: [...fila],
        modificada: nuevaFila,
        indices: { fechaPago: indiceFechaPago }
      });
    }
    return nuevaFila;
  });

  setDatosCSVMostrar(nuevosDatosCSVMostrar); // La tabla principal ahora se actualiza con los campos llenos
  setFilasModificadas(nuevosFilasModificadas);
  alert('Las fechas de pago vacías se han completado y se muestra una tabla de modificaciones.');
};

const handlePreProcesamientoFase2 = () => {
  if (!datosCSVMostrar || datosCSVMostrar.length <= 1) {
    alert('No hay datos suficientes para pre-procesar para la predicción (tabla modificada).');
    return;
  }

  const encabezadosMostrar = datosCSVMostrar[0];
  const datosParaPrediccion = [...datosCSVMostrar.slice(1)];

  const getIndice = (header) => encabezadosMostrar.findIndex(h => h.toLowerCase() === header.toLowerCase());
  const indiceFechaMaximaPago = getIndice('fechamaximapago');
  const indiceFechaPago = getIndice('fechapago');
  const indiceMonto = getIndice('monto');

  if (indiceFechaMaximaPago === -1) {
    alert('La columna "fechaMaximaPago" no se encontró en la tabla modificada.');
    return;
  }

  const datosConObjetivo = datosParaPrediccion.map(fila => {
    const fechaMaxima = new Date(fila[indiceFechaMaximaPago]);
    const fechaPagoStr = fila[indiceFechaPago];
    let diasRetraso = null;

    if (fechaPagoStr && fechaPagoStr.trim() !== '') {
      const fechaPagoReal = new Date(fechaPagoStr);
      const diferenciaTiempo = fechaPagoReal.getTime() - fechaMaxima.getTime();
      diasRetraso = Math.ceil(diferenciaTiempo / (1000 * 3600 * 24));
    }

    return {
      fechaMaximaPago: fila[indiceFechaMaximaPago],
      fechaPago: fechaPagoStr,
      monto: parseFloat(fila[indiceMonto]),
      diasRetraso: diasRetraso,
      filaOriginal: fila,
    };
  }).filter(item => item.diasRetraso !== null);

  if (datosConObjetivo.length === 0) {
    alert('No hay datos de pagos completados en la tabla modificada para generar la variable objetivo.');
    return;
  }

  const datosConCaracteristicas = datosConObjetivo.map(item => {
    const fechaMaxima = new Date(item.fechaMaximaPago);
    const diaSemanaMaximaPago = fechaMaxima.getDay();
    const mesMaximaPago = fechaMaxima.getMonth() + 1;

    return {
      ...item,
      diaSemanaMaximaPago,
      mesMaximaPago,
      monto: item.monto,
    };
  });

  const X = datosConCaracteristicas.map(item => ({
    diaSemanaMaximaPago: item.diaSemanaMaximaPago,
    mesMaximaPago: item.mesMaximaPago,
    monto: item.monto,
  }));
  const y = datosConCaracteristicas.map(item => item.diasRetraso);

  console.log('Datos Pre-Procesados Fase 2 (X) para entrenamiento (desde tabla modificada):', X.slice(0, 5));
  console.log('Variable Objetivo (y) para entrenamiento Fase 2 (desde tabla modificada):', y.slice(0, 5));
  alert(`Pre-procesamiento Fase 2 completado (usando tabla modificada). Se prepararon ${datosConCaracteristicas.length} registros para el entrenamiento del modelo.`);
};


  const handleNuevoAnalisis = () => {
    setArchivoCSV(null);
    setDatosCSVOriginal([]);
    setDatosCSVMostrar([]);
    setFilasModificadas([]);
    setError(null);
    setIsFileSelectedAndProcessed(false);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Análisis de Datos CSV</h2>

      <div className={styles.uploadContainer}>
        <label htmlFor="subirCSV" className={`${styles.uploadLabel} ${isFileSelectedAndProcessed ? styles.uploadLabelBlocked : ''}`}>
          Seleccionar Archivo CSV
        </label>
        <input
          type="file"
          id="subirCSV"
          accept=".csv"
          onChange={handleSubirArchivo}
          className={styles.uploadInput}
          ref={fileInputRef}
          disabled={isFileSelectedAndProcessed}
        />
        {datosCSVMostrar.length > 0 && (
          <button className={styles.newAnalysisButton} onClick={handleNuevoAnalisis}>
            Nuevo Análisis
          </button>
        )}
        {archivoCSV && <p className={styles.fileName}>Archivo seleccionado: {archivoCSV.name}</p>}
        {error && <p className={styles.error}>{error}</p>}
      </div>

      {datosCSVMostrar.length > 0 && (
        <div className={styles.dataContainer}>
          <h3>Datos del CSV:</h3>
          <table>
            <thead>
              {datosCSVMostrar[0] && (
                <tr>
                  {datosCSVMostrar[0].map((encabezado, index) => (
                    <th key={index}>{encabezado}</th>
                  ))}
                </tr>
              )}
            </thead>
            <tbody>
              {datosCSVMostrar.slice(1).map((fila, index) => (
                <tr key={index}>
                  {fila.map((celda, indexCelda) => (
                    <td key={indexCelda}>{celda}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <button className={styles.preprocessButton} onClick={handlePreProcesamiento}>
            Pre-Procesamiento
          </button>
        </div>
      )}

      {filasModificadas.length > 0 && (
        <div className={styles.modificationsContainer}>
          <h3>Filas con Modificaciones:</h3>
          <table>
            <thead>
              {datosCSVOriginal[0] && (
                <tr>
                  {datosCSVOriginal[0].map((encabezado, index) => (
                    <th key={index}>{encabezado}</th>
                  ))}
                </tr>
              )}
            </thead>
            <tbody>
              {filasModificadas.map((filaModificada, indexFila) => (
                <tr key={indexFila}>
                  {filaModificada.modificada.map((celda, indexCelda) => (
                    <td
                      key={indexCelda}
                      className={
                        indexCelda === filaModificada.indices.fechaPago ? styles.modifiedField : ''
                      }
                    >
                      {celda}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <button className={styles.preprocessPhase2Button} onClick={handlePreProcesamientoFase2}>
            Pre-Procesamiento Fase 2
          </button>
        </div>
      )}

      {archivoCSV && datosCSVMostrar.length === 0 && !error && (
        <button className={styles.processButton} onClick={procesarCSV}>
          Procesar CSV
        </button>
      )}
    </div>
  );
}

export default AnalisisDatos;