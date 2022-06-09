# API Proxy

Proyecto para implementar un proxy que actúe como intermediario entre el API de Mercado Libre y los servidores cliente.

## Tabla de contenido
- [Problemática](#problemática)
- [Metas](#metas)
- [Visión general](#visión-general)
- [Diseño](#diseño)
- [Implementación](#implementación)
  - [Instalación](#instalación)
  - [Configuración](#configuración)
  - [Estructura del proyecto](#estructura-del-proyecto)
  - [Migraciones](#migraciones)
  - [Ejecución](#ejecución)
- [Escalabilidad](#escalabilidad)
- [Notas](#notas)

## Problemática
Mercado Libre corre sus aplicaciones en más de 20,000 servidores, los cuales suelen comunicarse entre sí a través de API's y solo algunas son accesibles desde el exterior.

Uno de los problemas que se tienen actualmente es cómo controlar y medir estas interconexiones. Para lo cual, se necesita crear e implementar un *proxy de API's*.

## Metas
- Permitir ejecutar la función de proxy sobre el dominio api.mercadolibre.com: realizar la petición al proxy y este debe retornar el llamado a api.mercadolibre.com.
  - Ejemplo: `curl 127.0.0.1:8080/categories/MLA97994` deberá retornar el contenido de `https://api.mercadolibre.com/categories/MLA97994`
- Controlar la cantidad máxima de llamados por:
  - IP de origen
  - Path de destino
  - Combinaciones de ambos
  - Cuota de peticiones
- Se deben almacenar estadísticas de uso del proxy
- El proxy deberá poder ejecutarse sobre Linux
- La carga media del proxy debe superar los 50,000 request/segundo

## Visión general
Esta es un API proxy que permite realizar las peticiones al API de Mercado Libre (api.mercadolibre.com) mediante el proxy y retornando la respuesta por parte del API.

El proyecto se centra en una solución que escalará con el tiempo a medida que las necesidades del negocio crezcan y se necesite de una mayor disponibilidad y escalabilidad del API proxy. Para lo cual se considera un diseño de la arquitectura inicial.

## Diseño
El proyecto consiste en un proxy API que recibe las peticiones de distintos clientes para realizar la petición al API de mercadolibre, con el fin de retornar la respuesta del API.

El proxy está diseñado para recibir peticiones y mantener un rendimiento estable para su carga media de 50,000 request/segundo. El proxy debe poder ser ejecutado en un servidor Linux, para lo cual se utilizará el administrador de procesos para Node.js, PM2, el cual permitirá que el servicio se mantenga en ejecución y permitiendo que se genere un registro de logs básico en caso de que surjan errores al momento en el que el servicio presente latencias o una carga excesiva.

El proxy, al haberse pensado para correr en servidores Linux, puede ser llevado a cualquier proveedor en la nube que permita la ejecución del proyecto según las especificaciones de la implementación. Algunos proveedores podrían ser Google Cloud Platform, Amazon Web Services, Microsoft Azure, Cloudflare Workers, etc. La elección del proveedor dependerá de acuerdo a cómo vaya escalando el proyecto.

![Diagrama de arquitectura](https://github.com/jessicaramsa/api-proxy-ml/blob/main/resources/imgs/architecture.png?raw=true)

Al recibir las peticiones de los distintos clientes, de manera paralela se piensa llevar el registro de las estadísticas de uso que se le da al API. Este proceso en paralelo deberá llevar el registro de la IP de origen, el path de destino, información completa del payload de la request (headers, método, body, etc.), adicionalmente, se deberá llevar el registro de la cantidad de peticiones que se han realizado desde la misma IP de origen hacia el path de destino del API para realizar el conteo de la cuota de peticiones por la combinación de la IP de origen y el path de destino.

La información generada para las estadísticas de uso se guardará en una base de datos relacional, para lo cual se utilizará una base de datos MySQL. Esto con la finalidad de que en un futuro se pueda llegar a escalar el proyecto y explotar los beneficios que ofrecen las bases de datos relacionales y llevarlo a un cluster de BigTable.

Con el fin de evitar problemas con las consultas hacia la base de datos, se implementará la indexación de las tablas existentes permitiendo que los datos sean filtrados con mayor facilidad y eficiencia. La indexación resultará importante en la fase inicial y a corto plazo, dando tiempo para analizar la cantidad de registros que serán almacenados y posteriormente, procesados para mostrar las estadísticas de uso.

![Diagrama de base de datos](https://github.com/jessicaramsa/api-proxy-ml/blob/main/resources/imgs/database.png?raw=true)

El siguiente diagrama muestra las clases que se utilizan en el proyecto.

![Diagrama de clases](https://github.com/jessicaramsa/api-proxy-ml/blob/main/resources/imgs/classes.png?raw=true)

En este diagrama se encuentran las clases que identifican a las request que llegarán al proxy, las cuales tendrán sus respectivos atributos y métodos. A su vez, la clase que identifica las request se comunicará con la clase de la métrica de uso ya que dependerá del número de peticiones que lleguen al proxy y con base en esa métrica será conforme se pueda calcular el uso del proxy.

Podrían existir más clases que se puedan generar a partir del uso del proxy, sin embargo, se deja fuera del alcance.

Las tecnologías utilizadas:
- Javascript
- [Node.js v16.14.2 (o superior, recomendado)](https://nodejs.org/en/download/)
- [PM2](https://pm2.keymetrics.io/)
- Database MySQL

## Implementación

### Instalación
1. Clonar el repositorio via HTTPS o SSH (recomendado)
```bash
git clone git@github.com:jessicaramsa/api-proxy-ml.git
```

2. Verificar que la versión de Node.js sea la recomendada o una superior
```bash
node -v
```

3. Instalar globalmente PM2 para correr el proceso del proyecto
```bash
npm install pm2 -g
```

4. Instalar las dependencias del proyecto
```bash
npm install
```

### Configuración
1. Copiar el template del archivo con las variables de entorno
```bash
cp .env.example .env
```

2. Cambiar la configuración del puerto según sea conveniente para ejecutar el proxy

### Ejecución
1. Ejecutar el proyecto mediante npm
```bash
npm start
```

2. Levantar el proceso mediante PM2
```bash
pm2 start ecosystem.config.js
pm2 show api-proxy
```

### Estructura del proyecto
```
📦api-proxy-ml
 ┣ 📂resources
 ┃ ┗ 📂imgs
 ┃ ┃ ┣ 📜architecture.png
 ┃ ┃ ┣ 📜classes.png
 ┃ ┃ ┗ 📜scalability.png
 ┣ 📦test
 ┃ ┣ 📜makeRequests.sh
 ┃ ┗ 📜requests.txt
 ┣ 📂src
 ┃ ┗ 📜index.js
 ┣ 📜.env
 ┣ 📜.env.example
 ┣ 📜.gitignore
 ┣ 📜LICENSE
 ┣ 📜package.json
 ┗ 📜README.md
```

## Escalabilidad
La solución actual se enfoca en la funcionalidad principal para realizar el proxy, sin embargo, se puede llegar a escalar la solución a medida que las necesidades del negocio crezcan, además, de tener una arquitectura mucho más robusta.

El proxy podría recibir una carga de request/segundo que pueda llegar a un punto en el que se presente demasiada latencia, o bien, que el servicio presente caídas a medida que la cantidad de request/segundo vaya incrementando. Por lo que se piensa que a mediano plazo, se escale el proyecto a una arquitectura más robusta donde permita que la función del proxy ya existente se lleve a contenedores Docker.

Esto permitirá que por una parte la implementación se pueda llevar con facilidad a otro servidor y se pueda implementar una solución escalable de alta disponibilidad en el servicio a largo plazo. Como una de las primeras ventajas que ofrecería implementar el contenedor, sería la seguridad de la aplicación ya que se estaría aislando el proyecto del resto de procesos que estén ejecutándose en el servidor donde se despliegue. Independientemente del proceso que se despliegue, el contenedor se encargará de la ejecución del proxy y será una eficiencia en los tiempos de despliegue y configuración.

Una de las cosas a agregar, antes de que el resto de servidores se comuniquen con el proxy, será un balanceador de cargas para el servidor que puede ser implementado de distintas maneras dependiendo el proveedor en la nube que se utilice para realizar el host de la aplicación. Es importante considerar este balanceador de cargas en momentos en los que la aplicación necesite una alta disponibilidad.

Al igual que el servidor host para el proxy, se podría implementar un balanceador de cargas para el cluster de la base de datos. Este balanceador de cargas se encargará de distribuir la carga hacia la base de datos de acuerdo a la cantidad de transacciones que se realicen y/o el número de conexiones hacia la base de datos.

![Diagrama de arquitectura escalable](https://github.com/jessicaramsa/api-proxy-ml/blob/main/resources/imgs/scalability.png?raw=true)

Las conexiones de escritura hacia la base de datos representarían una baja carga, por lo que, las conexiones de lectura se someterían a monitoreo que permita decidir la cantidad de réplicas que se podrían llegar a manejar para tener una alta disponibilidad de los datos. Además, permitiría que las estadísticas de uso se puedan mostrar en la debida interfaz sin generar cuellos de botella por consumir altos volúmenes de datos.
