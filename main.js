const canvas1 = document.getElementById("canvasInput1");
const canvas2 = document.getElementById("canvasInput2");
const canvasOutput = document.getElementById("canvasOutput");

const processor = new ImageProcessor(canvas1, canvas2, canvasOutput);

// Elementos
const enableImage2 = document.getElementById("enableImage2");
const uploadImage1 = document.getElementById("uploadImage1");
const uploadImage2 = document.getElementById("uploadImage2");

const intensityAddInput = document.getElementById("intensityAddInput");
const intensitySubInput = document.getElementById("intensitySubInput");
const intensityMultInput = document.getElementById("intensityMultInput");
const intensityDivInput = document.getElementById("intensityDivInput");

// Uploads
uploadImage1.addEventListener("change", (e) => {
  if (e.target.files && e.target.files.length > 0) {
    processor.loadImage(e.target.files[0], 1);
  }
});

uploadImage2.addEventListener("change", (e) => {
  if (e.target.files && e.target.files.length > 0 && enableImage2.checked) {
    processor.loadImage(e.target.files[0], 2);
  }
});


enableImage2.addEventListener("change", () => {
  uploadImage2.disabled = !enableImage2.checked;
  if (!enableImage2.checked) {
    processor.image2 = null;
    processor.ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    uploadImage2.value = "";
  }
});

function applyOperation() {
  if (!enableImage2.checked) processor.image2 = null;

  const active = document.activeElement;
  if (active === intensityAddInput) {
    processor.add(parseInt(intensityAddInput.value) || 0);
  } else if (active === intensitySubInput) {
    processor.subtract(parseInt(intensitySubInput.value) || 0);
  } else if (active === intensityMultInput) {
    processor.multiply(parseFloat(intensityMultInput.value) || 1);
  } else if (active === intensityDivInput) {
    processor.divide(parseFloat(intensityDivInput.value) || 1);
  }
}

[intensityAddInput, intensitySubInput, intensityMultInput, intensityDivInput]
  .forEach(el => el.addEventListener("input", applyOperation));

document.getElementById("addBtn").addEventListener("click", () => {
  processor.add(parseInt(intensityAddInput.value) || 0);
});

document.getElementById("subBtn").addEventListener("click", () => {
  processor.subtract(parseInt(intensitySubInput.value) || 0);
});

document.getElementById("multBtn").addEventListener("click", () => {
  processor.multiply(parseFloat(intensityMultInput.value) || 1);
});

document.getElementById("divBtn").addEventListener("click", () => {
  processor.divide(parseFloat(intensityDivInput.value) || 1);
});

document.getElementById("grayscaleBtn").addEventListener("click", () => {
  processor.toGrayscale();
});

document.getElementById("saveBtn").addEventListener("click", () => {
  processor.saveResult();
});
