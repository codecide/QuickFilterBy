/**
 * WebExtension API mocks for testing
 *
 * This file provides comprehensive mocks for the WebExtension APIs
 * used by the QuickFilterBy extension, including browser.menus,
 * browser.mailTabs, browser.storage, browser.tabs, and browser.runtime.
 */

/**
 * Mock browser.menus API
 */
const menusMock = {
  create: jest.fn().mockImplementation((createProperties) => {
    const menuId = createProperties.id || `menu-${Math.random().toString(36).substr(2, 9)}`;
    return Promise.resolve(menuId);
  }),
  update: jest.fn().mockResolvedValue(undefined),
  remove: jest.fn().mockResolvedValue(undefined),
  removeAll: jest.fn().mockResolvedValue(undefined),
  onClicked: {
    addListener: jest.fn(),
    removeListener: jest.fn(),
    hasListener: jest.fn(),
  },
  onShown: {
    addListener: jest.fn(),
    removeListener: jest.fn(),
    hasListener: jest.fn(),
  },
  onHidden: {
    addListener: jest.fn(),
    removeListener: jest.fn(),
    hasListener: jest.fn(),
  },
};

/**
 * Mock browser.mailTabs API
 */
const mailTabsMock = {
  setQuickFilter: jest.fn().mockResolvedValue(undefined),
  getSelectedMessages: jest.fn().mockResolvedValue({
    messages: [],
  }),
  listSelectedMessages: jest.fn().mockResolvedValue({
    messages: [],
  }),
  onDisplayedFolderChanged: {
    addListener: jest.fn(),
    removeListener: jest.fn(),
    hasListener: jest.fn(),
  },
  onSelectedMessagesChanged: {
    addListener: jest.fn(),
    removeListener: jest.fn(),
    hasListener: jest.fn(),
  },
};

/**
 * Mock browser.storage API
 */
const storageMockData = {
  local: {},
  sync: {},
  managed: {},
};

const storageLocalMock = {
  get: jest.fn().mockImplementation((keys) => {
    if (keys === null || keys === undefined) {
      return Promise.resolve({ ...storageMockData.local });
    }
    if (Array.isArray(keys)) {
      const result = {};
      keys.forEach((key) => {
        if (storageMockData.local.hasOwnProperty(key)) {
          result[key] = storageMockData.local[key];
        }
      });
      return Promise.resolve(result);
    }
    if (typeof keys === 'string') {
      return Promise.resolve({ [keys]: storageMockData.local[keys] });
    }
    if (typeof keys === 'object') {
      const result = {};
      Object.keys(keys).forEach((key) => {
        if (storageMockData.local.hasOwnProperty(key)) {
          result[key] = storageMockData.local[key];
        } else {
          result[key] = keys[key];
        }
      });
      return Promise.resolve(result);
    }
    return Promise.resolve({});
  }),
  set: jest.fn().mockImplementation((items) => {
    Object.assign(storageMockData.local, items);
    return Promise.resolve(undefined);
  }),
  remove: jest.fn().mockImplementation((keys) => {
    if (Array.isArray(keys)) {
      keys.forEach((key) => delete storageMockData.local[key]);
    } else {
      delete storageMockData.local[keys];
    }
    return Promise.resolve(undefined);
  }),
  clear: jest.fn().mockImplementation(() => {
    storageMockData.local = {};
    return Promise.resolve(undefined);
  }),
  onChanged: {
    addListener: jest.fn(),
    removeListener: jest.fn(),
    hasListener: jest.fn(),
  },
  getBytesInUse: jest.fn().mockResolvedValue(0),
};

const storageSyncMock = {
  get: jest.fn().mockImplementation((keys) => {
    if (keys === null || keys === undefined) {
      return Promise.resolve({ ...storageMockData.sync });
    }
    if (Array.isArray(keys)) {
      const result = {};
      keys.forEach((key) => {
        if (storageMockData.sync.hasOwnProperty(key)) {
          result[key] = storageMockData.sync[key];
        }
      });
      return Promise.resolve(result);
    }
    if (typeof keys === 'string') {
      return Promise.resolve({ [keys]: storageMockData.sync[keys] });
    }
    if (typeof keys === 'object') {
      const result = {};
      Object.keys(keys).forEach((key) => {
        if (storageMockData.sync.hasOwnProperty(key)) {
          result[key] = storageMockData.sync[key];
        } else {
          result[key] = keys[key];
        }
      });
      return Promise.resolve(result);
    }
    return Promise.resolve({});
  }),
  set: jest.fn().mockImplementation((items) => {
    Object.assign(storageMockData.sync, items);
    return Promise.resolve(undefined);
  }),
  remove: jest.fn().mockImplementation((keys) => {
    if (Array.isArray(keys)) {
      keys.forEach((key) => delete storageMockData.sync[key]);
    } else {
      delete storageMockData.sync[keys];
    }
    return Promise.resolve(undefined);
  }),
  clear: jest.fn().mockImplementation(() => {
    storageMockData.sync = {};
    return Promise.resolve(undefined);
  }),
  onChanged: {
    addListener: jest.fn(),
    removeListener: jest.fn(),
    hasListener: jest.fn(),
  },
  getBytesInUse: jest.fn().mockResolvedValue(0),
  QUOTA_BYTES: 102400,
  QUOTA_BYTES_PER_ITEM: 8192,
  MAX_ITEMS: 512,
};

const storageManagedMock = {
  get: jest.fn().mockResolvedValue({}),
  onChanged: {
    addListener: jest.fn(),
    removeListener: jest.fn(),
    hasListener: jest.fn(),
  },
};

const storageMock = {
  local: storageLocalMock,
  sync: storageSyncMock,
  managed: storageManagedMock,
  onChanged: {
    addListener: jest.fn(),
    removeListener: jest.fn(),
    hasListener: jest.fn(),
    removeAllListeners: jest.fn(),
  },
  // Helper to clear mock data
  _clear: () => {
    storageMockData.local = {};
    storageMockData.sync = {};
    storageMockData.managed = {};
  },
  // Helper to set mock data
  _set: (area, data) => {
    storageMockData[area] = { ...data };
  },
  // Helper to get mock data
  _get: (area) => {
    return { ...storageMockData[area] };
  },
};

/**
 * Mock browser.tabs API
 */
const tabsMock = {
  query: jest.fn().mockResolvedValue([
    {
      id: 1,
      url: 'about:3pane',
      active: true,
      windowId: 1,
    },
  ]),
  get: jest.fn().mockImplementation((tabId) => {
    return Promise.resolve({
      id: tabId,
      url: 'about:3pane',
      active: true,
      windowId: 1,
    });
  }),
  create: jest.fn().mockResolvedValue({
    id: 2,
    url: 'about:3pane',
    active: true,
    windowId: 1,
  }),
  update: jest.fn().mockResolvedValue(undefined),
  remove: jest.fn().mockResolvedValue(undefined),
  onActivated: {
    addListener: jest.fn(),
    removeListener: jest.fn(),
    hasListener: jest.fn(),
  },
  onUpdated: {
    addListener: jest.fn(),
    removeListener: jest.fn(),
    hasListener: jest.fn(),
  },
  onRemoved: {
    addListener: jest.fn(),
    removeListener: jest.fn(),
    hasListener: jest.fn(),
  },
};

/**
 * Mock browser.runtime API
 */
const runtimeMock = {
  getManifest: jest.fn().mockReturnValue({
    name: 'QuickFilterBy',
    version: '14.0.0',
    manifest_version: 2,
  }),
  getBrowserInfo: jest.fn().mockResolvedValue({
    name: 'Thunderbird',
    vendor: 'Mozilla',
    version: '128.0.0',
    buildID: '20240101000000',
  }),
  getURL: jest.fn((path) => `moz-extension://test-uuid/${path}`),
  getPlatformInfo: jest.fn().mockResolvedValue({
    os: 'linux',
    arch: 'x86-64',
    nacl_arch: 'x86-64',
  }),
  openOptionsPage: jest.fn().mockResolvedValue(undefined),
  reload: jest.fn(),
  onStartup: {
    addListener: jest.fn(),
    removeListener: jest.fn(),
    hasListener: jest.fn(),
  },
  onInstalled: {
    addListener: jest.fn(),
    removeListener: jest.fn(),
    hasListener: jest.fn(),
  },
  onUpdateAvailable: {
    addListener: jest.fn(),
    removeListener: jest.fn(),
    hasListener: jest.fn(),
  },
  onSuspend: {
    addListener: jest.fn(),
    removeListener: jest.fn(),
    hasListener: jest.fn(),
  },
  onSuspendCanceled: {
    addListener: jest.fn(),
    removeListener: jest.fn(),
    hasListener: jest.fn(),
  },
  sendMessage: jest.fn().mockResolvedValue(undefined),
  connect: jest.fn().mockReturnValue({
    name: 'test-port',
    disconnect: jest.fn(),
    postMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
      hasListener: jest.fn(),
    },
    onDisconnect: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
      hasListener: jest.fn(),
    },
  }),
  onMessage: {
    addListener: jest.fn(),
    removeListener: jest.fn(),
    hasListener: jest.fn(),
  },
  id: 'test-extension-id@quickfilter',
  lastError: null,
};

/**
 * Mock browser.notifications API
 */
const notificationsMock = {
  create: jest.fn().mockImplementation((notificationId, options) => {
    const id = notificationId || `notification-${Math.random().toString(36).substr(2, 9)}`;
    return Promise.resolve(id);
  }),
  update: jest.fn().mockResolvedValue(false),
  clear: jest.fn().mockResolvedValue(true),
  getAll: jest.fn().mockResolvedValue({}),
  onButtonClicked: {
    addListener: jest.fn(),
    removeListener: jest.fn(),
    hasListener: jest.fn(),
  },
  onClicked: {
    addListener: jest.fn(),
    removeListener: jest.fn(),
    hasListener: jest.fn(),
  },
  onClosed: {
    addListener: jest.fn(),
    removeListener: jest.fn(),
    hasListener: jest.fn(),
  },
  onShown: {
    addListener: jest.fn(),
    removeListener: jest.fn(),
    hasListener: jest.fn(),
  },
};

/**
 * Mock browser.commands API
 */
const commandsMock = {
  getAll: jest.fn().mockResolvedValue([]),
  onCommand: {
    addListener: jest.fn(),
    removeListener: jest.fn(),
    hasListener: jest.fn(),
  },
};

/**
 * Complete browser object mock
 */
const browserMock = {
  menus: menusMock,
  mailTabs: mailTabsMock,
  storage: storageMock,
  tabs: tabsMock,
  runtime: runtimeMock,
  notifications: notificationsMock,
  commands: commandsMock,
};

// Make browser available globally for tests
global.browser = browserMock;

// Helper functions to reset mocks
browserMock._resetMocks = () => {
  Object.values(menusMock).forEach((mock) => {
    if (jest.isMockFunction(mock)) mock.mockClear();
  });
  Object.values(mailTabsMock).forEach((mock) => {
    if (jest.isMockFunction(mock)) mock.mockClear();
  });
  Object.values(storageMock).forEach((mock) => {
    if (typeof mock === 'object' && mock !== null) {
      Object.values(mock).forEach((nestedMock) => {
        if (jest.isMockFunction(nestedMock)) nestedMock.mockClear();
      });
    }
  });
  Object.values(tabsMock).forEach((mock) => {
    if (jest.isMockFunction(mock)) mock.mockClear();
  });
  Object.values(runtimeMock).forEach((mock) => {
    if (jest.isMockFunction(mock)) mock.mockClear();
  });
  Object.values(notificationsMock).forEach((mock) => {
    if (jest.isMockFunction(mock)) mock.mockClear();
  });
  Object.values(commandsMock).forEach((mock) => {
    if (jest.isMockFunction(mock)) mock.mockClear();
  });
  storageMock._clear();
};

module.exports = browserMock;
