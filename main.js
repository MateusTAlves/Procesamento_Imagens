// Inicializar processador com herança completa
const canvas1 = document.getElementById("canvas1");
const canvas2 = document.getElementById("canvas2");
const canvasSaida = document.getElementById("canvasSaida");

const processador = new OperacoesMorfologicas(canvas1, canvas2, canvasSaida);

// Modal para exibir kernels
const modal = document.getElementById('kernelModal');
const closeModal = document.querySelector('.close');

closeModal.onclick = function() {
  modal.style.display = 'none';
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = 'none';
  }
  if (event.target == infoModal) {
    infoModal.style.display = 'none';
  }
}

// Modal de informações da imagem
const infoModal = document.getElementById('infoModal');
const closeInfoModal = document.getElementById('closeInfoModal');

closeInfoModal.onclick = function() {
  infoModal.style.display = 'none';
}

function mostrarInformacoes() {
  const info = processador.obterInformacoesImagem();
  if (!info) return;
  document.getElementById('infoLargura').textContent = info.largura + ' px';
  document.getElementById('infoAltura').textContent = info.altura + ' px';
  document.getElementById('infoPixels').textContent = info.pixelsTotais.toLocaleString();
  document.getElementById('infoMin').textContent = info.min;
  document.getElementById('infoMax').textContent = info.max;

  infoModal.style.display = 'block';
}

document.getElementById('btnInfo1').addEventListener('click', () => {
  // Usar canvas1 diretamente
  const tempCanvas = processador.canvas;
  const tempCtx = processador.ctx;
  const tempCarregada = processador.imagemCarregada;
  
  processador.canvas = canvas1;
  processador.ctx = canvas1.getContext('2d');
  processador.imagemCarregada = canvas1.width > 0 && canvas1.height > 0;
  
  mostrarInformacoes();
  
  processador.canvas = tempCanvas;
  processador.ctx = tempCtx;
  processador.imagemCarregada = tempCarregada;
});

document.getElementById('btnInfo2').addEventListener('click', () => {
  // Usar canvas2 diretamente
  const tempCanvas = processador.canvas;
  const tempCtx = processador.ctx;
  const tempCarregada = processador.imagemCarregada;
  
  processador.canvas = canvas2;
  processador.ctx = canvas2.getContext('2d');
  processador.imagemCarregada = canvas2.width > 0 && canvas2.height > 0;
  
  mostrarInformacoes();
  
  processador.canvas = tempCanvas;
  processador.ctx = tempCtx;
  processador.imagemCarregada = tempCarregada;
});

document.getElementById('btnInfoSaida').addEventListener('click', () => {
  // Usar canvasSaida diretamente
  const tempCanvas = processador.canvas;
  const tempCtx = processador.ctx;
  const tempCarregada = processador.imagemCarregada;
  
  processador.canvas = canvasSaida;
  processador.ctx = canvasSaida.getContext('2d');
  processador.imagemCarregada = canvasSaida.width > 0 && canvasSaida.height > 0;
  
  mostrarInformacoes();
  
  processador.canvas = tempCanvas;
  processador.ctx = tempCtx;
  processador.imagemCarregada = tempCarregada;
});

// Helper para validação de tamanho ímpar
function validarTamanhoImpar(t) {
  if (!Number.isFinite(t)) return false;
  t = Math.abs(Math.floor(t));
  if (t % 2 === 0 || t < 3) return false;
  return t <= 15; // limite prático
}

// Navegação entre grupos
const navItems = document.querySelectorAll(".nav-item");
const operationGroups = document.querySelectorAll(".operation-group");

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    const groupId = item.dataset.group;

    navItems.forEach((nav) => nav.classList.remove("active"));
    item.classList.add("active");

    operationGroups.forEach((group) => {
      group.classList.remove("active");
      if (group.id === `group-${groupId}`) {
        group.classList.add("active");
      }
    });
  });
});

// Upload de imagens
const habilitarImagem2 = document.getElementById("habilitarImagem2");
const uploadImagem1 = document.getElementById("uploadImagem1");
const uploadImagem2 = document.getElementById("uploadImagem2");

uploadImagem1.addEventListener("change", (e) => {
  if (e.target.files && e.target.files.length > 0) {
    processador.carregarImagem(e.target.files[0], 1);
  }
});

uploadImagem2.addEventListener("change", (e) => {
  if (e.target.files && e.target.files.length > 0 && habilitarImagem2.checked) {
    processador.carregarImagem(e.target.files[0], 2);
  }
});

habilitarImagem2.addEventListener("change", () => {
  uploadImagem2.disabled = !habilitarImagem2.checked;
  if (!habilitarImagem2.checked) {
    processador.imagem2 = null;
    processador.ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    uploadImagem2.value = "";
  }
});

// ==================== OPERAÇÕES ARITMÉTICAS ====================

document.getElementById("btnAdicao").addEventListener("click", () => {
  const valor = parseInt(document.getElementById("valorAdicao").value) || 0;
  if (!habilitarImagem2.checked) processador.imagem2 = null;
  processador.adicao(valor);
});

document.getElementById("btnSubtracao").addEventListener("click", () => {
  const valor = parseInt(document.getElementById("valorSubtracao").value) || 0;
  if (!habilitarImagem2.checked) processador.imagem2 = null;
  processador.subtracao(valor);
});

document.getElementById("btnMultiplicacao").addEventListener("click", () => {
  const valor = parseFloat(document.getElementById("valorMultiplicacao").value) || 1;
  processador.multiplicacao(valor);
});

document.getElementById("btnDivisao").addEventListener("click", () => {
  const valor = parseFloat(document.getElementById("valorDivisao").value) || 1;
  processador.divisao(valor);
});

document.getElementById("btnDiferenca").addEventListener("click", () => {
  processador.diferenca();
});

document.getElementById("btnBlending").addEventListener("click", () => {
  const alpha = parseFloat(document.getElementById("valorBlending").value) || 0.5;
  processador.blending(alpha);
});

document.getElementById("btnMedia").addEventListener("click", () => {
  processador.media();
});

// ==================== CONVERSÃO ====================

document.getElementById("btnEscalaCinza").addEventListener("click", () => {
  processador.escalaCinza();
});

document.getElementById("btnConverterBinario").addEventListener("click", () => {
  // Conversão rápida para binário com limiar padrão 128
  processador.imagemBinaria(128);
});

document.getElementById("btnLimiarizacao").addEventListener("click", () => {
  const limiar = parseInt(document.getElementById("valorLimiarizacao").value) || 128;
  processador.limiarizacao(limiar);
});

// ==================== TRANSFORMAÇÕES ====================

document.getElementById("btnEspelharH").addEventListener("click", () => {
  processador.espelharHorizontal();
});

document.getElementById("btnEspelharV").addEventListener("click", () => {
  processador.espelharVertical();
});

document.getElementById("btnNegativo").addEventListener("click", () => {
  processador.negativo();
});

document.getElementById("btnNot").addEventListener("click", () => {
  processador.notLogico();
});

document.getElementById("btnAnd").addEventListener("click", () => {
  processador.eLogico();
});

document.getElementById("btnOr").addEventListener("click", () => {
  processador.ouLogico();
});

document.getElementById("btnXor").addEventListener("click", () => {
  processador.xorLogico();
});

// ==================== HISTOGRAMA ====================

document.getElementById("btnEqualizar").addEventListener("click", () => {
  processador.equalizarHistograma();
});

// ==================== FILTROS PASSA-BAIXA ====================

document.getElementById("btnFiltroMax").addEventListener("click", () => {
  const tamanho = parseInt(document.getElementById("tamanhoMax").value) || 3;
  if (!validarTamanhoImpar(tamanho)) {
    alert("Tamanho inválido. Use um número ímpar (3, 5, 7, 9, 11, 13, 15).");
    return;
  }
  processador.filtroMaximo(tamanho);
});

document.getElementById("btnFiltroMin").addEventListener("click", () => {
  const tamanho = parseInt(document.getElementById("tamanhoMin").value) || 3;
  if (!validarTamanhoImpar(tamanho)) {
    alert("Tamanho inválido. Use um número ímpar (3, 5, 7, 9, 11, 13, 15).");
    return;
  }
  processador.filtroMinimo(tamanho);
});

document.getElementById("btnFiltroMedia").addEventListener("click", () => {
  const tamanho = parseInt(document.getElementById("tamanhoMedia").value) || 3;
  if (!validarTamanhoImpar(tamanho)) {
    alert("Tamanho inválido. Use um número ímpar (3, 5, 7, 9, 11, 13, 15).");
    return;
  }
  processador.filtroMedia(tamanho);
});

document.getElementById("btnFiltroMediana").addEventListener("click", () => {
  const tamanho = parseInt(document.getElementById("tamanhoMediana").value) || 3;
  if (!validarTamanhoImpar(tamanho)) {
    alert("Tamanho inválido. Use um número ímpar (3, 5, 7, 9, 11, 13, 15).");
    return;
  }
  processador.filtroMediana(tamanho);
});

document.getElementById("btnFiltroOrdem").addEventListener("click", () => {
  const tamanho = parseInt(document.getElementById("tamanhoOrdem").value) || 3;
  if (!validarTamanhoImpar(tamanho)) {
    alert("Tamanho inválido. Use um número ímpar (3, 5, 7, 9, 11, 13, 15).");
    return;
  }
  const rank = parseInt(document.getElementById("rankOrdem").value) || 5;
  processador.filtroOrdem(tamanho, rank);
});

document.getElementById("btnConservativa").addEventListener("click", () => {
  const tamanho = parseInt(document.getElementById("tamanhoConservativa").value) || 3;
  if (!validarTamanhoImpar(tamanho)) {
    alert("Tamanho inválido. Use um número ímpar (3, 5, 7, 9, 11, 13, 15).");
    return;
  }
  processador.suavizacaoConservativa(tamanho);
});

document.getElementById("btnGaussiano").addEventListener("click", () => {
  const tamanho = parseInt(document.getElementById("tamanhoGaussiano").value) || 3;
  if (!validarTamanhoImpar(tamanho)) {
    alert("Tamanho inválido. Use um número ímpar (3, 5, 7, 9, 11, 13, 15).");
    return;
  }
  const sigma = parseFloat(document.getElementById("sigmaGaussiano").value) || 1;
  processador.filtroGaussiano(tamanho, sigma);
});

document.getElementById("btnVerKernelGaussiano").addEventListener("click", () => {
  const tamanho = parseInt(document.getElementById("tamanhoGaussiano").value) || 3;
  const sigma = parseFloat(document.getElementById("sigmaGaussiano").value) || 1;
  
  // Gerar kernel gaussiano
  const raio = Math.floor(tamanho / 2);
  const kernel = [];
  let soma = 0;
  
  for (let y = -raio; y <= raio; y++) {
    for (let x = -raio; x <= raio; x++) {
      const valor = Math.exp(-(x * x + y * y) / (2 * sigma * sigma));
      kernel.push(valor);
      soma += valor;
    }
  }
  
  // Normalizar e arredondar para 4 casas decimais
  const kernelNormalizado = kernel.map(v => parseFloat((v / soma).toFixed(4)));
  
  processador._mostrarKernel(`Filtro Gaussiano ${tamanho}x${tamanho} (σ=${sigma})`, kernelNormalizado);
});

// ==================== FILTROS PASSA-ALTA ====================

document.getElementById("btnPrewitt").addEventListener("click", () => {
  processador.prewitt();
});

document.getElementById("btnVerKernelPrewitt").addEventListener("click", () => {
  const kernelX = [-1, 0, 1, -1, 0, 1, -1, 0, 1];
  const kernelY = [-1, -1, -1, 0, 0, 0, 1, 1, 1];
  processador._mostrarKernel("Filtro Prewitt (1ª Ordem)", kernelX, kernelY);
});

document.getElementById("btnSobel").addEventListener("click", () => {
  processador.sobel();
});

document.getElementById("btnVerKernelSobel").addEventListener("click", () => {
  const kernelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const kernelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
  processador._mostrarKernel("Filtro Sobel (1ª Ordem)", kernelX, kernelY);
});

document.getElementById("btnLaplaciano").addEventListener("click", () => {
  processador.laplaciano();
});

document.getElementById("btnVerKernelLaplaciano").addEventListener("click", () => {
  const kernel = [0, -1, 0, -1, 4, -1, 0, -1, 0];
  processador._mostrarKernel("Filtro Laplaciano (2ª Ordem)", kernel);
});

// ==================== OPERAÇÕES MORFOLÓGICAS ====================

document.getElementById("btnDilatacao").addEventListener("click", () => {
  processador.dilatacao();
});

document.getElementById("btnErosao").addEventListener("click", () => {
  processador.erosao();
});

document.getElementById("btnAbertura").addEventListener("click", () => {
  processador.abertura();
});

document.getElementById("btnFechamento").addEventListener("click", () => {
  processador.fechamento();
});

document.getElementById("btnContorno").addEventListener("click", () => {
  processador.contorno();
});


document.getElementById("btnSalvar").addEventListener("click", () => {
  processador.salvarResultado();
});