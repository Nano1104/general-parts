import axios from "axios"
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "./context/AuthContext.jsx";

//PAGES
import { Home } from "./pages/Home/Home.jsx"
import { AuthPage } from "./pages/AuthPage/AuthPage.jsx"
import { Register } from "./pages/Register/Register.jsx"
import { ProductosPage } from "./pages/ProductosPage/ProductosPage.jsx"
import { Contact } from "./pages/Contact/Contact.jsx"
import { ProductDetailContainer } from "./pages/ProductDetailContainer/ProductDetailContainer.jsx";
import { NoMatchRoute } from "./pages/NoMatchRoute/NoMatchRoute.jsx";
import { AdminPage } from "./pages/AdminPage/AdminPage.jsx";
import { Orders } from "./pages/Orders/Orders.jsx"
import { Cart } from "./pages/Cart/Cart.jsx";

function App() {
  const { authUser } = useAuthContext()

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/productos" element={<ProductosPage />} />
        <Route path="/productos/:category" element={<ProductosPage />} />
        <Route path="/productos/:category/:subcategory" element={<ProductosPage />} />
        <Route path="/producto/detail/:id" element={<ProductDetailContainer />} />
        <Route path="/admin" element={ authUser ? <AdminPage /> : <Navigate to="/" /> } />
        <Route path="/admin/:manage" element={ authUser ? <AdminPage /> : <Navigate to="/" /> } />
        <Route path="/reservas" element={ authUser ? <Orders /> : <Navigate to="/" /> } />
        <Route path="/authPage" element={ !authUser ? <AuthPage /> : <Navigate to="/" /> } />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart-v" element={ authUser ? <Cart /> : <Navigate to="/" /> } />
        <Route path="*" element={<NoMatchRoute />} />
      </Routes>
    </>
  )
}

export default App
