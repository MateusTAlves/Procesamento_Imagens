class OperacoesMorfologicas extends FiltrosPassaAlta {

  // Elemento Estruturante 3x3
  _SE = [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1]
  ];

  // DILATAÇÃO: C = A ⊕ B
  dilatacao() {
    if (!this._validarImagem1()) return;

    const { width, height } = this.imagem1;
    const src = this._converterParaBinario(this._clonarDados(this.imagem1));
    const out = new Uint8ClampedArray(src.length);
    // inicializa fundo preto e alpha opaco
    for (let k = 0; k < out.length; k += 4) {
      out[k] = out[k + 1] = out[k + 2] = 0;
      out[k + 3] = 255;
    }

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = (y * width + x) * 4;

        // Se o pixel central é branco → aplica SE
        if (src[i] === 255) {
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (this._SE[dy + 1][dx + 1] === 1) {
                const ii = ((y + dy) * width + (x + dx)) * 4;
                out[ii] = out[ii + 1] = out[ii + 2] = 255;
                out[ii + 3] = 255;
              }
            }
          }
        }
      }
    }

    this.mostrarResultado(this._criarImagemData(out, width, height));
  }

  // EROSÃO: C = A ⊖ B
  erosao() {
    if (!this._validarImagem1()) return;

    const { width, height } = this.imagem1;
    const src = this._converterParaBinario(this._clonarDados(this.imagem1));
    const out = new Uint8ClampedArray(src.length);
    // inicializa fundo preto e alpha opaco
    for (let k = 0; k < out.length; k += 4) {
      out[k] = out[k + 1] = out[k + 2] = 0;
      out[k + 3] = 255;
    }

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let todoBranco = true;

        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (this._SE[dy + 1][dx + 1] === 1) {
              const ii = ((y + dy) * width + (x + dx)) * 4;
              if (src[ii] !== 255) {
                todoBranco = false;
                break;
              }
            }
          }
          if (!todoBranco) break;
        }

        const o = (y * width + x) * 4;
        if (todoBranco) {
          out[o] = out[o + 1] = out[o + 2] = 255;
        } else {
          out[o] = out[o + 1] = out[o + 2] = 0;
        }
        out[o + 3] = 255;
      }
    }

    this.mostrarResultado(this._criarImagemData(out, width, height));
  }

  _processarErosao(imagemData) {
    const { width, height } = imagemData;
    const src = this._converterParaBinario(new Uint8ClampedArray(imagemData.data));
    const out = new Uint8ClampedArray(src.length);
    // inicializa fundo preto e alpha opaco
    for (let k = 0; k < out.length; k += 4) {
      out[k] = out[k + 1] = out[k + 2] = 0;
      out[k + 3] = 255;
    }

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let todoBranco = true;

        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (this._SE[dy + 1][dx + 1] === 1) {
              const ii = ((y + dy) * width + (x + dx)) * 4;
              if (src[ii] !== 255) {
                todoBranco = false;
                break;
              }
            }
          }
          if (!todoBranco) break;
        }

        const o = (y * width + x) * 4;
        if (todoBranco) {
          out[o] = out[o + 1] = out[o + 2] = 255;
        } else {
          out[o] = out[o + 1] = out[o + 2] = 0;
        }
        out[o + 3] = 255;
      }
    }

    return out;
  }

  _processarDilatacao(imagemData) {
    const { width, height } = imagemData;
    const src = this._converterParaBinario(new Uint8ClampedArray(imagemData.data));
    const out = new Uint8ClampedArray(src.length);
    // inicializa fundo preto e alpha opaco
    for (let k = 0; k < out.length; k += 4) {
      out[k] = out[k + 1] = out[k + 2] = 0;
      out[k + 3] = 255;
    }

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = (y * width + x) * 4;

        if (src[i] === 255) {
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (this._SE[dy + 1][dx + 1] === 1) {
                const ii = ((y + dy) * width + (x + dx)) * 4;
                out[ii] = out[ii + 1] = out[ii + 2] = 255;
                out[ii + 3] = 255;
              }
            }
          }
        }
      }
    }

    return out;
  }

  // ABERTURA: A ○ B = (A ⊖ B) ⊕ B
  abertura() {
    if (!this._validarImagem1()) return;

    const { width, height } = this.imagem1;

    const erodida = this._processarErosao(this.imagem1);

    const imagemTemp = this._criarImagemData(erodida, width, height);
    const resultado = this._processarDilatacao(imagemTemp);

    this.mostrarResultado(this._criarImagemData(resultado, width, height));
  }

  // FECHAMENTO: A ● B = (A ⊕ B) ⊖ B
  fechamento() {
    if (!this._validarImagem1()) return;

    const { width, height } = this.imagem1;

    const dilatada = this._processarDilatacao(this.imagem1);

    const imagemTemp = this._criarImagemData(dilatada, width, height);
    const resultado = this._processarErosao(imagemTemp);

    this.mostrarResultado(this._criarImagemData(resultado, width, height));
  }

  // CONTORNO: Ap = A – (A ⊖ B)
  contorno() {
    if (!this._validarImagem1()) return;

    const { width, height } = this.imagem1;

    const original = this._converterParaBinario(this._clonarDados(this.imagem1));

    const erodida = this._processarErosao(this.imagem1);

    const resultado = new Uint8ClampedArray(original.length);
    for (let i = 0; i < original.length; i += 4) {
      const diff = original[i] - erodida[i];
      resultado[i] = resultado[i + 1] = resultado[i + 2] = diff;
      resultado[i + 3] = 255;
    }

    this.mostrarResultado(this._criarImagemData(resultado, width, height));
  }
}

window.OperacoesMorfologicas = OperacoesMorfologicas;