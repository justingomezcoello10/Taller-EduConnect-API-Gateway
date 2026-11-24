const fs=require('fs');
const path=require('path');
let docx;
try { docx=require('docx'); } catch(e) { docx=require('C:\\Users\\justi\\AppData\\Roaming\\npm\\node_modules\\docx'); }
const {Document,Packer,Paragraph,TextRun,HeadingLevel,Table,TableRow,TableCell,WidthType,AlignmentType,BorderStyle,ImageRun,PageBreak,Header,Footer,PageNumber,TableOfContents}=docx;

const ROOT='C:\\Universidad\\Taller EduConnect';
const CAP=path.join(ROOT,'evidencia','capturas');

const navy='17365D', blue='0B5CAB', pale='DDEBF7', green='70AD47', red='C00000', gray='666666', white='FFFFFF';

function p(text='',opts={}){return new Paragraph({children:[new TextRun({text,break:opts.break, bold:opts.bold, italics:opts.italics, color:opts.color||'222222', size:opts.size||(opts.small?20:22)})],alignment:opts.align||AlignmentType.LEFT,spacing:{before:opts.before||70,after:opts.after||70,line:opts.line||300},style:opts.style});}
function h(text,level=1){return new Paragraph({text,heading:level===1?HeadingLevel.HEADING_1:level===2?HeadingLevel.HEADING_2:HeadingLevel.HEADING_3,spacing:{before:220,after:120}});}
function bullet(text){return new Paragraph({text,bullet:{level:0},spacing:{after:50,line:280}});}
function code(text){return new Paragraph({children:[new TextRun({text,font:'Cascadia Mono',size:18,color:'263238'})],spacing:{before:50,after:100},shading:{fill:'F2F4F5'}});}
function img(name,width=600,height=330,caption){
 const data=fs.readFileSync(path.join(CAP,name));
 const arr=[new Paragraph({children:[new ImageRun({data,type:'jpg',transformation:{width,height}})],alignment:AlignmentType.CENTER,spacing:{before:100,after:70}})];
 if(caption) arr.push(p(caption,{small:true,italics:true,align:AlignmentType.CENTER,color:gray,after:130}));
 return arr;
}
function table(headers,rows,widths){
 return new Table({columnWidths:widths,rows:[new TableRow({children:headers.map((x,i)=>new TableCell({width:{size:widths[i],type:WidthType.DXA},children:[p(x,{bold:true,color:white,small:true})],shading:{fill:blue},margins:{top:100,bottom:100,left:100,right:100}}))}),...rows.map(r=>new TableRow({children:r.map((x,i)=>new TableCell({width:{size:widths[i],type:WidthType.DXA},children:[p(String(x),{small:true})],margins:{top:80,bottom:80,left:90,right:90}}))}))],width:{size:widths.reduce((a,b)=>a+b,0),type:WidthType.DXA}});
}

const children=[];
children.push(new Paragraph({text:'Universidad de las Américas',heading:HeadingLevel.TITLE,alignment:AlignmentType.CENTER,spacing:{before:850,after:100}}));
children.push(p('Facultad de Ingeniería y Ciencias Aplicadas',{align:AlignmentType.CENTER,bold:true,size:28,after:550}));
children.push(p('INFORME TÉCNICO FINAL',{align:AlignmentType.CENTER,bold:true,size:36,color:blue,after:100}));
children.push(p('Taller EduConnect API Gateway',{align:AlignmentType.CENTER,bold:true,size:28,after:450}));
children.push(p('Grupo 3',{align:AlignmentType.CENTER,bold:true,size:26,after:300}));
children.push(p('Integrantes',{align:AlignmentType.CENTER,bold:true,size:24,after:60}));
for(const n of ['Jhoel Suarez','Mauricio Mora','Stefan Jativa','Justin Gomezcoello']) children.push(p(n,{align:AlignmentType.CENTER,after:50}));
children.push(p('Asignatura: Integración de Sistemas',{align:AlignmentType.CENTER,after:50}));
children.push(p('Fecha de ejecución: 24 de noviembre de 2026',{align:AlignmentType.CENTER,after:300}));
children.push(p('Versión de Kong: 3.9.5',{align:AlignmentType.CENTER,bold:true,after:150}));
children.push(new Paragraph({children:[new PageBreak()]}) );

children.push(h('Control de documento',1));
children.push(table(['Elemento','Información'],[
 ['Repositorio','https://github.com/justingomezcoello10/Taller-EduConnect-API-Gateway'],
 ['Colección Postman','EduConnect API Gateway - Grupo 3'],
 ['Gateway local','http://localhost:8000'],
 ['Admin API local','http://127.0.0.1:8001'],
 ['Versión fijada','Kong Gateway 3.9.5'],
 ['Resultado final','11 de 11 casos aprobados'],
], [2800,6200]));
children.push(h('Índice',1));
children.push(new TableOfContents('Índice', {hyperlink:true, headingStyles:{from:1,to:3}}));
children.push(new Paragraph({children:[new PageBreak()]}));

children.push(h('1. Resumen ejecutivo',1));
children.push(p('Este documento presenta la Prueba de Concepto completa de EduConnect implementada con Docker Compose y Kong Gateway 3.9.5 en modo DB-less. El equipo construyó cuatro mocks HTTP independientes, un único punto de acceso público, autenticación por API Key, límite de consumo y pruebas positivas y negativas reproducibles.'));
children.push(p('La suite final fue ejecutada contra el entorno real y obtuvo 11 casos aprobados de 11: las cuatro rutas públicas respondieron; las pruebas negativas dieron 401/404; las ráfagas confirmaron 429 al superar los límites; el mock apagado fue detectado por Kong y volvió a responder luego del healthcheck.'));
children.push(h('Resultado frente a la rúbrica',2));
children.push(table(['Criterio','Puntos','Cobertura en este informe'],[
 ['Investigación y comprensión conceptual','15','Conceptos Kong, DB-less, Service, Route, Consumer, plugins, fuentes oficiales'],
 ['Implementación funcional','35','Docker, cuatro mocks, rutas, API Key, rate limiting'],
 ['Pruebas y evidencias','20','Capturas reales, suite 11/11, negativos y análisis'],
 ['Razonamiento y limitaciones','15','Predicción-prueba-análisis, AuthN/AuthZ, trade-offs'],
 ['Desafío de transferencia','15','Certificados funcional con límite distinto'],
], [3600,1200,4200]));

children.push(h('2. Contexto, misión y alcance',1));
children.push(p('El caso EduConnect identifica acceso directo a APIs, políticas heterogéneas, sobrecarga externa y escasa visibilidad. La misión fue construir una PoC reproducible que exponga cuatro APIs mediante una entrada única, valide credenciales, controle tráfico y registre evidencia objetiva.'));
children.push(p('La PoC no resuelve autorizaciones de negocio, identidad de usuarios finales, monitoreo distribuido integral ni alta disponibilidad productiva. Estas limitaciones se explican en secciones posteriores.'));

children.push(h('3. Arquitectura de la solución',1));
children.push(p('El cliente accede a http://localhost:8000. Kong realiza el control de API Key y Rate Limiting y entrega cada solicitud al backend correspondiente dentro de la red Docker educonnect-net. Los contenedores de los mocks no exponen puertos al host.'));
children.push(table(['Componente','Identificador','Función'],[
 ['Gateway','Kong 3.9.5','Proxy, key-auth y rate-limiting'],
 ['Backend','estudiantes:3001','GET /estudiantes'],
 ['Backend','matriculas:3002','GET /matriculas'],
 ['Backend','pagos:3003','GET /pagos'],
 ['Backend','certificados:3004','GET /certificados'],
 ['Red','educonnect-net','Comunicación privada y DNS por nombre'],
], [2200,3000,3800]));

children.push(h('4. Procedimiento de instalación',1));
for(const s of [
 'Verificar Docker Engine/Desktop y Docker Compose.',
 'Ubicarse en la carpeta raíz del repositorio.',
 'Construir y levantar todos los servicios con docker compose up -d --build.',
 'Comprobar contenedores con docker compose ps.',
 'Ejecutar la suite python scripts/verify.py.',
 'Detener la solución con docker compose down.'
]) children.push(bullet(s));
children.push(code('docker compose up -d --build'));
children.push(code('docker compose ps'));
children.push(code('python scripts/verify.py'));

children.push(h('5. Evidencia del despliegue — Reto 0',1));
children.push(p('Hipótesis: si Kong y los cuatro mocks están en la red educonnect-net y usan nombres DNS, Kong podrá comunicarse sin IP rígidas.'));
children.push(p('Decisión: se fijó la imagen kong:3.9.5 y se utilizó configuración declarativa DB-less con kong/kong.yml.'));
children.push(...img('reto0-contenedores.jpg',620,340,'Imagen 1. Contenedores registrados como operativos y saludables.'));
children.push(p('Resultado y comprobación: Docker mostró Kong y los cuatro mocks operativos. Kong pudo resolver estudiantes, matriculas, pagos y certificados por nombre. No se utilizaron IP internas rígidas.'));
children.push(p('Limitación: esto demuestra resolución dentro de una red Docker local, no alta disponibilidad ni resolución en un clúster empresarial.'));

children.push(h('6. Service, Route, Consumer y Plugin',1));
children.push(table(['Objeto','Representa','Ejemplo'],[
 ['Service','Destino interno','http://estudiantes:3001/estudiantes'],
 ['Route','Coincidencia pública','/api/estudiantes, método GET'],
 ['Consumer','Consumidor externo','educonnect-app'],
 ['Plugin','Política aplicada','key-auth y rate-limiting'],
], [2000,2600,4400]));
children.push(p('Diferencia clave: Service indica a dónde se envía; Route indica cuándo coincide la solicitud. Si cambia la dirección interna, debe actualizarse el url del Service. Si cambia el nombre público, debe modificarse o crearse una Route.'));

children.push(h('7. Configuración declarativa de Kong',1));
children.push(code('_format_version: "3.0"'));
children.push(code('consumers: educonnect-app, educonnect-rate, educonnect-cert'));
children.push(code('plugins: key-auth + rate-limiting'));
children.push(p('La cabecera utilizada es apikey. hide_credentials: true impide reenviar la clave al backend; esto quedó comprobado en los registros, donde apiKeyRecibidaEnBackend fue false.'));

children.push(h('8. Evidencia positiva — Reto 1',1));
children.push(p('Hipótesis: las rutas /api/estudiantes, /api/matriculas, /api/pagos y /api/certificados devolverán 200 con una API Key registrada.'));
children.push(p('Prueba: GET a la URL pública con la cabecera apikey: educonnect-poc-key-2026.'));
for(const [name,title,caption] of [
 ['estudiantes','Estudiantes','Estudiantes respondió con identificador X-Service: estudiantes.'],
 ['matriculas','Matrículas','Matrículas respondió con identificador X-Service: matriculas.'],
 ['pagos','Pagos','Pagos respondió con identificador X-Service: pagos.'],
 ['certificados','Certificados','Certificados respondió con identificador X-Service: certificados.']
]){
 children.push(h('8.'+(['estudiantes','matriculas','pagos','certificados'].indexOf(name)+1)+' '+title,2));
 children.push(...img(`respuesta-${name}.jpg`,620,350,`Imagen — Respuesta real de ${title}. ${caption}`));
}
children.push(p('Resultado: las cuatro solicitudes fueron 200. Cada cabecera X-Service confirmó el backend correcto y el JSON mostró datos ficticios coherentes.'));

children.push(h('9. API Key y diferencia AuthN/AuthZ — Reto 2',1));
children.push(p('Hipótesis: sin clave o con clave inválida Kong responderá 401; con clave válida responderá 200 en una ruta existente.'));
children.push(h('9.1 Sin API Key',2));
children.push(code('GET http://localhost:8000/api/estudiantes'));
children.push(...img('sin-key.jpg',620,300,'Imagen — Respuesta real 401 por ausencia de API Key.'));
children.push(h('9.2 API Key incorrecta',2));
children.push(code('apikey: clave-invalida-de-prueba'));
children.push(...img('key-invalida.jpg',620,300,'Imagen — Respuesta real 401 por credencial inexistente.'));
children.push(h('9.3 API Key válida',2));
children.push(p('Con apikey: educonnect-poc-key-2026 se obtuvo HTTP 200 en una ruta existente.'));
children.push(p('Autenticación (AuthN): verifica la identidad o credencial del consumidor. Autorización (AuthZ): determina qué recurso, acción o propiedad puede usar. Una API Key válida solamente autentica al consumidor externo; no demuestra permiso para una matrícula, pago, certificado, operación o dato personal concreto.'));
children.push(p('Limitación: no existe identidad de usuario final, RBAC/ABAC, propiedad del recurso ni scopes.'));

children.push(h('10. Rate limiting — Reto 3',1));
children.push(p('Hipótesis: el consumidor de prueba recibirá cinco respuestas 200 y la sexta dentro de la misma ventana temporal recibirá 429.'));
children.push(p('Configuración elegida: minute: 5, policy: local, limit_by: consumer. La clave utilizada fue educonnect-rate-key-2026.'));
children.push(...img('reto3-pagos-rafaga.jpg',620,370,'Imagen — Secuencia real de seis solicitudes a Pagos.'));
children.push(p('Resultado observado: 200, 200, 200, 200, 200, 429. Se comprobó el umbral exacto de cinco solicitudes por minuto para el consumidor.'));
children.push(p('El alcance real es local por consumidor en una instancia de Kong. Si existen múltiples instancias, cada una puede tener su propio contador y permitir excedentes acumulados. Una solución empresarial debe usar Redis, base compartida o una política distribuida equivalente.'));

children.push(h('11. Ruta inexistente y backend no disponible — Reto 4',1));
children.push(h('11.1 Ruta no registrada',2));
children.push(p('Hipótesis: una ruta que no está configurada no será enviada a un backend y devolverá 404.'));
children.push(code('GET /api/desconocido'));
children.push(...img('ruta-inexistente.jpg',620,300,'Imagen — Respuesta real 404 ante ruta no registrada.'));
children.push(h('11.2 Backend no disponible',2));
children.push(p('Procedimiento: detener temporalmente solo el contenedor de Pagos, consultar /api/pagos con API Key válida y luego reiniciar el mock.'));
for(const s of ['Ejecutar docker compose stop pagos.','Consultar GET /api/pagos con apikey válida.','Registrar el código observado.','Ejecutar docker compose start pagos.','Esperar el healthcheck y repetir la consulta.']) children.push(bullet(s));
children.push(p('Resultado observado: al detener el mock, Kong respondió HTTP 500 “An unexpected error occurred”. Durante el arranque posterior se observó temporalmente HTTP 503; al quedar healthy, Pagos volvió a responder 200.'));
children.push(p('Explicación: los códigos exactos varían según el momento de la desconexión y la configuración del proxy. La evidencia demuestra que Kong detectó la ausencia temporal y que el backend recuperó el servicio.'));

children.push(h('12. Desafío de transferencia — Certificados',1));
children.push(p('Hipótesis: el cuarto mock estará disponible en /api/certificados, protegido por API Key y limitado a dos solicitudes por minuto.'));
children.push(h('12.1 Cambios realizados',2));
for(const s of ['Creación del contenedor certificados:3004.','Creación del mock con ruta /certificados.','Creación del Service certificados-service.','Creación de la Route /api/certificados.','Aplicación de key-auth.','Configuración rate-limiting minute: 2 y limit_by: consumer.']) children.push(bullet(s));
children.push(h('12.2 Evidencia positiva',2));
children.push(...img('respuesta-certificados.jpg',620,350,'Imagen — Certificados respondió HTTP 200 con JSON específico.'));
children.push(h('12.3 Evidencia de límite distinto',2));
children.push(...img('reto6-certificados-rafaga.jpg',620,320,'Imagen — Secuencia real de Certificados: 200, 200, 429.'));
children.push(p('Resultado: el límite funciona a dos solicitudes por minuto y supera el umbral en la tercera. El límite es distinto al configurado para las rutas principales.'));

children.push(h('13. Suite automatizada y reproducibilidad',1));
children.push(p('La suite reproducible se encuentra en scripts/verify.py y genera evidencia/resultados-pruebas.json. Ejecuta todos los casos positivos y negativos en secuencia.'));
children.push(code('python scripts/verify.py'));
children.push(table(['Caso','Esperado','Resultado'],[
 ['Estudiantes','200','Aprobado'],['Matrículas','200','Aprobado'],['Pagos','200','Aprobado'],
 ['Sin key','401','Aprobado'],['Key incorrecta','401','Aprobado'],['Key válida','200','Aprobado'],
 ['Ruta inexistente','404','Aprobado'],['Backend detenido','500/503 y recuperación','Aprobado'],
 ['Pagos 6 solicitudes','200×5 + 429','Aprobado'],['Certificados 3 solicitudes','200×2 + 429','Aprobado'],['Certificados sin key','401','Aprobado']
],[4200,2400,2400]));
children.push(p('Resultado final registrado: 11 casos aprobados de 11.'));

children.push(h('14. Evidencias adicionales de Postman',1));
children.push(p('La colección exportada contiene las solicitudes positivas y negativas de la PoC. La colección está vinculada al repositorio y al workspace seleccionado.'));
for(const s of ['Estudiantes - positiva','Matrículas - positiva','Pagos - positiva','Sin API Key - 401','API Key incorrecta - 401','Ruta no registrada - 404','Ráfaga de Pagos - 6 veces','Certificados - positiva','Certificados sin key - 401','Ráfaga de Certificados - 3 veces']) children.push(bullet(s));

children.push(h('15. Matriz completa de hipótesis, decisión, prueba y análisis',1));
children.push(table(['Reto','Hipótesis','Decisión','Prueba','Resultado','Limitación'],[
 ['0','DNS interno permite comunicación','DB-less y nombres Docker','docker compose ps','Todos saludables','Sin alta disponibilidad'],
 ['1','Rutas públicas llegan al mock correcto','Services/Routes + strip_path','4 GET con key','4×200','Cambios internos exigen Service'],
 ['2','Key ausente/inválida 401','key-auth en rutas','GET sin/key inválida','401/401/200','Sin AuthZ de negocio'],
 ['3','5×200 + 429','local 5/min/consumer','6 solicitudes','200×5+429','No distribuido'],
 ['4','404 y error backend','Route y prueba stop/start','curl/compose','404, 500/503, 200','Códigos dependen del estado'],
 ['Certificados','Ruta protegida y 2/min','Mock + Route + límite 2','3 solicitudes','200×2+429','Sin AuthZ ni Redis']
], [1000,2400,2400,1800,1800,2200]));

children.push(h('16. Limitaciones técnicas',1));
for(const s of [
 'No implementa identidad de usuarios finales.',
 'No implementa autorización por recurso, rol o atributo.',
 'DB-less no demuestra persistencia administrativa ni alta disponibilidad.',
 'Rate limiting local no se comparte entre múltiples instancias.',
 'Los datos son ficticios y estáticos.',
 'No hay TLS, secretos administrados, trazas distribuidas ni monitoreo integral.',
 'El código HTTP ante backend caído puede variar por el momento de la prueba.'
]) children.push(bullet(s));

children.push(h('17. Mejoras para producción',1));
for(const s of [
 'OAuth2/OIDC para identidad de usuarios finales y scopes.',
 'RBAC/ABAC para autorización por recurso y operación.',
 'Redis compartido o solucion distribuida para Rate Limiting.',
 'Múltiples réplicas de Kong detrás de balanceador externo.',
 'TLS, certificados, rotación y gestor seguro de secretos.',
 'Healthchecks activos, circuit breakers y retries controlados.',
 'Métricas, trazas distribuidas, auditoría y alertas.',
 'Pruebas de carga, escalamiento, respaldo y recuperacion ante desastres.'
]) children.push(bullet(s));

children.push(h('18. Diagnóstico aplicado ante fallos',1));
for(const s of [
 'Estado de contenedores: docker compose ps y healthchecks.',
 'Acceso del mock dentro de la red: prueba interna o logs.',
 'Coincidencia de Route: URL y método exactos.',
 'Plugin de autenticación: presencia y valor de apikey.',
 'Rate limiting: ventana, consumidor y respuestas 429.',
 'Respuesta del backend: X-Service y registros de consola.'
]) children.push(bullet(s));

children.push(h('19. Respuestas a las preguntas de reflexión',1));
children.push(p('Incidentes reducidos: acceso directo disperso, políticas heterogéneas y sobrecarga sin control central. Incidentes no resueltos: autorización de datos, identidad final, persistencia, alta disponibilidad y monitoreo distribuido.'));
children.push(p('El gateway no elimina la obligación de autorizar operaciones y recursos porque API Key solo identifica al consumidor. El sistema de negocio debe validar identidad, propiedad del recurso, operación solicitada y política aplicable.'));
children.push(p('Ventaja principal: una entrada única para aplicar políticas consistentes. Riesgo principal: concentración de tráfico y seguridad en un componente crítico. Antes de producción se añadirán múltiples instancias, Redis distribuido, identidad estándar, TLS, observabilidad y autorización.'));

children.push(h('20. Conclusiones y recomendaciones',1));
children.push(p('La PoC cumplió todos los objetivos planteados por la asignación. Se logró desplegar Kong con Docker Compose, integrarlo a cuatro mocks independientes, unificar las rutas, autenticar consumidores, limitar tráfico y ejecutar pruebas reproducibles. La evidencia demuestra que las rutas positivas devuelven 200, las negativas 401/404, el límite correcto produce 429 y el backend recupera disponibilidad.'));
children.push(p('Se recomienda continuar investigando autenticación moderna, autorización por recurso, política distribuida, observabilidad y alta disponibilidad. El proyecto constituye una base verificable para evolucionar hacia un entorno productivo, siempre con controles de seguridad y operación que no están incluidos en esta PoC.'));

children.push(h('21. Entregables obligatorios',1));
children.push(table(['Entregable','Ubicación','Estado'],[
 ['Docker Compose y Kong','docker-compose.yml, kong/kong.yml','Completo'],
 ['Cuatro mocks','mocks/','Completo'],
 ['README','README.md','Completo'],
 ['Colección Postman','Postman_EduConnect_API_Gateway.postman_collection.json','Completo'],
 ['Matriz de evidencias','evidencia/matriz-evidencias.md','Completo'],
 ['Diagrama de arquitectura','INFORME_FINAL.md y este documento','Completo'],
 ['Decisiones arquitectónicas','decisiones-arquitectonicas.md','Completo'],
 ['Declaración IA y fuentes','Este documento y README','Completo']
], [3700,4300,1000]));

children.push(h('22. Fuentes oficiales consultadas',1));
for(const s of [
 'Kong Gateway: https://developer.konghq.com/gateway/',
 'Kong DB-less: https://developer.konghq.com/gateway/db-less-mode/',
 'Key Authentication: https://developer.konghq.com/plugins/key-auth/',
 'Rate Limiting: https://developer.konghq.com/plugins/rate-limiting/',
 'Docker Compose: https://docs.docker.com/compose/',
 'Postman: https://learning.postman.com/docs/',
 'OWASP API Security: https://owasp.org/API-Security/'
]) children.push(bullet(s));

children.push(h('23. Declaración de uso de IA',1));
children.push(p('Se utilizó IA generativa como apoyo para estructurar archivos, depurar scripts y redactar documentación. Las decisiones técnicas fueron contrastadas con Docker/Kong ejecutándose realmente, respuestas observadas y documentación oficial. No se sustentó ninguna decisión únicamente en una sugerencia de IA.'));

const doc=new Document({
 sections:[{properties:{page:{margin:{top:900,right:900,bottom:900,left:900}}},headers:{default:new Header({children:[p('Taller EduConnect — API Gateway | Grupo 3',{small:true,color:gray,align:AlignmentType.RIGHT})]})},footers:{default:new Footer({children:[new Paragraph({children:[new TextRun('Universidad de las Américas  |  Página '),new TextRun({children:[PageNumber.CURRENT]})],alignment:AlignmentType.CENTER})]})},children}],
 styles:{default:{document:{run:{font:'Aptos',size:22,color:'222222'},paragraph:{spacing:{after:100,line:300}}}},paragraphStyles:[
  {id:'Title',name:'Title',basedOn:'Normal',next:'Normal',quickFormat:true,run:{font:'Aptos Display',size:40,bold:true,color:navy}},
  {id:'Heading1',name:'Heading 1',basedOn:'Normal',next:'Normal',quickFormat:true,run:{font:'Aptos Display',size:30,bold:true,color:blue},paragraph:{spacing:{before:300,after:120,keepNext:true}}},
  {id:'Heading2',name:'Heading 2',basedOn:'Normal',next:'Normal',quickFormat:true,run:{font:'Aptos Display',size:24,bold:true,color:navy},paragraph:{spacing:{before:180,after:80,keepNext:true}}},
 ]}
});
Packer.toBuffer(doc).then(b=>fs.writeFileSync(path.join(ROOT,'INFORME_FINAL_COMPLETO.docx'),b));
