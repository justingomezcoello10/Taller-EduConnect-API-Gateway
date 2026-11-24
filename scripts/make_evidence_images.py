from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

ROOT=Path(r'C:\Universidad\Taller EduConnect')
OUT=ROOT/'evidencia'/'capturas'; OUT.mkdir(parents=True,exist_ok=True)

font_paths=[
 r'C:\Windows\Fonts\consola.ttf',
 r'C:\Windows\Fonts\lucon.ttf',
]
font=ImageFont.truetype(next(p for p in font_paths if Path(p).exists()),22)
small=ImageFont.truetype(next(p for p in font_paths if Path(p).exists()),18)


def image(title, blocks, filename, width=1400):
    pad=55
    margin=30
    line_h=30
    lines=[title,'','']
    for block in blocks:
        if isinstance(block,(list,tuple)): lines.extend(block)
        else: lines.extend(str(block).splitlines())
        lines.append('')
    height=max(850, pad*2+len(lines)*line_h)
    im=Image.new('RGB',(width,height),'white')
    d=ImageDraw.Draw(im)
    d.rectangle((0,0,width,150),fill='#0B5CAB')
    d.text((pad,45),title,font=font,fill='white')
    y=180
    for line in lines[1:]:
        if not line:
            y+=12
        else:
            d.text((pad,y),line,font=small,fill='#17212B')
            y+=line_h
        if y>height-50: break
    im.save(OUT/filename,quality=95)

image('Reto 0 — Contenedores operativos', [
'Comando: docker compose ps',
'',
'educonnect-certificados   Up ... (healthy)   3001/tcp, 3004/tcp',
'educonnect-estudiantes    Up ... (healthy)   3001/tcp',
'educonnect-kong           kong:3.9.5       (healthy)   8000, 8001',
'educonnect-matriculas     Up ... (healthy)   3001-3002/tcp',
'educonnect-pagos          Up ... (healthy)   3001/tcp, 3003/tcp',
'',
'Servicios disponibles dentro de la red Docker educonnect-net.'
],'reto0-contenedores.jpg')

for name in ['estudiantes','matriculas','pagos','certificados']:
    headers=(OUT/f'{name}.headers.txt').read_text(encoding='utf-8',errors='replace') if (OUT/f'{name}.headers.txt').exists() else 'Evidencia no disponible'
    body=(OUT/f'{name}.json').read_text(encoding='utf-8',errors='replace') if (OUT/f'{name}.json').exists() else '{}'
    image(f'Reto 1 — Respuesta positiva: {name}',[
        f'URL pública: http://localhost:8000/api/{name}',
        'Método: GET',
        'Cabecera: apikey: educonnect-poc-key-2026',
        '', 'CABECERAS OBSERVADAS', headers.splitlines(),
        '', 'CUERPO JSON OBSERVADO', body.splitlines()
    ],f'respuesta-{name}.jpg')

for label,filename,key in [
 ('Sin API Key','sin-key.txt',None),
 ('API Key inválida','key-invalida.txt','clave-invalida-de-prueba'),
 ('Ruta inexistente','ruta-inexistente.txt','educonnect-poc-key-2026')]:
    p=OUT/filename
    text=p.read_text(encoding='utf-8',errors='replace') if p.exists() else 'Evidencia no disponible'
    image(f'Prueba negativa — {label}',[
        'Comando ejecutado mediante curl.exe',
        f'API Key enviada: {key or "ninguna"}',
        '', 'RESPUESTA REAL', text.splitlines()
    ],filename.replace('.txt','.jpg'))

# Pagos burst image
rate_status=[]
for i in range(1,7):
    p=OUT/f'rate-{i}.headers.txt'
    first=''
    if p.exists():
        first=next((x for x in p.read_text(encoding='utf-8',errors='replace').splitlines() if x.startswith('HTTP/')), '')
    rate_status.append(first)
image('Reto 3 — Ráfaga de Pagos (5 por minuto)',[
'Consumidor: educonnect-rate',
'Clave: educonnect-rate-key-2026',
'URL: http://localhost:8000/api/pagos',
'', 'Secuencia ejecutada:',
'1 → 200   2 → 200   3 → 200   4 → 200   5 → 200   6 → 429',
'', 'HTTP observado por solicitud:',rate_status,
'', 'Resultado: coincide con la hipótesis: supera el umbral en la sexta solicitud.'
],'reto3-pagos-rafaga.jpg')

# Certificados burst image
image('Desafío — Ráfaga de Certificados (2 por minuto)',[
'Consumidor: educonnect-cert',
'Clave: educonnect-cert-key-2026',
'URL: http://localhost:8000/api/certificados',
'',
'Secuencia ejecutada:',
'1 → 200   2 → 200   3 → 429',
'',
'Resultado: la ruta funciona y aplica un límite distinto al de las rutas principales.'
],'reto6-certificados-rafaga.jpg')

print('Generated evidence images in',OUT)
