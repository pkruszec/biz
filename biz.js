"use strict";
var _a;
const graph = document.getElementById("graph");
const unitsSelect = document.getElementById("units");
const ctx = graph.getContext("2d");
const dateSpan = document.getElementById("date");
const priceSpan = document.getElementById("price");
const balanceSpan = document.getElementById("balance");
const amt = document.getElementById("amt");
const total = document.getElementById("total");
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
let balance = 10000;
let shares = new Map();
const weekday = [
    "pn", "wt", "śr", "cz", "pt", "sb", "nd"
];
const unitNames = [
    "ABC",
    "BBC",
    "THC",
    "CBD",
];
let units = new Map();
let data = [];
function pad(n, width, z = '0') {
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}
function computeX(x) {
    return offsetX + x * ((graph.width - offsetX * 2) / scaleX);
}
function computeY(y) {
    return graph.height - (offsetY + y * ((graph.height - offsetY * 2) / scaleY));
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
            // const text = `${weekday[r.getDay()]} ${pad(r.getDate(), 2)}`;
            const text = `${pad(r.getDate(), 2)}`;
            const metrics = ctx.measureText(text);
            const tx = x - metrics.width / 2;
            ctx.fillText(text, tx, graph.height - 8);
        }
        for (let j = 1; j <= rulerScaleY; ++j) {
            const i = j * (scaleY / rulerScaleY);
            const y = computeY(i);
            ctx.moveTo(rulerOffsetX, y);
            ctx.lineTo(offsetX, y);
            const text = i.toFixed(2).replace(".", ","); // HACK
            const metrics = ctx.measureText(text);
            const ty = y + (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;
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
}
function frame(_) {
    const dpr = window.devicePixelRatio;
    const rect = graph.getBoundingClientRect();
    graph.width = rect.width * dpr;
    graph.height = rect.height * dpr;
    graph.style.width = `${rect.width}px`;
    graph.style.height = `${rect.height}px`;
    draw();
    window.requestAnimationFrame(frame);
}
function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}
function updatePrice() {
    var _a, _b, _c;
    const xs = (_a = units.get(unitsSelect.value)) === null || _a === void 0 ? void 0 : _a.values;
    if (xs) {
        const x = xs[(xs === null || xs === void 0 ? void 0 : xs.length) - 1].toFixed(2).replace(".", ","); // HACK
        const y = (_c = (_b = shares.get(unitsSelect.value)) === null || _b === void 0 ? void 0 : _b.toFixed(0)) !== null && _c !== void 0 ? _c : 0;
        priceSpan.textContent = `| Cena: ${x} | Posiadane: ${y}`;
    }
}
function updateBalance() {
    balanceSpan.textContent = `Stan konta: ${balance.toFixed(2).replace(".", ",")}`; // HACK
}
function unitChange(ev) {
    var _a;
    const key = ev.target.value;
    console.log(key);
    data = ((_a = units.get(key)) === null || _a === void 0 ? void 0 : _a.values) || [];
    updatePrice();
}
function buy() {
    var _a, _b, _c;
    if (amt.validity.valid) {
        const xs = (_b = (_a = units.get(unitsSelect.value)) === null || _a === void 0 ? void 0 : _a.values) !== null && _b !== void 0 ? _b : [0];
        const c = parseInt(amt.value);
        const p = xs[(xs === null || xs === void 0 ? void 0 : xs.length) - 1];
        const t = c * p;
        if (t <= balance) {
            balance -= t;
            shares.set(unitsSelect.value, ((_c = shares.get(unitsSelect.value)) !== null && _c !== void 0 ? _c : 0) + c);
            updateBalance();
            //updateStatus();
            updatePrice();
        }
        else {
            total.textContent = "Brak środków!";
        }
    }
}
function sell() {
    var _a, _b, _c;
    if (amt.validity.valid) {
        const xs = (_b = (_a = units.get(unitsSelect.value)) === null || _a === void 0 ? void 0 : _a.values) !== null && _b !== void 0 ? _b : [0];
        const c = parseInt(amt.value);
        const p = xs[(xs === null || xs === void 0 ? void 0 : xs.length) - 1];
        const t = c * p;
        const x = ((_c = shares.get(unitsSelect.value)) !== null && _c !== void 0 ? _c : 0);
        if (c <= x) {
            shares.set(unitsSelect.value, x - c);
            balance += t;
            updateBalance();
            updatePrice();
        }
        else {
            total.textContent = "Brak środków!";
        }
    }
}
function nextDay() {
    day++;
    let m = 0;
    for (let unit of units) {
        let a = unit[1].values;
        let v = randomRange(0, 250);
        a.push(v);
        if (v > m)
            m = v;
    }
    if (day >= scaleX)
        startX++;
    if (m >= scaleY)
        scaleY = Math.ceil(m / 100) * 100;
    dateSpan.textContent = date.toLocaleDateString("pl-PL");
    let r = new Date(date);
    r.setDate(r.getDate() + 1);
    date = r;
    updatePrice();
}
function updateStatus(ev = null) {
    var _a, _b;
    if (amt.validity.valid) {
        const xs = (_b = (_a = units.get(unitsSelect.value)) === null || _a === void 0 ? void 0 : _a.values) !== null && _b !== void 0 ? _b : [0];
        const t = (parseInt(amt.value) * xs[(xs === null || xs === void 0 ? void 0 : xs.length) - 1]).toFixed(2);
        total.textContent = `łącznie: ${t}`;
    }
    else {
        total.textContent = `(Wartość musi być między ${amt.min} a ${amt.max})`;
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
for (let i = 0; i < scaleX / 2; ++i) {
    nextDay();
}
document.onkeydown = function (ev) {
    if (ev.key == "n")
        nextDay();
};
updateBalance();
updateStatus();
amt.oninput = updateStatus;
data = ((_a = units.get(unitNames[0])) === null || _a === void 0 ? void 0 : _a.values) || [];
window.requestAnimationFrame(frame);
