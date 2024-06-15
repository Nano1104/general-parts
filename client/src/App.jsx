import { Routes, Route } from "react-router-dom";

//PAGES
import { Home } from "./pages/Home/Home.jsx"
import { Login } from "./pages/Login/Login.jsx"
import { Register } from "./pages/Register/Register.jsx"
import { ProductosPage } from "./pages/ProductosPage/ProductosPage.jsx"

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/productos" element={<ProductosPage />} />
        <Route path="/productos/category/:category" element={<ProductosPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  )
}

export default App
