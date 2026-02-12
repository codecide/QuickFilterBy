/**
 * Unit tests for src/utils/dom.js
 */

global.MutationObserver = class MockMutationObserver {
  constructor(callback) { this.callback = callback; this.observe = jest.fn(); this.disconnect = jest.fn(); }
  simulateMutations(mutations) { this.callback(mutations, this); }
};

global.window = {
  document: {
    querySelector: jest.fn(),
    querySelectorAll: jest.fn(() => []),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  },
  threadPane: { treeTable: null },
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  matchMedia: jest.fn(() => ({
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  }))
};
global.Node = { ELEMENT_NODE: 1 };
global.console = { log: jest.fn(), warn: jest.fn(), error: jest.fn(), info: jest.fn() };

const dom = require('../../src/utils/dom');

describe('dom.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    dom.clearColumnCache();
    window.matchMedia.mockReturnValue({
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    dom.cleanup();
  });

  describe('findElement', () => {
    it('should find element on first attempt', async () => {
      const el = { id: 'test' };
      window.document.querySelector.mockReturnValue(el);
      const result = await dom.findElement(window, '#test');
      expect(result).toBe(el);
    });

    it('should retry when element not immediately available', async () => {
      window.document.querySelector
        .mockReturnValueOnce(null)
        .mockReturnValueOnce({ id: 'found' });

      const promise = dom.findElement(window, '#test', { maxRetries: 3, retryDelay: 100 });
      jest.advanceTimersByTime(200);
      const result = await promise;
      expect(result).toEqual({ id: 'found' });
    });
  });

  describe('findElements', () => {
    it('should find multiple elements', () => {
      const els = [{ id: '1' }, { id: '2' }];
      window.document.querySelectorAll.mockReturnValue(els);
      expect(dom.findElements(window, '.test')).toEqual(els);
    });

    it('should handle empty results', () => {
      window.document.querySelectorAll.mockReturnValue([]);
      expect(dom.findElements(window, '.test')).toEqual([]);
    });
  });

  describe('getColumnType', () => {
    it('should identify known column types', () => {
      expect(dom.getColumnType('subjectcol-column')).toBe('subject');
      expect(dom.getColumnType('recipientcol-column')).toBe('recipient');
      expect(dom.getColumnType('sendercol-column')).toBe('sender');
      expect(dom.getColumnType('correspondentcol-column')).toBe('correspondent');
    });

    it('should return null for unknown columns', () => {
      expect(dom.getColumnType('unknown-column')).toBeNull();
      expect(dom.getColumnType(null)).toBeNull();
      expect(dom.getColumnType('')).toBeNull();
    });
  });

  describe('discoverColumns', () => {
    it('should discover column mapping from DOM headers', async () => {
      const mockHeaders = [
        { classList: ['correspondentcol-column', 'headerCell'] },
        { classList: ['subjectcol-column', 'headerCell'] },
      ];
      window.document.querySelectorAll.mockReturnValue(mockHeaders);

      const mapping = await dom.discoverColumns(window);
      expect(mapping.correspondent).toBe('correspondentcol-column');
      expect(mapping.subject).toBe('subjectcol-column');
    });

    it('should return null mapping when DOM is empty', async () => {
      window.document.querySelectorAll.mockReturnValue([]);
      const mapping = await dom.discoverColumns(window);
      expect(mapping).toEqual({
        subject: null, recipient: null, sender: null, correspondent: null
      });
    });
  });

  describe('column cache', () => {
    it('should cache and clear column mapping', async () => {
      const mockHeaders = [{ classList: ['subjectcol-column', 'headerCell'] }];
      window.document.querySelectorAll.mockReturnValue(mockHeaders);

      await dom.discoverColumns(window);
      expect(dom.getColumnMapping()).toBeTruthy();
      dom.clearColumnCache();
      expect(dom.getColumnMapping()).toBeNull();
    });
  });

  describe('event listeners', () => {
    it('should register and remove listeners via ID', () => {
      const target = { addEventListener: jest.fn(), removeEventListener: jest.fn() };
      const id = dom.addListener(target, 'click', jest.fn());
      expect(typeof id).toBe('string');
      expect(dom.getListenerCount()).toBe(1);

      dom.removeListener(id);
      expect(dom.getListenerCount()).toBe(0);
    });

    it('removeAllListeners should clean up all listeners', () => {
      const target = { addEventListener: jest.fn(), removeEventListener: jest.fn() };
      dom.addListener(target, 'click', jest.fn());
      dom.addListener(target, 'keydown', jest.fn());
      dom.removeAllListeners();
      expect(dom.getListenerCount()).toBe(0);
    });
  });

  describe('createObserver', () => {
    it('should create a MutationObserver and call observe', () => {
      const target = {};
      const obs = dom.createObserver(target, jest.fn());
      expect(obs).toBeTruthy();
      expect(obs.observe).toHaveBeenCalled();
    });
  });

  describe('debounce', () => {
    it('should delay function execution', () => {
      const fn = jest.fn();
      const debounced = dom.debounce(fn, 200);
      debounced();
      debounced();
      debounced();
      expect(fn).not.toHaveBeenCalled();
      jest.advanceTimersByTime(200);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});
