/* eslint-disable no-console */
const express = require('express');
const url = require('url');
const kue = require('kue');
const Arena = require('bull-arena');
const { fork } = require('child_process');

const { queues, NOTIFY_URL } = require('./queues');

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
const queue = kue.createQueue();

// const getRedisConfig = (redisUrl) => {
//   console.log('redisUrl', redisUrl);
//   const redisConfig = url.parse(redisUrl);
//   return {
//     host: redisConfig.hostname || 'localhost',
//     port: Number(redisConfig.port || 6379),
//     database: (redisConfig.pathname || '/0').substr(1) || '0',
//     password: redisConfig.auth ? redisConfig.auth.split(':')[1] : undefined,
//   };
// };

app.use(express.static(`${__dirname}/`, { maxAge: 14400 }));
app.get('/', (req, res) => {
  let containers = '';
  [1,2,3,4,5].map((cnt) => {
    const bgColor = pastel();
    const checked = cnt === 1 ? 'checked' : '';
    const timer = `<div id="timer${cnt}"><div style="font-family: Courier New; margin: 10px 0 0">req:<br />avg:</div></div>`;
    const iframe = `<iframe id="container${cnt}" src="/basic" style="background:white;display:block;border:none;border-radius:10px;width: 100%;"></iframe>`;
    containers += `<div onclick="toggle(${cnt})" style="background: ${bgColor};cursor:pointer;color:#666; box-shadow: 5px 5px 14px 2px #888;padding: 20px;margin:10px 0 20px 20px;width: auto;float: left;border-radius: 5px;"><input type="checkbox" id="chk${cnt}" ${checked} style="display:none" /><h2 id="pageTitle${cnt}" style="display:inline-block">...</h2>${iframe}${timer}</div>`
  });
  res.send(`<html><head><title>Perf Tests</title><script src="./runner.js"></script></head><body style="font-family: Courier New;background: url('./background.svg')">${containers}</body></html>`);
});
app.get('/basic', (req, res) => {
  res.send(iframeContent('❤️'));
});
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
app.get('/intense-kue', (req, res) => {
  const job = queue.create('mytype', {
    title: 'mytitle',
    letter: 'a',
  }).removeOnComplete(true)
    .save((err) => {
      if (err) {
        res.send('🙅‍');
        return;
      }
      job.on('complete', (result) => {
        res.send('🏇');
      });
      job.on('failed', () => {
        res.send('🙅‍');
      });
    });
  });
// app.get('/intense-bull', Arena(
//   {
//     queues: [
//       {
//         name: NOTIFY_URL,
//         hostId: 'Worker',
//         redis: getRedisConfig(process.env.REDIS_URL),
//       },
//     ],
//   },
//   {
//     basePath: '/arena',
//     disableListen: true,
//   },
// ));
app.get('/intense-bull', (req, res) => {
  res.send(iframeContent('🐂'));
});

app.listen(3000, () => console.log('Serving from http://localhost:3000!'));