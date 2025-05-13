import React from 'react';
import {
  Box,
  Slider,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Card,
  CardContent,
  SelectChangeEvent
} from '@mui/material';
import { GAParams, TrackDifficulty } from '../core/types';

interface ControlPanelProps {
  gaParams: GAParams;
  trackDifficulty: TrackDifficulty;
  onUpdateGAParams: (params: Partial<GAParams>) => void;
  onChangeTrackDifficulty: (difficulty: TrackDifficulty) => void;
}

/**
 * GA設定を制御するパネルコンポーネント
 */
const ControlPanel: React.FC<ControlPanelProps> = ({
  gaParams,
  trackDifficulty,
  onUpdateGAParams,
  onChangeTrackDifficulty
}) => {
  // スライダー値変更ハンドラ
  const handleSliderChange = (param: keyof GAParams) => (_: Event, value: number | number[]) => {
    if (typeof value === 'number') {
      onUpdateGAParams({ [param]: value });
    }
  };

  // 数値入力ハンドラ
  const handleNumberInputChange = (param: keyof GAParams) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    if (!isNaN(value)) {
      onUpdateGAParams({ [param]: value });
    }
  };

  // トラック難易度変更ハンドラ
  const handleTrackDifficultyChange = (event: SelectChangeEvent<string>) => {
    onChangeTrackDifficulty(event.target.value as TrackDifficulty);
  };

  return (
    <Card sx={{ height: '100%', overflow: 'auto' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          パラメータ設定
        </Typography>

        {/* トラック難易度 */}
        <Box mb={3}>
          <FormControl fullWidth size="small">
            <InputLabel id="track-difficulty-label">コース難易度</InputLabel>
            <Select
              labelId="track-difficulty-label"
              value={trackDifficulty}
              label="コース難易度"
              onChange={handleTrackDifficultyChange}
            >
              <MenuItem value={TrackDifficulty.EASY}>簡単</MenuItem>
              <MenuItem value={TrackDifficulty.MEDIUM}>普通</MenuItem>
              <MenuItem value={TrackDifficulty.HARD}>難しい</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* 個体数 */}
        <Box mb={3}>
          <Typography gutterBottom>
            個体数: {gaParams.populationSize}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Slider
              value={gaParams.populationSize}
              min={5}
              max={50}
              step={1}
              onChange={handleSliderChange('populationSize')}
              aria-labelledby="population-size-slider"
            />
            <TextField
              size="small"
              type="number"
              value={gaParams.populationSize}
              onChange={handleNumberInputChange('populationSize')}
              inputProps={{
                min: 5,
                max: 50,
                step: 1
              }}
              sx={{ width: 70, ml: 2 }}
            />
          </Box>
        </Box>

        {/* 突然変異率 */}
        <Box mb={3}>
          <Typography gutterBottom>
            突然変異率: {(gaParams.mutationRate * 100).toFixed(1)}%
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Slider
              value={gaParams.mutationRate}
              min={0}
              max={0.3}
              step={0.01}
              onChange={handleSliderChange('mutationRate')}
              aria-labelledby="mutation-rate-slider"
            />
            <TextField
              size="small"
              type="number"
              value={gaParams.mutationRate}
              onChange={handleNumberInputChange('mutationRate')}
              inputProps={{
                min: 0,
                max: 0.3,
                step: 0.01
              }}
              sx={{ width: 70, ml: 2 }}
            />
          </Box>
        </Box>

        {/* 交叉率 */}
        <Box mb={3}>
          <Typography gutterBottom>
            交叉率: {(gaParams.crossoverRate * 100).toFixed(1)}%
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Slider
              value={gaParams.crossoverRate}
              min={0}
              max={1}
              step={0.05}
              onChange={handleSliderChange('crossoverRate')}
              aria-labelledby="crossover-rate-slider"
            />
            <TextField
              size="small"
              type="number"
              value={gaParams.crossoverRate}
              onChange={handleNumberInputChange('crossoverRate')}
              inputProps={{
                min: 0,
                max: 1,
                step: 0.05
              }}
              sx={{ width: 70, ml: 2 }}
            />
          </Box>
        </Box>

        {/* エリート数 */}
        <Box mb={3}>
          <Typography gutterBottom>
            エリート保持数: {gaParams.elitismCount}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Slider
              value={gaParams.elitismCount}
              min={0}
              max={10}
              step={1}
              onChange={handleSliderChange('elitismCount')}
              aria-labelledby="elitism-count-slider"
            />
            <TextField
              size="small"
              type="number"
              value={gaParams.elitismCount}
              onChange={handleNumberInputChange('elitismCount')}
              inputProps={{
                min: 0,
                max: 10,
                step: 1
              }}
              sx={{ width: 70, ml: 2 }}
            />
          </Box>
        </Box>

        {/* トーナメントサイズ */}
        <Box mb={3}>
          <Typography gutterBottom>
            トーナメントサイズ: {gaParams.tournamentSize}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Slider
              value={gaParams.tournamentSize}
              min={2}
              max={10}
              step={1}
              onChange={handleSliderChange('tournamentSize')}
              aria-labelledby="tournament-size-slider"
            />
            <TextField
              size="small"
              type="number"
              value={gaParams.tournamentSize}
              onChange={handleNumberInputChange('tournamentSize')}
              inputProps={{
                min: 2,
                max: 10,
                step: 1
              }}
              sx={{ width: 70, ml: 2 }}
            />
          </Box>
        </Box>

        {/* 最大世代数 */}
        <Box mb={3}>
          <Typography gutterBottom>
            最大世代数: {gaParams.maxGenerations}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Slider
              value={gaParams.maxGenerations}
              min={10}
              max={500}
              step={10}
              onChange={handleSliderChange('maxGenerations')}
              aria-labelledby="max-generations-slider"
            />
            <TextField
              size="small"
              type="number"
              value={gaParams.maxGenerations}
              onChange={handleNumberInputChange('maxGenerations')}
              inputProps={{
                min: 10,
                max: 500,
                step: 10
              }}
              sx={{ width: 70, ml: 2 }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ControlPanel;