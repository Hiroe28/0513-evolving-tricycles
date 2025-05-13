// 車両の遺伝子を表す型定義
export interface VehicleGene {
  // 車輪の位置と半径
  wheels: {
    positions: [number, number][]; // x, y座標の配列（3つの車輪）
    radii: number[];              // 各車輪の半径
  };
  // シャーシの頂点座標
  chassis: {
    vertices: [number, number][]; // 4〜6点のx, y座標
  };
}

// 個体（車両）を表す型
export interface Individual {
  gene: VehicleGene;        // 遺伝子情報
  fitness: number;          // 適応度（走行距離）
  distance: number;         // 現在の水平移動距離
  id: string;               // 個体識別子
  generation: number;       // 何世代目か
  isElite?: boolean;        // エリートかどうか
}

// GA設定パラメータ
export interface GAParams {
  populationSize: number;   // 1世代あたりの個体数
  mutationRate: number;     // 突然変異率（0.0〜1.0）
  crossoverRate: number;    // 交叉率（0.0〜1.0）
  elitismCount: number;     // そのまま次世代に残すエリート個体数
  tournamentSize: number;   // トーナメント選択時の対戦者数
  maxGenerations: number;   // 最大世代数
  timeStep: number;         // 物理シミュレーションの時間ステップ
}

// シミュレーション状態
export interface SimulationState {
  running: boolean;         // 実行中かどうか
  speed: number;            // シミュレーション速度（1x, 2x, 4x）
  currentGeneration: number;// 現在の世代
  bestFitness: number;      // これまでの最高適応度
  averageFitness: number;   // 現在世代の平均適応度
  highlightBest: boolean;   // ベスト個体をハイライト表示するかどうか
  fitnessHistory: {         // 適応度の推移記録
    generation: number;
    best: number;
    average: number;
  }[];
}

// コースの難易度設定
export enum TrackDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

// シミュレーション設定
export interface SimulationConfig {
  gaParams: GAParams;
  trackDifficulty: TrackDifficulty;
  darkMode: boolean;
}