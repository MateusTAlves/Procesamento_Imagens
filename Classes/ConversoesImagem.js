class ConversoesImagem extends ProcessadorImagem {

    escalaCinza() {
        if (!this._validarImagem1()) return;

        const dados = this._clonarDados(this.imagem1);
        const { width: largura, height: altura } = this.imagem1;

        const resultado = this._converterParaEscalaCinza(dados);
        this.mostrarResultado(this._criarImagemData(resultado, largura, altura));
    }

    imagemBinaria(limiar = 128) {
        if (!this._validarImagem1()) return;

        const dados = this._clonarDados(this.imagem1);
        const { width: largura, height: altura } = this.imagem1;
        const resultado = this._converterParaBinario(dados, limiar);

        this.mostrarResultado(this._criarImagemData(resultado, largura, altura));
    }

    _verificarImagemBinaria(imagemData) {
        const dados = imagemData.data;

        for (let i = 0; i < dados.length; i += 4) {
            const r = dados[i], g = dados[i + 1], b = dados[i + 2];

            const ehPreto = (r === 0 && g === 0 && b === 0);
            const ehBranco = (r === 255 && g === 255 && b === 255);

            if (!ehPreto && !ehBranco) {
                return false;
            }
        }
        return true;
    }

    limiarizacao(limiar = 128) {
        if (!this._validarImagem1()) return;

        const dados = this._clonarDados(this.imagem1);
        const { width: largura, height: altura } = this.imagem1;
        const t = Math.max(0, Math.min(255, Number.isFinite(limiar) ? limiar : 128));
        const resultado = this._converterParaBinario(dados, t);

        this.mostrarResultado(this._criarImagemData(resultado, largura, altura));
    }
}

window.ConversoesImagem = ConversoesImagem;
