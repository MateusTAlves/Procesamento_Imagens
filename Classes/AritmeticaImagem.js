class AritmeticaImagem extends ConversoesImagem {

    adicao(valor = 0) {
        if (!this._validarImagem1()) return;
        const dados = this._clonarDados(this.imagem1);
        const { width: largura, height: altura } = this.imagem1;
        const resultado = new Uint8ClampedArray(dados.length);

        if (this.imagem2 && this.imagem2.width === largura && this.imagem2.height === altura) {
            // Adição entre duas imagens
            const dados2 = this.imagem2.data;
            for (let i = 0; i < dados.length; i += 4) {
                resultado[i] = this._clampByte(dados[i] + dados2[i]);
                resultado[i + 1] = this._clampByte(dados[i + 1] + dados2[i + 1]);
                resultado[i + 2] = this._clampByte(dados[i + 2] + dados2[i + 2]);
                resultado[i + 3] = dados[i + 3];
            }
        } else {
            // Adição com constante
            const v = Number.isFinite(valor) ? valor : 0;
            for (let i = 0; i < dados.length; i += 4) {
                resultado[i] = this._clampByte(dados[i] + v);
                resultado[i + 1] = this._clampByte(dados[i + 1] + v);
                resultado[i + 2] = this._clampByte(dados[i + 2] + v);
                resultado[i + 3] = dados[i + 3];
            }
        }

        this.mostrarResultado(this._criarImagemData(resultado, largura, altura));
    }

    subtracao(valor = 0) {
        if (!this._validarImagem1()) return;
        const dados = this._clonarDados(this.imagem1);
        const { width: largura, height: altura } = this.imagem1;
        const resultado = new Uint8ClampedArray(dados.length);

        if (this.imagem2 && this.imagem2.width === largura && this.imagem2.height === altura) {
            // Subtração entre duas imagens
            const dados2 = this.imagem2.data;
            for (let i = 0; i < dados.length; i += 4) {
                resultado[i] = this._clampByte(dados[i] - dados2[i]);
                resultado[i + 1] = this._clampByte(dados[i + 1] - dados2[i + 1]);
                resultado[i + 2] = this._clampByte(dados[i + 2] - dados2[i + 2]);
                resultado[i + 3] = dados[i + 3];
            }
        } else {
            // Subtração com constante
            const v = Number.isFinite(valor) ? valor : 0;
            for (let i = 0; i < dados.length; i += 4) {
                resultado[i] = this._clampByte(dados[i] - v);
                resultado[i + 1] = this._clampByte(dados[i + 1] - v);
                resultado[i + 2] = this._clampByte(dados[i + 2] - v);
                resultado[i + 3] = dados[i + 3];
            }
        }

        this.mostrarResultado(this._criarImagemData(resultado, largura, altura));
    }

    multiplicacao(valor = 1) {
        if (!this._validarImagem1()) return;
        // multiplicação Z = X * v
        const v = Math.max(0.1, Math.min(10, Number.isFinite(valor) ? valor : 1));
        const { width: largura, height: altura } = this.imagem1;
        const dados = this._clonarDados(this.imagem1);
        const resultado = new Uint8ClampedArray(dados.length);

        for (let i = 0; i < dados.length; i += 4) {
            resultado[i] = this._clampByte(Math.round(dados[i] * v));
            resultado[i + 1] = this._clampByte(Math.round(dados[i + 1] * v));
            resultado[i + 2] = this._clampByte(Math.round(dados[i + 2] * v));
            resultado[i + 3] = dados[i + 3];
        }

        this.mostrarResultado(this._criarImagemData(resultado, largura, altura));
    }

    divisao(valor = 1) {
        if (!this._validarImagem1()) return;
        // Divisão: Z = X / v
        const v = Math.max(0.1, Math.min(10, Number.isFinite(valor) && valor > 0 ? valor : 1));
        const { width: largura, height: altura } = this.imagem1;
        const dados = this._clonarDados(this.imagem1);
        const resultado = new Uint8ClampedArray(dados.length);

        for (let i = 0; i < dados.length; i += 4) {
            resultado[i] = this._clampByte(Math.round(dados[i] / v));
            resultado[i + 1] = this._clampByte(Math.round(dados[i + 1] / v));
            resultado[i + 2] = this._clampByte(Math.round(dados[i + 2] / v));
            resultado[i + 3] = dados[i + 3];
        }

        this.mostrarResultado(this._criarImagemData(resultado, largura, altura));
    }

    diferenca() {
        if (!this._validarDuasImagens()) return;
        const dados = this._clonarDados(this.imagem1);
        const dados2 = this.imagem2.data;
        const { width: largura, height: altura } = this.imagem1;
        const resultado = new Uint8ClampedArray(dados.length);

        // Diferença absoluta: Z(x,y) = |X(x,y) - Y(x,y)|
        for (let i = 0; i < dados.length; i += 4) {
            resultado[i] = this._clampByte(Math.abs(dados[i] - dados2[i]));
            resultado[i + 1] = this._clampByte(Math.abs(dados[i + 1] - dados2[i + 1]));
            resultado[i + 2] = this._clampByte(Math.abs(dados[i + 2] - dados2[i + 2]));
            resultado[i + 3] = dados[i + 3];
        }

        this.mostrarResultado(this._criarImagemData(resultado, largura, altura));
    }

    blending(alpha = 0.5) {
        if (!this._validarDuasImagens()) return;
        const dados = this._clonarDados(this.imagem1);
        const dados2 = this.imagem2.data;
        const { width: largura, height: altura } = this.imagem1;
        const a = Math.max(0, Math.min(1, alpha));
        const resultado = new Uint8ClampedArray(dados.length);

        // Blending: Z(x,y) = α×P(x,y) + (1-α)×Q(x,y)
        for (let i = 0; i < dados.length; i += 4) {
            resultado[i] = this._clampByte(Math.round(dados[i] * a + dados2[i] * (1 - a)));
            resultado[i + 1] = this._clampByte(Math.round(dados[i + 1] * a + dados2[i + 1] * (1 - a)));
            resultado[i + 2] = this._clampByte(Math.round(dados[i + 2] * a + dados2[i + 2] * (1 - a)));
            resultado[i + 3] = dados[i + 3];
        }

        this.mostrarResultado(this._criarImagemData(resultado, largura, altura));
    }

    media() {
        if (!this._validarDuasImagens()) return;
        const dados = this._clonarDados(this.imagem1);
        const dados2 = this.imagem2.data;
        const { width: largura, height: altura } = this.imagem1;
        const resultado = new Uint8ClampedArray(dados.length);

        // Média: Z(x,y) = (P(x,y) + Q(x,y)) / 2
        for (let i = 0; i < dados.length; i += 4) {
            resultado[i] = this._clampByte(Math.round((dados[i] + dados2[i]) / 2));
            resultado[i + 1] = this._clampByte(Math.round((dados[i + 1] + dados2[i + 1]) / 2));
            resultado[i + 2] = this._clampByte(Math.round((dados[i + 2] + dados2[i + 2]) / 2));
            resultado[i + 3] = dados[i + 3];
        }

        this.mostrarResultado(this._criarImagemData(resultado, largura, altura));
    }
}

window.AritmeticaImagem = AritmeticaImagem;
