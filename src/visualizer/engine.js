/**
 * VisualizerEngine — Core animation engine for CodeVisual AI
 * Handles playback controls, timing, HiDPI canvas, and delegates rendering
 * to the active visualizer module.
 */
export class VisualizerEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.steps = [];
    this.currentStep = 0;
    this.isPlaying = false;
    this.speed = 1; // 0.5x, 1x, 1.5x, 2x
    this.animationFrame = null;
    this.onStepChange = null; // callback
    this.currentVisualizer = null;
    this.interpolation = 0; // 0-1 for smooth transitions
    this.dpr = window.devicePixelRatio || 1;
    this.lastTimestamp = 0;
    this.stepDuration = 1000; // base ms per step
    this.elapsed = 0;

    this._resizeObserver = null;
    this._boundResize = this.resize.bind(this);
    this.resize();
    this._initResizeObserver();
  }

  /* ------------------------------------------------------------------ */
  /*  Initialization helpers                                            */
  /* ------------------------------------------------------------------ */

  _initResizeObserver() {
    if (typeof ResizeObserver !== 'undefined') {
      this._resizeObserver = new ResizeObserver(() => this.resize());
      this._resizeObserver.observe(this.canvas.parentElement || this.canvas);
    } else {
      window.addEventListener('resize', this._boundResize);
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Visualizer & step management                                      */
  /* ------------------------------------------------------------------ */

  setVisualizer(visualizer) {
    this.currentVisualizer = visualizer;
    this.steps = [];
    this.currentStep = 0;
    this.isPlaying = false;
    this.interpolation = 0;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    this.render();
  }

  loadSteps(steps) {
    this.steps = steps;
    this.currentStep = 0;
    this.interpolation = 0;
    this.elapsed = 0;
    this.render();
    this._notifyStepChange();
  }

  /* ------------------------------------------------------------------ */
  /*  Playback controls                                                 */
  /* ------------------------------------------------------------------ */

  play() {
    if (this.steps.length === 0) return;
    if (this.currentStep >= this.steps.length - 1) {
      this.currentStep = 0;
      this.interpolation = 0;
      this.elapsed = 0;
    }
    this.isPlaying = true;
    this.lastTimestamp = performance.now();
    this._animate();
  }

  pause() {
    this.isPlaying = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  stepForward() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.interpolation = 0;
      this.elapsed = 0;
      this.render();
      this._notifyStepChange();
    }
  }

  stepBack() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.interpolation = 0;
      this.elapsed = 0;
      this.render();
      this._notifyStepChange();
    }
  }

  reset() {
    this.currentStep = 0;
    this.isPlaying = false;
    this.interpolation = 0;
    this.elapsed = 0;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    this.render();
    this._notifyStepChange();
  }

  goToStep(n) {
    if (n >= 0 && n < this.steps.length) {
      this.currentStep = n;
      this.interpolation = 0;
      this.elapsed = 0;
      this.render();
      this._notifyStepChange();
    }
  }

  setSpeed(speed) {
    this.speed = speed;
  }

  /* ------------------------------------------------------------------ */
  /*  Queries                                                           */
  /* ------------------------------------------------------------------ */

  getProgress() {
    if (this.steps.length <= 1) return 0;
    return this.currentStep / (this.steps.length - 1);
  }

  getCurrentStep() {
    if (this.steps.length === 0) return null;
    return this.steps[this.currentStep];
  }

  getTotalSteps() {
    return this.steps.length;
  }

  /* ------------------------------------------------------------------ */
  /*  Animation loop                                                    */
  /* ------------------------------------------------------------------ */

  _animate() {
    if (!this.isPlaying) return;

    const now = performance.now();
    const delta = now - this.lastTimestamp;
    this.lastTimestamp = now;

    const effectiveDuration = this.stepDuration / this.speed;
    this.elapsed += delta;
    this.interpolation = Math.min(this.elapsed / effectiveDuration, 1);

    this.render();

    if (this.interpolation >= 1) {
      this.interpolation = 0;
      this.elapsed = 0;

      if (this.currentStep < this.steps.length - 1) {
        this.currentStep++;
        this._notifyStepChange();
      } else {
        this.isPlaying = false;
        this._notifyStepChange();
        return;
      }
    }

    this.animationFrame = requestAnimationFrame(() => this._animate());
  }

  /* ------------------------------------------------------------------ */
  /*  Rendering                                                         */
  /* ------------------------------------------------------------------ */

  render() {
    const ctx = this.ctx;
    const canvas = this.canvas;
    const width = canvas.width / this.dpr;
    const height = canvas.height / this.dpr;

    ctx.save();
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // Clear with transparent background so the page bg shows through
    ctx.clearRect(0, 0, width, height);

    if (this.steps.length === 0 || !this.currentVisualizer) {
      // Empty-state message
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '16px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        'Select an algorithm and click Play to begin',
        width / 2,
        height / 2,
      );
      ctx.restore();
      return;
    }

    const step = this.steps[this.currentStep];
    const nextStep =
      this.currentStep < this.steps.length - 1
        ? this.steps[this.currentStep + 1]
        : null;

    this.currentVisualizer.render(ctx, step, width, height, {
      interpolation: this.interpolation,
      nextStep: nextStep,
      stepIndex: this.currentStep,
      totalSteps: this.steps.length,
    });

    ctx.restore();
  }

  /* ------------------------------------------------------------------ */
  /*  Resize handling                                                   */
  /* ------------------------------------------------------------------ */

  resize() {
    const canvas = this.canvas;
    const parent = canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 450;

    this.dpr = window.devicePixelRatio || 1;
    canvas.width = width * this.dpr;
    canvas.height = height * this.dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    this.render();
  }

  /* ------------------------------------------------------------------ */
  /*  Cleanup                                                           */
  /* ------------------------------------------------------------------ */

  destroy() {
    this.isPlaying = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    } else {
      window.removeEventListener('resize', this._boundResize);
    }
    this.steps = [];
    this.currentVisualizer = null;
    this.onStepChange = null;
  }

  /* ------------------------------------------------------------------ */
  /*  Internal helpers                                                  */
  /* ------------------------------------------------------------------ */

  _notifyStepChange() {
    if (this.onStepChange && this.steps.length > 0) {
      this.onStepChange({
        step: this.steps[this.currentStep],
        index: this.currentStep,
        total: this.steps.length,
        isPlaying: this.isPlaying,
      });
    }
  }
}
