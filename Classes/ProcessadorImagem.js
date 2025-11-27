class ProcessadorImagem {
  constructor(canvas1, canvas2, canvasSaida) {
    this.canvas1 = canvas1;
    this.canvas2 = canvas2;
    this.canvasSaida = canvasSaida;

    this.ctx1 = canvas1.getContext("2d", { willReadFrequently: true });
    this.ctx2 = canvas2.getContext("2d", { willReadFrequently: true });
    this.ctxSaida = canvasSaida.getContext("2d", { willReadFrequently: true });

    this.imagem1 = null;
    this.imagem2 = null;
    this._img1 = null;
    this._img2 = null;
  }

  _ajustarTamanho(largura, altura, maxLargura = 400, maxAltura = 300) {
    let l = largura, a = altura;
    if (l > maxLargura) { a *= maxLargura / l; l = maxLargura; }
    if (a > maxAltura) { l *= maxAltura / a; a = maxAltura; }
    return { largura: Math.round(l), altura: Math.round(a) };
  }

  carregarImagem(arquivo, qual = 1) {
    const isTiff = /\.(tif|tiff)$/i.test(arquivo.name) || arquivo.type.includes("tiff");
    const leitor = new FileReader();

    if (isTiff) {
      if (window.Tiff) {
        leitor.onload = e => {
          try {
            const tiff = new Tiff({ buffer: e.target.result });
            const canvasFromTiff = tiff.toCanvas();
            const img = new Image();
            img.onload = () => this._processarImagemCarregada(img, qual);
            img.src = canvasFromTiff.toDataURL();
          } catch (err) {
            console.error("Erro ao processar TIFF:", err);
            alert("Erro ao processar TIFF. Verifique o arquivo ou inclua tiff.js.");
          }
        };
        leitor.readAsArrayBuffer(arquivo);
        return;
      } else {
        alert("Biblioteca TIFF não encontrada!\n\nPara abrir arquivos TIFF corretamente, adicione no index.html:\n<script src=\"https://cdn.jsdelivr.net/npm/tiff.js@latest/tiff.min.js\"></script>\n\nTentando carregar sem a biblioteca... pode não funcionar.");
      }
    }

    const img = new Image();
    leitor.onload = e => {
      img.src = e.target.result;
      img.onload = () => this._processarImagemCarregada(img, qual);
    };
    leitor.readAsDataURL(arquivo);
  }

  // helper privado para centralizar o resto do carregamento
  _processarImagemCarregada(img, qual = 1) {
    if (qual === 1) {
      const { largura, altura } = this._ajustarTamanho(img.naturalWidth, img.naturalHeight);
      this.canvas1.width = largura;
      this.canvas1.height = altura;
      this.canvasSaida.width = largura;
      this.canvasSaida.height = altura;

      this.ctx1.clearRect(0, 0, largura, altura);
      this.ctx1.drawImage(img, 0, 0, largura, altura);
      this.imagem1 = this.ctx1.getImageData(0, 0, largura, altura);
      this._img1 = img;

      if (this._img2) {
        this.canvas2.width = largura;
        this.canvas2.height = altura;
        this.ctx2.clearRect(0, 0, largura, altura);
        this.ctx2.drawImage(this._img2, 0, 0, largura, altura);
        this.imagem2 = this.ctx2.getImageData(0, 0, largura, altura);
      }

      this.mostrarResultado(this.imagem1);
    } else {
      if (this.imagem1) {
        const { width: largura, height: altura } = this.imagem1;
        this.canvas2.width = largura;
        this.canvas2.height = altura;
        this.ctx2.clearRect(0, 0, largura, altura);
        this.ctx2.drawImage(img, 0, 0, largura, altura);
        this.imagem2 = this.ctx2.getImageData(0, 0, largura, altura);
      } else {
        const { largura, altura } = this._ajustarTamanho(img.naturalWidth, img.naturalHeight);
        this.canvas2.width = largura;
        this.canvas2.height = altura;
        this.ctx2.clearRect(0, 0, largura, altura);
        this.ctx2.drawImage(img, 0, 0, largura, altura);
        this.imagem2 = this.ctx2.getImageData(0, 0, largura, altura);
      }
      this._img2 = img;
    }
  }

  mostrarResultado(imagemData) {
    this.ctxSaida.putImageData(imagemData, 0, 0);
  }

  // Mostrar kernel em formato de matriz
  _mostrarKernel(titulo, kernelX, kernelY = null) {
    const modal = document.getElementById('kernelModal');
    const titleEl = document.getElementById('kernelTitle');
    const displayEl = document.getElementById('kernelDisplay');
    
    titleEl.textContent = titulo;
    displayEl.innerHTML = '';
    
    const tamanho = Math.sqrt(kernelX.length);
    
    const divX = document.createElement('div');
    divX.className = 'kernel-matrix';
    if (kernelY) {
      const labelX = document.createElement('h4');
      labelX.textContent = 'Kernel X (Horizontal)';
      divX.appendChild(labelX);
    }
    
    const tableX = document.createElement('table');
    for (let i = 0; i < tamanho; i++) {
      const row = document.createElement('tr');
      for (let j = 0; j < tamanho; j++) {
        const cell = document.createElement('td');
        cell.textContent = kernelX[i * tamanho + j];
        row.appendChild(cell);
      }
      tableX.appendChild(row);
    }
    divX.appendChild(tableX);
    displayEl.appendChild(divX);
    
    if (kernelY) {
      const divY = document.createElement('div');
      divY.className = 'kernel-matrix';
      const labelY = document.createElement('h4');
      labelY.textContent = 'Kernel Y (Vertical)';
      divY.appendChild(labelY);
      
      const tableY = document.createElement('table');
      for (let i = 0; i < tamanho; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < tamanho; j++) {
          const cell = document.createElement('td');
          cell.textContent = kernelY[i * tamanho + j];
          row.appendChild(cell);
        }
        tableY.appendChild(row);
      }
      divY.appendChild(tableY);
      displayEl.appendChild(divY);
    }
    
    modal.style.display = 'block';
  }

  _validarImagem1() {
    if (!this.imagem1) {
      alert("Por favor, carregue a imagem 1 primeiro!");
      return false;
    }
    return true;
  }

  _validarDuasImagens() {
    if (!this.imagem1 || !this.imagem2) {
      alert("Por favor, carregue as duas imagens!");
      return false;
    }
    if (this.imagem1.width !== this.imagem2.width || this.imagem1.height !== this.imagem2.height) {
      alert("As imagens devem ter o mesmo tamanho!");
      return false;
    }
    return true;
  }

  _clonarDados(imagemData) {
    return new Uint8ClampedArray(imagemData.data);
  }

  _criarImagemData(dados, largura, altura) {
    return new ImageData(dados, largura, altura);
  }

  _luminanciaRGB(r, g, b) {
    return Math.round(this._luminanciaFloat(r, g, b));
  }

  // Luminância como float
  _luminanciaFloat(r, g, b) {
    return 0.299 * r + 0.587 * g + 0.114 * b;
  }

  // Limita um valor para o intervalo de um byte [0,255]
  _clampByte(v) {
    return Math.max(0, Math.min(255, v));
  }

  _converterParaEscalaCinza(dados) {
    const resultado = new Uint8ClampedArray(dados.length);
    for (let i = 0; i < dados.length; i += 4) {
      const g = this._luminanciaRGB(dados[i], dados[i + 1], dados[i + 2]);
      resultado[i] = resultado[i + 1] = resultado[i + 2] = g;
      resultado[i + 3] = dados[i + 3];
    }
    return resultado;
  }

  _converterParaBinario(dados, limiar = 128) {
    const resultado = new Uint8ClampedArray(dados.length);
    
    for (let i = 0; i < dados.length; i += 4) {
      const cinza = this._luminanciaRGB(dados[i], dados[i + 1], dados[i + 2]);
      const binario = cinza >= limiar ? 255 : 0;
      resultado[i] = resultado[i + 1] = resultado[i + 2] = binario;
      resultado[i + 3] = 255;
    }
    
    return resultado;
  }

  obterInformacoesImagem() {
    if (!this.imagemCarregada || !this.canvas || this.canvas.width === 0) {
      alert("Por favor, carregue uma imagem primeiro!");
      return null;
    }

    const imagemData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const dados = imagemData.data;
    const largura = imagemData.width;
    const altura = imagemData.height;
    const pixelsTotais = largura * altura;

    let min = 255;
    let max = 0;
    let somaLuminancia = 0;
    const tonsDistintos = new Set();

    for (let i = 0; i < dados.length; i += 4) {
      const r = dados[i];
      const g = dados[i + 1];
      const b = dados[i + 2];

      const luminancia = this._luminanciaRGB(r, g, b);
      somaLuminancia += luminancia;

      if (luminancia < min) min = luminancia;
      if (luminancia > max) max = luminancia;

      tonsDistintos.add(luminancia);
    }

    const brilhoMedio = (somaLuminancia / pixelsTotais).toFixed(1);
    const contraste = max - min;

    return {
      largura,
      altura,
      pixelsTotais,
      min,
      max,
      brilhoMedio,
      contraste,
      tonsDistintos: tonsDistintos.size
    };
  }


  async salvarResultado() {
    if (!this.canvasSaida.width || !this.canvasSaida.height) return;

    if ("showSaveFilePicker" in window) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: "resultado.png",
          types: [{ description: "Imagens PNG", accept: { "image/png": [".png"] } }],
        });
        const writable = await handle.createWritable();
        const blob = await new Promise((resolve) => this.canvasSaida.toBlob(resolve, "image/png"));
        await writable.write(blob);
        await writable.close();
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Erro ao salvar:", err);
        }
      }
    } else {
      const link = document.createElement("a");
      link.download = "resultado.png";
      link.href = this.canvasSaida.toDataURL("image/png");
      link.click();
    }
  }
}

window.ProcessadorImagem = ProcessadorImagem;