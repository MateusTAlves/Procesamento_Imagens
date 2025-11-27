class FiltrosPassaAlta extends FiltrosPassaBaixa {

  _aplicarConvolucao(kernelX, kernelY = null) {
    if (!this._validarImagem1()) return;

    const { width: largura, height: altura } = this.imagem1;
    const dados = this._clonarDados(this.imagem1);
    const resultado = new Uint8ClampedArray(dados.length);

    const tamanho = Math.sqrt(kernelX.length);
    const raio = Math.floor(tamanho / 2);

    for (let y = 0; y < altura; y++) {
      for (let x = 0; x < largura; x++) {
        let gx = 0, gy = 0;

        for (let ky = 0; ky < tamanho; ky++) {
          for (let kx = 0; kx < tamanho; kx++) {
            const nx = Math.min(Math.max(x + kx - raio, 0), largura - 1);
            const ny = Math.min(Math.max(y + ky - raio, 0), altura - 1);
            const idx = (ny * largura + nx) * 4;

            const cinza = this._luminanciaFloat(dados[idx], dados[idx + 1], dados[idx + 2]);
            const indiceKernel = ky * tamanho + kx;

            gx += cinza * kernelX[indiceKernel];
            if (kernelY) {
              gy += cinza * kernelY[indiceKernel];
            }
          }
        }

        const magnitude = kernelY ? Math.sqrt(gx * gx + gy * gy) : Math.abs(gx);
        const valor = Math.min(255, Math.max(0, Math.round(magnitude)));

        const idxAtual = (y * largura + x) * 4;
        resultado[idxAtual] = resultado[idxAtual + 1] = resultado[idxAtual + 2] = valor;
        resultado[idxAtual + 3] = 255;
      }
    }

    this.mostrarResultado(this._criarImagemData(resultado, largura, altura));
  }

  // Detector de Bordas Prewitt (Primeira Ordem)
  prewitt() {
    const kernelX = [
      -1, 0, 1,
      -1, 0, 1,
      -1, 0, 1
    ];
    const kernelY = [
      -1, -1, -1,
      0, 0, 0,
      1, 1, 1
    ];
    this._aplicarConvolucao(kernelX, kernelY);
  }

  // Detector de Bordas Sobel (Primeira Ordem)
  sobel() {
    const kernelX = [
      -1, 0, 1,
      -2, 0, 2,
      -1, 0, 1
    ];
    const kernelY = [
      -1, -2, -1,
      0, 0, 0,
      1, 2, 1
    ];
    this._aplicarConvolucao(kernelX, kernelY);
  }

  // Detector de Bordas Laplaciano (Segunda Ordem)
  laplaciano() {
    const kernel = [
      0, -1, 0,
      -1, 4, -1,
      0, -1, 0
    ];
    this._aplicarConvolucao(kernel);
  }
}

window.FiltrosPassaAlta = FiltrosPassaAlta;