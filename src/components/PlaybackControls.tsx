import React from 'react';
import {
  Box,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  useTheme
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SpeedIcon from '@mui/icons-material/Speed';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

interface PlaybackControlsProps {
  isRunning: boolean;
  currentSpeed: number;
  highlightBest: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onToggleHighlight: () => void;
}

/**
 * シミュレーション制御コンポーネント
 */
const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isRunning,
  currentSpeed,
  highlightBest,
  onStart,
  onStop,
  onReset,
  onSpeedChange,
  onToggleHighlight
}) => {
  const theme = useTheme();
  
  // 速度変更ハンドラ
  const handleSpeedChange = (
    _event: React.MouseEvent<HTMLElement>,
    newSpeed: number | null,
  ) => {
    if (newSpeed !== null) {
      onSpeedChange(newSpeed);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      gap: 2, 
      p: 2, 
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      borderRadius: 1
    }}>
      {/* 再生/一時停止ボタン */}
      <Tooltip title={isRunning ? '一時停止' : '再生'}>
        <Button
          variant="contained"
          color={isRunning ? 'secondary' : 'primary'}
          onClick={isRunning ? onStop : onStart}
          startIcon={isRunning ? <PauseIcon /> : <PlayArrowIcon />}
        >
          {isRunning ? '一時停止' : '再生'}
        </Button>
      </Tooltip>
      
      {/* リセットボタン */}
      <Tooltip title="シミュレーションをリセット">
        <Button
          variant="outlined"
          color="primary"
          onClick={onReset}
          startIcon={<RestartAltIcon />}
        >
          リセット
        </Button>
      </Tooltip>
      
      {/* 速度調整ボタングループ */}
      <Box>
        <ToggleButtonGroup
          value={currentSpeed}
          exclusive
          onChange={handleSpeedChange}
          aria-label="シミュレーション速度"
          size="small"
        >
          <ToggleButton value={1} aria-label="通常速度">
            <Tooltip title="通常速度">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SpeedIcon fontSize="small" sx={{ mr: 0.5 }} />
                1×
              </Box>
            </Tooltip>
          </ToggleButton>
          <ToggleButton value={2} aria-label="2倍速">
            <Tooltip title="2倍速">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SpeedIcon fontSize="small" sx={{ mr: 0.5 }} />
                2×
              </Box>
            </Tooltip>
          </ToggleButton>
          <ToggleButton value={4} aria-label="4倍速">
            <Tooltip title="4倍速">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SpeedIcon fontSize="small" sx={{ mr: 0.5 }} />
                4×
              </Box>
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      {/* ベスト個体ハイライトボタン */}
      <Tooltip title={highlightBest ? 'ハイライト解除' : 'ベスト個体をハイライト'}>
        <Button
          variant={highlightBest ? 'contained' : 'outlined'}
          color="warning"
          onClick={onToggleHighlight}
          startIcon={<EmojiEventsIcon />}
        >
          ベスト個体
        </Button>
      </Tooltip>
    </Box>
  );
};

export default PlaybackControls;