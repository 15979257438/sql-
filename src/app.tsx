import { useEffect } from 'react';
import Taro from '@tarojs/taro';
import { useAuthStore } from './stores/authStore';
import { useUIStore } from './stores/uiStore';
import { socketService } from './services/socketService';
import { seedIfEmpty, resetData } from './services/mockData';
import { ToastContainer } from './components/shared/Feedback';
import './app.scss';

const DATA_VERSION = 'v3';

function App({ children }: { children?: React.ReactNode }) {
  const initialize = useAuthStore(s => s.initialize);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const setOffline = useUIStore(s => s.setOffline);

  useEffect(() => {
    // Force data refresh when app version changes
    const currentVersion = Taro.getStorageSync('CAMPUS_TRADE_dataVersion');
    if (currentVersion !== DATA_VERSION) {
      resetData();
      Taro.setStorageSync('CAMPUS_TRADE_dataVersion', DATA_VERSION);
    } else {
      seedIfEmpty();
    }
    initialize().then(() => {
      if (isAuthenticated) {
        socketService.connect();
      }
    });
  }, [initialize, isAuthenticated]);

  useEffect(() => {
    Taro.getNetworkType({
      success: (res) => {
        setOffline(res.networkType === 'none');
      },
    });
    Taro.onNetworkStatusChange((res) => {
      setOffline(!res.isConnected);
    });
  }, [setOffline]);

  return (
    <>
      <ToastContainer />
      {children}
    </>
  );
}

export default App;