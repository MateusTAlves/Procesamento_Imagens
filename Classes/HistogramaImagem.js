class HistogramaImagem extends TransformacoesImagem {

  calcularHistograma(dados) {
    const histograma = new Array(256).fill(0);

    for (let i = 0; i < dados.length; i += 4) {
      // Converter para escala de cinza
      const cinza = this._luminanciaRGB(dados[i], dados[i + 1], dados[i + 2]);
      histograma[cinza]++;
    }

    return histograma;
  }

  desenharHistograma(histograma, canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    const bins = histograma.length || 256;
    const maxFreq = Math.max(...histograma);
    if (!maxFreq) return;

    const pad = { left: 48, right: 12, top: 12, bottom: 36 };
    const plotW = W - pad.left - pad.right;
    const plotH = H - pad.top - pad.bottom;

    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = 1;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = pad.top + (plotH / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(W - pad.right, y);
      ctx.stroke();
    }

    ctx.fillStyle = "#111";
    ctx.font = "11px Arial";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    for (let i = 0; i <= gridLines; i++) {
      const value = Math.round(maxFreq - (maxFreq / gridLines) * i);
      const y = pad.top + (plotH / gridLines) * i;
      ctx.fillText(value.toLocaleString(), pad.left - 8, y);
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const xMarks = 4;
    for (let i = 0; i <= xMarks; i++) {
      const frac = i / xMarks;
      const grayLevel = Math.round(frac * 255);
      const x = pad.left + frac * plotW;
      ctx.fillText(grayLevel, x, H - pad.bottom + 8);
    }

    const barW = plotW / bins;
    const spacing = Math.max(0, barW * 0.06);
    ctx.fillStyle = "#1d4ed8";

    for (let i = 0; i < bins; i++) {
      const freq = histograma[i];
      const h = (freq / maxFreq) * plotH;
      const x = pad.left + i * barW + spacing / 2;
      const y = pad.top + (plotH - h);
      ctx.fillRect(x, y, Math.max(1, barW - spacing), Math.max(1, h));
    }

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1.5;
    // eixo X
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top + plotH);
    ctx.lineTo(W - pad.right, pad.top + plotH);
    ctx.stroke();
    // eixo Y
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, pad.top + plotH);
    ctx.stroke();
  }

  equalizarHistograma() {
    if (!this._validarImagem1()) return;

    const dados = this._clonarDados(this.imagem1);
    const { width: largura, height: altura } = this.imagem1;
    const totalPixels = largura * altura;

    const grayBuffer = this._converterParaEscalaCinza(dados);

    const histogramaOriginal = this.calcularHistograma(grayBuffer);
    this.desenharHistograma(histogramaOriginal, "histogramaOriginal");

    const cdf = new Array(256);
    cdf[0] = histogramaOriginal[0];
    for (let i = 1; i < 256; i++) {
      cdf[i] = cdf[i - 1] + histogramaOriginal[i];
    }

    const cdfMin = cdf.find(val => val > 0);

    const tabelaEqualizacao = new Array(256);
    for (let i = 0; i < 256; i++) {
      tabelaEqualizacao[i] = Math.round(((cdf[i] - cdfMin) / (totalPixels - cdfMin)) * 255);
    }

    const resultado = new Uint8ClampedArray(dados.length);
    const histogramaEqualizado = new Array(256).fill(0);
    for (let i = 0; i < grayBuffer.length; i += 4) {
      const gray = grayBuffer[i];
      const novoCinza = tabelaEqualizacao[gray];

      resultado[i] = resultado[i + 1] = resultado[i + 2] = novoCinza;
      resultado[i + 3] = grayBuffer[i + 3];

      histogramaEqualizado[novoCinza]++;
    }

    this.desenharHistograma(histogramaEqualizado, "histogramaEqualizado");
    this.mostrarResultado(this._criarImagemData(resultado, largura, altura));
  }
}

window.HistogramaImagem = HistogramaImagem;