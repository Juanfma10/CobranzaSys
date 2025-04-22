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
  const [datosPreProcesadosFase2, setDatosPreProcesadosFase2] = useState(null); // Nuevo estado para los datos de Fase 2
  const [datosPreProcesadosFase1, setDatosPreProcesadosFase1] = useState(null);
  const [fechaInicioCobranza, setFechaInicioCobranza] = useState('');
  const [archivoCompleto, setArchivoCompleto] = useState(false); 
  const [botonPreProcesamientoBloqueado, setBotonPreProcesamientoBloqueado] = useState(false);
  const [botonPreProcesamiento2Bloqueado, setBotonPreProcesamiento2Bloqueado] = useState(false);
  const [fechaInicioCobranzaBloqueada, setFechaInicioCobranzaBloqueada] = useState(false);


  const handleFechaInicioCobranzaChange = (event) => {
    setFechaInicioCobranza(event.target.value);
  };

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

 

  
  const handlePreProcesamiento = () => {
    if (!datosCSVOriginal || datosCSVOriginal.length <= 1) {
      alert('No hay datos para pre-procesar.');
      return;
    }
    if (!fechaInicioCobranza) {
      alert('Por favor, selecciona la fecha de inicio de cobranza.');
      return;
    }

    setBotonPreProcesamientoBloqueado(true);
    setFechaInicioCobranzaBloqueada(true);

    const encabezadosOriginal = datosCSVOriginal[0].map(header => header.toLowerCase());
    const indiceFechaPagoOriginal = encabezadosOriginal.indexOf('fechapago');
    const indiceFechaMaximaPagoOriginal = encabezadosOriginal.indexOf('fechamaximapago');
    //const indiceMontoOriginal = encabezadosOriginal.indexOf('monto');
    let completo = true;
    const nuevosFilasModificadas = [];
    const datosModificados = datosCSVOriginal.map((fila, index) => {
      const nuevaFila = [...fila];
      if (index === 0) {
        return [...nuevaFila, 'Fecha Inicio Cobranza'];
      }
      nuevaFila.push(fechaInicioCobranza);
      let modificada = false;
      if (nuevaFila[indiceFechaPagoOriginal] === undefined || nuevaFila[indiceFechaPagoOriginal].trim() === '') {
        nuevaFila[indiceFechaPagoOriginal] = nuevaFila[indiceFechaMaximaPagoOriginal];
        modificada = true;
        completo = false;
      }
      if (modificada) {
        nuevosFilasModificadas.push({
          original: [...fila],
          modificada: nuevaFila.slice(0, -1),
          indices: { fechaPago: indiceFechaPagoOriginal }
        });
      }
      return nuevaFila;
    });

    setFilasModificadas(nuevosFilasModificadas);
    setDatosPreProcesadosFase1(datosModificados);
    setArchivoCompleto(completo);

    if (completo) {
      alert('Archivo CSV completo.');
      setDatosCSVMostrar(datosModificados);
    } else {
      alert('Las fechas de pago vacías se han completado y se muestra una tabla de modificaciones.');
      //setDatosCSVMostrar(datosModificados);
    }
  };



  

  const handlePreProcesamientoFase2 = () => {

    if (!datosPreProcesadosFase1 || datosPreProcesadosFase1.length <= 1) {
      alert('Por favor, ejecuta el Pre-Procesamiento primero.');
      return;
    }
    setBotonPreProcesamiento2Bloqueado(true);

    const encabezadosMostrar = datosPreProcesadosFase1[0];
    const datosParaPrediccion = [...datosPreProcesadosFase1.slice(1)];

    const getIndice = (header) => encabezadosMostrar.findIndex(h => h.toLowerCase() === header.toLowerCase());
    const indiceFechaMaximaPago = getIndice('fechamaximapago');
    const indiceFechaPago = getIndice('fechapago');
    const indiceMonto = getIndice('monto'); // <---- AÑADIDO: Obtener el índice de "monto"
    

    if (indiceFechaMaximaPago === -1) {
      alert('La columna "fechaMaximaPago" no se encontró en los datos pre-procesados.');
      return;
    }
   

    const datosConObjetivo = datosParaPrediccion.map(fila => {
      const fechaMaxima = new Date(fila[indiceFechaMaximaPago]);
      const fechaPagoStr = fila[indiceFechaPago];
      let montoStr=fila[indiceMonto]
      let diasRetraso = null;

      if (fechaPagoStr && fechaPagoStr.trim() !== '') {
        const fechaPagoReal = new Date(fechaPagoStr);
        const diferenciaTiempo = fechaPagoReal.getTime() - fechaMaxima.getTime();
        diasRetraso = Math.ceil(diferenciaTiempo / (1000 * 3600 * 24));
      }

      return {
        fechaMaximaPago: fila[indiceFechaMaximaPago],
        fechaPago: fechaPagoStr,
        monto:montoStr,
        diasRetraso: diasRetraso,
        filaOriginal: fila,
      };
    }).filter(item => item.diasRetraso !== null);

    if (datosConObjetivo.length === 0) {
      alert('No hay datos de pagos completados en los datos pre-procesados para generar la variable objetivo.');
      return;
    }

    const datosConCaracteristicas = datosConObjetivo.map(item => {
      const fechaMaxima = new Date(item.fechaMaximaPago);
      const diaSemanaMaximaPago = fechaMaxima.getDay();
      const mesMaximaPago = fechaMaxima.getMonth() + 1;
      const fechaInicio = new Date(fechaInicioCobranza);
      const diferenciaInicioMaxima = Math.ceil((fechaMaxima.getTime() - fechaInicio.getTime()) / (1000 * 3600 * 24));

      return {
        fechaInicioCobranza: fechaInicioCobranza,
        diaSemanaMaximaPago,
        mesMaximaPago,
        monto: item.monto, // <---- USAR el monto del item
        diasRetraso: item.diasRetraso,
        diferenciaInicioMaxima,
      };
    });

    setDatosPreProcesadosFase2(datosConCaracteristicas);
    console.log('Datos Pre-Procesados Fase 2:', datosConCaracteristicas.slice(0, 5));
    alert(`Pre-procesamiento Fase 2 completado. Se prepararon ${datosConCaracteristicas.length} registros para el entrenamiento del modelo.`);
  };



  const handleNuevoAnalisis = () => {
    setArchivoCSV(null);
    setDatosCSVOriginal([]);
    setDatosCSVMostrar([]);
    setFilasModificadas([]);
    setBotonPreProcesamientoBloqueado(false); 
    setError(null);
    setIsFileSelectedAndProcessed(false);
    setFechaInicioCobranza(''); // Restablecer la fecha de inicio de cobranza
    setDatosPreProcesadosFase1(null); // Restablecer los datos de Fase 1
    setDatosPreProcesadosFase2(null); // Restablecer los datos de Fase 2
    setBotonPreProcesamiento2Bloqueado(false);
    setFechaInicioCobranzaBloqueada(false); // Desbloquear el input al nuevo análisis
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Limpiar el input de archivo
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
        <div className={`${styles.dataContainer} ${archivoCompleto ? styles.completo : ''}`}>
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

          <div className={styles.cobranzaDateInput}>
            <label htmlFor="fechaInicioCobranza">Fecha de inicio de cobranza:</label>
            <input
              type="date"
              id="fechaInicioCobranza"
              value={fechaInicioCobranza}
              onChange={handleFechaInicioCobranzaChange}
              disabled={fechaInicioCobranzaBloqueada}
            />
          </div>

          <button className={styles.preprocessButton} onClick={handlePreProcesamiento}
              disabled={botonPreProcesamientoBloqueado}    
          >
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
          <button className={styles.preprocessPhase2Button} 
          onClick={handlePreProcesamientoFase2}
          disabled={botonPreProcesamiento2Bloqueado} >
            Pre-Procesamiento Fase 2
          </button>
        </div>
      )}


{datosPreProcesadosFase2 && (
        <div className={styles.phase2OutputContainer}>
          <h3>Datos Pre-Procesados (Fase 2):</h3>
          <table>
            <thead>
              <tr>
                <th>Fecha Inicio Cobranza</th> {/* Nueva columna */}
                <th>Mes Max Pago</th>
                <th>Día Max Pago vs Inicio Cobranza</th>
                <th>Días de Retraso</th>
                <th>Monto</th> {/* Cambiado a minúsculas para coincidir con la propiedad */}
              </tr>
            </thead>
            <tbody>
              {datosPreProcesadosFase2.map((data, index) => (
                <tr key={index}>
                  <td>{data.fechaInicioCobranza}</td> {/* Renderizar fecha de inicio */}
                  <td>{data.mesMaximaPago}</td>
                  <td>{data.diferenciaInicioMaxima}</td>
                  <td>{data.diasRetraso}</td>
                  <td>{data.monto}</td> {/* Accediendo a la propiedad 'monto' */}
                </tr>
              ))}
            </tbody>
          </table>
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