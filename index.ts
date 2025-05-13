const graph = document.getElementById("graph") as HTMLCanvasElement;
const unitsSelect = document.getElementById("units") as HTMLSelectElement;
const ctx = graph.getContext("2d")!;
const dateSpan = document.getElementById("date") as HTMLSpanElement;
const priceSpan = document.getElementById("price") as HTMLSpanElement;

const backgroundColor = "#FFFFFFFF";
const plotColor = "#FF0000FF";
const textColor = "#000000FF";
const rulerColor = "#000000FF";
const font = "16px sans-serif";

let scaleX = 20;
let scaleY = 10;
let rulerScaleY = 10;
let rulerOffsetX = 80;
let rulerOffsetY = 25;
let offsetX = rulerOffsetX + 20;
let offsetY = 40;
let dotRadius = 4;

let startX = 0;
let day = 0;

let date = new Date();
let firstDate = date;

interface Unit {
    values: number[];
}

const weekday: string[] = [
    "pn", "wt", "śr", "cz", "pt", "sb", "nd"
];

const unitNames: string[] = [
    "ABC",
    "BBC",
    "THC",
    "CBD",
];

let units = new Map<string, Unit>();
let data: number[] = [];

function pad(n: any, width: any, z: any = '0') {
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

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

            //const text = (i + startX).toString();
            let r = new Date(firstDate);
            r.setDate(r.getDate() + i + startX);
            //const text = `${pad(r.getDate(), 2)}.${pad(r.getMonth(), 2)}}`;
            const text = `${weekday[r.getDay()]} ${pad(r.getDate(), 2)}`;

            const metrics = ctx.measureText(text);
            const tx = x - metrics.width/2;
            ctx.fillText(text, tx, graph.height - 8);
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
    ctx.moveTo(computeX(0), computeY(data[startX]));
    for (let i = 1; i < data.length; ++i) {
        ctx.lineTo(computeX(i), computeY(data[startX + i]));
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

function updatePrice() {
    const xs = units.get(unitsSelect.value)?.values;
    if (xs) {
        const x = xs[xs?.length - 1].toFixed(2);
        priceSpan.textContent = `Cena: ${x}`;
    }
}

function unitChange(ev: Event) {
    const key = (ev.target as HTMLOptionElement).value;
    console.log(key);
    data = units.get(key)?.values || [];
    updatePrice();
}

function nextDay() {
    day++;

    let m = 0;
    for (let unit of units) {
        let a = unit[1].values;
        let v = randomRange(0, 250);
        a.push(v);

        if (v>m) m = v;
    }

    if (day >= scaleX) startX++;
    if (m >= scaleY) scaleY = Math.ceil(m/100)*100;

    dateSpan.textContent = date.toLocaleDateString("pl-PL");
    let r = new Date(date);
    r.setDate(r.getDate() + 1);
    date = r;

    updatePrice();
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

for (let i = 0; i < scaleX/2; ++i) {
    nextDay();
}

document.onkeydown = function(ev) {
    if (ev.key == "n") nextDay();
}

// for (let i = 0; i < 1; ++i) {
//     for (let unit of units) {
//         unit[1].values.push(randomRange(basePriceMin, basePriceMax));
//     }
// }

data = units.get(unitNames[0])?.values || [];
window.requestAnimationFrame(frame);
