/**
 * SPIKE (exp/openui) — a fixed OpenUI Lang program that exercises the whole catalog, for the
 * `/?gallery` visual check. Deterministic (no model call), so it renders the same every time
 * and can be screenshotted to verify how the composed components actually look.
 */
export const GALLERY_LANG = `h = Heading("Curio · generative catalog")
p1 = Prose("This panel shows every piece of the catalog, rendered by the same engine the chat uses in Gen UI mode.")
def1 = DefinitionCard("Photosynthesis", "The process by which plants turn light into chemical energy.", "Biology")
stats = StatRow([{value: "4879 km", label: "Diameter"}, {value: "88 days", label: "Orbit"}, {value: "167°C", label: "Mean temp."}])
facts = FactTable("Key data", [{label: "Distance to the Sun", value: "57.9M km"}, {label: "Moons", value: "0"}, {label: "Gravity", value: "3.7 m/s²"}])
bars = BarList("Most populous countries (millions)", [{label: "India", value: 1428}, {label: "China", value: 1425}, {label: "USA", value: 340}, {label: "Indonesia", value: 277}])
line = LineChart("Mean temperature by decade (°C)", [{label: "1960", value: 13.9}, {label: "1980", value: 14.2}, {label: "2000", value: 14.6}, {label: "2020", value: 15.0}])
donut = Donut("Electricity generation", [{label: "Wind", value: 24}, {label: "Nuclear", value: 20}, {label: "Gas", value: 22}, {label: "Solar", value: 18}, {label: "Hydro", value: 16}])
tl = Timeline("A history of the Bauhaus", [{date: "1919", label: "Founded in Weimar"}, {date: "1925", label: "Moved to Dessau"}, {date: "1933", label: "Closed"}])
comp = Comparison("Python vs JavaScript", [{heading: "Python", points: ["Clear syntax", "Data science"]}, {heading: "JavaScript", points: ["Native to the browser", "Huge ecosystem"]}])
steps = Steps("French press coffee", [{title: "Heat the water", detail: "around 92°C"}, {title: "Add the ground coffee"}, {title: "Wait 4 min and press"}])
lst = BulletList("Tips for sleeping", false, ["A fixed schedule", "No screens beforehand", "A cool room"])
q = Quote("Form follows function.", "Louis Sullivan")
tg = Tags(["Astronomy", "Solar system", "Orbit", "Mercury"])
co = Callout("Curious fact: a day on Mercury lasts longer than its own year.")
dv = Divider("Interactive")
sb = SandboxHTML("<!DOCTYPE html><html><head><style>body{margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#fff;font-family:sans-serif;color:#333}</style></head><body><canvas id=c width=280 height=150></canvas><script>const g=document.getElementById('c').getContext('2d');let t=0;function d(){g.clearRect(0,0,280,150);const a=Math.sin(t);const px=140+Math.sin(a)*70,py=15+Math.cos(a)*70;g.strokeStyle='#999';g.beginPath();g.moveTo(140,15);g.lineTo(px,py);g.stroke();g.fillStyle='#2563eb';g.beginPath();g.arc(px,py,12,0,7);g.fill();t+=0.03;requestAnimationFrame(d)}d()</script></body></html>", "Pendulum (canvas)", 170)
root = Panel([h, p1, def1, stats, facts, bars, line, donut, tl, comp, steps, lst, q, tg, co, dv, sb])`;
