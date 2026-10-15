import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "./context/AuthContext.jsx";
import { Loading } from "./components/Loading/Loading.jsx";

//PAGES
// La Home va en el bundle principal (es la página de entrada). El resto se descarga recién al
// navegar a cada ruta: quien solo mira la Home no baja el panel admin, el registro, el carrito, etc.
import { Home } from "./pages/Home/Home.jsx"
// Si el sitio estaba abierto durante un deploy, el archivo de la página (con hash viejo) puede no
// existir más: se recarga una vez para traer la versión nueva en lugar de mostrar una pantalla rota.
const RELOAD_FLAG = "chunk-reload";
const lazyPage = (load, name) => lazy(() => load()
  .then(m => {
    try { sessionStorage.removeItem(RELOAD_FLAG); } catch { /* sin storage: no importa */ }
    return { default: m[name] };
  })
  .catch(err => {
    let reloaded = true;
    try { reloaded = sessionStorage.getItem(RELOAD_FLAG) === "1"; sessionStorage.setItem(RELOAD_FLAG, "1"); } catch { /* sin storage: no recargar en bucle */ }
    if (!reloaded) window.location.reload();
    throw err;
  }));
const AuthPage = lazyPage(() => import("./pages/AuthPage/AuthPage.jsx"), "AuthPage");
const ProductosPage = lazyPage(() => import("./pages/ProductosPage/ProductosPage.jsx"), "ProductosPage");
const Contact = lazyPage(() => import("./pages/Contact/Contact.jsx"), "Contact");
const ProductDetailContainer = lazyPage(() => import("./pages/ProductDetailContainer/ProductDetailContainer.jsx"), "ProductDetailContainer");
const NoMatchRoute = lazyPage(() => import("./pages/NoMatchRoute/NoMatchRoute.jsx"), "NoMatchRoute");
const AdminPage = lazyPage(() => import("./pages/AdminPage/AdminPage.jsx"), "AdminPage");
const Orders = lazyPage(() => import("./pages/Orders/Orders.jsx"), "Orders");
const Cart = lazyPage(() => import("./pages/Cart/Cart.jsx"), "Cart");

function App() {
  const { authUser, isAdmin } = useAuthContext()


  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/productos" element={ authUser ? <ProductosPage /> : <AuthPage /> } />
        <Route path="/productos/:category" element={ authUser ? <ProductosPage /> : <AuthPage /> } />
        <Route path="/productos/:category/:subcategory" element={ authUser ? <ProductosPage /> : <AuthPage /> } />
        <Route path="/productos/:category/:subcategory/:categories" element={ authUser ? <ProductosPage /> : <AuthPage /> } />
        <Route path="/producto/detail/:id" element={ authUser ? <ProductDetailContainer /> : <AuthPage /> } />

        <Route path="/admin" element={ isAdmin ? <AdminPage /> : <Navigate to="/" /> } />
        <Route path="/admin/:manage" element={ isAdmin ? <AdminPage /> : <Navigate to="/" /> } />
        <Route path="/reservas" element={ isAdmin ? <Orders /> : <Navigate to="/" /> } />
        <Route path="/authPage" element={ !authUser ? <AuthPage /> : <Navigate to="/" /> } />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart-v" element={ authUser ? <Cart /> : <Navigate to="/" /> } />
        <Route path="*" element={<NoMatchRoute />} />
      </Routes>
    </Suspense>
  )
}

export default App
