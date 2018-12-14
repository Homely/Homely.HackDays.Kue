
function msleep(n) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}
function sleep(n) {
  msleep(n*1000);
}

process.on('message', ({ letter }) => {
  sleep(5); // fake CPU intensity
  let fruit = null;
  switch (letter) {
    case 'a':
      fruit = 'apple';
      break;
    default:
      fruit = 'unknown';
  }
  process.send({ fruit });
});
