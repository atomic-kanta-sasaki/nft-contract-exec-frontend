import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import MyPage from "./MyPage";


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={`/`} element={<Home />} />
        <Route path={`/me`} element={<MyPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
