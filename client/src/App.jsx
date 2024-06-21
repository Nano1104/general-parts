import { Routes, Route } from "react-router-dom";

//PAGES
import { Home } from "./pages/Home/Home.jsx"
import { Login } from "./pages/Login/Login.jsx"
import { Register } from "./pages/Register/Register.jsx"
import { ProductosPage } from "./pages/ProductosPage/ProductosPage.jsx"
import { Contact } from "./pages/Contact/Contact.jsx"
import { ProductDetailContainer } from "./pages/ProductDetailContainer/ProductDetailContainer.jsx";
import { NoMatchRoute } from "./pages/NoMatchRoute/NoMatchRoute.jsx";

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/productos" element={<ProductosPage />} />
        <Route path="/productos/:category" element={<ProductosPage />} />
        <Route path="/productos/:category/:subcategory" element={<ProductosPage />} />
        <Route path="/producto/detail/:id" element={<ProductDetailContainer />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NoMatchRoute />} />
      </Routes>
    </>
  )
}

export default App
