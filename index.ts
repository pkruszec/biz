const graph = document.getElementById("graph") as HTMLCanvasElement;
const unitsSelect = document.getElementById("units") as HTMLTableElement;
const ctx = graph.getContext("2d")!;

const backgroundColor = "#FFFFFFFF";
const plotColor = "#FF0000FF";
const textColor = "#000000FF";
const rulerColor = "#000000FF";
const font = "20px sans-serif";

const scaleX = 20;
const scaleY = 10;
const offsetX = 80;
const offsetY = 40;
const rulerScaleY = 10;
const rulerOffsetX = 60;
const rulerOffsetY = 20;
const dotRadius = 4;

interface Unit {
    values: number[];
}

const unitNames: string[] = [
    "ABC",
    "BBC",
];

let units = new Map<string, Unit>();
let data: number[] = [];

function computeX(x: number): number {
    return offsetX + x * ((graph.width - offsetX*2) / scaleX);
}

function computeY(y: number): number {
    return graph.height - (offsetY + y * ((graph.height - offsetY*2) / scaleY));
}

function draw() {
    ctx.font = font;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, graph.width, graph.height);

    {
        ctx.strokeStyle = rulerColor;
        ctx.fillStyle = textColor;

        ctx.beginPath();

        const bx = computeX(0);
        const by = computeY(0);
        ctx.moveTo(bx, 0);
        ctx.lineTo(bx, graph.height);
        ctx.moveTo(0, by);
        ctx.lineTo(graph.width, by);
        
        for (let i = 1; i <= scaleX; ++i) {
            const x = computeX(i);
            ctx.moveTo(x, graph.height - rulerOffsetY);
            ctx.lineTo(x, graph.height - offsetY);

            const text = i.toString();
            const metrics = ctx.measureText(text);
            const tx = x - metrics.width/2;
            ctx.fillText(text, tx, graph.height);
        }

        for (let j = 1; j <= rulerScaleY; ++j) {
            const i = j * (scaleY/rulerScaleY);
            const y = computeY(i);
            ctx.moveTo(rulerOffsetX, y);
            ctx.lineTo(offsetX, y);

            const text = i.toFixed(3).toString();
            const metrics = ctx.measureText(text);
            const ty = y + (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent)/2;
            ctx.fillText(text, rulerOffsetX - metrics.width, ty);
        }

        ctx.stroke();
    }

    ctx.strokeStyle = plotColor;
    ctx.fillStyle = plotColor;
    ctx.beginPath();
    ctx.moveTo(computeX(0), computeY(data[0]));
    for (let i = 1; i < data.length; ++i) {
        ctx.lineTo(computeX(i), computeY(data[i]));
    }
    ctx.stroke();

    // for (let i = 0; i < data.length; ++i) {
    //     ctx.beginPath();
    //     ctx.arc(computeX(i), computeY(data[i]), dotRadius, 0, 2*Math.PI, false);
    //     ctx.fill();
    // }
}

function frame(_: number) {
    const dpr = window.devicePixelRatio;
    const rect = graph.getBoundingClientRect();
    graph.width = rect.width*dpr;
    graph.height = rect.height*dpr;
    graph.style.width = `${rect.width}px`;
    graph.style.height = `${rect.height}px`;
    draw();
    window.requestAnimationFrame(frame);
}

function randomRange(min: number, max: number): number {
    return Math.random() * (max-min) + min;
}

function unitChange(ev: Event) {
    const key = (ev.target as HTMLOptionElement).value;
    console.log(key);
    data = units.get(key)?.values || [];
}

function nextDay() {
    for (let unit of units) {
        let a = unit[1].values;
        let v = randomRange(basePriceMin, basePriceMax);
        a.push(v);
    }
}

for (let name of unitNames) {
    units.set(name, {
        values: []
    });
}

for (let unit of units) {
    let elem = document.createElement("option");
    elem.value = unit[0];
    elem.textContent = unit[0];
    unitsSelect.appendChild(elem);
}

unitsSelect.onchange = unitChange;

const basePriceMin = 1;
const basePriceMax = 10;

for (let i = 0; i < 1; ++i) {
    for (let unit of units) {
        unit[1].values.push(randomRange(basePriceMin, basePriceMax));
    }
}

data = units.get(unitNames[0])?.values || [];
window.requestAnimationFrame(frame);
