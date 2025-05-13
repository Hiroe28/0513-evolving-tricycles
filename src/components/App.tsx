import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  CssBaseline,
  Container,
  Grid,
  ThemeProvider,
  createTheme,
  useMediaQuery,
  Typography,
  Link,
  Paper
} from '@mui/material';
import SimulationView from './SimulationView';
import ControlPanel from './ControlPanel';
import StatsDashboard from './StatsDashboard';
import PlaybackControls from './PlaybackControls';
import ThemeToggle from './ThemeToggle';
import { useSimulation } from '../hooks/useSimulation';
import { TrackDifficulty } from '../core/types';

/**
 * メインアプリケーションコンポーネント
 */
const App: React.FC = () => {
  // ユーザーのシステム設定に基づく初期ダークモード
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [darkMode, setDarkMode] = useState<boolean>(prefersDarkMode);
  
  // 画面サイズの検出
  const isMobile = useMediaQuery('(max-width:600px)');
  const isTablet = useMediaQuery('(min-width:601px) and (max-width:960px)');
  
  // シミュレーションフックの初期化
  const simulation = useSimulation(TrackDifficulty.MEDIUM);
  
  // シミュレーション領域のサイズ計算
  const [simWidth, setSimWidth] = useState<number>(800);
  const [simHeight, setSimHeight] = useState<number>(500);
  
  // レスポンシブサイズの計算
  useEffect(() => {
    const updateSize = () => {
      if (isMobile) {
        // モバイル：画面幅いっぱい、高さは画面の50%
        setSimWidth(window.innerWidth - 32); // パディングを考慮
        setSimHeight(window.innerHeight * 0.4);
      } else if (isTablet) {
        // タブレット：画面幅の100%
        setSimWidth(window.innerWidth - 48);
        setSimHeight(window.innerHeight * 0.5);
      } else {
        // デスクトップ：左側60%
        setSimWidth((window.innerWidth - 48) * 0.6);
        setSimHeight(window.innerHeight * 0.7);
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [isMobile, isTablet]);
  
  // テーマの作成
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: {
            main: '#3f51b5',
          },
          secondary: {
            main: '#f50057',
          },
        },
      }),
    [darkMode],
  );
  
  // ダークモード切り替えハンドラ
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  // レンダリングデータの取得
  const renderData = simulation.getRenderData();
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth={false} sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {/* ヘッダー */}
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              3輪車進化シミュレーター
            </Typography>
            <ThemeToggle isDarkMode={darkMode} onToggle={toggleDarkMode} />
          </Box>
          
          {/* メインコンテンツ */}
          <Box sx={{ flexGrow: 1 }}>
            {isMobile ? (
              // モバイルレイアウト（縦方向に積み上げ）
              <Box>
                {/* シミュレーション表示（上部） */}
                <Paper 
                  elevation={3} 
                  sx={{ 
                    mb: 2, 
                    overflow: 'hidden',
                    borderRadius: 2,
                    width: '100%'
                  }}
                >
                  <SimulationView
                    renderData={renderData}
                    width={simWidth}
                    height={simHeight}
                  />
                </Paper>
                
                {/* 再生コントロール */}
                <Box sx={{ mb: 2 }}>
                  <PlaybackControls
                    isRunning={simulation.simulationState.running}
                    currentSpeed={simulation.simulationState.speed}
                    highlightBest={simulation.simulationState.highlightBest}
                    onStart={simulation.startSimulation}
                    onStop={simulation.stopSimulation}
                    onReset={simulation.resetSimulation}
                    onSpeedChange={simulation.changeSpeed}
                    onToggleHighlight={simulation.toggleHighlightBest}
                  />
                </Box>
                
                {/* 統計ダッシュボード */}
                <Paper elevation={3} sx={{ mb: 2, borderRadius: 2 }}>
                  <StatsDashboard
                    simulationState={simulation.simulationState}
                    bestIndividual={simulation.bestIndividual}
                    currentPopulation={simulation.population}
                  />
                </Paper>
                
                {/* コントロールパネル */}
                <Paper elevation={3} sx={{ borderRadius: 2 }}>
                  <ControlPanel
                    gaParams={simulation.gaParams}
                    trackDifficulty={simulation.trackDifficulty}
                    onUpdateGAParams={simulation.updateGAParams}
                    onChangeTrackDifficulty={simulation.changeTrackDifficulty}
                  />
                </Paper>
              </Box>
            ) : (
              // タブレット/デスクトップレイアウト（グリッド）
              <Grid container spacing={3}>
                {/* 左側：シミュレーション表示 */}
                <Grid item xs={12} md={7} lg={8}>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      overflow: 'hidden',
                      borderRadius: 2,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <SimulationView
                      renderData={renderData}
                      width={simWidth}
                      height={simHeight}
                    />
                    <Box sx={{ p: 2 }}>
                      <PlaybackControls
                        isRunning={simulation.simulationState.running}
                        currentSpeed={simulation.simulationState.speed}
                        highlightBest={simulation.simulationState.highlightBest}
                        onStart={simulation.startSimulation}
                        onStop={simulation.stopSimulation}
                        onReset={simulation.resetSimulation}
                        onSpeedChange={simulation.changeSpeed}
                        onToggleHighlight={simulation.toggleHighlightBest}
                      />
                    </Box>
                  </Paper>
                </Grid>
                
                {/* 右側：コントロールと統計 */}
                <Grid item xs={12} md={5} lg={4}>
                  <Grid container direction="column" spacing={3}>
                    {/* 上：コントロールパネル */}
                    <Grid item>
                      <ControlPanel
                        gaParams={simulation.gaParams}
                        trackDifficulty={simulation.trackDifficulty}
                        onUpdateGAParams={simulation.updateGAParams}
                        onChangeTrackDifficulty={simulation.changeTrackDifficulty}
                      />
                    </Grid>
                    
                    {/* 下：統計ダッシュボード */}
                    <Grid item>
                      <StatsDashboard
                        simulationState={simulation.simulationState}
                        bestIndividual={simulation.bestIndividual}
                        currentPopulation={simulation.population}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            )}
          </Box>
          
          {/* フッター */}
          <Box sx={{ mt: 4, textAlign: 'center', py: 2 }}>
            <Typography variant="body2" color="text.secondary">
              © 2025 3輪車進化シミュレーター | 
              <Link 
                href="https://github.com/username/evolving-tricycles" 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{ ml: 1 }}
              >
                GitHub
              </Link>
            </Typography>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default App;