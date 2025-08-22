const tela1 = document.getElementById("telaEntrada1");
const tela2 = document.getElementById("telaEntrada2");
const telaResultado = document.getElementById("telaResultado");

const processador = new ProcessadorImagem(tela1, tela2, telaResultado);

// Elementos
const habilitarImagem2 = document.getElementById("habilitarImagem2");
const enviarImagem1 = document.getElementById("enviarImagem1");
const enviarImagem2 = document.getElementById("enviarImagem2");

const Adicao = document.getElementById("Adicao");
const Subtracao = document.getElementById("Subtracao");
const Multiplicacao = document.getElementById("Multiplicacao");
const Divisao = document.getElementById("Divisao");

// Upload de imagens
enviarImagem1.addEventListener("change", (e) => {
  if (e.target.files && e.target.files.length > 0) {
    processador.carregarImagem(e.target.files[0], 1);
  }
});

enviarImagem2.addEventListener("change", (e) => {
  if (e.target.files && e.target.files.length > 0 && habilitarImagem2.checked) {
    processador.carregarImagem(e.target.files[0], 2);
  }
});

habilitarImagem2.addEventListener("change", () => {
  enviarImagem2.disabled = !habilitarImagem2.checked;
  if (!habilitarImagem2.checked) {
    processador.imagem2 = null;
    processador.ctx2.clearRect(0, 0, tela2.width, tela2.height);
    enviarImagem2.value = "";
  }
});

function aplicarOperacao() {
  if (!habilitarImagem2.checked) processador.imagem2 = null;

  const ativo = document.activeElement;
  if (ativo === Adicao) {
    processador.somar(parseInt(Adicao.value) || 0);
  } else if (ativo === Subtracao) {
    processador.subtrair(parseInt(Subtracao.value) || 0);
  } else if (ativo === Multiplicacao) {
    processador.multiplicar(parseFloat(Multiplicacao.value) || 1);
  } else if (ativo === Divisao) {
    processador.dividir(parseFloat(Divisao.value) || 1);
  }
}

[Adicao, Subtracao, Multiplicacao, Divisao]
  .forEach(el => el.addEventListener("input", aplicarOperacao));

document.getElementById("btnAdicao").addEventListener("click", () => {
  processador.somar(parseInt(Adicao.value) || 0);
});

document.getElementById("btnSubtracao").addEventListener("click", () => {
  processador.subtrair(parseInt(Subtracao.value) || 0);
});

document.getElementById("btnMultiplicacao").addEventListener("click", () => {
  processador.multiplicar(parseFloat(Multiplicacao.value) || 1);
});

document.getElementById("btnDivisao").addEventListener("click", () => {
  processador.dividir(parseFloat(Divisao.value) || 1);
});

// Botões de filtros
document.getElementById("btnEscalaCinza").addEventListener("click", () => {
  processador.escalaCinza();
});

// Botão salvar
document.getElementById("btnSalvar").addEventListener("click", () => {
  processador.salvarResultado();
});