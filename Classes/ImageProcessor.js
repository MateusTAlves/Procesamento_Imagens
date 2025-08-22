class ProcessadorImagem {
  constructor(tela1, tela2, telaResultado) {
    this.tela1 = tela1;
    this.tela2 = tela2;
    this.telaResultado = telaResultado;

    this.ctx1 = tela1.getContext("2d");
    this.ctx2 = tela2.getContext("2d");
    this.ctxResultado = telaResultado.getContext("2d");

    this.imagem1 = null;
    this.imagem2 = null;
    this._img1 = null;
    this._img2 = null;
  }

  _ajustarTamanho(largura, altura, maxL = 250, maxA = 200) {
    let l = largura, a = altura;
    if (l > maxL) { a *= maxL / l; l = maxL; }
    if (a > maxA) { l *= maxA / a; a = maxA; }
    return { width: Math.round(l), height: Math.round(a) };
  }

  carregarImagem(arquivo, qual = 1) {
    const leitor = new FileReader();
    const img = new Image();
    leitor.onload = e => {
      img.src = e.target.result;
      img.onload = () => {
        if (qual === 1) {
          const { width, height } = this._ajustarTamanho(img.naturalWidth, img.naturalHeight);
          this.tela1.width = width;
          this.tela1.height = height;
          this.telaResultado.width = width;
          this.telaResultado.height = height;

          this.ctx1.clearRect(0, 0, width, height);
          this.ctx1.drawImage(img, 0, 0, width, height);
          this.imagem1 = this.ctx1.getImageData(0, 0, width, height);
          this._img1 = img;

          if (this._img2) {
            this.tela2.width = width;
            this.tela2.height = height;
            this.ctx2.clearRect(0, 0, width, height);
            this.ctx2.drawImage(this._img2, 0, 0, width, height);
            this.imagem2 = this.ctx2.getImageData(0, 0, width, height);
          }

          this.mostrarResultado(this.imagem1);
        } else {
          if (this.imagem1) {
            const { width, height } = this.imagem1;
            this.tela2.width = width;
            this.tela2.height = height;
            this.ctx2.clearRect(0, 0, width, height);
            this.ctx2.drawImage(img, 0, 0, width, height);
            this.imagem2 = this.ctx2.getImageData(0, 0, width, height);
          } else {
            const { width, height } = this._ajustarTamanho(img.naturalWidth, img.naturalHeight);
            this.tela2.width = width;
            this.tela2.height = height;
            this.ctx2.clearRect(0, 0, width, height);
            this.ctx2.drawImage(img, 0, 0, width, height);
            this.imagem2 = this.ctx2.getImageData(0, 0, width, height);
          }
          this._img2 = img;
        }
      };
    };
    leitor.readAsDataURL(arquivo);
  }

  mostrarResultado(dadosImagem) {
    this.ctxResultado.putImageData(dadosImagem, 0, 0);
  }

  somar(valor = 0) {
    if (!this.imagem1) return;
    const dados = new Uint8ClampedArray(this.imagem1.data);

    if (this.imagem2 && this.imagem2.width === this.imagem1.width && this.imagem2.height === this.imagem1.height) {
      const dados2 = this.imagem2.data;
      for (let i = 0; i < dados.length; i += 4) {
        dados[i] = Math.min(255, dados[i] + dados2[i]);
        dados[i + 1] = Math.min(255, dados[i + 1] + dados2[i + 1]);
        dados[i + 2] = Math.min(255, dados[i + 2] + dados2[i + 2]);
      }
    } else {
      const v = Number.isFinite(valor) ? valor : 0;
      for (let i = 0; i < dados.length; i += 4) {
        dados[i] = Math.min(255, dados[i] + v);
        dados[i + 1] = Math.min(255, dados[i + 1] + v);
        dados[i + 2] = Math.min(255, dados[i + 2] + v);
      }
    }

    this.mostrarResultado(new ImageData(dados, this.imagem1.width, this.imagem1.height));
  }

  subtrair(valor = 0) {
    if (!this.imagem1) return;
    const dados = new Uint8ClampedArray(this.imagem1.data);

    if (this.imagem2 && this.imagem2.width === this.imagem1.width && this.imagem2.height === this.imagem1.height) {
      const dados2 = this.imagem2.data;
      for (let i = 0; i < dados.length; i += 4) {
        dados[i] = Math.max(0, dados[i] - dados2[i]);
        dados[i + 1] = Math.max(0, dados[i + 1] - dados2[i + 1]);
        dados[i + 2] = Math.max(0, dados[i + 2] - dados2[i + 2]);
      }
    } else {
      const v = Number.isFinite(valor) ? valor : 0;
      for (let i = 0; i < dados.length; i += 4) {
        dados[i] = Math.max(0, dados[i] - v);
        dados[i + 1] = Math.max(0, dados[i + 1] - v);
        dados[i + 2] = Math.max(0, dados[i + 2] - v);
      }
    }

    this.mostrarResultado(new ImageData(dados, this.imagem1.width, this.imagem1.height));
  }

  multiplicar(valor = 1) {
    if (!this.imagem1) return;
    const v = Number.isFinite(valor) ? Math.max(0, valor) : 1;
    const dados = new Uint8ClampedArray(this.imagem1.data);

    for (let i = 0; i < dados.length; i += 4) {
      dados[i] = Math.min(255, dados[i] * v);
      dados[i + 1] = Math.min(255, dados[i + 1] * v);
      dados[i + 2] = Math.min(255, dados[i + 2] * v);
    }

    this.mostrarResultado(new ImageData(dados, this.imagem1.width, this.imagem1.height));
  }

  dividir(valor = 1) {
    if (!this.imagem1) return;
    const v = Number.isFinite(valor) ? valor : 1;
    const divisor = v <= 0 ? 1 : v;
    const dados = new Uint8ClampedArray(this.imagem1.data);

    for (let i = 0; i < dados.length; i += 4) {
      dados[i] = Math.min(255, dados[i] / divisor);
      dados[i + 1] = Math.min(255, dados[i + 1] / divisor);
      dados[i + 2] = Math.min(255, dados[i + 2] / divisor);
    }

    this.mostrarResultado(new ImageData(dados, this.imagem1.width, this.imagem1.height));
  }

  escalaCinza() {
    if (!this.imagem1) return;

    const dados = new Uint8ClampedArray(this.imagem1.data);

    for (let i = 0; i < dados.length; i += 4) {
      const r = dados[i];
      const g = dados[i + 1];
      const b = dados[i + 2];

      const cinza = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

      dados[i] = cinza;
      dados[i + 1] = cinza;
      dados[i + 2] = cinza;
    }

    this.mostrarResultado(new ImageData(dados, this.imagem1.width, this.imagem1.height));
  }

  async salvarResultado() {
    if (!this.telaResultado.width || !this.telaResultado.height) return;

    if ("showSaveFilePicker" in window) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: "resultado.png",
          types: [{ description: "Imagens PNG", accept: { "image/png": [".png"] } }],
        });
        const gravavel = await handle.createWritable();
        const blob = await new Promise(resolve => this.telaResultado.toBlob(resolve, "image/png"));
        await gravavel.write(blob);
        await gravavel.close();
      } catch (err) {
        console.error("Erro ao salvar:", err);
      }
    } else {
      const link = document.createElement("a");
      link.download = "resultado.png";
      link.href = this.telaResultado.toDataURL("image/png");
      link.click();
    }
  }
}

window.ProcessadorImagem = ProcessadorImagem;