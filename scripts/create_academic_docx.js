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
function image(name,width=600,height=330,caption){const arr=[];const file=path.join(CAP,name);if(fs.existsSync(file)){arr.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:100,after:70},children:[new ImageRun({data:fs.readFileSync(file),type:name.endsWith('.png')?'png':'jpg',transformation:{width,height}})]}));if(caption)arr.push(p(caption,{align:AlignmentType.CENTER,italics:true,small:true,color:GREY,after:150}));}else arr.push(p(`[Evidencia visual pendiente: ${name}]`,{italics:true,color:'C00000'}));return arr;}
const c=[];
c.push(new Paragraph({text:'Universidad de las Américas',heading:HeadingLevel.TITLE,alignment:AlignmentType.CENTER,spacing:{before:900,after:100}}));
c.push(p('Facultad de Ingeniería y Ciencias Aplicadas',{align:AlignmentType.CENTER,bold:true,size:28,after:500}));
c.push(p('INFORME TÉCNICO',{align:AlignmentType.CENTER,bold:true,size:36,color:BLUE,after:100}));
c.push(p('Taller EduConnect API Gateway',{align:AlignmentType.CENTER,bold:true,size:28,after:450}));
c.push(p('Grupo 3',{align:AlignmentType.CENTER,bold:true,size:26,after:300}));
c.push(p('Jhoel Suarez  •  Mauricio Mora  •  Stefan Jativa  •  Justin Gomezcoello',{align:AlignmentType.CENTER,after:180}));
c.push(p('Asignatura: Integración de Sistemas',{align:AlignmentType.CENTER,after:80}));c.push(p('Fecha: 24 de noviembre de 2026',{align:AlignmentType.CENTER,after:300}));
c.push(p('Kong Gateway 3.9.5 | Docker Compose | Postman',{align:AlignmentType.CENTER,bold:true,color:NAVY,after:100}));
c.push(new Paragraph({children:[new PageBreak()]}) );
c.push(h('Índice',1));c.push(new TableOfContents('Contenido',{hyperlink:true,headingStyles:{from:1,to:3}}));c.push(new Paragraph({children:[new PageBreak()]}) );

c.push(h('1. Introducción',1));
c.push(p('La organización EduConnect presentó problemas de acceso directo a múltiples APIs, políticas heterogéneas de autenticación, sobrecarga de consumidores externos y baja visibilidad operativa. Ante este contexto, se diseñó una prueba de concepto reproducible basada en Kong Gateway para centralizar el acceso sin reescribir los sistemas existentes.'));
c.push(p('La solución implementada expone cuatro servicios simulados mediante un único punto de entrada. Se aplicaron autenticación por API Key y control de consumo por consumidor, y se ejecutaron pruebas positivas, negativas y de recuperación.'));

c.push(h('2. Contexto y misión',1));
c.push(p('La misión consistió en desplegar Kong con Docker Compose, integrar cuatro backends HTTP independientes, configurar Services y Routes, aplicar políticas de acceso y registrar evidencia objetiva. La PoC no resolvió identidad de usuarios finales, autorización de negocio, monitoreo distribuido integral ni alta disponibilidad productiva.'));
c.push(h('2.1 Alcance logrado',2));
for(const s of ['Gateway Kong 3.9.5 desplegado en contenedores.','Cuatro mocks independientes: Estudiantes, Matrículas, Pagos y Certificados.','Ruta pública única mediante el puerto 8000.','API Key para consumidores ficticios.','Rate limiting de cinco solicitudes por minuto en rutas principales.','Límite de dos solicitudes por minuto en Certificados.','Pruebas de rutas válidas, credenciales inválidas, ruta inexistente y backend detenido.']) c.push(bullet(s));

c.push(h('3. Arquitectura implementada',1));
c.push(p('El cliente se comunica únicamente con el proxy público de Kong. Kong valida las políticas y selecciona el backend correspondiente dentro de la red Docker educonnect-net. Los servicios internos no exponen puertos al sistema anfitrión.'));
c.push(table(['Componente','Nombre/puerto','Función'],[['Cliente','Postman/curl','Inicia solicitudes HTTP'],['Gateway','Kong:8000','Proxy público y aplicación de plugins'],['Estudiantes','estudiantes:3001','GET /estudiantes'],['Matrículas','matriculas:3002','GET /matriculas'],['Pagos','pagos:3003','GET /pagos'],['Certificados','certificados:3004','GET /certificados'],['Red','educonnect-net','DNS interno y comunicación privada']], [2200,2800,4000]));

c.push(h('4. Instalación y despliegue',1));
c.push(h('4.1 Requisitos',2));
for(const s of ['Docker Engine/Desktop activo.','Docker Compose disponible.','Postman o cliente HTTP.','Editor de código.','Acceso a documentación oficial.']) c.push(bullet(s));
c.push(h('4.2 Inicio del entorno',2));
c.push(code('docker compose up -d --build'));c.push(code('docker compose ps'));
c.push(p('Esta secuencia construye los mocks, crea la red interna, carga kong/kong.yml y deja Kong como proxy público.'));
c.push(h('4.3 Evidencia real del entorno Docker',2));
c.push(...image('04-postman-importacion-real.png',620,320,'La colección fue creada e importada en el workspace real de Postman.'));

c.push(h('5. Retos de implementación',1));

c.push(h('Reto 0. Comprensión y despliegue de Kong',2));
c.push(p('Predicción: al levantar los contenedores en una red común y usar nombres de servicio, Kong podrá comunicar sus rutas con los mocks sin necesitar IP privadas rígidas.'));
c.push(p('Decisión: se fijó Kong 3.9.5 y se utilizó modo DB-less. El archivo kong/kong.yml contiene Consumers, Services, Routes y plugins.'));
c.push(code('docker compose ps'));
c.push(p('Resultado: el gateway y los cuatro mocks quedaron saludables. Kong usa el DNS interno de Docker para resolver nombres como estudiantes, matriculas, pagos y certificados.'));
c.push(p('Limitación: la prueba demuestra el funcionamiento en un entorno local; no demuestra alta disponibilidad ni operación distribuida.'));

c.push(h('Reto 1. Punto de acceso único',2));
c.push(p('Predicción: las cuatro rutas públicas /api/... llegarán al backend correspondiente y devolverán HTTP 200 con datos JSON.'));
for(const [name,title,desc] of [['respuesta-estudiantes.jpg','Estudiantes','Respuesta real de Estudiantes mediante el gateway.'],['respuesta-matriculas.jpg','Matrículas','Respuesta real de Matrículas mediante el gateway.'],['respuesta-pagos.jpg','Pagos','Respuesta real de Pagos mediante el gateway.'],['respuesta-certificados.jpg','Certificados','Respuesta real de Certificados mediante el gateway.']]){c.push(h(title,3));c.push(...image(name,620,350,desc));}
c.push(p('Resultado: las cuatro rutas fueron verificadas con HTTP 200. La cabecera X-Service y el campo servicio confirmaron cuál mock respondió.'));
c.push(p('Diferencia entre objetos: un Service representa el destino interno; una Route representa la regla de coincidencia pública. strip_path elimina /api/<recurso> antes del reenvío al backend. Si cambia la dirección interna, se actualiza el url del Service; si cambia la URL pública, se modifica la Route.'));

c.push(h('Reto 2. Protección con API Key',2));
c.push(p('Predicción: sin credencial o con clave inexistente Kong deberá rechazar la solicitud con 401; una clave registrada permitirá una ruta válida con 200.'));
c.push(h('Prueba sin API Key',3));c.push(code('GET http://localhost:8000/api/estudiantes'));c.push(...image('sin-key.jpg',620,300,'Respuesta observada: 401 Unauthorized sin API Key.'));
c.push(h('Prueba con API Key incorrecta',3));c.push(code('apikey: clave-invalida-de-prueba'));c.push(...image('key-invalida.jpg',620,300,'Respuesta observada: 401 Unauthorized con credencial inexistente.'));
c.push(h('Prueba con API Key válida',3));c.push(code('apikey: educonnect-poc-key-2026'));c.push(p('Resultado: HTTP 200 en una ruta existente.'));
c.push(p('Distinción técnica: autenticación (AuthN) identifica y valida al consumidor. Autorización (AuthZ) determina qué operación y qué recurso puede utilizar. Una API Key válida no demuestra permiso sobre una matrícula, pago o dato personal concreto.'));

c.push(h('Reto 3. Control de consumo',2));c.push(p('Predicción: con un consumidor nuevo se observarán cinco respuestas 200 y una respuesta 429 en la sexta solicitud dentro de la misma ventana.'));
c.push(p('Decisión: minute: 5, policy: local y limit_by: consumer. La clave utilizada fue educonnect-rate-key-2026 para aislar la prueba.'));
c.push(...image('reto3-pagos-rafaga.jpg',620,370,'Evidencia real de la secuencia: 200, 200, 200, 200, 200, 429.'));
c.push(p('Resultado: se confirmó el comportamiento esperado. El alcance real es por consumidor identificado por la API Key y dentro de una ventana local de minuto.'));
c.push(p('Limitación: los contadores locales no se comparten entre múltiples instancias de Kong. En producción se podría usar Redis o una política distribuida para garantizar un límite global consistente.'));

c.push(h('Reto 4. Comportamiento y evidencias',2));c.push(h('Ruta no registrada',3));c.push(code('GET http://localhost:8000/api/desconocido'));c.push(...image('ruta-inexistente.jpg',620,300,'Respuesta observada: 404 Not Found.'));
c.push(h('Backend no disponible',3));
for(const s of ['Detener temporalmente solo el mock de Pagos.','Consultar /api/pagos con API Key válida.','Registrar el código devuelto por Kong.','Reiniciar el mock y esperar su healthcheck.','Repetir la solicitud y comprobar la recuperación.']) c.push(bullet(s));
c.push(p('Resultado observado: al detener Pagos, Kong respondió 500 “An unexpected error occurred”. Durante el arranque posterior se observó temporalmente 503; luego del healthcheck Pagos volvió a responder 200.'));
c.push(p('Análisis: el código exacto puede variar según el momento de desconexión, estado de DNS, worker y configuración de Kong. La evidencia confirma la ausencia temporal y la recuperación posterior.'));

c.push(h('Desafío de transferencia: Certificados Académicos',2));c.push(p('Predicción: se podrá agregar un cuarto mock protegido por API Key y aplicar un límite distinto sin modificar los mocks existentes ni las rutas principales.'));
for(const s of ['Nuevo contenedor certificados:3004.','Nuevo mock con respuesta /certificados.','Nuevo Service certificados-service.','Nueva Route /api/certificados.','Plugin key-auth.','Rate limiting distinto: minute: 2.']) c.push(bullet(s));
c.push(h('Prueba positiva',3));c.push(...image('respuesta-certificados.jpg',620,350,'Evidencia real de la respuesta HTTP 200 de Certificados.'));
c.push(h('Prueba de consumo distinto',3));c.push(...image('reto6-certificados-rafaga.jpg',620,320,'Secuencia observada: 200, 200, 429.'));
c.push(p('Resultado: Certificados funciona, exige API Key y supera el límite en la tercera solicitud. La aplicación del límite distinto se realizó mediante una configuración independiente en la ruta.'));

c.push(h('6. Evidencias de Postman',1));c.push(p('La colección importada contiene solicitudes positivas y negativas, junto con las ráfagas que permiten reproducir los retos.'));
c.push(...image('04-postman-importacion-real.png',620,340,'Captura real del importador y workspace de Postman durante la creación de la colección.'));
for(const s of ['Estudiantes — positiva','Matrículas — positiva','Pagos — positiva','Sin API Key — negativa','API Key incorrecta — negativa','Ruta inexistente — negativa','Ráfaga de Pagos','Certificados — positiva','Certificados sin key','Ráfaga de Certificados']) c.push(bullet(s));

c.push(h('7. Evidencias de Kong y registros',1));c.push(p('Kong registró las solicitudes y estados HTTP. Los mocks registraron ruta, método, consumidor reconocido y estado 200 sin recibir la API Key después de que el plugin la ocultó.'));
c.push(code('{ "servicio": "pagos", "metodo": "GET", "ruta": "/pagos", "estado": 200, "consumidorKong": "educonnect-app", "apiKeyRecibidaEnBackend": false }'));

c.push(h('8. Resultados de la suite reproducible',1));c.push(table(['Caso','Esperado','Resultado'],[['Estudiantes','200','Aprobado'],['Matrículas','200','Aprobado'],['Pagos','200','Aprobado'],['Sin key','401','Aprobado'],['Key incorrecta','401','Aprobado'],['Key válida','200','Aprobado'],['Ruta inexistente','404','Aprobado'],['Backend detenido','500/503 y recuperación','Aprobado'],['Pagos 6 solicitudes','200×5 + 429','Aprobado'],['Certificados 3 solicitudes','200×2 + 429','Aprobado']], [4200,2400,2400]));c.push(p('Resultado final registrado: 11 casos aprobados de 11 mediante python scripts/verify.py.'));

c.push(h('9. Limitaciones',1));
for(const s of ['No se implementa identidad de usuario final.','No existe autorización por recurso, rol o atributo.','Los datos de los mocks son ficticios y estáticos.','El contador local no está distribuido entre instancias.','La PoC no incorpora TLS ni alta disponibilidad.','No se implementa monitoreo distribuido ni trazabilidad integral.','Los códigos ante backend caído pueden variar según el momento y configuración.']) c.push(bullet(s));

c.push(h('10. Respuestas a las preguntas de reflexión',1));
c.push(p('Esta PoC reduce el acceso directo disperso, permite centralizar políticas y mejora la visibilidad básica de solicitudes. Permanece sin solución la identidad final, autorización por recurso, persistencia, observabilidad distribuida y alta disponibilidad.'));
c.push(p('El gateway no elimina la obligación de autorizar operaciones y recursos porque API Key solo autentica al consumidor. La autorización debe considerar usuario, rol, propiedad del recurso, acción y política de negocio.'));
c.push(p('La principal ventaja de centralizar es aplicar seguridad y control de forma consistente. El principal riesgo es crear un punto crítico de falla y concentrar tráfico y seguridad en un componente.'));

c.push(h('11. Conclusiones',1));
c.push(p('El equipo cumplió la misión central del taller: desplegar Kong en Docker Compose, construir cuatro backends HTTP independientes, unificar el punto de acceso, autenticar consumidores y controlar el tráfico. Las pruebas demostraron rutas válidas, respuestas negativas, limitación y recuperación ante backend no disponible.'));
c.push(p('Kong permitió verificar la diferencia entre Service y Route, el proceso de autenticación por API Key y la aplicación de políticas por consumidor. La configuración DB-less hizo que el entorno fuera reproducible desde el repositorio, sin direcciones IP rígidas ni configuraciones privadas ocultas.'));
c.push(p('La PoC demuestra funcionalidad técnica, pero no representa una arquitectura productiva completa. Las principales brechas son autorización de recursos, identidad final, Redis distribuido, alta disponibilidad, TLS y monitoreo integral.'));

c.push(h('12. Recomendaciones',1));
for(const s of ['Implementar OAuth2/OIDC para usuarios finales y scopes.', 'Agregar RBAC/ABAC para operaciones y recursos individuales.', 'Usar Redis o una política distribuida para rate limiting entre réplicas.', 'Desplegar múltiples instancias de Kong detrás de un balanceador externo.', 'Aplicar TLS, secretos administrados y rotación periódica de API Keys.', 'Incorporar circuit breakers, retries controlados y healthchecks activos.', 'Implementar métricas, trazas distribuidas, auditoría y alertas.', 'Ejecutar pruebas de carga y validaciones de recuperación ante desastres.', 'Evitar exponer credenciales en repositorios o documentación.', 'Mantener configuraciones declarativas versionadas y revisadas.']) c.push(bullet(s));

c.push(h('13. Referencias oficiales',1));
for(const s of ['Kong Gateway: https://developer.konghq.com/gateway/','Kong DB-less: https://developer.konghq.com/gateway/db-less-mode/','Kong Key Authentication: https://developer.konghq.com/plugins/key-auth/','Kong Rate Limiting: https://developer.konghq.com/plugins/rate-limiting/','Docker Compose: https://docs.docker.com/compose/','Postman: https://learning.postman.com/docs/','OWASP API Security: https://owasp.org/API-Security/']) c.push(bullet(s));

const doc=new Document({sections:[{properties:{page:{margin:{top:900,right:900,bottom:900,left:900}}},headers:{default:new Header({children:[p('Taller EduConnect API Gateway — Grupo 3',{small:true,align:AlignmentType.RIGHT,color:GREY})]})},footers:{default:new Footer({children:[new Paragraph({children:[new TextRun('Universidad de las Américas  |  Página '),new TextRun({children:[PageNumber.CURRENT]})],alignment:AlignmentType.CENTER})]})},children:c}],styles:{default:{document:{run:{font:'Aptos',size:22,color:'222222'},paragraph:{spacing:{after:100,line:300}}}},paragraphStyles:[{id:'Heading1',name:'Heading 1',basedOn:'Normal',next:'Normal',quickFormat:true,run:{font:'Aptos Display',size:30,bold:true,color:BLUE},paragraph:{spacing:{before:300,after:120,keepNext:true}}},{id:'Heading2',name:'Heading 2',basedOn:'Normal',next:'Normal',quickFormat:true,run:{font:'Aptos Display',size:24,bold:true,color:NAVY},paragraph:{spacing:{before:180,after:80,keepNext:true}}}]}});
Packer.toBuffer(doc).then(b=>fs.writeFileSync(path.join(ROOT,'INFORME_EDUCONNECT_ACADEMICO.docx'),b));
