import { VehicleGene } from '../types';

/**
 * 車両の適応度を評価する関数
 * 実装では単純に移動距離を適応度とする
 * 
 * @param gene - 評価する車両の遺伝子
 * @param distance - 移動距離
 * @returns 適応度スコア
 */
export function evaluateFitness(gene: VehicleGene, distance: number): number {
  // この実装では単純に移動距離をそのまま適応度としている
  // 将来的には複数の評価基準（安定性、燃費など）を加えることも可能
  return distance;
}