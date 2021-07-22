import $ from "jquery";
import *  as echarts from "echarts";
import TGAM from "./tgam";

const chart = echarts.init($("#chart-div")[0] as HTMLDivElement);
let data: [number, number][] = [];
setInterval(() => {
    chart.setOption({
        title: { text: "EEG-GAME" },
        tooltip: {},
        xAxis: [{ type: "value", min: 'dataMin', max: 'dataMax' }],
        yAxis: [{ type: "value" }],
        series: [{
            name: 'Wave',
            type: 'line',
            data: data
        }]
    });
}, 1000);

let gid = 0;
new TGAM("COM3")
.on('wave', (incoming) => {
    data.push([gid++, incoming]);
    if (data.length >= 1000) data.shift();
})
.on('attention', (a) => $("#attention-span").text(a))
.on('meditation', (a) => $("#meditation-span").text(a))
.on('blink', (_) => $("#blink-span").text(1 + parseInt($("#blink-span").text())))
.on('spectrum', (a) => $("#spectrum-span").text(a.join('\t')))
.on('poorSignal', (n) => $("#noise-span").text(n));
