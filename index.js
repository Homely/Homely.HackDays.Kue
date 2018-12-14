/* eslint-disable no-console */
const express = require('express');
const { fork } = require('child_process');

function msleep(n) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}
function sleep(n) {
  msleep(n*1000);
}

const pastel = () => {
  return `hsl(${360 * Math.random()},${(70 + 30 * Math.random())}%,${(85 + 10 * Math.random())}%)`;
}

const iframeContent = (child) => {
  const bgColor = pastel();
  return `<html><head></head><body style="background:${bgColor}"><div style="margin:40px auto;text-align:center;width:100%;font-size:40px">${child}</div></body></html>`;
}

const app = express();
app.use(express.static(`${__dirname}/`, { maxAge: 14400 }));
app.get('/', (req, res) => {
  let containers = '';
  [1,2,3].map((cnt) => {
    const bgColor = pastel();
    const checked = cnt === 1 ? 'checked' : '';
    const timer = `<div id="timer${cnt}"><div style="font-family: Courier New; margin: 10px 0 0">req:<br />avg:</div></div>`;
    containers += `<div onclick="toggle(${cnt})" style="background: ${bgColor};cursor:pointer;color:#666; box-shadow: 5px 5px 14px 2px #888;padding: 20px;margin:10px 0 20px 20px;width: auto;float: left;border-radius: 5px;"><input type="checkbox" id="chk${cnt}" ${checked} style="display:none" /><h2 id="pageTitle${cnt}" style="display:inline-block">...</h2><iframe id="container${cnt}" src="/basic" style="background:white;display:block;border:none;border-radius:10px"></iframe>${timer}</div>`
  });
  res.send(`<html><head><title>Perf Tests</title><script src="./runner.js"></script></head><body style="font-family: Courier New;background: url('./background.svg')">${containers}</body></html>`);
});
app.get('/basic', (req, res) => {
  res.send(iframeContent('❤️'));
})
app.get('/intense', (req, res) => {
  sleep(5);
  res.send(iframeContent('🐌'));
});
app.get('/intense-fork', (req, res) => {
  const worker = fork('./worker');
  worker.on('message', ({ fruit }) => {
    res.send(iframeContent('🐇'));
    worker.kill();
  });
  worker.send({ letter: 'a' });
});
app.listen(3000, () => console.log('Serving from http://localhost:3000!'));