import { Theme } from '../types';

export const themes: Record<string, Theme> = {
  default: {
    name: 'الأزرق الافتراضي',
    primary: 'blue',
    secondary: 'indigo',
    accent: 'sky',
    background: 'from-blue-50 to-indigo-100',
    surface: 'white',
    text: 'gray-900'
  },
  green: {
    name: 'الأخضر الطبيعي',
    primary: 'green',
    secondary: 'emerald',
    accent: 'teal',
    background: 'from-green-50 to-emerald-100',
    surface: 'white',
    text: 'gray-900'
  },
  purple: {
    name: 'البنفسجي الملكي',
    primary: 'purple',
    secondary: 'violet',
    accent: 'fuchsia',
    background: 'from-purple-50 to-violet-100',
    surface: 'white',
    text: 'gray-900'
  },
  orange: {
    name: 'البرتقالي الدافئ',
    primary: 'orange',
    secondary: 'amber',
    accent: 'yellow',
    background: 'from-orange-50 to-amber-100',
    surface: 'white',
    text: 'gray-900'
  }
};

export const darkThemes: Record<string, Theme> = {
  default: {
    name: 'الأزرق الليلي',
    primary: 'blue',
    secondary: 'indigo',
    accent: 'sky',
    background: 'from-gray-900 to-blue-900',
    surface: 'gray-800',
    text: 'gray-100'
  },
  green: {
    name: 'الأخضر الليلي',
    primary: 'green',
    secondary: 'emerald',
    accent: 'teal',
    background: 'from-gray-900 to-green-900',
    surface: 'gray-800',
    text: 'gray-100'
  },
  purple: {
    name: 'البنفسجي الليلي',
    primary: 'purple',
    secondary: 'violet',
    accent: 'fuchsia',
    background: 'from-gray-900 to-purple-900',
    surface: 'gray-800',
    text: 'gray-100'
  },
  orange: {
    name: 'البرتقالي الليلي',
    primary: 'orange',
    secondary: 'amber',
    accent: 'yellow',
    background: 'from-gray-900 to-orange-900',
    surface: 'gray-800',
    text: 'gray-100'
  }
};

export const getThemeClasses = (theme: { primary: string }, darkMode: boolean) => {
  const baseTheme = darkMode ? darkThemes : themes;
  const currentTheme = baseTheme[theme.primary] || baseTheme.default;
  
  return {
    background: `bg-gradient-to-br ${currentTheme.background}`,
    surface: `bg-${currentTheme.surface}`,
    primary: `bg-${currentTheme.primary}-600 hover:bg-${currentTheme.primary}-700 text-white`,
    secondary: `bg-${currentTheme.secondary}-600 hover:bg-${currentTheme.secondary}-700 text-white`,
    accent: `bg-${currentTheme.accent}-600 hover:bg-${currentTheme.accent}-700 text-white`,
    text: `text-${currentTheme.text}`,
    border: darkMode ? 'border-gray-600' : 'border-gray-300',
    textPrimary: `text-${currentTheme.primary}-600`,
    textSecondary: `text-${currentTheme.secondary}-600`,
    bgPrimary: `bg-${currentTheme.primary}-50`,
    bgSecondary: `bg-${currentTheme.secondary}-50`
  };
};