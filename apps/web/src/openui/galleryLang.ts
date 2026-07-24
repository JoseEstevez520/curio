/**
 * SPIKE (exp/openui) — a fixed OpenUI Lang program that exercises the whole catalog, for the
 * `/?gallery` visual check. Deterministic (no model call), so it renders the same every time
 * and can be screenshotted to verify how the composed components actually look.
 */
export const GALLERY_LANG = `h = Heading("Curio · catálogo generativo")
p1 = Prose("Este panel muestra las piezas del catálogo, renderizadas con el mismo motor que usa el chat en modo Gen UI.")
def1 = DefinitionCard("Fotosíntesis", "Proceso por el que las plantas convierten la luz en energía química.", "Biología")
stats = StatRow([{value: "4879 km", label: "Diámetro"}, {value: "88 días", label: "Órbita"}, {value: "167°C", label: "Temp. media"}])
facts = FactTable("Datos clave", [{label: "Distancia al Sol", value: "57,9M km"}, {label: "Lunas", value: "0"}, {label: "Gravedad", value: "3,7 m/s²"}])
bars = BarList("Países más poblados (millones)", [{label: "India", value: 1428}, {label: "China", value: 1425}, {label: "EE.UU.", value: 340}, {label: "Indonesia", value: 277}])
line = LineChart("Temperatura media por década (°C)", [{label: "1960", value: 13.9}, {label: "1980", value: 14.2}, {label: "2000", value: 14.6}, {label: "2020", value: 15.0}])
donut = Donut("Generación eléctrica", [{label: "Eólica", value: 24}, {label: "Nuclear", value: 20}, {label: "Gas", value: 22}, {label: "Solar", value: 18}, {label: "Hidro", value: 16}])
tl = Timeline("Historia de la Bauhaus", [{date: "1919", label: "Fundación en Weimar"}, {date: "1925", label: "Traslado a Dessau"}, {date: "1933", label: "Cierre"}])
comp = Comparison("Python vs JavaScript", [{heading: "Python", points: ["Sintaxis clara", "Ciencia de datos"]}, {heading: "JavaScript", points: ["Nativo del navegador", "Ecosistema enorme"]}])
steps = Steps("Café en prensa francesa", [{title: "Calienta el agua", detail: "unos 92°C"}, {title: "Añade el café molido"}, {title: "Espera 4 min y presiona"}])
lst = BulletList("Consejos para dormir", false, ["Horario fijo", "Sin pantallas antes", "Habitación fresca"])
q = Quote("La forma sigue a la función.", "Louis Sullivan")
tg = Tags(["Astronomía", "Sistema solar", "Órbita", "Mercurio"])
co = Callout("Dato curioso: un día en Mercurio dura más que su propio año.")
dv = Divider("Interactivo")
sb = SandboxHTML("<!DOCTYPE html><html><head><style>body{margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#fff;font-family:sans-serif;color:#333}</style></head><body><canvas id=c width=280 height=150></canvas><script>const g=document.getElementById('c').getContext('2d');let t=0;function d(){g.clearRect(0,0,280,150);const a=Math.sin(t);const px=140+Math.sin(a)*70,py=15+Math.cos(a)*70;g.strokeStyle='#999';g.beginPath();g.moveTo(140,15);g.lineTo(px,py);g.stroke();g.fillStyle='#2563eb';g.beginPath();g.arc(px,py,12,0,7);g.fill();t+=0.03;requestAnimationFrame(d)}d()</script></body></html>", "Péndulo (canvas)", 170)
root = Panel([h, p1, def1, stats, facts, bars, line, donut, tl, comp, steps, lst, q, tg, co, dv, sb])`;
