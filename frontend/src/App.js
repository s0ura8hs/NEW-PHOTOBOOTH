import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PhotoboothApp from './components/PhotoboothApp';
import './App.css';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PhotoboothApp />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;