import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, Typography, Box, Grid, useTheme } from '@mui/material';
import { SimulationState, Individual } from '../core/types';

interface StatsDashboardProps {
  simulationState: SimulationState;
  bestIndividual: Individual | null;
  currentPopulation: Individual[];
}

/**
 * 統計ダッシュボードコンポーネント
 */
const StatsDashboard: React.FC<StatsDashboardProps> = ({
  simulationState,
  bestIndividual,
  currentPopulation
}) => {
  const theme = useTheme();
  
  // 統計データの計算
  const currentGeneration = simulationState.currentGeneration;
  const bestFitness = simulationState.bestFitness;
  const averageFitness = simulationState.averageFitness;
  
  // 上位5個体の取得（距離降順でソート）
  const topIndividuals = [...currentPopulation]
    .sort((a, b) => b.distance - a.distance)
    .slice(0, 5);
  
  // グラフデータ
  const chartData = simulationState.fitnessHistory;
  
  // ダークモード対応の色設定
  const bestLineColor = theme.palette.mode === 'dark' ? '#8BC34A' : '#4CAF50';
  const avgLineColor = theme.palette.mode === 'dark' ? '#90CAF9' : '#2196F3';
  
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom>
          統計ダッシュボード
        </Typography>
        
        {/* 現在の統計情報 */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={4}>
            <Typography variant="subtitle2">現在の世代</Typography>
            <Typography variant="h5">{currentGeneration}</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="subtitle2">最高距離</Typography>
            <Typography variant="h5">{bestFitness.toFixed(2)}m</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="subtitle2">平均距離</Typography>
            <Typography variant="h5">{averageFitness.toFixed(2)}m</Typography>
          </Grid>
        </Grid>
        
        {/* 最良個体の情報 */}
        {bestIndividual && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2">史上最良個体（世代 {bestIndividual.generation}）</Typography>
            <Typography variant="body2">
              距離: {bestIndividual.fitness.toFixed(2)}m
            </Typography>
          </Box>
        )}
        
        {/* 現在世代のトップ個体 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2">現在世代のトップ車両</Typography>
          {topIndividuals.map((ind, index) => (
            <Typography key={ind.id} variant="body2">
              {index + 1}. ID: {ind.id.substring(0, 8)}...（距離: {ind.distance.toFixed(2)}m）
              {ind.isElite ? ' 【エリート】' : ''}
            </Typography>
          ))}
        </Box>
        
        {/* 適応度推移グラフ */}
        <Box sx={{ flexGrow: 1, width: '100%', minHeight: 200 }}>
          <Typography variant="subtitle2" gutterBottom>
            適応度推移
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 5,
                left: 5,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="generation" 
                label={{ value: '世代', position: 'insideBottomRight', offset: 0 }} 
              />
              <YAxis 
                label={{ value: '距離 (m)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value: number) => [value.toFixed(2) + 'm']} 
                labelFormatter={(label) => `世代 ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="best"
                name="最高距離"
                stroke={bestLineColor}
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="average"
                name="平均距離"
                stroke={avgLineColor}
                strokeWidth={1.5}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatsDashboard;