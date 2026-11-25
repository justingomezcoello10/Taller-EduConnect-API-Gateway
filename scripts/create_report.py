from pathlib import Path
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = ROOT / "evidencia" / "capturas-reales"
BLACK = "000000"
BLUE = "DDEBF7"
PALE = "F4F8FC"
GREY = "D9D9D9"


def shade(cell, color):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), color)
    tc_pr.append(shd)


def borders(table):
    tbl_pr = table._tbl.tblPr
    b = OxmlElement("w:tblBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        el = OxmlElement(f"w:{edge}")
        el.set(qn("w:val"), "single")
        el.set(qn("w:sz"), "5")
        el.set(qn("w:color"), GREY)
        b.append(el)
    tbl_pr.append(b)


def setup(doc, title):
    sec = doc.sections[0]
    sec.top_margin = Inches(0.7)
    sec.bottom_margin = Inches(0.65)
    sec.left_margin = Inches(0.8)
    sec.right_margin = Inches(0.8)
    styles = doc.styles
    normal = styles["Normal"]
    normal.font.name = "Aptos"
    normal.font.size = Pt(10)
    normal.font.color.rgb = RGBColor.from_string("222222")
    normal.paragraph_format.space_after = Pt(6)
    normal.paragraph_format.line_spacing = 1.1
    for name, size in (("Title", 26), ("Heading 1", 16), ("Heading 2", 12.5), ("Heading 3", 11)):
        st = styles[name]
        st.font.name = "Aptos Display"
        st.font.size = Pt(size)
        st.font.bold = True
        st.font.color.rgb = RGBColor.from_string(BLACK)
        st.paragraph_format.keep_with_next = True
        st.paragraph_format.space_before = Pt(12 if name != "Title" else 0)
        st.paragraph_format.space_after = Pt(5)
    header = sec.header.paragraphs[0]
    header.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    run = header.add_run("TALLER EDUCONNECT  |  GRUPO 3")
    run.font.name = "Aptos"
    run.font.size = Pt(8)
    run.font.color.rgb = RGBColor.from_string("666666")
    footer = sec.footer.paragraphs[0]
    footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
    fr = footer.add_run("Universidad de las Américas  |  ")
    fr.font.size = Pt(8)
    fld = OxmlElement("w:fldSimple")
    fld.set(qn("w:instr"), "PAGE")
    footer._p.append(fld)
    doc.core_properties.title = title
    doc.core_properties.subject = "Taller EduConnect API Gateway"


def para(doc, text, bold_lead=None, italic=False, center=False):
    p = doc.add_paragraph()
    if center:
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    if bold_lead and text.startswith(bold_lead):
        r = p.add_run(bold_lead)
        r.bold = True
        p.add_run(text[len(bold_lead):])
    else:
        r = p.add_run(text)
        r.italic = italic
    return p


def heading(doc, text, level=1):
    return doc.add_heading(text, level=level)


def bullets(doc, entries):
    for entry in entries:
        p = doc.add_paragraph(style="List Bullet")
        p.paragraph_format.space_after = Pt(3)
        p.add_run(entry)


def code(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Inches(0.18)
    p.paragraph_format.space_before = Pt(1)
    p.paragraph_format.space_after = Pt(3)
    pPr = p._p.get_or_add_pPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), "F2F4F6")
    pPr.append(shd)
    r = p.add_run(text)
    r.font.name = "Cascadia Mono"
    r.font.size = Pt(9)
    return p


def table(doc, headers, rows):
    t = doc.add_table(rows=1, cols=len(headers))
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    t.autofit = True
    for i, value in enumerate(headers):
        c = t.rows[0].cells[i]
        c.text = value
        shade(c, BLUE)
        c.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        for r in c.paragraphs[0].runs:
            r.bold = True
            r.font.size = Pt(9)
    for row in rows:
        cells = t.add_row().cells
        for i, value in enumerate(row):
            cells[i].text = str(value)
            cells[i].vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            for p in cells[i].paragraphs:
                p.paragraph_format.space_after = Pt(2)
                p.paragraph_format.space_before = Pt(2)
                for r in p.runs:
                    r.font.size = Pt(8.5)
    borders(t)
    doc.add_paragraph().paragraph_format.space_after = Pt(0)
    return t


def image(doc, name, caption):
    f = EVIDENCE / name
    if not f.exists():
        raise FileNotFoundError(f"Required real evidence image is missing: {f}")
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(3)
    p.paragraph_format.space_after = Pt(2)
    p.add_run().add_picture(str(f), width=Inches(6.65))
    cap = doc.add_paragraph()
    cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cap.paragraph_format.space_after = Pt(6)
    r = cap.add_run(caption)
    r.italic = True
    r.font.size = Pt(8.5)
    r.font.color.rgb = RGBColor.from_string("555555")


def build_main():
    d = Document()
    setup(d, "Informe del taller EduConnect API Gateway")
    p = d.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(90)
    r = p.add_run("UNIVERSIDAD DE LAS AMÉRICAS")
    r.bold = True
    r.font.size = Pt(13)
    p = d.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.add_run("Facultad de Ingeniería y Ciencias Aplicadas").font.size = Pt(11)
    p = d.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(55)
    title_run = p.add_run("Informe del taller\nEduConnect API Gateway")
    title_run.bold = True
    title_run.font.name = "Aptos Display"
    title_run.font.size = Pt(27)
    title_run.font.color.rgb = RGBColor.from_string(BLACK)
    p = d.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(15)
    r = p.add_run("Integración de Sistemas  |  Grupo 3")
    r.bold = True
    r.font.size = Pt(13)
    para(d, "Jhoel Suarez · Mauricio Mora · Stefan Jativa · Justin Gomezcoello", center=True)
    para(d, "Fecha de ejecución: 24 de noviembre de 2026", center=True)
    para(d, "Kong Gateway 3.9.5 · Docker Compose · Postman", center=True)
    para(d, "Repositorio: github.com/justingomezcoello10/Taller-EduConnect-API-Gateway", center=True)
    d.add_page_break()

    heading(d, "Contenido", 1)
    bullets(d, [
        "Objetivo, justificación y alcance", "Preparación del entorno", "Arquitectura y conceptos",
        "Instalación y uso de Postman", "Retos 0 a 4", "Desafío de transferencia: Certificados",
        "Resultados, conclusiones, recomendaciones y fuentes",
    ])
    heading(d, "1. Objetivo, justificación y alcance", 1)
    para(d, "El objetivo fue desplegar Kong Gateway con Docker Compose y comprobar que cuatro APIs simuladas pueden exponerse mediante una sola dirección. También configuramos API Key para identificar consumidores y rate limiting para controlar solicitudes. La prueba muestra cómo el gateway desacopla al cliente de las direcciones internas y centraliza controles básicos.")
    para(d, "EduConnect necesita evitar conexiones y políticas distintas para cada consumidor y API. Implementamos una PoC local sin cambiar los sistemas existentes, con datos ficticios y estáticos. El alcance no incluye identidad de usuarios finales, permisos de negocio, persistencia, alta disponibilidad ni monitoreo distribuido completo.")
    heading(d, "2. Preparación del entorno", 1)
    para(d, "Se utilizó Docker Desktop para ejecutar los contenedores y Postman para preparar y enviar solicitudes. Docker Compose define cinco contenedores: Kong y los mocks de Estudiantes, Matrículas, Pagos y Certificados. No se requiere una base de datos.")
    para(d, "Los archivos principales son docker-compose.yml, kong/kong.yml, mocks/server.js y mocks/Dockerfile. La colección de Postman, esta guía, la matriz de evidencias y los scripts de verificación se versionan junto con la configuración.")
    heading(d, "3. Arquitectura y conceptos utilizados", 1)
    para(d, "Postman envía GET http://localhost:8000/api/pagos con la cabecera apikey. Kong identifica la Route, valida el Consumer, aplica el límite y localiza el Service de Pagos. Luego reenvía a http://pagos:3003/pagos por la red educonnect-net. El mock devuelve JSON e identifica el servicio en X-Service y en el campo servicio.")
    table(d, ["Componente", "Nombre y puerto", "Función"], [
        ["Cliente", "Postman", "Envía solicitudes al gateway"], ["Kong", "localhost:8000", "Enruta y aplica plugins"],
        ["Estudiantes", "estudiantes:3001", "GET /estudiantes"], ["Matrículas", "matriculas:3002", "GET /matriculas"],
        ["Pagos", "pagos:3003", "GET /pagos"], ["Certificados", "certificados:3004", "GET /certificados"],
        ["Red Docker", "educonnect-net", "DNS interno y tráfico privado"],
    ])
    para(d, "Un Service describe el destino backend. Una Route describe la combinación pública de URL y método. strip_path: true retira /api antes del reenvío. Si cambia un nombre DNS o puerto interno, se actualiza el Service; el cliente puede mantener la misma dirección pública.")
    para(d, "Un Consumer representa la aplicación cliente identificada por Kong y un plugin aplica una política. DB-less carga Consumers, Services, Routes y plugins desde kong/kong.yml. Docker Compose crea la red y resuelve los nombres de servicio, evitando direcciones IP rígidas.")
    heading(d, "4. Instalación y ejecución en Docker", 1)
    para(d, "En una terminal abierta en la raíz del repositorio, primero se construyen los mocks y se arranca el entorno:")
    code(d, "docker compose up -d --build")
    para(d, "Después se verifica el estado de cada servicio:")
    code(d, "docker compose ps")
    para(d, "El estado esperado es running y healthy. El proxy público escucha en el puerto 8000. La Admin API se limita a 127.0.0.1:8001 para diagnóstico local. Los mocks no publican puertos al host.")
    image(d, "docker-desktop-01-contenedores.jpg", "Figura 1. Captura real de Docker Desktop: stack expandido con Kong y los cuatro mocks en ejecución.")
    heading(d, "5. Construcción y uso de Postman", 1)
    para(d, "En Postman organizamos la colección EduConnect API Gateway - Grupo 3 con solicitudes positivas y negativas. Cada solicitud usa GET. Las rutas protegidas envían apikey con una variable de colección; así se conserva una URL base común y se cambia el Consumer de la prueba.")
    table(d, ["Variable", "Valor ficticio", "Propósito"], [
        ["baseUrl", "http://localhost:8000", "Punto de entrada de Kong"],
        ["apiKey", "educonnect-poc-key-2026", "Solicitudes generales"],
        ["rateKey", "educonnect-rate-key-2026", "Prueba de límite 5/min"],
        ["certKey", "educonnect-cert-key-2026", "Certificados, límite 2/min"],
    ])
    para(d, "Seleccionamos una solicitud y usamos Send. Postman muestra el estado HTTP y el JSON en Response. X-Service y el campo servicio permiten comprobar qué backend respondió. Las claves son ficticias y de laboratorio. key-auth las valida en Kong; hide_credentials: true evita que el mock reciba la cabecera.")
    image(d, "postman-01-coleccion-real.jpg", "Figura 2. Colección y solicitudes visibles en la aplicación Postman local.")
    image(d, "postman-03-estudiantes-documentado.jpg", "Figura 3. Detalle real de la solicitud de Estudiantes con explicación y resultado.")
    heading(d, "6. Reto 0: despliegue de Kong", 1)
    para(d, "Predicción: al compartir una red Docker y usar nombres DNS de Compose, Kong resolverá los mocks sin IP fija.", "Predicción:")
    para(d, "Decisión: fijamos Kong 3.9.5 en modo DB-less. kong/kong.yml declara cuatro Consumers, cuatro Services, cuatro Routes y sus plugins.", "Decisión:")
    para(d, "Prueba: iniciamos Compose y revisamos docker compose ps y Docker Desktop. Resultado: Kong y los cuatro mocks quedaron activos. Las llamadas positivas confirmaron el enrutamiento por nombres internos.", "Prueba:")
    para(d, "Limitación: la observación demuestra integración en una red local; no demuestra alta disponibilidad ni operación entre hosts.", "Limitación:")
    heading(d, "7. Reto 1: punto de acceso único", 1)
    para(d, "Predicción: GET /api/estudiantes, /api/matriculas y /api/pagos deben devolver 200 y JSON del mock correcto. Para Certificados se agregó /api/certificados.", "Predicción:")
    para(d, "Decisión: una Route por recurso y un Service por backend; cada Route admite GET y aplica autenticación.", "Decisión:")
    para(d, "Resultado: las cuatro solicitudes con API Key válida devolvieron 200. Los cuerpos JSON identifican estudiantes, matriculas, pagos y certificados.", "Resultado:")
    image(d, "postman-02-estudiantes-200.jpg", "Figura 4. Estudiantes: Postman muestra 200 OK y el JSON identifica el servicio.")
    image(d, "postman-04-matriculas-200.jpg", "Figura 5. Matrículas: Postman muestra 200 OK y el JSON identifica el servicio.")
    image(d, "postman-05-pagos-200.jpg", "Figura 6. Pagos: Postman muestra 200 OK y el JSON identifica el servicio.")
    para(d, "Interpretación: el cliente conoce solo localhost:8000 y la ruta pública. Si cambia un destino interno, se modifica el Service; si cambia el contrato público, se modifica la Route.")
    heading(d, "8. Reto 2: autenticación con API Key", 1)
    para(d, "Predicción: la falta de clave o una clave desconocida devuelve 401. Una clave válida permite continuar a una ruta existente.", "Predicción:")
    para(d, "Decisión: key-auth busca la cabecera apikey. educonnect-app cubre las pruebas generales; dos Consumers separados se reservan para las ráfagas. Las claves son ficticias.", "Decisión:")
    para(d, "Resultado: la suite registró 401 sin clave, 401 con clave incorrecta y 200 con clave válida. Certificados sin clave también devolvió 401.", "Resultado:")
    image(d, "postman-06-sin-key-401.jpg", "Figura 7. Solicitud real sin apikey: 401 Unauthorized.")
    para(d, "AuthN identifica quién presenta la credencial. AuthZ determina qué operaciones y recursos puede usar. Una API Key válida identifica al Consumer, pero no prueba que pueda consultar una matrícula, un pago o un certificado específicos.")
    heading(d, "9. Reto 3: control de consumo", 1)
    para(d, "Predicción: cinco solicitudes de un Consumer en la misma ventana devuelven 200; la sexta devuelve 429.", "Predicción:")
    para(d, "Decisión: las tres rutas originales usan minute: 5, policy: local y limit_by: consumer. educonnect-rate-key-2026 separa la ráfaga de las solicitudes generales.", "Decisión:")
    table(d, ["Solicitud consecutiva a Pagos", "Estado"], [[str(i), "200"] for i in range(1, 6)] + [["6", "429"]])
    para(d, "Resultado: la suite envió seis llamadas consecutivas y registró [200, 200, 200, 200, 200, 429]. Cada intento y su marca de tiempo quedaron en evidencia/resultados-pruebas.json.")
    para(d, "Limitación: el contador local no se comparte entre réplicas. En producción se requiere un almacén compartido, como Redis, o una política distribuida para aplicar una cuota global.")
    heading(d, "10. Reto 4: rutas y backend no disponible", 1)
    heading(d, "Ruta no registrada", 2)
    para(d, "Predicción: una URL sin Route devuelve 404. Postman envió GET /api/desconocido con una clave válida; Kong respondió 404 y el cuerpo indicó que no encontró una Route coincidente. La petición no llegó a un mock.")
    image(d, "postman-10-ruta-inexistente-404.jpg", "Figura 8. Solicitud real a /api/desconocido: Kong respondió 404 Not Found.")
    heading(d, "Backend de Pagos detenido y recuperado", 2)
    para(d, "Predicción: al detener Pagos, una solicitud válida debe devolver un error de proxy. El código concreto puede cambiar con DNS y el momento de la desconexión. Al recuperar el backend, la solicitud debe volver a funcionar.")
    code(d, "docker compose stop pagos")
    para(d, "Con Pagos detenido, enviamos desde Postman GET /api/pagos con apikey. La respuesta observada fue 503 Service Temporarily Unavailable y el cuerpo indicó name resolution failed.")
    image(d, "postman-07-pagos-backend-detained-503.jpg", "Figura 9. Pagos detenido: Postman muestra 503 por fallo de resolución del backend.")
    para(d, "Luego iniciamos el mock y esperamos a que el estado fuera healthy. Kong conservó temporalmente el fallo DNS; reiniciamos Kong, esperamos su healthcheck y volvimos a enviar la solicitud.")
    code(d, "docker compose start pagos")
    code(d, "docker compose restart kong")
    para(d, "La solicitud posterior respondió 200 con el JSON de Pagos. La secuencia completa está registrada en evidencia/backend-no-disponible.json.")
    image(d, "postman-08-pagos-recuperado-200.jpg", "Figura 10. Después de recuperar Pagos y Kong, la ruta volvió a responder 200 OK.")
    heading(d, "11. Desafío de transferencia: Certificados", 1)
    para(d, "Predicción: se puede agregar un cuarto backend con una Route nueva, mantener la API Key y aplicar otro límite sin alterar las tres rutas originales.")
    para(d, "Decisión: añadimos el mock certificados:3004, certificados-service y GET /api/certificados. Esa Route usa key-auth y minute: 2.")
    para(d, "Resultado: Postman recibió 200 y el JSON devolvió estado EMITIDO. La suite observó 401 sin clave y la secuencia [200, 200, 429] con el Consumer dedicado.")
    image(d, "postman-09-certificados-200.jpg", "Figura 11. Certificados: respuesta real 200 OK a través de Kong.")
    heading(d, "12. Resultados y reflexión", 1)
    table(d, ["Caso", "Resultado observado"], [
        ["Cuatro rutas positivas", "4 × HTTP 200"], ["Clave ausente e incorrecta", "2 × HTTP 401"],
        ["Certificados sin clave", "HTTP 401"], ["Ruta no registrada", "HTTP 404"],
        ["Límite de Pagos", "200 × 5; luego 429"], ["Límite de Certificados", "200 × 2; luego 429"],
        ["Backend Pagos detenido", "HTTP 503"], ["Después de recuperar Pagos y Kong", "HTTP 200"],
    ])
    para(d, "La suite final registró 11 casos aprobados de 11. La PoC centraliza la autenticación del Consumer, el enrutamiento y límites básicos. La principal ventaja del gateway es aplicar reglas comunes y ocultar destinos internos; el principal riesgo es que concentre tráfico y controles en un componente crítico.")
    para(d, "El gateway no reemplaza la autorización dentro de los sistemas. La PoC no verifica identidad final, permisos por recurso, persistencia, TLS, alta disponibilidad ni trazabilidad distribuida.")
    heading(d, "13. Conclusiones y recomendaciones", 1)
    para(d, "Desplegamos Kong con Compose, integramos cuatro mocks independientes, expusimos un único punto de acceso y verificamos autenticación, control de consumo, rutas inválidas y recuperación. El desafío de Certificados confirmó que la configuración puede ampliarse mediante un nuevo mock, Service, Route y límite propio.")
    para(d, "Antes de producción recomendamos OAuth2/OIDC, roles o atributos para autorizar operaciones, TLS y secretos gestionados, rate limiting distribuido, varias réplicas detrás de un balanceador, métricas y trazas, alertas, auditoría y pruebas de carga y recuperación.")
    heading(d, "14. Uso de IA y fuentes", 1)
    para(d, "Se utilizó IA generativa como apoyo para organizar la documentación y preparar verificaciones. Contrastamos la configuración ejecutándola en Docker Desktop, Kong y Postman y con la suite local.")
    for text in [
        "Kong Gateway y modo DB-less: https://developer.konghq.com/gateway/ y https://developer.konghq.com/gateway/db-less-mode/",
        "Key Authentication y Rate Limiting: https://developer.konghq.com/plugins/key-auth/ y https://developer.konghq.com/plugins/rate-limiting/",
        "Docker Compose: https://docs.docker.com/compose/ | Postman: https://learning.postman.com/docs/",
        "OWASP API Security: https://owasp.org/API-Security/",
    ]:
        bullets(d, [text])
    para(d, "La matriz completa está en evidencia/matriz-evidencias.md. Las respuestas detalladas están en evidencia/resultados-pruebas.json y evidencia/backend-no-disponible.json.")
    d.save(ROOT / "INFORME_EDUCONNECT.docx")


def build_brief():
    d = Document()
    setup(d, "Decisiones arquitectónicas de la PoC EduConnect")
    p = d.add_paragraph()
    p.add_run("Decisiones arquitectónicas\nEduConnect API Gateway")
    p.runs[0].bold = True
    p.runs[0].font.name = "Aptos Display"
    p.runs[0].font.size = Pt(25)
    p.runs[0].font.color.rgb = RGBColor.from_string(BLACK)
    para(d, "Grupo 3 · Integración de Sistemas · 24 de noviembre de 2026", center=True)
    heading(d, "Arquitectura y propósito", 1)
    para(d, "La PoC valida un punto de acceso común para Estudiantes, Matrículas, Pagos y Certificados. Kong Gateway 3.9.5 opera en modo DB-less dentro de Docker Compose. El cliente usa http://localhost:8000; Kong aplica políticas y reenvía las solicitudes a cuatro mocks independientes en educonnect-net. Los backends no publican puertos al host. El DNS de Compose evita direcciones IP rígidas.")
    para(d, "Un Service describe el destino interno; una Route identifica ruta pública y método. Con strip_path: true, Kong retira /api antes de reenviar. Si cambia el nombre o puerto interno, se actualiza el Service sin cambiar el contrato del consumidor.")
    heading(d, "Autenticación y autorización", 1)
    para(d, "key-auth busca una clave ficticia en la cabecera apikey e identifica un Consumer. hide_credentials: true evita pasarla al mock. La suite observó 401 sin clave, 401 con clave incorrecta y 200 con clave válida. Esto verifica AuthN: quién presenta la credencial. No verifica AuthZ: qué usuario puede leer una matrícula, pago o certificado determinado. Eso requiere contexto de usuario, recurso, acción y política de negocio.")
    heading(d, "Consumo, límites y producción", 1)
    para(d, "Rate Limiting usa policy: local y limit_by: consumer. Las rutas originales permiten cinco solicitudes por minuto y Certificados permite dos. La suite observó 200 × 5 + 429 y 200 × 2 + 429. El contador local no se comparte entre réplicas; no constituye una cuota distribuida.")
    para(d, "La PoC usa datos estáticos y no incorpora identidad final, autorización por recurso, persistencia, TLS, alta disponibilidad o trazabilidad integral. Kong centraliza políticas, pero concentra tráfico en un componente crítico. Antes de producción recomendamos OAuth2/OIDC, RBAC/ABAC, secretos gestionados y TLS, Redis o política distribuida, varias réplicas, balanceador, métricas, trazas, alertas, auditoría y pruebas de carga y recuperación.")
    heading(d, "Fuentes consultadas", 1)
    bullets(d, [
        "Kong Gateway y DB-less: https://developer.konghq.com/gateway/ · https://developer.konghq.com/gateway/db-less-mode/",
        "Key Authentication y Rate Limiting: https://developer.konghq.com/plugins/key-auth/ · https://developer.konghq.com/plugins/rate-limiting/",
        "Docker Compose: https://docs.docker.com/compose/ · Postman: https://learning.postman.com/docs/",
        "OWASP API Security: https://owasp.org/API-Security/",
    ])
    d.save(ROOT / "DECISIONES_ARQUITECTONICAS.docx")


if __name__ == "__main__":
    build_main()
    build_brief()
    print("Documentos Word generados.")
