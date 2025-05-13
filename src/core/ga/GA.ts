import { Individual, VehicleGene, GAParams } from '../types';
import { tournamentSelection } from './selection';
import { crossover } from './crossover';
import { mutate } from './mutation';
import { v4 as uuidv4 } from 'uuid';

/**
 * 遺伝的アルゴリズムのメインクラス
 */
export class GeneticAlgorithm {
  private population: Individual[] = [];
  private params: GAParams;
  private currentGeneration = 0;
  private bestIndividual: Individual | null = null;

  /**
   * 遺伝的アルゴリズムの初期化
   * @param params - GAのパラメータ設定
   */
  constructor(params: GAParams) {
    this.params = params;
  }

  /**
   * ランダムな車両遺伝子を生成
   */
  private generateRandomGene(): VehicleGene {
    // シャーシ頂点数をランダムに決定（4〜6点）
    const vertexCount = Math.floor(Math.random() * 3) + 4;
    
    // シャーシ頂点座標の生成（中心からの相対座標）
    const vertices: [number, number][] = [];
    for (let i = 0; i < vertexCount; i++) {
      const angle = (i / vertexCount) * Math.PI * 2;
      const radius = 0.5 + Math.random() * 0.5; // 0.5〜1.0のランダムな半径
      vertices.push([
        Math.cos(angle) * radius,
        Math.sin(angle) * radius
      ]);
    }

    // 3つの車輪の位置を生成
    const wheelPositions: [number, number][] = [];
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2 + Math.random() * 0.5;
      const radius = 0.8 + Math.random() * 0.4; // 0.8〜1.2のランダムな距離
      wheelPositions.push([
        Math.cos(angle) * radius,
        Math.sin(angle) * radius
      ]);
    }

    // 車輪の半径を生成
    const wheelRadii = Array(3)
      .fill(0)
      .map(() => 0.2 + Math.random() * 0.3); // 0.2〜0.5のランダムな半径

    return {
      chassis: { vertices },
      wheels: {
        positions: wheelPositions,
        radii: wheelRadii
      }
    };
  }

  /**
   * 初期集団の生成
   */
  initialize(): void {
    this.currentGeneration = 0;
    this.population = [];

    // 指定された個体数だけランダムな個体を生成
    for (let i = 0; i < this.params.populationSize; i++) {
      const gene = this.generateRandomGene();
      this.population.push({
        gene,
        fitness: 0,
        distance: 0,
        id: uuidv4(),
        generation: this.currentGeneration
      });
    }
  }

  /**
   * 現在の世代の適応度を評価
   * @param simulationResults - 物理シミュレーション結果（各個体の移動距離）
   */
  evaluatePopulation(simulationResults: Map<string, number>): void {
    for (const individual of this.population) {
      // シミュレーション結果から移動距離を取得
      const distance = simulationResults.get(individual.id) || 0;
      individual.distance = distance;
      
      // 適応度を計算（単純に移動距離を適応度とする）
      individual.fitness = distance;
    }

    // 適応度でソート（降順）
    this.population.sort((a, b) => b.fitness - a.fitness);

    // 最良個体を記録
    const currentBest = this.population[0];
    if (!this.bestIndividual || currentBest.fitness > this.bestIndividual.fitness) {
      this.bestIndividual = { ...currentBest };
    }
  }

  /**
   * 次世代の個体を生成
   */
  evolve(): void {
    const newPopulation: Individual[] = [];
    this.currentGeneration++;

    // エリート選択：上位n個体をそのまま次世代に残す
    const elites = this.population.slice(0, this.params.elitismCount);
    for (const elite of elites) {
      newPopulation.push({
        ...elite,
        generation: this.currentGeneration,
        isElite: true
      });
    }

    // 残りの個体を選択・交叉・突然変異で生成
    while (newPopulation.length < this.params.populationSize) {
      // トーナメント選択で親を2つ選ぶ
      const parent1 = tournamentSelection(this.population, this.params.tournamentSize);
      const parent2 = tournamentSelection(this.population, this.params.tournamentSize);

      // 交叉率に基づいて交叉を行うかを決定
      let childGene: VehicleGene;
      if (Math.random() < this.params.crossoverRate) {
        childGene = crossover(parent1.gene, parent2.gene);
      } else {
        // 交叉しない場合はどちらかの親をコピー
        childGene = Math.random() < 0.5 ? { ...parent1.gene } : { ...parent2.gene };
      }

      // 突然変異を適用
      childGene = mutate(childGene, this.params.mutationRate);

      // 新しい個体を作成
      newPopulation.push({
        gene: childGene,
        fitness: 0,
        distance: 0,
        id: uuidv4(),
        generation: this.currentGeneration
      });
    }

    this.population = newPopulation;
  }

  /**
   * 現在の世代を取得
   */
  getCurrentGeneration(): number {
    return this.currentGeneration;
  }

  /**
   * 現在の個体群を取得
   */
  getPopulation(): Individual[] {
    return this.population;
  }

  /**
   * 最良個体を取得
   */
  getBestIndividual(): Individual | null {
    return this.bestIndividual;
  }

  /**
   * 現在世代の平均適応度を計算
   */
  getAverageFitness(): number {
    if (this.population.length === 0) return 0;
    const sum = this.population.reduce((acc, ind) => acc + ind.fitness, 0);
    return sum / this.population.length;
  }
}