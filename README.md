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

2. Descargar [base de datos de leyes](https://datos.gob.ar/dataset/justicia-base-infoleg-normativa-nacional/archivo/justicia_bf0ec116-ad4e-4572-a476-e57167a84403) (para disponer de informacion adicional sobre las leyes mencionadas).

Ubicar el archivo `base-infoleg-normativa-nacional.csv` en la carpeta `leyes/`. (Ya viene incluida en `.gitignore`)

(Si queres una vista previa de estos datos para entender el formato podes descargar el [archivo de muestreo](https://datos.gob.ar/km/dataset/justicia-base-infoleg-normativa-nacional/archivo/justicia_8b1c2310-564e-41e6-9a84-99cfa9939bbc))

# Ejemplo de uso

```
yarn start MILEI2
```

Y luego copiar output a una planilla y dividir por separador. (O guardar como CSV e importar)
