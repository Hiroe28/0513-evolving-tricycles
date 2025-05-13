import React from 'react';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

interface ThemeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
}

/**
 * ダークモード切り替えボタン
 */
const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDarkMode, onToggle }) => {
  const theme = useTheme();
  
  return (
    <Tooltip title={isDarkMode ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}>
      <IconButton
        onClick={onToggle}
        color="inherit"
        sx={{ 
          position: 'absolute', 
          top: theme.spacing(1), 
          right: theme.spacing(1),
          zIndex: 1100,
          bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          '&:hover': {
            bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
          }
        }}
      >
        {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;