import { useState, useEffect, useRef, useCallback } from 'react';
import { Individual, GAParams, SimulationState, TrackDifficulty } from '../core/types';
import { GeneticAlgorithm } from '../core/ga/GA';
import { PhysicsSimulation } from '../core/physics/simulation';

// デフォルトのGAパラメータ
const DEFAULT_GA_PARAMS: GAParams = {
  populationSize: 20,
  mutationRate: 0.05,
  crossoverRate: 0.7,
  elitismCount: 2,
  tournamentSize: 3,
  maxGenerations: 100,
  timeStep: 1 / 60
};

/**
 * シミュレーションを制御するカスタムフック
 */
export const useSimulation = (initialTrackDifficulty: TrackDifficulty = TrackDifficulty.MEDIUM) => {
  // GAパラメータの状態
  const [gaParams, setGaParams] = useState<GAParams>(DEFAULT_GA_PARAMS);
  
  // トラックの難易度
  const [trackDifficulty, setTrackDifficulty] = useState<TrackDifficulty>(initialTrackDifficulty);
  
  // シミュレーション状態
  const [simulationState, setSimulationState] = useState<SimulationState>({
    running: false,
    speed: 1,
    currentGeneration: 0,
    bestFitness: 0,
    averageFitness: 0,
    highlightBest: false,
    fitnessHistory: []
  });
  
  // 現在の個体群
  const [population, setPopulation] = useState<Individual[]>([]);
  
  // 最良個体
  const [bestIndividual, setBestIndividual] = useState<Individual | null>(null);
  
  // GA、物理シミュレーション、アニメーションフレームのリファレンス
  const gaRef = useRef<GeneticAlgorithm | null>(null);
  const physicsRef = useRef<PhysicsSimulation | null>(null);
  const rafRef = useRef<number | null>(null);
  const simulationTimeRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // 現在の世代の評価完了フラグ
  const generationEvaluatedRef = useRef<boolean>(false);
  
  // 累積時間ステップカウンタ
  const timeStepAccumulatorRef = useRef<number>(0);
  
  /**
   * シミュレーションの初期化
   */
  const initSimulation = useCallback(() => {
    // 既存のシミュレーションをクリーンアップ
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // 遺伝的アルゴリズムの初期化
    gaRef.current = new GeneticAlgorithm(gaParams);
    gaRef.current.initialize();
    
    // 物理シミュレーションの初期化
    physicsRef.current = new PhysicsSimulation(trackDifficulty);
    
    // 状態のリセット
    simulationTimeRef.current = 0;
    generationEvaluatedRef.current = false;
    timeStepAccumulatorRef.current = 0;
    
    // 初期個体群の取得と設定
    const initialPopulation = gaRef.current.getPopulation();
    setPopulation(initialPopulation);
    
    // シミュレーション状態の更新
    setSimulationState(prev => ({
      ...prev,
      currentGeneration: 0,
      bestFitness: 0,
      averageFitness: 0,
      fitnessHistory: []
    }));
    
    setBestIndividual(null);
    
    // 初期個体群を物理シミュレーションに追加
    for (const individual of initialPopulation) {
      physicsRef.current.addVehicle(individual.id, individual.gene);
    }
    
    return initialPopulation;
  }, [gaParams, trackDifficulty]);
  
  /**
   * 次の世代に進む
   */
  const evolveToNextGeneration = useCallback(() => {
    if (!gaRef.current || !physicsRef.current) return;
    
    // 現在の世代の個体の移動距離を取得
    const distanceResults = new Map<string, number>();
    for (const individual of population) {
      const distance = physicsRef.current.getVehicleDistance(individual.id);
      distanceResults.set(individual.id, distance);
    }
    
    // 移動距離を適応度として評価
    gaRef.current.evaluatePopulation(distanceResults);
    
    // 現在の最良個体と平均適応度を取得
    const currentBest = gaRef.current.getBestIndividual();
    const averageFitness = gaRef.current.getAverageFitness();
    
    if (currentBest) {
      setBestIndividual(currentBest);
    }
    
    // 適応度履歴に追加
    setSimulationState(prev => {
      const newHistory = [...prev.fitnessHistory, {
        generation: prev.currentGeneration,
        best: currentBest?.fitness || 0,
        average: averageFitness
      }];
      
      return {
        ...prev,
        bestFitness: currentBest?.fitness || 0,
        averageFitness,
        fitnessHistory: newHistory
      };
    });
    
    // 次世代の個体を生成
    gaRef.current.evolve();
    const newPopulation = gaRef.current.getPopulation();
    setPopulation(newPopulation);
    
    // 物理シミュレーションをリセット
    physicsRef.current.reset();
    
    // 新しい個体を物理シミュレーションに追加
    for (const individual of newPopulation) {
      physicsRef.current.addVehicle(individual.id, individual.gene);
    }
    
    // カウンターをリセット
    simulationTimeRef.current = 0;
    generationEvaluatedRef.current = false;
    
    // 世代カウンターを更新
    setSimulationState(prev => ({
      ...prev,
      currentGeneration: prev.currentGeneration + 1
    }));
    
    return newPopulation;
  }, [population]);
  
  /**
   * アニメーションループ
   */
  const animationLoop = useCallback((timestamp: number) => {
    if (!physicsRef.current || !simulationState.running) return;
    
    // 前のフレームからの経過時間を計算（最大0.1秒）
    const deltaTime = Math.min(0.1, (timestamp - (simulationTimeRef.current || timestamp)) / 1000);
    simulationTimeRef.current = timestamp;
    
    // シミュレーション速度に応じて時間ステップを調整
    const adjustedDeltaTime = deltaTime * simulationState.speed;
    timeStepAccumulatorRef.current += adjustedDeltaTime;
    
    // 時間ステップが蓄積されるたびに物理シミュレーションを更新
    const timeStep = gaParams.timeStep;
    while (timeStepAccumulatorRef.current >= timeStep) {
      // 各車両に駆動力を与える
      for (const individual of population) {
        physicsRef.current.applyTorque(individual.id, 20); // 定数トルク
      }
      
      // 物理シミュレーションを1ステップ進める
      physicsRef.current.step(timeStep);
      timeStepAccumulatorRef.current -= timeStep;
    }
    
    // 現在の個体の移動距離を更新（UI表示用）
    const updatedPopulation = population.map(individual => {
      const distance = physicsRef.current?.getVehicleDistance(individual.id) || 0;
      return {
        ...individual,
        distance
      };
    });
    setPopulation(updatedPopulation);
    
    // シミュレーション時間が一定値を超えたら世代を評価して次に進む
    const MAX_SIMULATION_TIME = 20.0 * (1.0 / simulationState.speed); // 速度に応じて調整
    if (physicsRef.current.getTimeElapsed() >= MAX_SIMULATION_TIME && !generationEvaluatedRef.current) {
      generationEvaluatedRef.current = true;
      
      // 非同期で次の世代に進む（UIの応答性を確保するため）
      timeoutRef.current = setTimeout(() => {
        evolveToNextGeneration();
      }, 100);
    }
    
    // 次のアニメーションフレームをリクエスト
    rafRef.current = requestAnimationFrame(animationLoop);
  }, [simulationState.running, simulationState.speed, population, gaParams.timeStep, evolveToNextGeneration]);
  
  /**
   * シミュレーション開始
   */
  const startSimulation = useCallback(() => {
    setSimulationState(prev => ({ ...prev, running: true }));
  }, []);
  
  /**
   * シミュレーション停止
   */
  const stopSimulation = useCallback(() => {
    setSimulationState(prev => ({ ...prev, running: false }));
  }, []);
  
  /**
   * シミュレーション速度変更
   */
  const changeSpeed = useCallback((speed: number) => {
    setSimulationState(prev => ({ ...prev, speed }));
  }, []);
  
  /**
   * ベスト個体ハイライト切り替え
   */
  const toggleHighlightBest = useCallback(() => {
    setSimulationState(prev => ({ ...prev, highlightBest: !prev.highlightBest }));
  }, []);
  
  /**
   * GAパラメータ更新
   */
  const updateGAParams = useCallback((params: Partial<GAParams>) => {
    setGaParams(prev => ({ ...prev, ...params }));
  }, []);
  
  /**
   * トラック難易度変更
   */
  const changeTrackDifficulty = useCallback((difficulty: TrackDifficulty) => {
    setTrackDifficulty(difficulty);
  }, []);
  
  /**
   * シミュレーションリセット
   */
  const resetSimulation = useCallback(() => {
    // シミュレーションを停止
    stopSimulation();
    
    // 新しいシミュレーションを初期化
    initSimulation();
  }, [initSimulation, stopSimulation]);
  
  // シミュレーション実行状態の変化を監視
  useEffect(() => {
    if (simulationState.running) {
      // シミュレーションが実行中ならアニメーションループを開始
      rafRef.current = requestAnimationFrame(animationLoop);
    } else if (rafRef.current) {
      // 停止したならアニメーションループを停止
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    
    return () => {
      // クリーンアップ
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [simulationState.running, animationLoop]);
  
  // GAパラメータかトラック難易度の変更時にリセット
  useEffect(() => {
    resetSimulation();
  }, [gaParams, trackDifficulty, resetSimulation]);
  
  // 初期化
  useEffect(() => {
    initSimulation();
    return () => {
      // クリーンアップ
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [initSimulation]);
  
  // レンダリングデータの準備
  const getRenderData = useCallback(() => {
    if (!physicsRef.current) return null;
    
    const vehiclesData = population.map(individual => {
      const vehicleData = physicsRef.current?.getVehicleRenderData(individual.id);
      return {
        id: individual.id,
        isElite: individual.isElite || false,
        isBest: bestIndividual?.id === individual.id,
        highlight: simulationState.highlightBest && bestIndividual?.id === individual.id,
        fitness: individual.fitness,
        data: vehicleData
      };
    });
    
    const trackData = physicsRef.current.getTrackRenderData();
    const scale = physicsRef.current.getScale();
    
    return {
      vehicles: vehiclesData.filter(v => v.data !== null), // null データを除外
      track: trackData,
      scale
    };
  }, [population, bestIndividual, simulationState.highlightBest]);
  
  return {
    // 状態
    simulationState,
    population,
    bestIndividual,
    gaParams,
    trackDifficulty,
    
    // アクション
    startSimulation,
    stopSimulation,
    resetSimulation,
    changeSpeed,
    toggleHighlightBest,
    updateGAParams,
    changeTrackDifficulty,
    
    // レンダリングデータ
    getRenderData
  };
};