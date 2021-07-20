import SerialPort from "serialport";
import $ from "jquery";
import *  as echarts from "echarts";

const chart = echarts.init($("#chart-div")[0] as HTMLDivElement);
let data: [number, number][] = [];
setInterval(() => {
    chart.setOption({
        title: { text: "EEG-GAME" },
        tooltip: {},
        xAxis: [{ type: "value", min: 'dataMin', max: 'dataMax' }],
        yAxis: [{ type: "value" }],
        series: [{
            name: 'test',
            type: 'line',
            data: data
        }]
    });
}, 1000);

let gid = 0;
new SerialPort("COM3", {
    baudRate: 57600
}).on('data', (incoming: number[]) => {
    for (const b of incoming) {
        data.push([gid++, b]);
        if (data.length >= 100) data.shift();
    }
});
