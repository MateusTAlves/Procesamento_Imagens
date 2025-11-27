class TransformacoesImagem extends AritmeticaImagem {

  espelharHorizontal() {
    if (!this._validarImagem1()) return;

    const { width: largura, height: altura } = this.imagem1;
    const dados = this._clonarDados(this.imagem1);
    const resultado = new Uint8ClampedArray(dados.length);

    for (let y = 0; y < altura; y++) {
      for (let x = 0; x < largura; x++) {
        const idxOrigem = (y * largura + x) * 4;
        const idxDestino = (y * largura + (largura - 1 - x)) * 4;

        resultado[idxDestino] = dados[idxOrigem];
        resultado[idxDestino + 1] = dados[idxOrigem + 1];
        resultado[idxDestino + 2] = dados[idxOrigem + 2];
        resultado[idxDestino + 3] = dados[idxOrigem + 3];
      }
    }

    this.mostrarResultado(this._criarImagemData(resultado, largura, altura));
  }

  espelharVertical() {
    if (!this._validarImagem1()) return;

    const { width: largura, height: altura } = this.imagem1;
    const dados = this._clonarDados(this.imagem1);
    const resultado = new Uint8ClampedArray(dados.length);

    for (let y = 0; y < altura; y++) {
      for (let x = 0; x < largura; x++) {
        const idxOrigem = (y * largura + x) * 4;
        const idxDestino = ((altura - 1 - y) * largura + x) * 4;

        resultado[idxDestino] = dados[idxOrigem];
        resultado[idxDestino + 1] = dados[idxOrigem + 1];
        resultado[idxDestino + 2] = dados[idxOrigem + 2];
        resultado[idxDestino + 3] = dados[idxOrigem + 3];
      }
    }

    this.mostrarResultado(this._criarImagemData(resultado, largura, altura));
  }

  negativo() {
    if (!this._validarImagem1()) return;
    const dados = this._clonarDados(this.imagem1);
    const { width: largura, height: altura } = this.imagem1;
    const resultado = new Uint8ClampedArray(dados.length);

    // G(x,y) = 255 - F(x,y)
    for (let i = 0; i < dados.length; i += 4) {
      resultado[i] = 255 - dados[i];
      resultado[i + 1] = 255 - dados[i + 1];
      resultado[i + 2] = 255 - dados[i + 2];
      resultado[i + 3] = dados[i + 3];
    }

    this.mostrarResultado(this._criarImagemData(resultado, largura, altura));
  }

  // ==================== OPERAÇÕES LÓGICAS ====================

  // NOT Lógico - imagens binárias
  notLogico() {
    if (!this._validarImagem1()) return;

    if (!this._verificarImagemBinaria(this.imagem1)) {
      alert("A imagem deve ser binária (apenas preto e branco). Use 'Imagem Binária' ou 'Limiarização' primeiro.");
      return;
    }
    const dados = this._clonarDados(this.imagem1);
    const { width: largura, height: altura } = this.imagem1;
    const resultadoNot = new Uint8ClampedArray(dados.length);

    // Isaída(i,j) = MAX - Ientrada(i,j), onde MAX = 255
    for (let i = 0; i < dados.length; i += 4) {
      resultadoNot[i] = 255 - dados[i];
      resultadoNot[i + 1] = 255 - dados[i + 1];
      resultadoNot[i + 2] = 255 - dados[i + 2];
      resultadoNot[i + 3] = dados[i + 3];
    }

    this.mostrarResultado(this._criarImagemData(resultadoNot, largura, altura));
  }

  // AND Lógico - imagens binárias
  eLogico() {
    if (!this._validarDuasImagens()) return;

    if (!this._verificarImagemBinaria(this.imagem1) || !this._verificarImagemBinaria(this.imagem2)) {
      alert("Ambas as imagens devem ser binárias (apenas preto e branco). Use 'Imagem Binária' ou 'Limiarização' primeiro.");
      return;
    }
    const dados = this._clonarDados(this.imagem1);
    const dados2 = this.imagem2.data;
    const { width: largura, height: altura } = this.imagem1;
    const resultadoAnd = new Uint8ClampedArray(dados.length);

    for (let i = 0; i < dados.length; i += 4) {
      resultadoAnd[i] = dados[i] & dados2[i];
      resultadoAnd[i + 1] = dados[i + 1] & dados2[i + 1];
      resultadoAnd[i + 2] = dados[i + 2] & dados2[i + 2];
      resultadoAnd[i + 3] = dados[i + 3];
    }

    this.mostrarResultado(this._criarImagemData(resultadoAnd, largura, altura));
  }

  // OR Lógico - imagens binárias
  ouLogico() {
    if (!this._validarDuasImagens()) return;

    if (!this._verificarImagemBinaria(this.imagem1) || !this._verificarImagemBinaria(this.imagem2)) {
      alert("Ambas as imagens devem ser binárias (apenas preto e branco). Use 'Imagem Binária' ou 'Limiarização' primeiro.");
      return;
    }
    const dados = this._clonarDados(this.imagem1);
    const dados2 = this.imagem2.data;
    const { width: largura, height: altura } = this.imagem1;
    const resultadoOr = new Uint8ClampedArray(dados.length);

    for (let i = 0; i < dados.length; i += 4) {
      resultadoOr[i] = dados[i] | dados2[i];
      resultadoOr[i + 1] = dados[i + 1] | dados2[i + 1];
      resultadoOr[i + 2] = dados[i + 2] | dados2[i + 2];
      resultadoOr[i + 3] = dados[i + 3];
    }

    this.mostrarResultado(this._criarImagemData(resultadoOr, largura, altura));
  }

  // XOR Lógico - imagens binárias
  xorLogico() {
    if (!this._validarDuasImagens()) return;

    if (!this._verificarImagemBinaria(this.imagem1) || !this._verificarImagemBinaria(this.imagem2)) {
      alert("Ambas as imagens devem ser binárias (apenas preto e branco). Use 'Imagem Binária' ou 'Limiarização' primeiro.");
      return;
    }
    const dados = this._clonarDados(this.imagem1);
    const dados2 = this.imagem2.data;
    const { width: largura, height: altura } = this.imagem1;
    const resultadoXor = new Uint8ClampedArray(dados.length);

    for (let i = 0; i < dados.length; i += 4) {
      resultadoXor[i] = dados[i] ^ dados2[i];
      resultadoXor[i + 1] = dados[i + 1] ^ dados2[i + 1];
      resultadoXor[i + 2] = dados[i + 2] ^ dados2[i + 2];
      resultadoXor[i + 3] = dados[i + 3];
    }

    this.mostrarResultado(this._criarImagemData(resultadoXor, largura, altura));
  }
}

window.TransformacoesImagem = TransformacoesImagem;