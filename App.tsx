import 'react-native-gesture-handler';
import './global.css';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, TextInput } from 'react-native';

import { AppNavigator } from './src/navigation/AppNavigator';
import { AppStateProvider } from './src/contexts/AppStateContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { I18nProvider } from './src/contexts/I18nContext';
import { OrdersProvider } from './src/contexts/OrdersContext';
import { PaymentCardsProvider } from './src/contexts/PaymentCardsContext';
import { ToastProvider } from './src/contexts/ToastContext';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';

const GlobalText = Text as any;
GlobalText.defaultProps = GlobalText.defaultProps ?? {};
GlobalText.defaultProps.allowFontScaling = false;
GlobalText.defaultProps.maxFontSizeMultiplier = 1;

const GlobalTextInput = TextInput as any;
GlobalTextInput.defaultProps = GlobalTextInput.defaultProps ?? {};
GlobalTextInput.defaultProps.allowFontScaling = false;
GlobalTextInput.defaultProps.maxFontSizeMultiplier = 1;

function AppContent() {
  const { isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AuthProvider>
        <OrdersProvider>
          <AppStateProvider>
            <PaymentCardsProvider>
              <ToastProvider>
                <AppNavigator />
              </ToastProvider>
            </PaymentCardsProvider>
          </AppStateProvider>
        </OrdersProvider>
      </AuthProvider>
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <I18nProvider>
            <AppContent />
          </I18nProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
