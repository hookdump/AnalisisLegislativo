const commandLineArgs = require('command-line-args')
const optDefinitions = [
  { name: 'proyecto', type: String, defaultOption: true },
]
const args = commandLineArgs(optDefinitions)
const { proyecto } = args

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
      ley = matchLey[1].replace(/\./g, "")
    }

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

function procesar(texto) {
  // 1. Limpiar: Eliminar todos los bloques de texto encerrados por comillas asi: “foo”
  const regexComillas = /“[^”]*”/g
  limpio = texto.replace(regexComillas, '')

  // 2. Separar texto principal de los anexos
  const [ textoPrincipal, anexos ] = separarAnexos(limpio)

  // 3. Ubicar titulos
  const titulos = extraerTitulos(textoPrincipal)

  // 4. Mostrar titulos
  titulos.forEach(titulo => console.log(titulo))
}

// output en formato CSV (separado por @) listo para importar a una planilla
async function principal() {
  const texto = await cargar(proyecto)
  procesar(texto)
}

principal()