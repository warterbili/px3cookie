/**
 * Browser environment builder using JSDOM.
 * Returns { window, dom, document } with browser APIs mocked
 * so PX SDK can run inside Node.js.
 */

'use strict';

const { JSDOM } = require('jsdom');

/**
 * Build a realistic browser environment for PX SDK execution.
 * @param {Object} opts
 * @param {string} opts.targetUrl  - The page URL to simulate
 * @param {string} opts.userAgent  - Browser user agent string
 * @returns {{ window: Window, dom: JSDOM, document: Document }}
 */
function buildEnvironment({ targetUrl, userAgent } = {}) {
  const ua = userAgent || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
  const url = targetUrl || 'https://www.ifood.com.br';

  const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {
    url,
    userAgent: ua,
    pretendToBeVisual: true,
    runScripts: 'dangerously',
    resources: 'usable',
  });

  const window = dom.window;
  const document = window.document;

  // ── Navigator patches ──────────────────────────────────────
  installNavigator(window, ua);

  // ── Screen / display ──────────────────────────────────────
  installScreen(window);

  // ── Performance API ────────────────────────────────────────
  installPerformance(window);

  // ── Canvas (stub) ─────────────────────────────────────────
  installCanvas(window);

  // ── Audio (stub) ──────────────────────────────────────────
  installAudio(window);

  // ── Storage ───────────────────────────────────────────────
  installStorage(window);

  // ── Misc browser APIs ─────────────────────────────────────
  installMisc(window);

  process.stderr.write(`[ENV] Environment built successfully\n`);
  process.stderr.write(`[ENV] Target URL: ${url}\n`);
  process.stderr.write(`[ENV] User-Agent: ${ua.substring(0, 80)}\n`);

  return { window, dom, document };
}


// ── Navigator ─────────────────────────────────────────────────

function installNavigator(window, ua) {
  const nav = window.navigator;

  const overrides = {
    userAgent: ua,
    appVersion: ua.replace('Mozilla/', ''),
    platform: 'MacIntel',
    vendor: 'Google Inc.',
    vendorSub: '',
    product: 'Gecko',
    productSub: '20030107',
    language: 'en-US',
    languages: ['en-US', 'en', 'pt-BR'],
    onLine: true,
    cookieEnabled: true,
    doNotTrack: null,
    maxTouchPoints: 0,
    hardwareConcurrency: 8,
    deviceMemory: 8,
    appCodeName: 'Mozilla',
    appName: 'Netscape',
    pdfViewerEnabled: true,
  };

  for (const [k, v] of Object.entries(overrides)) {
    try {
      Object.defineProperty(nav, k, { get: () => v, configurable: true });
    } catch (_) {}
  }

  // plugins (non-empty to look real)
  try {
    const pluginData = [
      { name: 'PDF Viewer', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
      { name: 'Chrome PDF Viewer', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
      { name: 'Chromium PDF Viewer', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
    ];
    Object.defineProperty(nav, 'plugins', {
      get: () => {
        const arr = pluginData.map(p => ({ ...p, length: 1 }));
        arr.item = (i) => arr[i] || null;
        arr.namedItem = (name) => arr.find(p => p.name === name) || null;
        arr.refresh = () => {};
        return arr;
      },
      configurable: true,
    });
  } catch (_) {}

  // mimeTypes
  try {
    Object.defineProperty(nav, 'mimeTypes', {
      get: () => {
        const arr = [
          { type: 'application/pdf', suffixes: 'pdf', description: 'Portable Document Format' },
          { type: 'text/pdf', suffixes: 'pdf', description: 'Portable Document Format' },
        ];
        arr.item = (i) => arr[i] || null;
        arr.namedItem = (name) => arr.find(m => m.type === name) || null;
        return arr;
      },
      configurable: true,
    });
  } catch (_) {}

  // permissions stub
  if (!nav.permissions) {
    try {
      Object.defineProperty(nav, 'permissions', {
        get: () => ({
          query: async () => ({ state: 'prompt' }),
        }),
        configurable: true,
      });
    } catch (_) {}
  }

  // webdriver = false (anti-bot) — use data property so PX write-test passes
  try {
    Object.defineProperty(nav, 'webdriver', {
      value: false,
      writable: true,
      configurable: true,
    });
  } catch (_) {}

  // connection
  try {
    Object.defineProperty(nav, 'connection', {
      get: () => ({
        effectiveType: '4g',
        rtt: 50,
        downlink: 10,
        saveData: false,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
      }),
      configurable: true,
    });
  } catch (_) {}

  // userAgentData + getHighEntropyValues (main3.js line 1441)
  try {
    Object.defineProperty(nav, 'userAgentData', {
      get: () => ({
        brands: [
          { brand: 'Chromium', version: '131' },
          { brand: 'Not_A Brand', version: '24' },
        ],
        mobile: false,
        platform: 'macOS',
        getHighEntropyValues: async (hints) => ({
          architecture: 'arm',
          bitness: '64',
          brands: [
            { brand: 'Chromium', version: '131.0.6778.265' },
            { brand: 'Not_A Brand', version: '24.0.0.0' },
          ],
          mobile: false,
          model: '',
          platform: 'macOS',
          platformVersion: '14.0.0',
          uaFullVersion: '131.0.6778.265',
        }),
      }),
      configurable: true,
    });
  } catch (_) {}

  process.stderr.write('[NAV] Navigator patches installed\n');
}


// ── Screen ────────────────────────────────────────────────────

function installScreen(window) {
  const screenProps = {
    width: 1920, height: 1080,
    availWidth: 1920, availHeight: 1080,
    availLeft: 0, availTop: 0,
    colorDepth: 24, pixelDepth: 24,
  };
  try {
    for (const [k, v] of Object.entries(screenProps)) {
      Object.defineProperty(window.screen, k, { get: () => v, configurable: true });
    }
  } catch (_) {}

  // devicePixelRatio
  try {
    Object.defineProperty(window, 'devicePixelRatio', { get: () => 2, configurable: true });
  } catch (_) {}

  // innerWidth / innerHeight
  try {
    Object.defineProperty(window, 'innerWidth', { get: () => 1920, configurable: true });
    Object.defineProperty(window, 'innerHeight', { get: () => 1080, configurable: true });
    Object.defineProperty(window, 'outerWidth', { get: () => 1920, configurable: true });
    Object.defineProperty(window, 'outerHeight', { get: () => 1080, configurable: true });
  } catch (_) {}

  process.stderr.write('[SCREEN] Screen/display patches installed\n');
}


// ── Performance ───────────────────────────────────────────────

function installPerformance(window) {
  if (!window.performance) {
    window.performance = {};
  }
  const perf = window.performance;
  const start = Date.now();

  if (!perf.now) perf.now = () => Date.now() - start;
  if (!perf.timeOrigin) perf.timeOrigin = start;
  if (!perf.getEntriesByType) perf.getEntriesByType = () => [];
  if (!perf.getEntriesByName) perf.getEntriesByName = () => [];
  if (!perf.mark) perf.mark = () => {};
  if (!perf.measure) perf.measure = () => {};
  if (!perf.clearMarks) perf.clearMarks = () => {};
  if (!perf.clearMeasures) perf.clearMeasures = () => {};
  if (!perf.navigation) {
    perf.navigation = { type: 0, redirectCount: 0 };
  }
  if (!perf.timing) {
    const t = start - 500;
    perf.timing = {
      navigationStart: t,
      unloadEventStart: 0, unloadEventEnd: 0,
      redirectStart: 0, redirectEnd: 0,
      fetchStart: t + 10,
      domainLookupStart: t + 20, domainLookupEnd: t + 50,
      connectStart: t + 50, connectEnd: t + 100,
      secureConnectionStart: t + 60,
      requestStart: t + 100,
      responseStart: t + 200, responseEnd: t + 300,
      domLoading: t + 310, domInteractive: t + 400,
      domContentLoadedEventStart: t + 410, domContentLoadedEventEnd: t + 420,
      domComplete: t + 500,
      loadEventStart: t + 500, loadEventEnd: t + 510,
    };
  }

  // performance.memory (main3.js line 1449)
  if (!perf.memory) {
    perf.memory = {
      jsHeapSizeLimit: 4294705152,
      totalJSHeapSize: 35839741,
      usedJSHeapSize: 24190824,
    };
  }

  process.stderr.write('[PERF] Performance API installed\n');
}


// ── Canvas ────────────────────────────────────────────────────

function installCanvas(window) {
  // 2D context stub
  const fakeCtx2d = {
    fillRect: () => {},
    clearRect: () => {},
    getImageData: (x, y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h }),
    putImageData: () => {},
    createImageData: () => ({ data: [] }),
    setTransform: () => {},
    drawImage: () => {},
    save: () => {},
    fillText: () => {},
    restore: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    stroke: () => {},
    translate: () => {},
    scale: () => {},
    rotate: () => {},
    arc: () => {},
    fill: () => {},
    measureText: () => ({ width: 10 }),
    transform: () => {},
    rect: () => {},
    clip: () => {},
    createLinearGradient: () => ({ addColorStop: () => {} }),
    createRadialGradient: () => ({ addColorStop: () => {} }),
    createPattern: () => {},
    bezierCurveTo: () => {},
    quadraticCurveTo: () => {},
    arcTo: () => {},
    isPointInPath: () => false,
    canvas: { width: 300, height: 150 },
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 1,
    font: '10px sans-serif',
    textAlign: 'start',
    textBaseline: 'alphabetic',
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
  };

  // WebGL context stub (main3.js line 4739)
  const webglConsts = {
    DEPTH_TEST: 0x0B71, LEQUAL: 0x0203,
    COLOR_BUFFER_BIT: 0x4000, DEPTH_BUFFER_BIT: 0x0100,
    VERTEX_SHADER: 0x8B31, FRAGMENT_SHADER: 0x8B30,
    COMPILE_STATUS: 0x8B81, LINK_STATUS: 0x8B82,
    MAX_TEXTURE_SIZE: 0x0D33, MAX_RENDERBUFFER_SIZE: 0x84E8,
    MAX_VIEWPORT_DIMS: 0x0D3A, MAX_VERTEX_ATTRIBS: 0x8869,
    MAX_VERTEX_UNIFORM_VECTORS: 0x8DFB, MAX_VARYING_VECTORS: 0x8DFC,
    MAX_FRAGMENT_UNIFORM_VECTORS: 0x8DFD, MAX_TEXTURE_IMAGE_UNITS: 0x8872,
    MAX_VERTEX_TEXTURE_IMAGE_UNITS: 0x8B4C, MAX_COMBINED_TEXTURE_IMAGE_UNITS: 0x8B4D,
    RENDERER: 0x1F01, VENDOR: 0x1F00, VERSION: 0x1F02,
    SHADING_LANGUAGE_VERSION: 0x8B8C,
    ALIASED_LINE_WIDTH_RANGE: 0x846E, ALIASED_POINT_SIZE_RANGE: 0x846D,
  };

  const fakeWebGL = {
    ...webglConsts,
    canvas: { width: 300, height: 150 },
    drawingBufferWidth: 300,
    drawingBufferHeight: 150,
    getParameter: (pname) => {
      switch (pname) {
        case 0x1F01: return 'ANGLE (NVIDIA, NVIDIA GeForce GTX 1650 Direct3D11 vs_5_0 ps_5_0)';
        case 0x1F00: return 'Google Inc. (NVIDIA)';
        case 0x1F02: return 'WebGL 1.0 (OpenGL ES 2.0 Chromium)';
        case 0x8B8C: return 'WebGL GLSL ES 1.0 (OpenGL ES GLSL ES 1.0 Chromium)';
        case 0x0D33: return 16384;
        case 0x84E8: return 16384;
        case 0x0D3A: return new Int32Array([32767, 32767]);
        case 0x8869: return 16;
        case 0x8DFB: return 4096;
        case 0x8DFC: return 30;
        case 0x8DFD: return 1024;
        case 0x8872: return 16;
        case 0x8B4C: return 16;
        case 0x8B4D: return 80;
        case 0x846E: return new Float32Array([1, 1]);
        case 0x846D: return new Float32Array([1, 1024]);
        default: return 0;
      }
    },
    getSupportedExtensions: () => [
      'ANGLE_instanced_arrays', 'EXT_blend_minmax', 'EXT_color_buffer_half_float',
      'EXT_disjoint_timer_query', 'EXT_float_blend', 'EXT_frag_depth',
      'EXT_shader_texture_lod', 'EXT_texture_compression_bptc',
      'EXT_texture_filter_anisotropic', 'WEBKIT_EXT_texture_filter_anisotropic',
      'OES_element_index_uint', 'OES_fbo_render_mipmap', 'OES_standard_derivatives',
      'OES_texture_float', 'OES_texture_float_linear', 'OES_texture_half_float',
      'OES_texture_half_float_linear', 'OES_vertex_array_object',
      'WEBGL_color_buffer_float', 'WEBGL_compressed_texture_s3tc',
      'WEBKIT_WEBGL_compressed_texture_s3tc', 'WEBGL_compressed_texture_s3tc_srgb',
      'WEBGL_debug_renderer_info', 'WEBGL_debug_shaders', 'WEBGL_depth_texture',
      'WEBKIT_WEBGL_depth_texture', 'WEBGL_draw_buffers', 'WEBGL_lose_context',
      'WEBKIT_WEBGL_lose_context',
    ],
    getExtension: (name) => {
      if (name === 'WEBGL_debug_renderer_info') {
        return {
          UNMASKED_VENDOR_WEBGL: 0x9245,
          UNMASKED_RENDERER_WEBGL: 0x9246,
        };
      }
      if (name === 'EXT_texture_filter_anisotropic' || name === 'WEBKIT_EXT_texture_filter_anisotropic') {
        return { MAX_TEXTURE_MAX_ANISOTROPY_EXT: 0x84FF };
      }
      return {};
    },
    createShader: () => ({}),
    shaderSource: () => {},
    compileShader: () => {},
    getShaderParameter: () => true,
    createProgram: () => ({}),
    attachShader: () => {},
    linkProgram: () => {},
    getProgramParameter: () => true,
    useProgram: () => {},
    createBuffer: () => ({}),
    bindBuffer: () => {},
    bufferData: () => {},
    enableVertexAttribArray: () => {},
    vertexAttribPointer: () => {},
    getAttribLocation: () => 0,
    getUniformLocation: () => ({}),
    uniform1f: () => {},
    uniform2f: () => {},
    uniform4fv: () => {},
    clearColor: () => {},
    clear: () => {},
    enable: () => {},
    depthFunc: () => {},
    drawArrays: () => {},
    viewport: () => {},
    getShaderInfoLog: () => '',
    getProgramInfoLog: () => '',
    deleteShader: () => {},
    deleteProgram: () => {},
    deleteBuffer: () => {},
    readPixels: () => {},
  };

  // Patch createElement to intercept canvas creation
  const origCreateElement = window.document.createElement.bind(window.document);
  window.document.createElement = function(tag, ...args) {
    const el = origCreateElement(tag, ...args);
    if (tag.toLowerCase() === 'canvas') {
      el.getContext = (type) => {
        if (type === 'webgl' || type === 'experimental-webgl') {
          return fakeWebGL;
        }
        return fakeCtx2d;
      };
      el.toDataURL = () => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      el.toBlob = (cb) => cb(new window.Blob());
    }
    return el;
  };

  process.stderr.write('[CANVAS] Canvas 2D + WebGL mock installed\n');
}


// ── Audio ─────────────────────────────────────────────────────

function installAudio(window) {
  class MockAudioContext {
    constructor() {
      this.sampleRate = 44100;
      this.state = 'suspended';
      this.destination = { maxChannelCount: 2 };
      this.currentTime = 0;
    }
    createOscillator() {
      return {
        type: 'sine', frequency: { value: 440, setValueAtTime: () => {} },
        connect: () => {}, start: () => {}, stop: () => {},
        disconnect: () => {},
      };
    }
    createDynamicsCompressor() {
      return {
        threshold: { value: -24 }, knee: { value: 30 },
        ratio: { value: 12 }, attack: { value: 0.003 }, release: { value: 0.25 },
        connect: () => {}, disconnect: () => {},
        reduction: -20,
      };
    }
    createAnalyser() {
      return {
        fftSize: 2048, frequencyBinCount: 1024,
        connect: () => {}, disconnect: () => {},
        getFloatFrequencyData: () => {},
      };
    }
    createGain() { return { gain: { value: 1, setValueAtTime: () => {} }, connect: () => {}, disconnect: () => {} }; }
    createScriptProcessor() { return { connect: () => {}, disconnect: () => {}, onaudioprocess: null }; }
    createBuffer() { return { getChannelData: () => new Float32Array(128) }; }
    createBufferSource() { return { buffer: null, connect: () => {}, start: () => {}, stop: () => {}, onended: null, loop: false }; }
    decodeAudioData(buf, cb) { if (cb) cb({ duration: 0, length: 0, numberOfChannels: 1, sampleRate: 44100, getChannelData: () => new Float32Array() }); }
    resume() { return Promise.resolve(); }
    suspend() { return Promise.resolve(); }
    close() { return Promise.resolve(); }
  }

  // OfflineAudioContext (main3.js line 7510)
  class MockOfflineAudioContext extends MockAudioContext {
    constructor(channels, length, sampleRate) {
      super();
      this.length = length || 44100;
      this.sampleRate = sampleRate || 44100;
      this.oncomplete = null;
    }
    startRendering() {
      const buffer = {
        duration: this.length / this.sampleRate,
        length: this.length,
        numberOfChannels: 1,
        sampleRate: this.sampleRate,
        getChannelData: () => {
          // Return deterministic audio fingerprint data
          const data = new Float32Array(this.length);
          for (let i = 0; i < data.length; i++) {
            data[i] = Math.sin(i * 0.01) * 0.001;
          }
          return data;
        },
      };
      if (this.oncomplete) {
        setTimeout(() => this.oncomplete({ renderedBuffer: buffer }), 10);
      }
      return Promise.resolve(buffer);
    }
  }

  try {
    window.AudioContext = MockAudioContext;
    window.webkitAudioContext = MockAudioContext;
    window.OfflineAudioContext = MockOfflineAudioContext;
    window.webkitOfflineAudioContext = MockOfflineAudioContext;
  } catch (_) {}

  process.stderr.write('[AUDIO] AudioContext + OfflineAudioContext mock installed\n');
}


// ── Storage ───────────────────────────────────────────────────

function installStorage(window) {
  class MockStorage {
    constructor() { this._data = {}; }
    get length() { return Object.keys(this._data).length; }
    key(n) { return Object.keys(this._data)[n] || null; }
    getItem(k) { return this._data[k] !== undefined ? this._data[k] : null; }
    setItem(k, v) { this._data[k] = String(v); }
    removeItem(k) { delete this._data[k]; }
    clear() { this._data = {}; }
  }

  const ls = new MockStorage();
  const ss = new MockStorage();

  try {
    Object.defineProperty(window, 'localStorage', { get: () => ls, configurable: true });
    Object.defineProperty(window, 'sessionStorage', { get: () => ss, configurable: true });
  } catch (_) {}

  process.stderr.write('[STORAGE] localStorage/sessionStorage installed\n');
}


// ── Misc browser APIs ─────────────────────────────────────────

function installMisc(window) {
  // requestAnimationFrame
  if (!window.requestAnimationFrame) {
    let rafId = 0;
    window.requestAnimationFrame = (cb) => { setTimeout(() => cb(Date.now()), 16); return ++rafId; };
    window.cancelAnimationFrame = (id) => { clearTimeout(id); };
  }

  // crypto.getRandomValues
  if (!window.crypto) window.crypto = {};
  if (!window.crypto.getRandomValues) {
    window.crypto.getRandomValues = (arr) => {
      const { randomFillSync } = require('crypto');
      return randomFillSync(arr);
    };
  }
  if (!window.crypto.subtle) {
    window.crypto.subtle = {
      digest: async (algo, data) => {
        const { createHash } = require('crypto');
        const name = (algo.name || algo).replace('-', '').toLowerCase();
        const h = createHash(name);
        h.update(Buffer.from(data));
        return h.digest().buffer;
      },
    };
  }

  // matchMedia
  if (!window.matchMedia) {
    window.matchMedia = (q) => ({
      matches: false, media: q, onchange: null,
      addListener: () => {}, removeListener: () => {},
      addEventListener: () => {}, removeEventListener: () => {},
      dispatchEvent: () => false,
    });
  }

  // IntersectionObserver stub
  if (!window.IntersectionObserver) {
    window.IntersectionObserver = class {
      constructor(cb) { this.cb = cb; }
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }

  // ResizeObserver stub
  if (!window.ResizeObserver) {
    window.ResizeObserver = class {
      constructor(cb) { this.cb = cb; }
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }

  // MutationObserver (JSDOM has it, just ensure)
  if (!window.MutationObserver) {
    window.MutationObserver = class {
      constructor(cb) { this._cb = cb; }
      observe() {}
      disconnect() {}
      takeRecords() { return []; }
    };
  }

  // History stub
  if (!window.history) {
    window.history = { pushState: () => {}, replaceState: () => {}, back: () => {}, forward: () => {}, go: () => {}, length: 1, state: null };
  }

  // Notification stub
  if (!window.Notification) {
    window.Notification = class { static permission = 'denied'; static requestPermission = async () => 'denied'; };
  }

  // PerformanceObserver
  if (!window.PerformanceObserver) {
    window.PerformanceObserver = class {
      constructor(cb) { this._cb = cb; }
      observe() {}
      disconnect() {}
    };
  }

  // requestIdleCallback
  if (!window.requestIdleCallback) {
    window.requestIdleCallback = (cb) => setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 50 }), 1);
    window.cancelIdleCallback = (id) => clearTimeout(id);
  }

  // visualViewport
  if (!window.visualViewport) {
    window.visualViewport = {
      width: 1920, height: 1080, offsetLeft: 0, offsetTop: 0,
      pageLeft: 0, pageTop: 0, scale: 1,
      addEventListener: () => {}, removeEventListener: () => {},
    };
  }

  // document extras
  try {
    Object.defineProperty(window.document, 'hidden', { get: () => false, configurable: true });
    Object.defineProperty(window.document, 'visibilityState', { get: () => 'visible', configurable: true });
  } catch (_) {}
  if (!window.document.hasFocus) {
    window.document.hasFocus = () => true;
  }

  // speechSynthesis
  if (!window.speechSynthesis) {
    window.speechSynthesis = { getVoices: () => [], speak: () => {}, cancel: () => {}, pause: () => {}, resume: () => {} };
  }

  // indexedDB stub
  if (!window.indexedDB) {
    window.indexedDB = { open: () => ({ result: null, onerror: null, onsuccess: null }) };
  }

  // Worker stub
  if (!window.Worker) {
    window.Worker = class { constructor() {} postMessage() {} terminate() {} };
  }

  // chrome object (anti-bot)
  if (!window.chrome) {
    window.chrome = {
      app: { isInstalled: false, InstallState: { DISABLED: 'disabled', INSTALLED: 'installed', NOT_INSTALLED: 'not_installed' }, RunningState: { CANNOT_RUN: 'cannot_run', READY_TO_RUN: 'ready_to_run', RUNNING: 'running' } },
      runtime: { OnInstalledReason: { CHROME_UPDATE: 'chrome_update', INSTALL: 'install', SHARED_MODULE_UPDATE: 'shared_module_update', UPDATE: 'update' }, PlatformOs: { ANDROID: 'android', CROS: 'cros', LINUX: 'linux', MAC: 'mac', OPENBSD: 'openbsd', WIN: 'win' }, RequestUpdateCheckStatus: { NO_UPDATE: 'no_update', THROTTLED: 'throttled', UPDATE_AVAILABLE: 'update_available' }, connect: () => {}, sendMessage: () => {} },
      csi: () => ({}),
      loadTimes: () => ({ commitLoadTime: Date.now() / 1000, connectionInfo: 'h2', finishDocumentLoadTime: Date.now() / 1000, finishLoadTime: Date.now() / 1000, firstPaintAfterLoadTime: 0, firstPaintTime: Date.now() / 1000, navigationType: 'Other', npnNegotiatedProtocol: 'h2', requestTime: Date.now() / 1000, startLoadTime: Date.now() / 1000, wasAlternateProtocolAvailable: false, wasFetchedViaSpdy: true, wasNpnNegotiated: true }),
    };
  }

  process.stderr.write('[MISC] Misc browser APIs installed\n');
}


module.exports = { buildEnvironment };
