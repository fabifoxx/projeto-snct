(() => {
  "use strict";

  // Elementos da interface
  const canvas = document.getElementById("frequencyChart");
  const ctx = canvas.getContext("2d");
  const minInput = document.getElementById("minFreq");
  const maxInput = document.getElementById("maxFreq");
  const rateInput = document.getElementById("hopRate");
  const channelInput = document.getElementById("channelCount");
  const minOut = document.getElementById("minOut");
  const maxOut = document.getElementById("maxOut");
  const rateOut = document.getElementById("rateOut");
  const channelOut = document.getElementById("channelOut");
  const currentFreq = document.getElementById("currentFreq");
  const hopCountEl = document.getElementById("hopCount");
  const syncStatus = document.getElementById("syncStatus");
  const startBtn = document.getElementById("startBtn");
  const modeBtn = document.getElementById("modeBtn");
  const resetBtn = document.getElementById("resetBtn");
  const txStatus = document.getElementById("txStatus");
  const rxStatus = document.getElementById("rxStatus");
  const explanation = document.getElementById("explanation");

  // Estado da simulação
  let running = false;
  let hopping = false;
  let elapsed = 0;
  let lastFrame = 0;
  let hopAccumulator = 0;
  let hopCount = 0;
  let currentChannel = 0;
  let history = [];
  let lastWidth = 0;
  let lastHeight = 0;

  const MAX_POINTS = 120;
  const FIXED_FREQ = 100;

  function settings() {
    let min = Number(minInput.value);
    let max = Number(maxInput.value);
    if (min >= max) {
      if (document.activeElement === minInput) {
        max = Math.min(250, min + 5);
        maxInput.value = max;
      } else {
        min = Math.max(50, max - 5);
        minInput.value = min;
      }
    }
    return {
      min,
      max,
      rate: Number(rateInput.value),
      channels: Number(channelInput.value)
    };
  }

  function channelFrequencies() {
    const s = settings();
    return Array.from({ length: s.channels }, (_, i) =>
      s.channels === 1 ? s.min : s.min + (s.max - s.min) * i / (s.channels - 1)
    );
  }

  function activeFrequency() {
    if (!hopping) return FIXED_FREQ;
    const channels = channelFrequencies();
    return channels[Math.min(currentChannel, channels.length - 1)];
  }

  function updateLabels() {
    const s = settings();
    minOut.textContent = `${s.min} MHz`;
    maxOut.textContent = `${s.max} MHz`;
    rateOut.textContent = `${s.rate} hops/s`;
    channelOut.textContent = `${s.channels} canais`;
    updateReadouts();
    drawChart();
  }

  function updateReadouts() {
    const freq = activeFrequency();
    currentFreq.textContent = `${freq.toFixed(1)} MHz`;
    currentFreq.className = `value ${hopping ? "green" : "red"}`;
    hopCountEl.textContent = hopCount;
    syncStatus.textContent = hopping ? "Sincronizados" : "Modo fixo";
    syncStatus.className = `value ${hopping ? "green" : ""}`;
    const status = running
      ? (hopping ? '<span class="sync-dot"></span>Saltando em sincronia' : '<span class="sync-dot" style="background:var(--red)"></span>Transmitindo em frequência fixa')
      : '<span class="sync-dot" style="background:#a6a3b0"></span>Pausado';
    txStatus.innerHTML = status;
    rxStatus.innerHTML = status;
    explanation.innerHTML = hopping
      ? "<strong>Frequency Hopping:</strong> os dois rádios seguem a mesma sequência pseudoaleatória e mudam de canal juntos. Isso pode tornar a interferência em uma única frequência menos eficaz, mas não garante uma comunicação totalmente segura."
      : "<strong>Frequência fixa:</strong> o sinal permanece em 100 MHz. Se houver uma interferência concentrada nessa frequência, a comunicação pode ser prejudicada. Ative o FHSS para visualizar os dois rádios saltando juntos entre canais.";
    modeBtn.textContent = hopping ? "Modo atual: Frequency Hopping" : "Modo atual: Frequência fixa";
    modeBtn.classList.toggle("fixed", !hopping);
    modeBtn.classList.toggle("mode-button", true);
    startBtn.textContent = running ? "Ⅱ Pausar simulação" : "▶ Iniciar simulação";
  }

  // Pseudoaleatoriedade reproduzível para fins didáticos.
  function nextChannel() {
    const channels = channelFrequencies();
    if (channels.length < 2) return 0;
    let next = currentChannel;
    // Evita repetir o mesmo canal consecutivamente, se houver alternativas.
    while (next === currentChannel) next = Math.floor(Math.random() * channels.length);
    return next;
  }

  function addPoint() {
    history.push({ t: elapsed, f: activeFrequency(), hopping });
    if (history.length > MAX_POINTS) history.shift();
  }

  function setMode(value) {
    hopping = value;
    hopAccumulator = 0;
    if (hopping) {
      const channels = channelFrequencies();
      currentChannel = Math.floor(Math.random() * channels.length);
    }
    history = [];
    addPoint();
    updateReadouts();
    drawChart();
  }

  function resetSimulation() {
    running = false;
    elapsed = 0;
    lastFrame = 0;
    hopAccumulator = 0;
    hopCount = 0;
    currentChannel = 0;
    history = [];
    addPoint();
    updateReadouts();
    drawChart();
  }

  // Desenha gráfico próprio em Canvas, sem dependências externas.
  function drawChart() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = window.devicePixelRatio || 1;
    const width = Math.round(rect.width * dpr);
    const height = Math.round(rect.height * dpr);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const w = rect.width;
    const h = rect.height;
    lastWidth = w;
    lastHeight = h;
    ctx.clearRect(0, 0, w, h);

    const pad = { left: 58, right: 17, top: 20, bottom: 42 };
    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;
    const s = settings();
    // Inclui 100 MHz no gráfico mesmo se a faixa configurada for diferente.
    const yMin = Math.min(s.min, FIXED_FREQ) - 10;
    const yMax = Math.max(s.max, FIXED_FREQ) + 10;
    const xMax = Math.max(10, elapsed);
    const xMin = Math.max(0, xMax - 20);
    const x = t => pad.left + ((t - xMin) / (xMax - xMin || 1)) * plotW;
    const y = f => pad.top + ((yMax - f) / (yMax - yMin || 1)) * plotH;

    // Fundo do gráfico
    ctx.fillStyle = "#22222c";
    ctx.fillRect(0, 0, w, h);

    // Linhas horizontais e rótulos do eixo Y
    ctx.font = "12px Arial";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    const ticks = 5;
    for (let i = 0; i <= ticks; i++) {
      const freq = yMin + (yMax - yMin) * i / ticks;
      const yy = y(freq);
      ctx.strokeStyle = "rgba(220,220,235,.12)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pad.left, yy); ctx.lineTo(w - pad.right, yy); ctx.stroke();
      ctx.fillStyle = "#c3bdc7";
      ctx.fillText(`${freq.toFixed(0)}`, pad.left - 9, yy);
    }

    // Canais configurados
    const channels = channelFrequencies();
    channels.forEach(freq => {
      const yy = y(freq);
      ctx.strokeStyle = "rgba(166,163,176,.18)";
      ctx.setLineDash([3, 5]);
      ctx.beginPath(); ctx.moveTo(pad.left, yy); ctx.lineTo(w - pad.right, yy); ctx.stroke();
    });
    ctx.setLineDash([]);

    // Marcas do eixo X
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let i = 0; i <= 5; i++) {
      const t = xMin + (xMax - xMin) * i / 5;
      const xx = x(t);
      ctx.strokeStyle = "rgba(220,220,235,.12)";
      ctx.beginPath(); ctx.moveTo(xx, pad.top); ctx.lineTo(xx, h - pad.bottom); ctx.stroke();
      ctx.fillStyle = "#c3bdc7";
      ctx.fillText(`${t.toFixed(1)} s`, xx, h - pad.bottom + 9);
    }

    // Títulos dos eixos
    ctx.fillStyle = "#f5f0ed";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Tempo", pad.left + plotW / 2, h - 15);
    ctx.save();
    ctx.translate(16, pad.top + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Frequência (MHz)", 0, 0);
    ctx.restore();

    // Linha vermelha de frequência fixa como referência/vulnerabilidade.
    ctx.strokeStyle = "#ff5d67";
    ctx.lineWidth = 2;
    ctx.setLineDash([7, 5]);
    ctx.beginPath();
    ctx.moveTo(pad.left, y(FIXED_FREQ));
    ctx.lineTo(w - pad.right, y(FIXED_FREQ));
    ctx.stroke();
    ctx.setLineDash([]);

    // Trajetória da comunicação. Segmentos são conectados em cada salto.
    if (history.length) {
      ctx.strokeStyle = hopping ? "#51d6a0" : "#ff5d67";
      ctx.lineWidth = 3;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.beginPath();
      let started = false;
      history.forEach(point => {
        if (point.t < xMin) return;
        const px = x(point.t);
        const py = y(point.f);
        if (!started) { ctx.moveTo(px, py); started = true; }
        else ctx.lineTo(px, py);
      });
      if (started) ctx.stroke();

      // Ponto atual destacado
      const last = history[history.length - 1];
      if (last.t >= xMin) {
        ctx.fillStyle = hopping ? "#51d6a0" : "#ff5d67";
        ctx.beginPath();
        ctx.arc(x(last.t), y(last.f), 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    // Rótulo de frequência fixa
    ctx.fillStyle = "#ff7b83";
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.font = "11px Arial";
    ctx.fillText("Referência fixa: 100 MHz", pad.left + 6, y(FIXED_FREQ) - 5);
  }

  function animate(timestamp) {
    if (!running) return;
    if (!lastFrame) lastFrame = timestamp;
    const delta = Math.min((timestamp - lastFrame) / 1000, 0.1);
    lastFrame = timestamp;
    elapsed += delta;

    if (hopping) {
      const s = settings();
      hopAccumulator += delta;
      const interval = 1 / s.rate;
      while (hopAccumulator >= interval) {
        hopAccumulator -= interval;
        currentChannel = nextChannel();
        hopCount++;
        addPoint();
      }
    } else {
      // Mantém a linha fixa atualizada para parecer um sinal contínuo.
      if (!history.length || elapsed - history[history.length - 1].t >= 0.12) addPoint();
    }

    updateReadouts();
    drawChart();
    requestAnimationFrame(animate);
  }

  startBtn.addEventListener("click", () => {
    running = !running;
    lastFrame = 0;
    updateReadouts();
    if (running) requestAnimationFrame(animate);
  });

  modeBtn.addEventListener("click", () => setMode(!hopping));
  resetBtn.addEventListener("click", resetSimulation);

  [minInput, maxInput, rateInput, channelInput].forEach(input => {
    input.addEventListener("input", () => {
      // Se a faixa de canais mudou, mantém o índice dentro do limite.
      const channels = channelFrequencies();
      currentChannel = Math.min(currentChannel, channels.length - 1);
      updateLabels();
    });
  });

  window.addEventListener("resize", drawChart);

  // Inicialização: gráfico parado em 100 MHz, pronto para começar.
  history = [{ t: 0, f: FIXED_FREQ, hopping: false }];
  updateLabels();
  updateReadouts();
  drawChart();
})();
