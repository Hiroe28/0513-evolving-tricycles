import { Individual } from '../types';

/**
 * トーナメント選択
 * ランダムに選んだn個体の中から最も適応度の高い個体を選択する
 * 
 * @param population - 現在の個体群
 * @param tournamentSize - トーナメントサイズ（対戦者数）
 * @returns 選択された個体
 */
export function tournamentSelection(
  population: Individual[],
  tournamentSize: number
): Individual {
  // 個体群が少ない場合は調整
  const actualSize = Math.min(tournamentSize, population.length);
  
  // トーナメント参加者をランダムに選択
  const tournament: Individual[] = [];
  for (let i = 0; i < actualSize; i++) {
    const randomIndex = Math.floor(Math.random() * population.length);
    tournament.push(population[randomIndex]);
  }
  
  // 最も適応度の高い個体を返す
  return tournament.reduce((best, current) => 
    current.fitness > best.fitness ? current : best, 
    tournament[0]
  );
}