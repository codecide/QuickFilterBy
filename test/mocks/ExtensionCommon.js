/**
 * ExtensionCommon API mocks for testing
 *
 * This file provides comprehensive mocks for the ExtensionCommon APIs
 * used by the QuickFilterBy extension, including ExtensionAPI,
 * EventManager, EventEmitter, and other utility functions.
 */

/**
 * Mock EventManager
 */
class EventManager {
  constructor(context, name, event, register) {
    this.context = context;
    this.name = name;
    this.event = event;
    this.register = register;
    this.unregister = null;
    this.listeners = new Set();
    this.initialized = false;
  }

  addListener(callback, ...args) {
    this.listeners.add(callback);
    return this.register(callback, ...args);
  }

  removeListener(callback) {
    this.listeners.delete(callback);
    if (this.unregister) {
      this.unregister();
      this.unregister = null;
    }
  }

  hasListener(callback) {
    return this.listeners.has(callback);
  }

  revoke() {
    if (this.unregister) {
      this.unregister();
      this.unregister = null;
    }
    this.listeners.clear();
  }
}

/**
 * Mock EventEmitter
 */
class EventEmitter {
  constructor() {
    this.listeners = new Map();
  }

  addListener(event, listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(listener);
    return listener;
  }

  removeListener(event, listener) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(listener);
    }
  }

  hasListener(event, listener) {
    return this.listeners.has(event) && this.listeners.get(event).has(listener);
  }

  emit(event, ...args) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((listener) => {
        try {
          listener(...args);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  once(event, listener) {
    const wrapper = (...args) => {
      this.removeListener(event, wrapper);
      listener(...args);
    };
    return this.addListener(event, wrapper);
  }

  removeAllListeners(event) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  listenerCount(event) {
    return this.listeners.has(event) ? this.listeners.get(event).size : 0;
  }
}

/**
 * Mock ExtensionAPI
 */
class ExtensionAPI {
  constructor(extension) {
    this.extension = extension;
    this.apiManager = extension.apiManager;
    this.context = {
      extension: extension,
      cloneScope: {},
      canAccessContainer: jest.fn().mockReturnValue(true),
      callOnClose: jest.fn(),
      ignoreClose: jest.fn(),
    };
    this.api = null;
  }

  getAPI(context) {
    if (!this.api) {
      this.api = this.buildAPI(context || this.context);
    }
    return this.api;
  }

  buildAPI(context) {
    return {};
  }

  onShutdown(reason) {
    // Override in subclasses
  }
}

/**
 * Mock ExtensionCommon module
 */
const ExtensionCommonMock = {
  ExtensionAPI,
  EventManager,
  EventEmitter,

  /**
   * Make a public API
   */
  makePublicAPI: (api) => {
    return api;
  },

  /**
   * Ignore event context
   */
  ignoreEventContext: () => {
    return true;
  },

  /**
   * Singleton context
   */
  SingletonEventManager: class {
    constructor(context, name, event, register) {
      this.context = context;
      this.name = name;
      this.event = event;
      this.register = register;
      this.unregister = null;
    }

    addListener(callback, ...args) {
      if (this.unregister) {
        this.unregister();
      }
      this.unregister = this.register(callback, ...args);
    }

    removeListener(callback) {
      if (this.unregister) {
        this.unregister();
        this.unregister = null;
      }
    }

    hasListener(callback) {
      return this.unregister !== null;
    }

    revoke() {
      if (this.unregister) {
        this.unregister();
        this.unregister = null;
      }
    }
  },

  /**
   * Event class for managing listeners
   */
  Event: class {
    constructor() {
      this.eventEmitter = new EventEmitter();
      this.manager = null;
    }

    addListener(callback, ...args) {
      return this.eventEmitter.addListener('fire', callback);
    }

    removeListener(callback) {
      this.eventEmitter.removeListener('fire', callback);
    }

    hasListener(callback) {
      return this.eventEmitter.hasListener('fire', callback);
    }

    emit(...args) {
      this.eventEmitter.emit('fire', ...args);
    }

    revoke() {
      this.eventEmitter.removeAllListeners();
    }
  },

  /**
   * Input class for user input handling
   */
  Input: class {
    constructor(context, details) {
      this.context = context;
      this.details = details;
    }

    validate() {
      return true;
    }

    cancel() {
      // Cancel input
    }
  },
};

/**
 * Mock Services for Thunderbird-specific APIs
 */
const ServicesMock = {
  obs: {
    addObserver: jest.fn(),
    removeObserver: jest.fn(),
    notifyObservers: jest.fn(),
  },
  prefs: {
    getBoolPref: jest.fn().mockReturnValue(false),
    setBoolPref: jest.fn(),
    getIntPref: jest.fn().mockReturnValue(0),
    setIntPref: jest.fn(),
    getCharPref: jest.fn().mockReturnValue(''),
    setCharPref: jest.fn(),
    addObserver: jest.fn(),
    removeObserver: jest.fn(),
  },
  io: {
    newURI: jest.fn().mockReturnValue({
      spec: 'http://example.com',
    }),
    newFileURI: jest.fn().mockReturnValue({
      spec: 'file:///path/to/file',
    }),
  },
  appinfo: {
    name: 'Thunderbird',
    version: '128.0.0',
    platformVersion: '128.0',
  },
  startup: {
    getStartupInfo: jest.fn().mockReturnValue({}),
  },
  console: {
    logStringMessage: jest.fn(),
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
  wm: {
    getMostRecentWindow: jest.fn().mockReturnValue({
      document: {},
      location: 'about:3pane',
    }),
  },
  strings: {
    createBundle: jest.fn().mockReturnValue({
      GetStringFromName: jest.fn().mockReturnValue('Test String'),
      formatStringFromName: jest.fn().mockReturnValue('Formatted String'),
    }),
  },
  timer: {
    setTimeout: jest.fn((callback, delay) => setTimeout(callback, delay)),
    setInterval: jest.fn((callback, delay) => setInterval(callback, delay)),
    clearTimeout: jest.fn((id) => clearTimeout(id)),
    clearInterval: jest.fn((id) => clearInterval(id)),
  },
};

/**
 * Mock Cu (Components.utils)
 */
const CuMock = {
  import: jest.fn((path) => {
    return {};
  }),
  reportError: jest.fn(),
  getGlobalForObject: jest.fn((obj) => {
    return global;
  }),
  cloneInto: jest.fn((obj) => {
    return JSON.parse(JSON.stringify(obj));
  }),
};

/**
 * Mock Cc (Components.classes)
 */
const CcMock = new Proxy({}, {
  get: (target, prop) => {
    return {
      getService: jest.fn(() => {
        return ServicesMock;
      }),
      createInstance: jest.fn(() => {
        return ServicesMock;
      }),
    };
  },
});

/**
 * Mock Ci (Components.interfaces)
 */
const CiMock = {
  nsIObserver: 'nsIObserver',
  nsISupports: 'nsISupports',
  nsIPrefBranch: 'nsIPrefBranch',
  nsIURI: 'nsIURI',
  nsIFile: 'nsIFile',
  nsITimer: 'nsITimer',
};

// Make ExtensionCommon available globally for tests
global.ExtensionCommon = ExtensionCommonMock;
global.Services = ServicesMock;
global.Cu = CuMock;
global.Cc = CcMock;
global.Ci = CiMock;

// Helper to reset mocks
ExtensionCommonMock._resetMocks = () => {
  jest.clearAllMocks();
  Object.values(ServicesMock.obs).forEach((mock) => {
    if (jest.isMockFunction(mock)) mock.mockClear();
  });
  Object.values(ServicesMock.prefs).forEach((mock) => {
    if (jest.isMockFunction(mock)) mock.mockClear();
  });
};

module.exports = {
  ExtensionCommon: ExtensionCommonMock,
  Services: ServicesMock,
  Cu: CuMock,
  Cc: CcMock,
  Ci: CiMock,
};
