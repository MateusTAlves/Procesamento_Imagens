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

  _fitSize(width, height, maxW = 300, maxH = 240) {
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
        data[i+1] = Math.min(255, data[i+1] + data2[i+1]);
        data[i+2] = Math.min(255, data[i+2] + data2[i+2]);
      }
    } else {
      const v = Number.isFinite(value) ? value : 0;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] + v);
        data[i+1] = Math.min(255, data[i+1] + v);
        data[i+2] = Math.min(255, data[i+2] + v);
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
        data[i+1] = Math.max(0, data[i+1] - data2[i+1]);
        data[i+2] = Math.max(0, data[i+2] - data2[i+2]);
      }
    } else {
      const v = Number.isFinite(value) ? value : 0;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.max(0, data[i] - v);
        data[i+1] = Math.max(0, data[i+1] - v);
        data[i+2] = Math.max(0, data[i+2] - v);
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
      data[i+1] = Math.min(255, data[i+1] * v);
      data[i+2] = Math.min(255, data[i+2] * v);
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
      data[i+1] = Math.min(255, data[i+1] / div);
      data[i+2] = Math.min(255, data[i+2] / div);
    }

    this.showResult(new ImageData(data, this.image1.width, this.image1.height));
  }

  difference() {
    if (!this.image1 || !this.image2) return;
    if (this.image2.width !== this.image1.width || this.image2.height !== this.image1.height) return;

    const data = new Uint8ClampedArray(this.image1.data);
    const data2 = this.image2.data;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.abs(data[i] - data2[i]);
      data[i+1] = Math.abs(data[i+1] - data2[i+1]);
      data[i+2] = Math.abs(data[i+2] - data2[i+2]);
    }

    this.showResult(new ImageData(data, this.image1.width, this.image1.height));
  }

  blending(alpha = 0.5) {
    if (!this.image1 || !this.image2) return;
    if (this.image2.width !== this.image1.width || this.image2.height !== this.image1.height) return;

    const data = new Uint8ClampedArray(this.image1.data);
    const data2 = this.image2.data;
    const a = Math.max(0, Math.min(1, alpha));

    for (let i = 0; i < data.length; i += 4) {
      data[i] = data[i] * a + data2[i] * (1 - a);
      data[i+1] = data[i+1] * a + data2[i+1] * (1 - a);
      data[i+2] = data[i+2] * a + data2[i+2] * (1 - a);
    }

    this.showResult(new ImageData(data, this.image1.width, this.image1.height));
  }

  average() {
    if (!this.image1 || !this.image2) return;
    if (this.image2.width !== this.image1.width || this.image2.height !== this.image1.height) return;

    const data = new Uint8ClampedArray(this.image1.data);
    const data2 = this.image2.data;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = (data[i] + data2[i]) / 2;
      data[i+1] = (data[i+1] + data2[i+1]) / 2;
      data[i+2] = (data[i+2] + data2[i+2]) / 2;
    }

    this.showResult(new ImageData(data, this.image1.width, this.image1.height));
  }

  grayscale() {
    if (!this.image1) return;
    const data = new Uint8ClampedArray(this.image1.data);

    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
      data[i] = data[i+1] = data[i+2] = gray;
    }

    this.showResult(new ImageData(data, this.image1.width, this.image1.height));
  }

  flipHorizontal() {
    if (!this.image1) return;
    const { width, height } = this.image1;
    const data = new Uint8ClampedArray(this.image1.data);
    const result = new Uint8ClampedArray(data.length);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcIdx = (y * width + x) * 4;
        const dstIdx = (y * width + (width - 1 - x)) * 4;
        result[dstIdx] = data[srcIdx];
        result[dstIdx+1] = data[srcIdx+1];
        result[dstIdx+2] = data[srcIdx+2];
        result[dstIdx+3] = data[srcIdx+3];
      }
    }

    this.showResult(new ImageData(result, width, height));
  }

  flipVertical() {
    if (!this.image1) return;
    const { width, height } = this.image1;
    const data = new Uint8ClampedArray(this.image1.data);
    const result = new Uint8ClampedArray(data.length);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcIdx = (y * width + x) * 4;
        const dstIdx = ((height - 1 - y) * width + x) * 4;
        result[dstIdx] = data[srcIdx];
        result[dstIdx+1] = data[srcIdx+1];
        result[dstIdx+2] = data[srcIdx+2];
        result[dstIdx+3] = data[srcIdx+3];
      }
    }

    this.showResult(new ImageData(result, width, height));
  }

  negative() {
    if (!this.image1) return;
    const data = new Uint8ClampedArray(this.image1.data);

    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i];
      data[i+1] = 255 - data[i+1];
      data[i+2] = 255 - data[i+2];
    }

    this.showResult(new ImageData(data, this.image1.width, this.image1.height));
  }

  threshold(value = 128) {
    if (!this.image1) return;
    const data = new Uint8ClampedArray(this.image1.data);

    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
      const binary = gray >= value ? 255 : 0;
      data[i] = data[i+1] = data[i+2] = binary;
    }

    this.showResult(new ImageData(data, this.image1.width, this.image1.height));
  }

  logicalAnd() {
    if (!this.image1 || !this.image2) return;
    if (this.image2.width !== this.image1.width || this.image2.height !== this.image1.height) return;

    const data = new Uint8ClampedArray(this.image1.data);
    const data2 = this.image2.data;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = data[i] & data2[i];
      data[i+1] = data[i+1] & data2[i+1];
      data[i+2] = data[i+2] & data2[i+2];
    }

    this.showResult(new ImageData(data, this.image1.width, this.image1.height));
  }

  logicalOr() {
    if (!this.image1 || !this.image2) return;
    if (this.image2.width !== this.image1.width || this.image2.height !== this.image1.height) return;

    const data = new Uint8ClampedArray(this.image1.data);
    const data2 = this.image2.data;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = data[i] | data2[i];
      data[i+1] = data[i+1] | data2[i+1];
      data[i+2] = data[i+2] | data2[i+2];
    }

    this.showResult(new ImageData(data, this.image1.width, this.image1.height));
  }

  logicalXor() {
    if (!this.image1 || !this.image2) return;
    if (this.image2.width !== this.image1.width || this.image2.height !== this.image1.height) return;

    const data = new Uint8ClampedArray(this.image1.data);
    const data2 = this.image2.data;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = data[i] ^ data2[i];
      data[i+1] = data[i+1] ^ data2[i+1];
      data[i+2] = data[i+2] ^ data2[i+2];
    }

    this.showResult(new ImageData(data, this.image1.width, this.image1.height));
  }

  equalizeHistogram() {
    if (!this.image1) return;

    const data = new Uint8ClampedArray(this.image1.data);
    const { width, height } = this.image1;
    const totalPixels = width * height;

    const histogram = new Array(256).fill(0);
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2]);
      histogram[gray]++;
    }

    this.drawHistogram(histogram, "histogramOriginal");

    const cdf = new Array(256);
    cdf[0] = histogram[0];
    for (let i = 1; i < 256; i++) {
      cdf[i] = cdf[i-1] + histogram[i];
    }

    const cdfMin = cdf.find((val) => val > 0);
    const equalized = new Array(256);
    for (let i = 0; i < 256; i++) {
      equalized[i] = Math.round(((cdf[i] - cdfMin) / (totalPixels - cdfMin)) * 255);
    }

    const equalizedHistogram = new Array(256).fill(0);
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2]);
      const newGray = equalized[gray];
      data[i] = data[i+1] = data[i+2] = newGray;
      equalizedHistogram[newGray]++;
    }

    this.drawHistogram(equalizedHistogram, "histogramEqualized");

    this.showResult(new ImageData(data, width, height));
  }

  drawHistogram(histogram, canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const max = Math.max(...histogram);

    const barWidth = width / 256;
    ctx.fillStyle = "#3b82f6";

    for (let i = 0; i < 256; i++) {
      const barHeight = (histogram[i] / max) * (height - 20);
      ctx.fillRect(i * barWidth, height - barHeight, barWidth, barHeight);
    }

    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, height - 1);
    ctx.lineTo(width, height - 1);
    ctx.stroke();
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
        const blob = await new Promise((resolve) => this.canvasOutput.toBlob(resolve, "image/png"));
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