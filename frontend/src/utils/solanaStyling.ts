// Solana styling utilities based on Solana's design system

// Solana color palette
export const solanaColors = {
  // Primary colors
  purple: {
    DEFAULT: '#9945FF',
    light: '#BF7FFF',
    dark: '#7A2BFF',
  },
  green: {
    DEFAULT: '#14F195',
    light: '#66F7C1',
    dark: '#0BC678',
  },
  blue: {
    DEFAULT: '#00C2FF',
    light: '#66DBFF',
    dark: '#00A3D3',
  },
  // Secondary colors
  teal: '#05D2DD',
  yellow: '#FFEC1F',
  orange: '#FF9C24',
  red: '#FF4557',
  // Neutrals
  black: '#000000',
  darkGray: '#141414',
  gray: '#2C2C2C',
  lightGray: '#858585',
  white: '#FFFFFF',
  // Gradients
  gradients: {
    purpleToGreen: 'linear-gradient(45deg, #9945FF 0%, #14F195 100%)',
    purpleToBlue: 'linear-gradient(45deg, #9945FF 0%, #00C2FF 100%)',
    blueToGreen: 'linear-gradient(45deg, #00C2FF 0%, #14F195 100%)',
  }
};

// Helper for formatting SOL values
export const formatSolBalance = (balance: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(balance);
};

// Common button styles (as Tailwind class strings)
export const buttonStyles = {
  primary: 'bg-gradient-to-r from-purple-DEFAULT to-blue-DEFAULT hover:from-purple-dark hover:to-blue-dark text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-light focus:ring-opacity-50',
  secondary: 'bg-gray border border-purple-DEFAULT text-white hover:border-purple-light font-semibold py-2 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-light focus:ring-opacity-50',
  ghost: 'bg-transparent border border-gray text-white hover:border-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50',
  disabled: 'bg-lightGray text-darkGray cursor-not-allowed font-semibold py-2 px-6 rounded-lg',
};

// Card styles
export const cardStyles = {
  DEFAULT: 'bg-darkGray border border-gray rounded-xl shadow-md overflow-hidden',
  hover: 'hover:border-blue-DEFAULT transition-all duration-200',
  active: 'border-purple-DEFAULT',
};

// Status indicators
export const statusStyles = {
  success: 'bg-green-DEFAULT text-black px-2 py-1 rounded-full text-xs font-medium',
  pending: 'bg-yellow text-black px-2 py-1 rounded-full text-xs font-medium',
  error: 'bg-red text-white px-2 py-1 rounded-full text-xs font-medium',
};

// Tooltip styles
export const tooltipStyles = {
  wrapper: 'relative inline-block',
  tooltip: 'invisible absolute z-10 bg-darkGray text-white text-sm px-3 py-2 rounded-md shadow-lg opacity-0 transition-opacity duration-300 whitespace-nowrap',
  visible: 'visible opacity-100',
  placement: {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  },
  arrow: 'absolute h-2 w-2 bg-darkGray rotate-45',
  arrowPlacement: {
    top: 'top-full left-1/2 transform -translate-x-1/2 -mt-1',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 -mb-1',
    left: 'left-full top-1/2 transform -translate-y-1/2 -ml-1',
    right: 'right-full top-1/2 transform -translate-y-1/2 -mr-1',
  },
}; 