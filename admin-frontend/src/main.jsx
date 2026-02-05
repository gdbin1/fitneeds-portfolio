import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
  <Provider store={store} future={{ v7_startTransition: true }}> {/* Redux Store를 App 컴포넌트에 주입 */}
    <App />
  </Provider>
  // </React.StrictMode>
);

