const commandLineArgs = require('command-line-args');
const { error } = require('console');
const optDefinitions = [
  { name: 'proyecto', type: String, defaultOption: true },
]
const args = commandLineArgs(optDefinitions)
const { proyecto } = args

const DATOS_PATH = 'leyes/base-infoleg-normativa-nacional.csv';
const csv = require('csv-parser')
const fs = require('fs')

// ejemplo del CSV de DATOS_PATH:
/*
"id_norma","tipo_norma","numero_norma","clase_norma","organismo_origen","fecha_sancion","numero_boletin","fecha_boletin","pagina_boletin","titulo_resumido","titulo_sumario","texto_resumido","observaciones","texto_original","texto_actualizado","modificada_por","modifica_a"
"374675","Resolución","15","","COMISION TECNICA MIXTA DEL FRENTE MARITIMO","2022-11-03","35045","2022-11-11","30","ESPECIE GATUZO - RESERVA ADMINISTRATIVA DE CAPTURA","COMISION TECNICA MIXTA DEL FRENTE MARITIMO","HABILITESE EL TOTAL DE LA RESERVA ADMINISTRATIVA DE CAPTURA (200 T) PREVISTA EN EL ART. 2º) DE LA RESOLUCION Nº 6/22 PARA LA ESPECIE GATUZO (MUSTELUS SCHMITTI) PARA EL AÑO 2022.","","http://servicios.infoleg.gob.ar/infolegInternet/anexos/370000-374999/374675/norma.htm","","0","1"
"374242","Decisión Administrativa","1102","","JEFATURA DE GABINETE DE MINISTROS","2022-11-03","35040","2022-11-04","31","DESIGNACION","AGENCIA NACIONAL DE PROMOCION DE LA INVESTIGACION, EL DESARROLLO TECNOLOGICO Y LA INNOVACION","DASE POR DESIGNADO CON CARACTER TRANSITORIO, A PARTIR DEL 1° DE SEPTIEMBRE DE 2022 Y POR EL TERMINO DE CIENTO OCHENTA (180) DIAS HABILES CONTADOS A PARTIR DE LA FECHA DE LA PRESENTE MEDIDA, AL MEDICO VETERINARIO JORGE OSVALDO BLACKHALL (D.N.I Nº 14.202.944) EN EL CARGO DE DIRECTOR DE EVALUACION TECNICA DE PROYECTOS DE INVESTIGACION DE LA DIRECCION NACIONAL DEL FONDO PARA LA INVESTIGACION CIENTIFICA Y TECNOLOGICA (FONCYT) DE LA AGENCIA NACIONAL DE PROMOCION DE LA INVESTIGACION, EL DESARROLLO TECNOLOGICO Y LA INNOVACION, ORGANISMO DESCENTRALIZADO ACTUANTE EN LA ORBITA DEL MINISTERIO DE CIENCIA, TECNOLOGIA E INNOVACION, NIVEL B - GRADO 0 DEL CONVENIO COLECTIVO DE TRABAJO SECTORIAL DEL PERSONAL DEL SISTEMA NACIONAL DE EMPLEO PUBLICO (SINEP) HOMOLOGADO POR EL DECRETO N° 2098/08.","","","","0",""
"374234","Decreto","736","","PODER EJECUTIVO NACIONAL (P.E.N.)","2022-11-03","35040","2022-11-04","23","RENUNCIA Y DESIGNACION","MINISTERIO DE DESARROLLO SOCIAL","DASE POR ACEPTADA, A PARTIR DEL 13 DE OCTUBRE DE 2022, LA RENUNCIA PRESENTADA POR EL SEÑOR GUSTAVO MARCELO AGUILERA (D.N.I. N° 21.089.893) AL CARGO DE SECRETARIO DE ARTICULACION DE POLITICA SOCIAL DEL MINISTERIO DE DESARROLLO SOCIAL. DASE POR DESIGNADO, A PARTIR DEL 13 DE OCTUBRE DE 2022, EN EL CARGO DE SECRETARIO DE ARTICULACION DE POLITICA SOCIAL DEL MINISTERIO DE DESARROLLO SOCIAL AL PROFESOR LEONARDO SEBASTIAN MOYANO (D.N.I. N° 29.151.778).","","http://servicios.infoleg.gob.ar/infolegInternet/anexos/370000-374999/374234/norma.htm","","0","1"
*/
// en cargarNombres() quiero cargar la base de datos CSV, y mapear cada ley en el array leyes con su nombre (titulo_resumido)
// el archivo es muy grande, 200mb, asi que usar streams o algo asi.

const DEBUG_LEYES = ["24156", "24185", "24241", "24449", "24515"];

function cargarNombres(leyes) {
  const path = require('path')
  const ruta = path.join(__dirname, DATOS_PATH)
  const stream = fs.createReadStream(ruta, { encoding: 'utf8' })
  let compilado = {}

  // const leyesInt = leyes.map(ley => parseInt(ley))
  const leyesOk = leyes.filter(ley => ley != '')

  return new Promise((resolve, reject) => {
    stream.pipe(csv())
      .on('data', (data) => {
        const tipoLimpio = data.tipo_norma.replace("Decreto/", "");

        const esLey = (tipoLimpio === 'Ley')
        if (leyesOk.includes(data.numero_norma)) {
          if (DEBUG_LEYES.includes(data.numero_norma)) console.log(">>>>>> DEBUG", data)
          // console.log('ENCONTRE!', data.numero_norma, data.titulo_resumido)
          const yaExiste = !!compilado[data.numero_norma]
          if (!yaExiste) compilado[data.numero_norma] = {}
          if (yaExiste && !esLey) {
            // console.log('Ya existe y no es ley', data.numero_norma, 'tenia:', compilado[data.numero_norma].tipo, 'y nuevo:', tipoLimpio)
            // Solo sobreescribir item si el actual ES LEY
          } else {
            if (yaExiste && esLey) console.log('SOBREESCRIBIENDO, ENCONTRE LEY', data.numero_norma, 'tenia:', compilado[data.numero_norma].tipo, 'y nuevo:', tipoLimpio)
            compilado[data.numero_norma] = {
              nombre: data.titulo_sumario || data.titulo_resumido,
              tipo: tipoLimpio,
              fecha: data.fecha_sancion,
              modificadaPor: data.modificada_por,
              link: data.texto_original,
            }
          }
        }
      })
      .on('end', () => {
        console.log('Fin!');
        resolve(compilado)
      })
      .on('error', (err) => {
        console.log('Error:', err)
        reject(err)
      })
      /*
      .on('close', () => {
        console.log('Cerrado!')
        resolve(nombres)
      })
      */
  })
}

// Load file proyectos/${proyecto}.txt using fs.readFileSync
function cargar(archivo) {
  const fs = require('fs')
  const path = require('path')
  const ruta = path.join(__dirname, `proyectos/${archivo}.txt`)
  try {
    const datos = fs.readFileSync(ruta, 'utf8')
    return datos
  } catch (err) {
    console.error('Error al cargar el archivo:', ruta)
  }
}

function extraerTitulos(texto) {
  const regex = /ARTÍCULO (\d*)°?.- (.*)\n/g
  const titulos = []
  let match = regex.exec(texto)
  while (match != null) {
    const id = parseInt(match[1])
    const contenido = match[2].replace("General de Sociedades ", "");

    // Identificar menciones a leyes dentro de contenido, se espera solo 1 match por titulo
    // La ley podria contener punto decimal: 23.444
    const regexLey = /Ley (?:N[°º] ?)?(?:Nr?o\.? ?)?(?:N[uú]mero ?)? ?([\d\.]*)/ig
    const matchLey = regexLey.exec(contenido)
    let ley = 'N/A'
    if (matchLey != null) {
      ley = matchLey[1].replace(/\./g, "").trim()
    }
    if (ley == '') ley = 'N/A'

    titulos[id] = (`${id}@${ley}@${contenido}`)
    match = regex.exec(texto)
  }
  return titulos;
}

function separarAnexos(texto) {
  const divisorAnexos = "ANEXO I EMPRESAS PÚBLICAS SUJETAS A PRIVATIZACIÓN";
  const partes = texto.split(divisorAnexos);
  partes[1] = divisorAnexos + partes[1];
  return partes;
}



async function procesar(texto) {
  // 1. Limpiar: Eliminar todos los bloques de texto encerrados por comillas asi: “foo”
  const regexComillas = /“[^”]*”/g
  limpio = texto.replace(regexComillas, '')

  // 2. Separar texto principal de los anexos
  const [ textoPrincipal, anexos ] = separarAnexos(limpio)

  // 3. Ubicar titulos
  const titulos = extraerTitulos(textoPrincipal)

  // 4. Compilar leyes unicas
  const leyes = []
  titulos.forEach(titulo => {
    const [ id, ley, contenido ] = titulo.split('@')
    if (ley != 'N/A') {
      if (!leyes.includes(ley)) leyes.push(ley)
    }
  })

  // 5. Buscar nombres de las leyes
  console.log('Cargando nombres...')
  const DB = await cargarNombres(leyes);
  const keys = Object.keys(DB)
  console.log('LEY@TIPO@FECHA@NOMBRE@MODIFICADA_POR@LINK')
  keys.forEach(key => {
    const datos = DB[key]
    console.log(`${key}@${datos.tipo}@${datos.fecha}@${datos.nombre}@${datos.modificadaPor}@${datos.link}`)
  })
  console.log('-------------------------')


  // 6. Mostrar titulos
  titulos.forEach(titulo => console.log(titulo))
}

// output en formato CSV (separado por @) listo para importar a una planilla
async function principal() {
  const texto = await cargar(proyecto)
  await procesar(texto)
}

principal()