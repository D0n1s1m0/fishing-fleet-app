import React, { createContext, useState, useContext, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';

type ThemeMode = 'light' | 'dark' | 'accessible';

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Зелено-белая тема
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#1565c0',
      light: '#42a5f5',
      dark: '#0d47a1',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f1f8e9',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a3a1a',
      secondary: '#2e5e2e',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    warning: {
      main: '#f57c00',
      light: '#ffb74d',
      dark: '#e65100',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#b71c1c',
    },
    info: {
      main: '#0288d1',
      light: '#4fc3f7',
      dark: '#01579b',
    },
  },
  typography: {
    fontFamily: '"Times New Roman", Times, serif',
    h1: { fontFamily: '"Times New Roman", Times, serif', fontWeight: 700 },
    h2: { fontFamily: '"Times New Roman", Times, serif', fontWeight: 700 },
    h3: { fontFamily: '"Times New Roman", Times, serif', fontWeight: 600 },
    h4: { fontFamily: '"Times New Roman", Times, serif', fontWeight: 600 },
    h5: { fontFamily: '"Times New Roman", Times, serif', fontWeight: 500 },
    h6: { fontFamily: '"Times New Roman", Times, serif', fontWeight: 500 },
    body1: { fontFamily: '"Times New Roman", Times, serif', fontSize: '1.1rem' },
    body2: { fontFamily: '"Times New Roman", Times, serif' },
    button: { fontFamily: '"Times New Roman", Times, serif', fontWeight: 600, textTransform: 'none' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 20px',
          '&:hover': { boxShadow: '0 4px 8px rgba(46, 125, 50, 0.2)' },
        },
        contained: {
          background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
          color: '#ffffff',
          '&:hover': { background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(46, 125, 50, 0.1)',
          border: '1px solid rgba(46, 125, 50, 0.15)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(46, 125, 50, 0.08)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
        },
      },
    },
  },
});

// Черно-зеленая тема
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#2e7d32',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#64b5f6',
      light: '#90caf9',
      dark: '#1976d2',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0a0f0a',
      paper: '#1a2a1a',
    },
    text: {
      primary: '#e8f5e9',
      secondary: '#a5d6a7',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#2e7d32',
    },
    warning: {
      main: '#ffb74d',
      light: '#ffd54f',
      dark: '#f57c00',
    },
    error: {
      main: '#ef5350',
      light: '#ff8a80',
      dark: '#c62828',
    },
    info: {
      main: '#4fc3f7',
      light: '#80deea',
      dark: '#0288d1',
    },
  },
  typography: {
    fontFamily: '"Times New Roman", Times, serif',
    h1: { fontFamily: '"Times New Roman", Times, serif', fontWeight: 700 },
    h2: { fontFamily: '"Times New Roman", Times, serif', fontWeight: 700 },
    h3: { fontFamily: '"Times New Roman", Times, serif', fontWeight: 600 },
    h4: { fontFamily: '"Times New Roman", Times, serif', fontWeight: 600 },
    h5: { fontFamily: '"Times New Roman", Times, serif', fontWeight: 500 },
    h6: { fontFamily: '"Times New Roman", Times, serif', fontWeight: 500 },
    body1: { fontFamily: '"Times New Roman", Times, serif', fontSize: '1.1rem' },
    body2: { fontFamily: '"Times New Roman", Times, serif' },
    button: { fontFamily: '"Times New Roman", Times, serif', fontWeight: 600, textTransform: 'none' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 20px',
          '&:hover': { boxShadow: '0 4px 8px rgba(76, 175, 80, 0.3)' },
        },
        contained: {
          background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
          color: '#ffffff',
          '&:hover': { background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)' },
        },
        outlined: {
          borderColor: '#4caf50',
          color: '#4caf50',
          '&:hover': { borderColor: '#81c784', backgroundColor: 'rgba(76, 175, 80, 0.08)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(76, 175, 80, 0.2)',
          backgroundColor: '#1a2a1a',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
          backgroundColor: '#1a2a1a',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #0a0f0a 0%, #1a2a1a 100%)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          borderBottom: '1px solid #4caf50',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
        },
        filled: {
          backgroundColor: 'rgba(76, 175, 80, 0.15)',
          color: '#a5d6a7',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(76, 175, 80, 0.3)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#4caf50',
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(76, 175, 80, 0.2)',
          },
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          '& .MuiInputLabel-root': {
            color: '#a5d6a7',
          },
        },
      },
    },
  },
});

// Тема для слабовидящих с приятным шрифтом
const accessibleTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a237e',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#b71c1c',
      contrastText: '#ffffff',
    },
    background: {
      default: '#fff8e1',
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#424242',
    },
    success: {
      main: '#1b5e20',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#e65100',
      contrastText: '#ffffff',
    },
    error: {
      main: '#b71c1c',
      contrastText: '#ffffff',
    },
    info: {
      main: '#0d47a1',
      contrastText: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Arial", "Helvetica", sans-serif',
    fontSize: 20,
    htmlFontSize: 20,
    h1: { fontFamily: '"Arial", "Helvetica", sans-serif', fontSize: '3rem', fontWeight: 700, lineHeight: 1.3 },
    h2: { fontFamily: '"Arial", "Helvetica", sans-serif', fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.3 },
    h3: { fontFamily: '"Arial", "Helvetica", sans-serif', fontSize: '2.2rem', fontWeight: 700, lineHeight: 1.3 },
    h4: { fontFamily: '"Arial", "Helvetica", sans-serif', fontSize: '1.8rem', fontWeight: 700, lineHeight: 1.4 },
    h5: { fontFamily: '"Arial", "Helvetica", sans-serif', fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.4 },
    h6: { fontFamily: '"Arial", "Helvetica", sans-serif', fontSize: '1.3rem', fontWeight: 700, lineHeight: 1.4 },
    body1: { fontFamily: '"Arial", "Helvetica", sans-serif', fontSize: '1.25rem', lineHeight: 1.8, letterSpacing: '0.01em' },
    body2: { fontFamily: '"Arial", "Helvetica", sans-serif', fontSize: '1.15rem', lineHeight: 1.7, letterSpacing: '0.01em' },
    button: { fontFamily: '"Arial", "Helvetica", sans-serif', fontSize: '1.25rem', fontWeight: 700, textTransform: 'none', letterSpacing: '0.02em' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '14px 28px',
          border: '3px solid #1a237e',
          borderRadius: 12,
          fontSize: '1.25rem',
          '&:focus': { outline: '4px solid #b71c1c', outlineOffset: '4px' },
          '&:hover': { borderWidth: '3px' },
        },
        contained: {
          backgroundColor: '#1a237e',
          color: '#ffffff',
          '&:hover': { backgroundColor: '#283593' },
        },
        outlined: {
          borderWidth: '3px',
          '&:hover': { borderWidth: '3px', backgroundColor: 'rgba(26, 35, 126, 0.05)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '3px solid #1a237e',
          boxShadow: '4px 4px 0 rgba(0,0,0,0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '3px solid #1a237e',
          boxShadow: '4px 4px 0 rgba(0,0,0,0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a237e',
          borderBottom: '4px solid #b71c1c',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: '2px solid #1a237e',
          fontSize: '1.1rem',
          height: 40,
          fontWeight: 600,
        },
        filled: {
          backgroundColor: '#e8eaf6',
          color: '#1a237e',
        },
        avatar: {
          fontSize: '1.2rem',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            fontSize: '1.25rem',
            '& fieldset': { borderColor: '#1a237e', borderWidth: '3px' },
            '&:hover fieldset': { borderColor: '#283593', borderWidth: '3px' },
            '&.Mui-focused fieldset': { borderColor: '#b71c1c', borderWidth: '4px' },
          },
          '& .MuiInputLabel-root': { fontSize: '1.25rem', color: '#1a237e' },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: '1.15rem',
          padding: '16px',
          borderBottom: '2px solid #1a237e',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            fontWeight: 700,
            backgroundColor: '#e8eaf6',
            borderBottom: '3px solid #1a237e',
            color: '#1a237e',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '3px solid #1a237e',
          fontSize: '1.15rem',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 14,
          borderRadius: 7,
          border: '2px solid #1a237e',
          backgroundColor: '#e8eaf6',
        },
        bar: { backgroundColor: '#1a237e' },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          fontSize: '1.25rem',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '1.2rem',
          padding: '12px 20px',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: '1.1rem',
          backgroundColor: '#1a237e',
          padding: '8px 16px',
          borderRadius: 8,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          width: 48,
          height: 48,
          fontSize: '1.3rem',
          border: '2px solid #b71c1c',
        },
      },
    },
  },
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('themeMode');
    return (saved as ThemeMode) || 'light';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
    
    if (themeMode === 'accessible') {
      document.body.style.zoom = '1.1';
      document.body.style.filter = 'contrast(1.1) brightness(1.05)';
    } else {
      document.body.style.zoom = '1';
      document.body.style.filter = 'none';
    }
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'accessible';
      return 'light';
    });
  };

  const getTheme = () => {
    switch (themeMode) {
      case 'dark': return darkTheme;
      case 'accessible': return accessibleTheme;
      default: return lightTheme;
    }
  };

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, toggleTheme }}>
      <MuiThemeProvider theme={getTheme()}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useThemeMode must be used within ThemeProvider');
  return context;
};
