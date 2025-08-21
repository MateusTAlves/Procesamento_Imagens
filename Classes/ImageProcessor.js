class ImageProcessor {
  constructor(canvas1, canvas2, canvasOutput) {
    this.canvas1 = canvas1;
    this.canvas2 = canvas2;
    this.canvasOutput = canvasOutput;

    this.ctx1 = canvas1.getContext("2d");
    this.ctx2 = canvas2.getContext("2d");
    this.ctxOutput = canvasOutput.getContext("2d");

    this.image1 = null;
    this.image2 = null;
    this._img1 = null;
    this._img2 = null;
  }

  _fitSize(width, height, maxW = 250, maxH = 200) {
    let w = width, h = height;
    if (w > maxW) { h *= maxW / w; w = maxW; }
    if (h > maxH) { w *= maxH / h; h = maxH; }
    return { width: Math.round(w), height: Math.round(h) };
  }

  loadImage(file, which = 1) {
    const reader = new FileReader();
    const img = new Image();
    reader.onload = e => {
      img.src = e.target.result;
      img.onload = () => {
        if (which === 1) {
          const { width, height } = this._fitSize(img.naturalWidth, img.naturalHeight);
          this.canvas1.width = width;
          this.canvas1.height = height;
          this.canvasOutput.width = width;
          this.canvasOutput.height = height;

          this.ctx1.clearRect(0, 0, width, height);
          this.ctx1.drawImage(img, 0, 0, width, height);
          this.image1 = this.ctx1.getImageData(0, 0, width, height);
          this._img1 = img;

          if (this._img2) {
            this.canvas2.width = width;
            this.canvas2.height = height;
            this.ctx2.clearRect(0, 0, width, height);
            this.ctx2.drawImage(this._img2, 0, 0, width, height);
            this.image2 = this.ctx2.getImageData(0, 0, width, height);
          }

          this.showResult(this.image1);
        } else {
          if (this.image1) {
            const { width, height } = this.image1;
            this.canvas2.width = width;
            this.canvas2.height = height;
            this.ctx2.clearRect(0, 0, width, height);
            this.ctx2.drawImage(img, 0, 0, width, height);
            this.image2 = this.ctx2.getImageData(0, 0, width, height);
          } else {
            const { width, height } = this._fitSize(img.naturalWidth, img.naturalHeight);
            this.canvas2.width = width;
            this.canvas2.height = height;
            this.ctx2.clearRect(0, 0, width, height);
            this.ctx2.drawImage(img, 0, 0, width, height);
            this.image2 = this.ctx2.getImageData(0, 0, width, height);
          }
          this._img2 = img;
        }
      };
    };
    reader.readAsDataURL(file);
  }

  showResult(imageData) {
    this.ctxOutput.putImageData(imageData, 0, 0);
  }

  add(value = 0) {
    if (!this.image1) return;
    const data = new Uint8ClampedArray(this.image1.data);

    if (this.image2 && this.image2.width === this.image1.width && this.image2.height === this.image1.height) {
      const data2 = this.image2.data;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] + data2[i]);
        data[i + 1] = Math.min(255, data[i + 1] + data2[i + 1]);
        data[i + 2] = Math.min(255, data[i + 2] + data2[i + 2]);
      }
    } else {
      const v = Number.isFinite(value) ? value : 0;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] + v);
        data[i + 1] = Math.min(255, data[i + 1] + v);
        data[i + 2] = Math.min(255, data[i + 2] + v);
      }
    }

    this.showResult(new ImageData(data, this.image1.width, this.image1.height));
  }

  subtract(value = 0) {
    if (!this.image1) return;
    const data = new Uint8ClampedArray(this.image1.data);

    if (this.image2 && this.image2.width === this.image1.width && this.image2.height === this.image1.height) {
      const data2 = this.image2.data;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.max(0, data[i] - data2[i]);
        data[i + 1] = Math.max(0, data[i + 1] - data2[i + 1]);
        data[i + 2] = Math.max(0, data[i + 2] - data2[i + 2]);
      }
    } else {
      const v = Number.isFinite(value) ? value : 0;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.max(0, data[i] - v);
        data[i + 1] = Math.max(0, data[i + 1] - v);
        data[i + 2] = Math.max(0, data[i + 2] - v);
      }
    }

    this.showResult(new ImageData(data, this.image1.width, this.image1.height));
  }

  multiply(value = 1) {
    if (!this.image1) return;
    const v = Number.isFinite(value) ? Math.max(0, value) : 1;
    const data = new Uint8ClampedArray(this.image1.data);

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * v);
      data[i + 1] = Math.min(255, data[i + 1] * v);
      data[i + 2] = Math.min(255, data[i + 2] * v);
    }

    this.showResult(new ImageData(data, this.image1.width, this.image1.height));
  }

  divide(value = 1) {
    if (!this.image1) return;
    const v = Number.isFinite(value) ? value : 1;
    const div = v <= 0 ? 1 : v; 
    const data = new Uint8ClampedArray(this.image1.data);

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] / div);
      data[i + 1] = Math.min(255, data[i + 1] / div);
      data[i + 2] = Math.min(255, data[i + 2] / div);
    }

    this.showResult(new ImageData(data, this.image1.width, this.image1.height));
  }

  toGrayscale() {
    if (!this.image1) return;

    const data = new Uint8ClampedArray(this.image1.data);

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1]; 
      const b = data[i + 2];

      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray; 
    }

    this.showResult(new ImageData(data, this.image1.width, this.image1.height));
  }

  async saveResult() {
    if (!this.canvasOutput.width || !this.canvasOutput.height) return;

    if ("showSaveFilePicker" in window) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: "resultado.png",
          types: [{ description: "Imagens PNG", accept: { "image/png": [".png"] } }],
        });
        const writable = await handle.createWritable();
        const blob = await new Promise(resolve => this.canvasOutput.toBlob(resolve, "image/png"));
        await writable.write(blob);
        await writable.close();
      } catch (err) {
        console.error("Erro ao salvar:", err);
      }
    } else {
      const link = document.createElement("a");
      link.download = "resultado.png";
      link.href = this.canvasOutput.toDataURL("image/png");
      link.click();
    }
  }
}

window.ImageProcessor = ImageProcessor;
