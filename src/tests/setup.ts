import '@testing-library/jest-dom';
import { vi } from 'vitest';

// 必要なモックやグローバル設定をここに記述
(global as any).ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Canvas APIのモック
(global as any).HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  // 必要なcanvasコンテキストのメソッドをモック
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  fill: vi.fn(),
  arc: vi.fn(),
  ellipse: vi.fn(),
  rect: vi.fn(),
}));