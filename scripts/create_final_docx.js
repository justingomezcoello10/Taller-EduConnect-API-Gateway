const fs=require('fs'),path=require('path');
const docx=require(path.join(process.cwd(),'scripts/node_modules/docx'));
const {Document,Packer,Paragraph,TextRun,HeadingLevel,Table,TableRow,TableCell,WidthType,AlignmentType,ImageRun,PageBreak,Header,Footer,PageNumber,TableOfContents}=docx;
const ROOT=process.cwd(), CAP=path.join(ROOT,'evidencia','capturas-reales');
const BLUE='0B5CAB', NAVY='17365D', WHITE='FFFFFF', PALE='DDEBF7', GREY='666666';
const p=(text='',o={})=>new Paragraph({children:[new TextRun({text,bold:o.bold,italics:o.italics,color:o.color||'222222',size:o.size||(o.small?20:22)})],alignment:o.align||AlignmentType.LEFT,spacing:{before:o.before||70,after:o.after||90,line:o.line||300}});
const h=(text,l=1)=>new Paragraph({text,heading:l===1?HeadingLevel.HEADING_1:l===2?HeadingLevel.HEADING_2:HeadingLevel.HEADING_3,spacing:{before:280,after:130}});
const bullet=text=>new Paragraph({text,bullet:{level:0},spacing:{after:55,line:280}});
const code=text=>new Paragraph({children:[new TextRun({text,font:'Cascadia Mono',size:18})],shading:{fill:'F2F4F5'},spacing:{before:50,after:100}});
function table(headers,rows,widths){return new Table({columnWidths:widths,width:{size:widths.reduce((a,b)=>a+b,0),type:WidthType.DXA},rows:[new TableRow({children:headers.map((x,i)=>new TableCell({width:{size:widths[i],type:WidthType.DXA},shading:{fill:BLUE},margins:{top:90,bottom:90,left:90,right:90},children:[p(x,{bold:true,color:WHITE,small:true})]}))}),...rows.map(r=>new TableRow({children:r.map((x,i)=>new TableCell({width:{size:widths[i],type:WidthType.DXA},margins:{top:80,bottom:80,left:90,right:90},children:[p(String(x),{small:true})]}))}))]});}
function image(name,width=620,height=330,caption){const arr=[];const file=path.join(CAP,name);if(fs.existsSync(file)){arr.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:100,after:70},children:[new ImageRun({data:fs.readFileSync(file),type:name.endsWith('.png')?'png':'jpg',transformation:{width,height}})]}));if(caption)arr.push(p(caption,{align:AlignmentType.CENTER,italics:true,small:true,color:GREY,after:150}));}else arr.push(p(`[Evidencia visual pendiente: ${name}]`,{italics:true,color:'C00000'}));return arr;}
const c=[];
c.push(new Paragraph({text:'Universidad de las Américas',heading:HeadingLevel.TITLE,alignment:AlignmentType.CENTER,spacing:{before:900,after:100}}));
c.push(p('Facultad de Ingeniería y Ciencias Aplicadas',{align:AlignmentType.CENTER,bold:true,size:28,after:500}));
c.push(p('INFORME TÉCNICO',{align:AlignmentType.CENTER,bold:true,size:36,color:BLUE,after:100}));
c.push(p('Taller EduConnect API Gateway',{align:AlignmentType.CENTER,bold:true,size:28,after:450}));
c.push(p('Grupo 3',{align:AlignmentType.CENTER,bold:true,size:26,after:300}));
c.push(p('Jhoel Suarez  •  Mauricio Mora  •  Stefan Jativa  •  Justin Gomezcoello',{align:AlignmentType.CENTER,after:180}));
c.push(p('Asignatura: Integración de Sistemas',{align:AlignmentType.CENTER,after:80}));
c.push(p('Fecha: 24 de noviembre de 2026',{align:AlignmentType.CENTER,after:300}));
c.push(p('Kong Gateway 3.9.5 | Docker Compose | Postman | GitHub',{align:AlignmentType.CENTER,bold:true,color:NAVY,after:100}));
c.push(new Paragraph({children:[new PageBreak()]}) );
c.push(h('Índice',1));c.push(new TableOfContents('Contenido',{hyperlink:true,headingStyles:{from:1,to:3}}));c.push(new Paragraph({children:[new PageBreak()]}) );

c.push(h('1. Introducción',1));
c.push(p('Primero se identificó el problema: EduConnect tenía varios sistemas y consumidores accediendo directamente a distintas APIs, sin una política común de autenticación ni control de consumo. Luego se decidió construir una prueba de concepto reproducible que centralizara el acceso con un API Gateway, sin reescribir los sistemas existentes.'));
c.push(p('El objetivo de este informe es documentar, paso a paso, lo que el equipo hizo: desde el despliegue de Kong en Docker hasta las pruebas con Postman y la publicación en GitHub. Cada evidencia se presenta con su captura real y la explicación de lo que demuestra.'));

c.push(h('2. Equipo y contexto',1));
c.push(p('Universidad de las Américas — Facultad de Ingeniería y Ciencias Aplicadas. Asignatura: Integración de Sistemas. Grupo 3: Jhoel Suarez, Mauricio Mora, Stefan Jativa y Justin Gomezcoello. Repositorio público: https://github.com/justingomezcoello10/Taller-EduConnect-API-Gateway'));

c.push(h('3. Arquitectura implementada',1));
c.push(p('Primero se definió una red Docker privada (educonnect-net) donde viven Kong y los cuatro mocks. Luego se expuso únicamente el puerto 8000 de Kong al sistema anfitrión. Los servicios internos no publican puertos, por lo que solo Kong puede alcanzarlos mediante DNS interno.'));
c.push(table(['Componente','Nombre/puerto','Función'],[['Cliente','Postman/curl','Inicia solicitudes HTTP'],['Gateway','Kong:8000','Proxy público y aplicación de plugins'],['Estudiantes','estudiantes:3001','GET /estudiantes'],['Matrículas','matriculas:3002','GET /matriculas'],['Pagos','pagos:3003','GET /pagos'],['Certificados','certificados:3004','GET /certificados'],['Red','educonnect-net','DNS interno y comunicación privada']], [2200,2800,4000]));

c.push(h('4. Despliegue del entorno',1));
c.push(h('4.1 Primer paso: levantar los contenedores',2));
c.push(p('Primero se ejecutó el comando que construye los mocks y crea la red interna. Luego se verificó que los cinco contenedores quedaran saludables.'));
c.push(code('docker compose up -d --build'));
c.push(code('docker compose ps'));
c.push(p('La captura siguiente muestra Docker Desktop con los cinco contenedores en estado healthy. Esto demuestra que el entorno se desplegó correctamente antes de cualquier prueba.'));
c.push(...image('33-docker-desktop.png',620,340,'Docker Desktop: contenedores educonnect-kong, estudiantes, matriculas, pagos y certificados en estado healthy.'));
c.push(p('La terminal siguiente confirma lo mismo mediante docker compose ps, con los puertos expuestos solo por Kong (8000 y 8001).'));
c.push(...image('35-terminal-docker-ps.png',620,320,'Terminal: docker compose ps muestra los cinco servicios Up y healthy.'));

c.push(h('4.2 Segundo paso: comprobar la versión de Kong',2));
c.push(p('Primero se consultó el endpoint administrativo. Luego se confirmó que la versión fuera 3.9.5, la fijada en el compose.'));
c.push(code('curl http://127.0.0.1:8001/'));
c.push(p('La respuesta devolvió "3.9.5", lo que valida que el gateway instalado coincide con la versión declarada en la configuración.'));

c.push(h('5. Configuración de Kong (DB-less)',1));
c.push(p('Primero se eligió el modo DB-less para que toda la configuración viva en kong/kong.yml y sea reproducible. Luego se definieron Consumers, Services, Routes y plugins.'));
c.push(bullet('Consumers: educonnect-app (5/min), educonnect-rate (5/min) y educonnect-cert (2/min).'));
c.push(bullet('Services: estudiantes-service, matriculas-service, pagos-service y certificados-service apuntando a los mocks por nombre DNS.'));
c.push(bullet('Routes públicas: /api/estudiantes, /api/matriculas, /api/pagos y /api/certificados con strip_path: true.'));
c.push(bullet('Plugins: key-auth en cada Route y rate-limiting con policy local y limit_by consumer.'));
c.push(p('La cabecera usada por el cliente es apikey. Kong valida la clave, identifica al consumidor y oculta la credencial al backend (apiKeyRecibidaEnBackend: false).'));

c.push(h('6. Pruebas en Postman',1));
c.push(h('6.1 Primer paso: importar la colección',2));
c.push(p('Primero se abrió Postman en modo local. Luego se importó el archivo Postman_EduConnect_API_Gateway.postman_collection.json desde el repositorio. La colección quedó con sus variables baseUrl, apiKey, rateKey y certKey.'));
c.push(...image('04-postman-importacion-real.png',620,320,'Captura real del importador de Postman con el archivo de la colección.'));
c.push(...image('20-postman-coleccion-importada.png',620,340,'Postman Desktop: colección importada con las 10 solicitudes y variables configuradas.'));

c.push(h('6.2 Segundo paso: revisar la estructura de la colección',2));
c.push(p('La colección contiene diez solicitudes organizadas así:'));
for(const s of ['Estudiantes - positiva (GET /api/estudiantes con apikey válida)','Matrículas - positiva (GET /api/matriculas)','Pagos - positiva (GET /api/pagos)','Sin API Key - 401 (GET sin cabecera)','API Key incorrecta - 401 (apikey inválida)','Ruta no registrada - 404 (GET /api/desconocido)','Rate limit Pagos - ejecutar 6 veces (apikey rate)','Certificados - positiva (GET /api/certificados)','Certificados sin API Key - 401','Rate limit Certificados - ejecutar 3 veces (apikey cert)']) c.push(bullet(s));
c.push(p('Cada solicitud usa la variable {{baseUrl}} que apunta a http://localhost:8000. Las credenciales se inyectan mediante {{apiKey}}, {{rateKey}} y {{certKey}}.'));

c.push(h('6.3 Tercer paso: ejecutar y verificar cada solicitud',2));
c.push(p('Primero se envió la solicitud de Pagos desde Postman. Luego se verificó que la respuesta fuera 200 OK con el JSON del mock. La captura muestra el cuerpo real devuelto por Kong.'));
c.push(...image('24-pagos-200.png',620,340,'Postman: respuesta 200 OK de Pagos con el cuerpo JSON del mock.'));

c.push(h('Reto 1 — Rutas positivas (200)',3));
c.push(p('Predicción: las cuatro rutas públicas llegarán al backend correspondiente y devolverán HTTP 200 con datos JSON.'));
c.push(table(['Ruta','API Key','Respuesta observada','Servicio'],[['/api/estudiantes','educonnect-poc-key-2026','200','estudiantes'],['/api/matriculas','educonnect-poc-key-2026','200','matriculas'],['/api/pagos','educonnect-poc-key-2026','200','pagos'],['/api/certificados','educonnect-poc-key-2026','200','certificados']], [2200,2600,1800,1600]));
c.push(p('Los cuerpos devueltos fueron:'));
c.push(code('{"id":101,"nombre":"Ana Perez","carrera":"Ingenieria de Software","servicio":"estudiantes"}'));
c.push(code('{"id":501,"estudianteId":101,"periodo":"2026-1","estado":"ACTIVA","servicio":"matriculas"}'));
c.push(code('{"id":701,"matriculaId":501,"valor":150,"moneda":"USD","estado":"PENDIENTE","servicio":"pagos"}'));
c.push(code('{"id":901,"estudianteId":101,"tipo":"CERTIFICADO_ACADEMICO","estado":"EMITIDO","servicio":"certificados"}'));
c.push(p('La cabecera X-Service confirmó en cada caso qué mock respondió, validando el enrutamiento del gateway.'));

c.push(h('Reto 2 — Protección con API Key (401)',3));
c.push(p('Predicción: sin credencial o con clave inexistente Kong rechaza con 401; una clave registrada permite una ruta válida con 200.'));
c.push(table(['Escenario','Cabecera apikey','Código'],[['Sin API Key','(ausente)','401'],['API Key incorrecta','clave-invalida-de-prueba','401'],['API Key válida','educonnect-poc-key-2026','200']], [2400,3000,1600]));
c.push(p('Cuerpos devueltos:'));
c.push(code('{"message":"No API key found in request"}   (sin key)'));
c.push(code('{"message":"Unauthorized"}   (key incorrecta)'));
c.push(p('La terminal siguiente muestra una ejecución real con curl sin credencial, devolviendo 401.'));
c.push(...image('37-terminal-curl-401.png',620,320,'Terminal: curl sin apikey devuelve HTTP 401 (No API key found).'));
c.push(p('Distinción técnica: la autenticación (AuthN) identifica y valida al consumidor. La autorización (AuthZ) determina qué operación y recurso puede usar. Una API Key válida no demuestra permiso sobre un recurso concreto.'));

c.push(h('Reto 3 — Control de consumo (429)',3));
c.push(p('Predicción: con un consumidor nuevo se observan cinco respuestas 200 y una respuesta 429 en la sexta solicitud dentro de la misma ventana.'));
c.push(p('Decisión: minute: 5, policy: local y limit_by: consumer. La clave utilizada fue educonnect-rate-key-2026 para aislar la prueba.'));
c.push(table(['Solicitud','Código'],[['1','200'],['2','200'],['3','200'],['4','200'],['5','200'],['6','429']], [2000,2000]));
c.push(p('La sexta solicitud devolvió "API rate limit exceeded" con Retry-After: 37. Esto demuestra que el límite se aplica por consumidor identificado por su API Key.'));
c.push(table(['Recurso','Límite','Secuencia observada'],[['Pagos','5/min','200,200,200,200,200,429'],['Certificados','2/min','200,200,429']], [2200,1600,2600]));
c.push(p('Limitación: los contadores locales no se comparten entre múltiples instancias de Kong. En producción se podría usar Redis o una política distribuida.'));

c.push(h('Reto 4 — Ruta no registrada (404) y backend no disponible (500/503)',3));
c.push(p('Ruta no registrada: GET /api/desconocido con API Key válida devolvió 404 con el mensaje "no Route matched with those values".'));
c.push(code('{"message":"no Route matched with those values"}'));
c.push(p('Backend no disponible: al detener el mock de Pagos, Kong respondió 500 "An unexpected error occurred". Durante el arranque posterior se observó temporalmente 503 y luego de su healthcheck Pagos volvió a responder 200. Los códigos exactos pueden variar según el momento de desconexión, estado de DNS, worker y configuración de Kong.'));

c.push(h('Desafío de transferencia — Certificados Académicos',3));
c.push(p('Primero se agregó un cuarto mock (certificados:3004) sin modificar los existentes. Luego se creó su Service, Route, plugin key-auth y un rate limiting distinto (2/min). El resultado fue HTTP 200 en las dos primeras solicitudes y 429 en la tercera, demostrando que un límite independiente se aplica por ruta.'));

c.push(h('7. Evidencias de terminal y gateway',1));
c.push(p('La terminal siguiente muestra una respuesta real 200 obtenida por curl a través del gateway, con el cuerpo JSON del mock.'));
c.push(...image('36-terminal-curl-200.png',620,320,'Terminal: curl con apikey devuelve HTTP 200 y el JSON de Estudiantes.'));
c.push(p('Kong registró las solicitudes y estados HTTP. Los mocks registraron ruta, método, consumidor reconocido y estado 200, sin recibir la API Key después de que el plugin la ocultó.'));
c.push(code('{ "servicio": "pagos", "metodo": "GET", "ruta": "/pagos", "estado": 200, "consumidorKong": "educonnect-app", "apiKeyRecibidaEnBackend": false }'));

c.push(h('8. Publicación en GitHub',1));
c.push(p('Primero se creó el repositorio público con gh CLI. Luego se subieron README, docker-compose.yml, kong/kong.yml, los cuatro mocks, la colección Postman, los scripts, las evidencias y los diagramas. La captura siguiente muestra el repositorio publicado.'));
c.push(...image('31-github-repo.png',620,340,'GitHub: repositorio Taller-EduConnect-API-Gateway publicado con todos los archivos.'));
c.push(p('La colección Postman se importó en el workspace del equipo y se corrigió un error de sintaxis JSON, dejando el archivo válido para importación.'));

c.push(h('9. Resultados de la suite reproducible',1));
c.push(table(['Caso','Esperado','Resultado'],[['Estudiantes','200','Aprobado'],['Matrículas','200','Aprobado'],['Pagos','200','Aprobado'],['Sin key','401','Aprobado'],['Key incorrecta','401','Aprobado'],['Key válida','200','Aprobado'],['Ruta inexistente','404','Aprobado'],['Backend detenido','500/503 y recuperación','Aprobado'],['Pagos 6 solicitudes','200×5 + 429','Aprobado'],['Certificados 3 solicitudes','200×2 + 429','Aprobado']], [4200,2400,2400]));
c.push(p('Resultado final registrado: 11 casos aprobados de 11 mediante python scripts/verify.py.'));

c.push(h('10. Limitaciones',1));
for(const s of ['No se implementa identidad de usuario final.','No existe autorización por recurso, rol o atributo.','Los datos de los mocks son ficticios y estáticos.','El contador local no está distribuido entre instancias.','La PoC no incorpora TLS ni alta disponibilidad.','No se implementa monitoreo distribuido ni trazabilidad integral.','Los códigos ante backend caído pueden variar según el momento y configuración.']) c.push(bullet(s));

c.push(h('11. Conclusiones',1));
c.push(p('El equipo cumplió la misión central del taller: desplegar Kong en Docker Compose, construir cuatro backends HTTP independientes, unificar el punto de acceso, autenticar consumidores y controlar el tráfico. Las pruebas demostraron rutas válidas, respuestas negativas, limitación y recuperación ante backend no disponible.'));
c.push(p('Kong permitió verificar la diferencia entre Service y Route, el proceso de autenticación por API Key y la aplicación de políticas por consumidor. La configuración DB-less hizo que el entorno fuera reproducible desde el repositorio, sin direcciones IP rígidas ni configuraciones privadas ocultas.'));
c.push(p('La PoC demuestra funcionalidad técnica, pero no representa una arquitectura productiva completa. Las principales brechas son autorización de recursos, identidad final, Redis distribuido, alta disponibilidad, TLS y monitoreo integral.'));

c.push(h('12. Recomendaciones',1));
for(const s of ['Implementar OAuth2/OIDC para usuarios finales y scopes.', 'Agregar RBAC/ABAC para operaciones y recursos individuales.', 'Usar Redis o una política distribuida para rate limiting entre réplicas.', 'Desplegar múltiples instancias de Kong detrás de un balanceador externo.', 'Aplicar TLS, secretos administrados y rotación periódica de API Keys.', 'Incorporar circuit breakers, retries controlados y healthchecks activos.', 'Implementar métricas, trazas distribuidas, auditoría y alertas.', 'Ejecutar pruebas de carga y validaciones de recuperación ante desastres.', 'Evitar exponer credenciales en repositorios o documentación.', 'Mantener configuraciones declarativas versionadas y revisadas.']) c.push(bullet(s));

c.push(h('13. Referencias oficiales',1));
for(const s of ['Kong Gateway: https://developer.konghq.com/gateway/','Kong DB-less: https://developer.konghq.com/gateway/db-less-mode/','Kong Key Authentication: https://developer.konghq.com/plugins/key-auth/','Kong Rate Limiting: https://developer.konghq.com/plugins/rate-limiting/','Docker Compose: https://docs.docker.com/compose/','Postman: https://learning.postman.com/docs/','OWASP API Security: https://owasp.org/API-Security/']) c.push(bullet(s));

const doc=new Document({sections:[{properties:{page:{margin:{top:900,right:900,bottom:900,left:900}}},headers:{default:new Header({children:[p('Taller EduConnect API Gateway — Grupo 3',{small:true,align:AlignmentType.RIGHT,color:GREY})]})},footers:{default:new Footer({children:[new Paragraph({children:[new TextRun('Universidad de las Américas  |  Página '),new TextRun({children:[PageNumber.CURRENT]})],alignment:AlignmentType.CENTER})]})},children:c}],styles:{default:{document:{run:{font:'Aptos',size:22,color:'222222'},paragraph:{spacing:{after:100,line:300}}}},paragraphStyles:[{id:'Heading1',name:'Heading 1',basedOn:'Normal',next:'Normal',quickFormat:true,run:{font:'Aptos Display',size:30,bold:true,color:BLUE},paragraph:{spacing:{before:300,after:120,keepNext:true}}},{id:'Heading2',name:'Heading 2',basedOn:'Normal',next:'Normal',quickFormat:true,run:{font:'Aptos Display',size:24,bold:true,color:NAVY},paragraph:{spacing:{before:180,after:80,keepNext:true}}}]}});
Packer.toBuffer(doc).then(b=>fs.writeFileSync(path.join(ROOT,'INFORME_EDUCONNECT_FINAL.docx'),b));console.log('done');