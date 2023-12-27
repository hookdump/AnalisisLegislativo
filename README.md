# AnalisisLegislativo

Herramienta de linea de comando (node) para parsear proyectos legislativos y sintetizar sus puntos principales.

* Leyes derogadas (total o parcialmente)
* Leyes modificadas
* Leyes o artículos nuevos
* Anexos

# Instalacion

1. Instalar dependencias
```
yarn
```

2. Descargar base de datos de leyes (para disponer de informacion adicional sobre las leyes mencionadas)

https://datos.gob.ar/dataset/justicia-base-infoleg-normativa-nacional/archivo/justicia_bf0ec116-ad4e-4572-a476-e57167a84403

Descargar el archivo `base-infoleg-normativa-nacional.csv` en la carpeta `leyes/`. (Ya viene incluida en `.gitignore`)

# Ejemplo de uso

```
yarn start MILEI2
```

Y luego copiar output a una planilla y dividir por separador. (O guardar como CSV e importar)
