class FiltrosPassaBaixa extends HistogramaImagem {

  _aplicarFiltroVizinhanca(funcao, tamanho = 3) {
    if (!this._validarImagem1()) return null;

    const { width: largura, height: altura } = this.imagem1;
    const dados = this._clonarDados(this.imagem1);
    const resultado = new Uint8ClampedArray(dados.length);

    const raio = Math.floor(tamanho / 2);

    for (let y = 0; y < altura; y++) {
      for (let x = 0; x < largura; x++) {
        const vizinhancaR = [];
        const vizinhancaG = [];
        const vizinhancaB = [];

        for (let dy = -raio; dy <= raio; dy++) {
          for (let dx = -raio; dx <= raio; dx++) {
            const nx = Math.min(Math.max(x + dx, 0), largura - 1);
            const ny = Math.min(Math.max(y + dy, 0), altura - 1);
            const idx = (ny * largura + nx) * 4;

            vizinhancaR.push(dados[idx]);
            vizinhancaG.push(dados[idx + 1]);
            vizinhancaB.push(dados[idx + 2]);
          }
        }

        const idxAtual = (y * largura + x) * 4;
        resultado[idxAtual] = funcao(vizinhancaR);
        resultado[idxAtual + 1] = funcao(vizinhancaG);
        resultado[idxAtual + 2] = funcao(vizinhancaB);
        resultado[idxAtual + 3] = dados[idxAtual + 3];
      }
    }

    return resultado;
  }

  // Filtro MAX
  filtroMaximo(tamanho = 3) {
    const resultado = this._aplicarFiltroVizinhanca(viz => Math.max(...viz), tamanho);
    if (resultado) {
      this.mostrarResultado(this._criarImagemData(resultado, this.imagem1.width, this.imagem1.height));
    }
  }

  // Filtro MIN
  filtroMinimo(tamanho = 3) {
    const resultado = this._aplicarFiltroVizinhanca(viz => Math.min(...viz), tamanho);
    if (resultado) {
      this.mostrarResultado(this._criarImagemData(resultado, this.imagem1.width, this.imagem1.height));
    }
  }

  // Filtro MEAN (Média)
  filtroMedia(tamanho = 3) {
    const resultado = this._aplicarFiltroVizinhanca(viz => {
      const soma = viz.reduce((acc, val) => acc + val, 0);
      return Math.round(soma / viz.length);
    }, tamanho);
    if (resultado) {
      this.mostrarResultado(this._criarImagemData(resultado, this.imagem1.width, this.imagem1.height));
    }
  }

  // Filtro MEDIANA
  filtroMediana(tamanho = 3) {
    const resultado = this._aplicarFiltroVizinhanca(viz => {
      const ordenado = [...viz].sort((a, b) => a - b);
      const meio = Math.floor(ordenado.length / 2);
      return ordenado[meio];
    }, tamanho);
    if (resultado) {
      this.mostrarResultado(this._criarImagemData(resultado, this.imagem1.width, this.imagem1.height));
    }
  }

  // Filtro ORDEM
  filtroOrdem(tamanho = 3, rank = 5) {
    const resultado = this._aplicarFiltroVizinhanca(viz => {
      const ordenado = [...viz].sort((a, b) => a - b);
      const indice = Math.min(Math.max(0, rank - 1), ordenado.length - 1);
      return ordenado[indice];
    }, tamanho);
    if (resultado) {
      this.mostrarResultado(this._criarImagemData(resultado, this.imagem1.width, this.imagem1.height));
    }
  }

  // Suavização Conservativa
  suavizacaoConservativa(tamanho = 3) {
    if (!this._validarImagem1()) return;

    const { width: largura, height: altura } = this.imagem1;
    const dados = this._clonarDados(this.imagem1);
    const resultado = new Uint8ClampedArray(dados.length);

    const raio = Math.floor(tamanho / 2);

    for (let y = 0; y < altura; y++) {
      for (let x = 0; x < largura; x++) {
        const idxAtual = (y * largura + x) * 4;

        for (let canal = 0; canal < 3; canal++) {
          const vizinhanca = [];
          const pixelCentral = dados[idxAtual + canal];

          // Coletar vizinhança (exceto pixel central)
          for (let dy = -raio; dy <= raio; dy++) {
            for (let dx = -raio; dx <= raio; dx++) {
              if (dx === 0 && dy === 0) continue;

              const nx = Math.min(Math.max(x + dx, 0), largura - 1);
              const ny = Math.min(Math.max(y + dy, 0), altura - 1);
              const idx = (ny * largura + nx) * 4;
              vizinhanca.push(dados[idx + canal]);
            }
          }

          const minVizinho = Math.min(...vizinhanca);
          const maxVizinho = Math.max(...vizinhanca);

          if (pixelCentral < minVizinho) {
            resultado[idxAtual + canal] = minVizinho;
          } else if (pixelCentral > maxVizinho) {
            resultado[idxAtual + canal] = maxVizinho;
          } else {
            resultado[idxAtual + canal] = pixelCentral;
          }
        }

        resultado[idxAtual + 3] = dados[idxAtual + 3];
      }
    }

    this.mostrarResultado(this._criarImagemData(resultado, largura, altura));
  }

  // Filtro Gaussiano
  filtroGaussiano(tamanho = 3, sigma = 1) {
    if (!this._validarImagem1()) return;

    const { width: largura, height: altura } = this.imagem1;
    const dados = this._clonarDados(this.imagem1);
    const resultado = new Uint8ClampedArray(dados.length);

    const raio = Math.floor(tamanho / 2);

    const kernel = [];
    let somaKernel = 0;

    for (let y = -raio; y <= raio; y++) {
      for (let x = -raio; x <= raio; x++) {
        const valor = Math.exp(-(x * x + y * y) / (2 * sigma * sigma));
        kernel.push(valor);
        somaKernel += valor;
      }
    }

    for (let i = 0; i < kernel.length; i++) {
      kernel[i] /= somaKernel;
    }

    for (let y = 0; y < altura; y++) {
      for (let x = 0; x < largura; x++) {
        let somaR = 0, somaG = 0, somaB = 0;
        let indiceKernel = 0;

        for (let dy = -raio; dy <= raio; dy++) {
          for (let dx = -raio; dx <= raio; dx++) {
            const nx = Math.min(Math.max(x + dx, 0), largura - 1);
            const ny = Math.min(Math.max(y + dy, 0), altura - 1);
            const idx = (ny * largura + nx) * 4;

            somaR += dados[idx] * kernel[indiceKernel];
            somaG += dados[idx + 1] * kernel[indiceKernel];
            somaB += dados[idx + 2] * kernel[indiceKernel];
            indiceKernel++;
          }
        }

        const idxAtual = (y * largura + x) * 4;
        resultado[idxAtual] = Math.round(somaR);
        resultado[idxAtual + 1] = Math.round(somaG);
        resultado[idxAtual + 2] = Math.round(somaB);
        resultado[idxAtual + 3] = dados[idxAtual + 3];
      }
    }

    this.mostrarResultado(this._criarImagemData(resultado, largura, altura));
  }
}

window.FiltrosPassaBaixa = FiltrosPassaBaixa;