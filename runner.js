
const urls = {
  1: { url: '/basic', title: 'Basic' },
  2: { url: '/intense', title: 'Blocking' },
  3: { url: '/intense-fork', title: 'Forked' },
};

const count = {
  1: { cnt: 0, tot: 0 },
  2: { cnt: 0, tot: 0 },
  3: { cnt: 0, tot: 0 },
};

const runner = (cnt) => {
  const stopwatch = new Date().getTime();
  
  const doit = document.getElementById(`chk${cnt}`);
  const container = document.getElementById(`container${cnt}`);
  const title = document.getElementById(`pageTitle${cnt}`);
  const timer = document.getElementById(`timer${cnt}`);

  title.innerHTML = urls[cnt].title;
  if (!doit.checked) {
    title.innerHTML += ' (paused)';
    setTimeout(() => runner(cnt), 1000);
    return;
  }
  container.src = urls[cnt].url;
  container.onload = () => {
    const timeTaken = new Date().getTime() - stopwatch;
    runner(cnt);

    count[cnt].cnt += 1;
    count[cnt].tot += timeTaken;
    const avg = parseInt(count[cnt].tot / count[cnt].cnt, 10);
    const rps = parseInt((1000 / avg) * 100, 10) / 100;
    timer.innerHTML = `<div style="font-family: Courier New; margin: 10px 0 0">req: <b>${rps}rps (${count[cnt].cnt})</b><br />avg: ${avg}ms (${timeTaken}ms)</div>`;
  }
}

window.onload = () => {
  runner(1);
  runner(2);
  runner(3);
}