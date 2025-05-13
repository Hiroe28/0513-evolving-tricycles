import { describe, it, expect, beforeEach } from 'vitest';
import { GeneticAlgorithm } from '../core/ga/GA';
import { GAParams } from '../core/types';

// テスト用のGAパラメータ
const testParams: GAParams = {
  populationSize: 10,
  mutationRate: 0.05,
  crossoverRate: 0.7,
  elitismCount: 2,
  tournamentSize: 3,
  maxGenerations: 10,
  timeStep: 1 / 60
};

describe('GeneticAlgorithm', () => {
  let ga: GeneticAlgorithm;

  beforeEach(() => {
    ga = new GeneticAlgorithm(testParams);
    ga.initialize();
  });

  it('初期化時に指定した個体数の個体群を生成する', () => {
    const population = ga.getPopulation();
    expect(population.length).toBe(testParams.populationSize);
  });

  it('個体の遺伝子が正しい構造を持つことを確認する', () => {
    const population = ga.getPopulation();
    const individual = population[0];

    // 遺伝子の構造チェック
    expect(individual.gene).toBeDefined();
    expect(individual.gene.chassis).toBeDefined();
    expect(individual.gene.wheels).toBeDefined();
    
    // シャーシは4〜6頂点を持つ
    expect(individual.gene.chassis.vertices.length).toBeGreaterThanOrEqual(4);
    expect(individual.gene.chassis.vertices.length).toBeLessThanOrEqual(6);
    
    // 車輪は3つある
    expect(individual.gene.wheels.positions.length).toBe(3);
    expect(individual.gene.wheels.radii.length).toBe(3);
    
    // 各車輪の半径は0.1〜0.6の範囲内
    individual.gene.wheels.radii.forEach((radius: number) => {
      expect(radius).toBeGreaterThanOrEqual(0.1);
      expect(radius).toBeLessThanOrEqual(0.6);
    });
  });

  it('シミュレーション結果に基づいて個体を評価できる', () => {
    const population = ga.getPopulation();
    
    // 移動距離をマップとして作成（IDと距離）
    const distanceResults = new Map<string, number>();
    for (const ind of population) {
      // ランダムな距離を設定
      distanceResults.set(ind.id, Math.random() * 10);
    }
    
    // 評価実行
    ga.evaluatePopulation(distanceResults);
    
    // 評価後、個体の適応度と距離が設定されていることを確認
    for (const ind of ga.getPopulation()) {
      const distance = distanceResults.get(ind.id) || 0;
      expect(ind.distance).toBe(distance);
      expect(ind.fitness).toBe(distance); // この実装では距離がそのまま適応度
    }
    
    // 個体群が適応度順にソートされていることを確認
    const sortedPopulation = ga.getPopulation();
    for (let i = 1; i < sortedPopulation.length; i++) {
      expect(sortedPopulation[i-1].fitness).toBeGreaterThanOrEqual(sortedPopulation[i].fitness);
    }
  });

  it('次世代に進むと世代カウンターが増加する', () => {
    // 初期世代は0
    expect(ga.getCurrentGeneration()).toBe(0);
    
    // シミュレーション結果の生成（ダミーデータ）
    const distanceResults = new Map<string, number>();
    for (const ind of ga.getPopulation()) {
      distanceResults.set(ind.id, Math.random() * 10);
    }
    
    // 評価して世代を進める
    ga.evaluatePopulation(distanceResults);
    ga.evolve();
    
    // 世代カウンターが1増えていることを確認
    expect(ga.getCurrentGeneration()).toBe(1);
  });

  it('エリート保持によって優秀な個体が次世代に残る', () => {
    // シミュレーション結果の生成
    const distanceResults = new Map<string, number>();
    let maxDistance = 0;
    
    // 各個体にランダムな距離を設定
    for (const ind of ga.getPopulation()) {
      const distance = Math.random() * 10;
      distanceResults.set(ind.id, distance);
      
      // 最大距離と対応するIDを記録
      if (distance > maxDistance) {
        maxDistance = distance;
      }
    }
    
    // 評価して世代を進める
    ga.evaluatePopulation(distanceResults);
    const bestFitness = ga.getPopulation()[0].fitness; // 最良個体の適応度
    ga.evolve();
    
    // 新世代の個体群を取得
    const newPopulation = ga.getPopulation();
    
    // エリート個体の確認
    const elites = newPopulation.filter(ind => ind.isElite);
    
    // エリート数がパラメータ通りであることを確認
    expect(elites.length).toBe(testParams.elitismCount);
    
    // 最も適応度の高い個体がエリートとして残っていることを確認
    // 注：IDは変わるため、適応度で確認
    const newBestFitness = elites[0].fitness;
    expect(newBestFitness).toBe(bestFitness);
  });
});