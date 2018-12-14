/* eslint-disable no-console */
const express = require('express');
const { fork } = require('child_process');

function msleep(n) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}
function sleep(n) {
  msleep(n*1000);
}

const iframeContent = (child) => {
  return `<html><head></head><body><div style="margin:40px auto;text-align:center;width:100%;font-size:40px">${child}</div></body></html>`;
}

const app = express();
app.use(express.static(`${__dirname}/`, { maxAge: 14400 }));
app.get('/', (req, res) => {
  let containers = '';
  [1,2,3].map((cnt) => {
    containers += `<div style="background: #ccc; border: 1px solid #aaa;padding: 20px;margin:0 0 10px 10px;width: auto;float: left"><input type="checkbox" id="chk${cnt}" checked /><h2 id="pageTitle${cnt}" style="display:inline-block">...</h2><iframe id="container${cnt}" src="/basic" style="background:white;display:block;border:1px solid #aaa"></iframe><div id="timer${cnt}">&nbsp;</div></div>`
  });
  res.send(`<html><head><title>Perf Tests</title><script src="./runner.js"></script></head><body style="font-family: helvetica">${containers}</body></html>`);
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