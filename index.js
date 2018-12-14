/* eslint-disable no-console */
const express = require('express');
const { fork } = require('child_process');

const app = express();
app.get('/', (req, res) => {
  res.send('Hello World! Want something <a href="/intense">intense</a>?');
  console.log('standard')
});
app.get('/intense', (req, res) => {
  const worker = fork('./worker');
  worker.on('message', ({ fruit }) => {
    res.send(`Hello Intense ${fruit}!`);
    console.log('intense');
    worker.kill();
  });
  worker.send({ letter: 'a' });
});
app.listen(3000, () => console.log('Serving from http://localhost:3000!'));