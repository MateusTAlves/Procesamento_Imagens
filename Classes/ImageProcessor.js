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

    // Verifica se é TIFF
    if (file.type === 'image/tiff' || file.name.toLowerCase().endsWith('.tif') || file.name.toLowerCase().endsWith('.tiff')) {
      reader.onload = e => {
        try {
          const buffer = e.target.result;
          const ifds = UTIF.decode(buffer);
          UTIF.decodeImage(buffer, ifds[0]);
          const rgba = UTIF.toRGBA8(ifds[0]);

          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = ifds[0].width;
          tempCanvas.height = ifds[0].height;
          const tempCtx = tempCanvas.getContext('2d');
          const imageData = new ImageData(new Uint8ClampedArray(rgba), ifds[0].width, ifds[0].height);
          tempCtx.putImageData(imageData, 0, 0);

          const img = new Image();
          img.onload = () => this._processLoadedImage(img, which);
          img.src = tempCanvas.toDataURL();
        } catch (error) {
          console.error('Erro ao carregar TIFF:', error);
          alert('Erro ao carregar arquivo TIFF');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // Imagens normais (PNG, JPG, etc)
      const img = new Image();
      reader.onload = e => {
        img.src = e.target.result;
        img.onload = () => this._processLoadedImage(img, which);
      };
      reader.readAsDataURL(file);
    }
  }

  _processLoadedImage(img, which) {
    if (which === 1) {
      const { width, height } = this._fitSize(img.naturalWidth || img.width, img.naturalHeight || img.height);
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
        const { width, height } = this._fitSize(img.naturalWidth || img.width, img.naturalHeight || img.height);
        this.canvas2.width = width;
        this.canvas2.height = height;
        this.ctx2.clearRect(0, 0, width, height);
        this.ctx2.drawImage(img, 0, 0, width, height);
        this.image2 = this.ctx2.getImageData(0, 0, width, height);
      }
      this._img2 = img;
    }
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

  difference() {
    if (!this.image1 || !this.image2) return;
    if (this.image2.width !== this.image1.width || this.image2.height !== this.image1.height) return;

    const data = new Uint8ClampedArray(this.image1.data);
    const data2 = this.image2.data;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.abs(data[i] - data2[i]);
      data[i + 1] = Math.abs(data[i + 1] - data2[i + 1]);
      data[i + 2] = Math.abs(data[i + 2] - data2[i + 2]);
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
      data[i + 1] = data[i + 1] * a + data2[i + 1] * (1 - a);
      data[i + 2] = data[i + 2] * a + data2[i + 2] * (1 - a);
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
      data[i + 1] = (data[i + 1] + data2[i + 1]) / 2;
      data[i + 2] = (data[i + 2] + data2[i + 2]) / 2;
    }

    this.showResult(new ImageData(data, this.image1.width, this.image1.height));
  }

  grayscale() {
    if (!this.image1) return;
    const data = new Uint8ClampedArray(this.image1.data);

    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = data[i + 1] = data[i + 2] = gray;
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
        result[dstIdx + 1] = data[srcIdx + 1];
        result[dstIdx + 2] = data[srcIdx + 2];
        result[dstIdx + 3] = data[srcIdx + 3];
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
        result[dstIdx + 1] = data[srcIdx + 1];
        result[dstIdx + 2] = data[srcIdx + 2];
        result[dstIdx + 3] = data[srcIdx + 3];
      }
    }

    this.showResult(new ImageData(result, width, height));
  }

  negative() {
    if (!this.image1) return;
    const data = new Uint8ClampedArray(this.image1.data);

    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i];
      data[i + 1] = 255 - data[i + 1];
      data[i + 2] = 255 - data[i + 2];
    }

    this.showResult(new ImageData(data, this.image1.width, this.image1.height));
  }

  threshold(value = 128) {
    if (!this.image1) return;
    const data = new Uint8ClampedArray(this.image1.data);

    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const binary = gray >= value ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = binary;
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
      data[i + 1] = data[i + 1] & data2[i + 1];
      data[i + 2] = data[i + 2] & data2[i + 2];
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
      data[i + 1] = data[i + 1] | data2[i + 1];
      data[i + 2] = data[i + 2] | data2[i + 2];
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
      data[i + 1] = data[i + 1] ^ data2[i + 1];
      data[i + 2] = data[i + 2] ^ data2[i + 2];
    }

    this.showResult(new ImageData(data, this.image1.width, this.image1.height));
  }

  logicalNot() {
    if (!this.image1) return;
    const data = new Uint8ClampedArray(this.image1.data);

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] > 127 ? 0 : 255;
      const g = data[i + 1] > 127 ? 0 : 255;
      const b = data[i + 2] > 127 ? 0 : 255;

      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
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
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      histogram[gray]++;
    }

    this.drawHistogram(histogram, "histogramOriginal");

    const cdf = new Array(256);
    cdf[0] = histogram[0];
    for (let i = 1; i < 256; i++) {
      cdf[i] = cdf[i - 1] + histogram[i];
    }

    let cdfMin = cdf.find((val) => val > 0) || 0;

    const equalized = new Array(256);
    for (let i = 0; i < 256; i++) {
      equalized[i] = Math.round(((cdf[i] - cdfMin) / (totalPixels - cdfMin)) * 255);
    }

    const equalizedHistogram = new Array(256).fill(0);
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      const newGray = equalized[gray];

      data[i] = data[i + 1] = data[i + 2] = newGray;
      equalizedHistogram[newGray]++;
    }

    this.drawHistogram(equalizedHistogram, "histogramEqualized");

    this.showResult(new ImageData(data, width, height));
  }

  drawHistogram(histogram, canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    const max = Math.max(...histogram);
    if (max === 0) return;

    const barWidth = width / 256;
    const padding = 20;
    const graphHeight = height - padding;

    ctx.fillStyle = "#3b82f6";
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = Math.max(1, barWidth);
    ctx.lineCap = "round";

    for (let i = 0; i < 256; i++) {
      const barHeight = (histogram[i] / max) * (graphHeight - 10);
      const x = i * barWidth;
      const y = graphHeight - barHeight;

      if (barWidth < 2) {
        ctx.beginPath();
        ctx.moveTo(x, graphHeight);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else {
        ctx.fillRect(x, y, barWidth, barHeight);
      }
    }

    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, graphHeight);
    ctx.lineTo(width, graphHeight);
    ctx.stroke();

    ctx.fillStyle = "#64748b";
    ctx.font = "10px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("0", 5, height - 5);
    ctx.fillText("255", width - 10, height - 5);
  }

  prewitt() {
    if (!this.image1) return;

    const { width, height } = this.image1;
    const data = new Uint8ClampedArray(this.image1.data);
    const result = new Uint8ClampedArray(data.length);

    const kernelX = [
      [1, 1, 1],
      [0, 0, 0],
      [-1, -1, -1]
    ];

    const kernelY = [
      [1, 0, -1],
      [1, 0, -1],
      [1, 0, -1]
    ];

    let maxMagnitude = 0;
    const magnitudes = [];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0, gy = 0;

        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4;
            const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];

            gx += gray * kernelX[ky + 1][kx + 1];
            gy += gray * kernelY[ky + 1][kx + 1];
          }
        }

        const magnitude = Math.sqrt(gx * gx + gy * gy);
        magnitudes.push(magnitude);
        if (magnitude > maxMagnitude) maxMagnitude = magnitude;
      }
    }

    let idx = 0;
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const normalizedValue = (magnitudes[idx] / maxMagnitude) * 255;
        const pixelIdx = (y * width + x) * 4;

        result[pixelIdx] = result[pixelIdx + 1] = result[pixelIdx + 2] = normalizedValue;
        result[pixelIdx + 3] = 255;
        idx++;
      }
    }

    for (let x = 0; x < width; x++) {
      result[x * 4] = result[x * 4 + 1] = result[x * 4 + 2] = 0;
      result[x * 4 + 3] = 255;
      const bottomIdx = ((height - 1) * width + x) * 4;
      result[bottomIdx] = result[bottomIdx + 1] = result[bottomIdx + 2] = 0;
      result[bottomIdx + 3] = 255;
    }
    for (let y = 0; y < height; y++) {
      const leftIdx = (y * width) * 4;
      result[leftIdx] = result[leftIdx + 1] = result[leftIdx + 2] = 0;
      result[leftIdx + 3] = 255;
      const rightIdx = (y * width + (width - 1)) * 4;
      result[rightIdx] = result[rightIdx + 1] = result[rightIdx + 2] = 0;
      result[rightIdx + 3] = 255;
    }

    this.showResult(new ImageData(result, width, height));
  }

  prewittVertical() {
    if (!this.image1) return;

    const { width, height } = this.image1;
    const data = new Uint8ClampedArray(this.image1.data);
    const result = new Uint8ClampedArray(data.length);

    const kernel = [
      [1, 1, 1],
      [0, 0, 0],
      [-1, -1, -1]
    ];

    let maxGrad = 0;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let sum = 0;

        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4;
            const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
            sum += gray * kernel[ky + 1][kx + 1];
          }
        }

        const absValue = Math.abs(sum);
        if (absValue > maxGrad) maxGrad = absValue;

        const pixelIdx = (y * width + x) * 4;
        result[pixelIdx] = result[pixelIdx + 1] = result[pixelIdx + 2] = absValue;
        result[pixelIdx + 3] = 255;
      }
    }

    if (maxGrad > 0) {
      for (let i = 0; i < result.length; i += 4) {
        const normalized = (result[i] / maxGrad) * 255;
        result[i] = result[i + 1] = result[i + 2] = normalized;
      }
    }

    this.showResult(new ImageData(result, width, height));
  }

  prewittHorizontal() {
    if (!this.image1) return;

    const { width, height } = this.image1;
    const data = new Uint8ClampedArray(this.image1.data);
    const result = new Uint8ClampedArray(data.length);

    const kernel = [
      [1, 0, -1],
      [1, 0, -1],
      [1, 0, -1]
    ];

    let maxGrad = 0;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let sum = 0;

        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4;
            const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
            sum += gray * kernel[ky + 1][kx + 1];
          }
        }

        const absValue = Math.abs(sum);
        if (absValue > maxGrad) maxGrad = absValue;

        const pixelIdx = (y * width + x) * 4;
        result[pixelIdx] = result[pixelIdx + 1] = result[pixelIdx + 2] = absValue;
        result[pixelIdx + 3] = 255;
      }
    }

    if (maxGrad > 0) {
      for (let i = 0; i < result.length; i += 4) {
        const normalized = (result[i] / maxGrad) * 255;
        result[i] = result[i + 1] = result[i + 2] = normalized;
      }
    }

    this.showResult(new ImageData(result, width, height));
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