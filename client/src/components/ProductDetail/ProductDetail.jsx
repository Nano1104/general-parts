// ─── ProductDetail.jsx ────────────────────────────────────────────────────────
//
// CAMBIOS VISUALES vs original:
//   - Layout: dos columnas en lg+ (imagen izquierda / info derecha), sin altura fija.
//     Antes: lg:h-[90vh] fijo + elementos absolute para breadcrumb y botón volver.
//     Ahora: flex natural, sin posicionamiento absoluto frágil.
//   - "Destacado": franja superior roja + badge, en vez de bg-[#DC5F00] completo.
//   - Sección de pricing: bloque visual separado con bg-zinc-50, jerarquía clara.
//   - Descuentos: tabla compacta en vez de 3 spans sueltos.
//   - Textarea de edición admin: transición suave con border animado.
//   - Botón "Volver": integrado en el flujo normal del layout, no absolute.
//   - Separador entre columnas: border-r vertical visible solo en lg+.
//   - Breadcrumb: mismo componente visual que ProductsContainer.
//
// LÓGICA: sin cambios. Todos los handlers, hooks, estados y condicionales son
// idénticos al original. No se tocó ningún comportamiento de negocio.
// ─────────────────────────────────────────────────────────────────────────────

import axios from "axios";
import { useState, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

// Context
import { useAuthContext } from "../../context/AuthContext.jsx";
import { useCartContext } from "../../context/CartContext.jsx";

// Icons
import { IoCartOutline, IoArrowUndoCircleOutline } from "react-icons/io5";
import { MdKeyboardArrowRight } from "react-icons/md";
import { FaPencil } from "react-icons/fa6";

// Components
import { ItemCount } from "../ItemCount/ItemCount.jsx";

// Utils
import { formatCurrency } from "../../utils/formatCurrency.js";
import { getImage } from "../../utils/getImage.js";
import { API_URL } from "../../utils/api_url.js";

// ─── Breadcrumb item — consistente con ProductsContainer ─────────────────────
const BreadcrumbLink = ({ to, children, isLast = false }) => (
    <>
        <Link
            to={to}
            className={[
                "text-xs font-semibold uppercase tracking-wide transition-colors duration-150",
                isLast
                    ? "text-zinc-900 pointer-events-none"
                    : "text-zinc-400 hover:text-red-600",
            ].join(" ")}
        >
            {children}
        </Link>
        {!isLast && (
            <MdKeyboardArrowRight className="text-zinc-300 flex-shrink-0" aria-hidden="true" />
        )}
    </>
);

// ─── Fila de dato: etiqueta + valor ──────────────────────────────────────────
// Evita repetir el mismo par label/valor en toda la sección de info.
const DataRow = ({ label, children }) => (
    <div className="flex items-baseline justify-between gap-4 py-2.5 border-b border-zinc-100 last:border-0">
        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.1em] flex-shrink-0">
            {label}
        </span>
        <span className="text-sm font-semibold text-zinc-900 text-right">{children}</span>
    </div>
);

// ─── Componente principal ─────────────────────────────────────────────────────
export const ProductDetail = ({ prod }) => {
    const {
        _id,
        codpro,
        desc_stock,
        proveed,
        desc_rubro,
        desc_subrub,
        desc_marca,
        precioimpre,
        stock,
        prod_details,
        imageUrl,
        destacado,
    } = prod;

    const { authUser, isAdmin } = useAuthContext();
    const { addProductToCart } = useCartContext();
    const { id } = useParams();
    const navigate = useNavigate();

    // Sin cambios en lógica de pricing
    const formatedPrice = formatCurrency(precioimpre);
    const d1 = authUser?.discount_1 || 0;
    const d2 = authUser?.discount_2 || 0;
    const d3 = authUser?.discount_3 || 0;
    const netPrice = precioimpre * (1 - d1 / 100) * (1 - d2 / 100) * (1 - d3 / 100);
    const formattedNetPrice = netPrice.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
    });

    // Sin cambios en estados
    const [quantity, setQuantity] = useState(stock);
    const [amount, setAmount] = useState(0);
    const [isFocus, setIsFocus] = useState(false);

    const textareaRef = useRef(null);

    // Sin cambios en handlers
    const encodedCategory = desc_rubro ? desc_rubro.toLowerCase() : "";
    const encodedSubcategory = desc_subrub ? encodeURIComponent(desc_subrub).toLowerCase() : "";

    const handleFocus = () => {
        setIsFocus(f => !f);
        if (!isFocus) textareaRef.current?.focus();
    };

    const handleSubmitNewText = async (e) => {
        e.preventDefault();
        const newText = textareaRef.current.value;
        try {
            const res = await axios.put(
                `${API_URL}/api/products/change-product-fieldValue/${_id}`,
                { field: "prod_details", value: newText },
                { withCredentials: true }
            );
            
            window.location.reload();
        } catch (err) {
            console.log("Error al cambiar texto: " + err);
        }
    };

    const handleAddToCart = () => {
        if (!authUser) {
            Swal.fire({
                html: `
                    <span style="font-weight: 400">Necesitas iniciar sesión para agregar al carrito!</span><br />
                    <a href="https://general-parts.vercel.app/authPage" class="font-bold text-lightRed underline rounded-lg">INICIAR SESIÓN</a>
                `,
                showConfirmButton: false,
                allowOutsideClick: true,
                allowEscapeKey: true,
                backdrop: true,
            });
        } else {
            addProductToCart(_id, authUser.cart._id || null, amount);
        }
    };

    const stockAvailable = stock > 0;

    return (
        <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 font-roboto">

            {/* ── Badge destacado ───────────────────────────────────────────── */}
            {destacado && (
                <div className="mb-4 flex items-center gap-2.5 px-4 py-2.5 bg-orange-500 w-full">
                    <span className="text-white text-xs font-black uppercase tracking-[0.18em]">
                        ★ Producto destacado
                    </span>
                </div>
            )}

            {/* ── Contenedor principal: dos columnas en lg+ ─────────────────── */}
            <div className="flex flex-col lg:flex-row bg-white border border-zinc-100 rounded-xl">

                {/* ═══════════════════════════════════════════════════════════════
                    COLUMNA IZQUIERDA — imagen + breadcrumb + volver
                ════════════════════════════════════════════════════════════════ */}
                <div className="lg:w-[52%] xl:w-[48%] flex flex-col lg:border-r border-zinc-100">

                    {/* Breadcrumb */}
                    <nav
                        aria-label="Navegación"
                        className="flex items-center gap-1.5 flex-wrap px-4 sm:px-6 pt-4 pb-3 border-b border-zinc-100"
                    >
                        <BreadcrumbLink to={`/productos/${encodedCategory}`}>
                            {desc_rubro}
                        </BreadcrumbLink>
                        <BreadcrumbLink to={`/productos/${encodedCategory}/${encodedSubcategory}`}>
                            {desc_subrub}
                        </BreadcrumbLink>
                        <BreadcrumbLink to="#" isLast>
                            {id}
                        </BreadcrumbLink>
                    </nav>

                    {/* Imagen */}
                    <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-12 min-h-[260px] sm:min-h-[320px] lg:min-h-[400px]">
                        {imageUrl ? (
                            <img
                                src={getImage(imageUrl)}
                                alt={`Repuesto: ${desc_stock || codpro}`}
                                className="max-h-[340px] w-full object-contain"
                                loading="eager"
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-3 text-zinc-300">
                                <svg viewBox="0 0 24 24" fill="none" className="w-16 h-16" aria-hidden="true">
                                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1" />
                                    <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1" />
                                    <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 italic">
                                    Imagen en desarrollo
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Botón volver */}
                    <div className="px-4 sm:px-6 pb-5 pt-3 border-t border-zinc-100">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-xs font-bold uppercase
                                       text-zinc-500 hover:text-lightRed transition-colors duration-150 group"
                        >
                            <IoArrowUndoCircleOutline
                                className="text-base group-hover:-translate-x-0.5 transition-transform duration-150"
                                aria-hidden="true"
                            />
                            Volver a productos
                        </button>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════
                    COLUMNA DERECHA — info, pricing, cantidad, descripción
                ════════════════════════════════════════════════════════════════ */}
                <div className="flex-1 flex flex-col">

                    {/* Nombre del producto */}
                    <div className="px-5 sm:px-8 pt-6 pb-5 border-b border-zinc-100">
                        <div className="w-6 h-[3px] bg-lightRed mb-4" aria-hidden="true" />
                        <h1 className="text-2xl sm:text-3xl font-black font-poppins uppercase tracking-tight leading-tight text-zinc-900">
                            {desc_stock}
                        </h1>
                    </div>

                    {/* Datos del producto */}
                    <div className="px-5 sm:px-8 py-5 border-b border-zinc-100">
                        <DataRow label={isAdmin ? "Proveedor" : "Código"}>
                            {isAdmin ? proveed : id}
                        </DataRow>
                        <DataRow label="Marca">{desc_marca || "—"}</DataRow>
                        <DataRow label="Stock">
                            <span className={stockAvailable ? "text-green-600" : "text-lightRed"}>
                                {stockAvailable ? "Disponible" : "Sin stock"}
                            </span>
                        </DataRow>
                    </div>

                    {/* Pricing */}
                    <div className="px-5 sm:px-8 py-5 bg-zinc-50 border-b border-zinc-100">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.18em] mb-4">
                            Precios
                        </p>

                        {/* Precio de lista */}
                        <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                                Lista
                            </span>
                            <span className="text-2xl sm:text-3xl font-black text-zinc-900 leading-none">
                                {formatedPrice}
                            </span>
                            <span className="text-xs text-zinc-400 font-semibold">ARS</span>
                        </div>

                        {/* Descuentos — solo si hay alguno distinto de 0 */}
                        {(d1 > 0 || d2 > 0 || d3 > 0) && (
                            <div className="mb-4 flex flex-col gap-1">
                                {d1 > 0 && (
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-zinc-400 font-medium">Descuento 1</span>
                                        <span className="font-bold text-zinc-700">−{d1}%</span>
                                    </div>
                                )}
                                {d2 > 0 && (
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-zinc-400 font-medium">Descuento 2</span>
                                        <span className="font-bold text-zinc-700">−{d2}%</span>
                                    </div>
                                )}
                                {d3 > 0 && (
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-zinc-400 font-medium">Descuento 3</span>
                                        <span className="font-bold text-zinc-700">−{d3}%</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Precio neto */}
                        <div className="flex items-baseline gap-2 pt-3 border-t border-zinc-200">
                            <span className="text-[11px] font-black text-lightRed uppercase tracking-wider">
                                Neto
                            </span>
                            <span className="text-3xl sm:text-4xl font-black text-lightRed leading-none">
                                {formattedNetPrice}
                            </span>
                            <span className="text-xs text-zinc-400 font-semibold">ARS</span>
                        </div>
                        <p className="text-[10px] text-zinc-400 italic mt-1.5 tracking-wide">
                            * Precio no incluye IVA
                        </p>
                    </div>

                    {/* Cantidad + agregar al carrito */}
                    <div className="px-5 sm:px-8 py-5 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.08em]">
                                Cantidad
                            </span>
                            {/* ItemCount no cambia — recibe exactamente las mismas props */}
                            <ItemCount handleQuantity={{ quantity, amount, setAmount }} />
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={!stockAvailable}
                            className={[
                                "flex items-center justify-center gap-2 sm:ml-auto rounded-md",
                                "px-6 py-3 text-sm font-bold uppercase",
                                "transition-colors duration-150",
                                stockAvailable
                                    ? "bg-zinc-900 hover:bg-lightRed text-white"
                                    : "bg-zinc-200 text-zinc-400 cursor-not-allowed",
                            ].join(" ")}
                        >
                            <IoCartOutline className="text-lg" aria-hidden="true" />
                            <span>Agregar al carrito</span>
                        </button>
                    </div>

                    {/* Descripción del producto */}
                    <div className="px-5 sm:px-8 py-5 flex-1">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.08em]">
                                Descripción del producto
                            </p>
                            {authUser && isAdmin && (
                                <button
                                    type="button"
                                    onClick={handleFocus}
                                    aria-label={isFocus ? "Cancelar edición" : "Editar descripción"}
                                    className={[
                                        "flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider",
                                        "transition-colors duration-150",
                                        isFocus
                                            ? "bg-zinc-900 text-white"
                                            : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800",
                                    ].join(" ")}
                                >
                                    <FaPencil className="text-[10px]" aria-hidden="true" />
                                    {isFocus ? "Editando..." : "Editar"}
                                </button>
                            )}
                        </div>

                        {/* Form de edición admin — lógica sin cambios */}
                        <form onSubmit={handleSubmitNewText}>
                            <textarea
                                ref={textareaRef}
                                defaultValue={prod_details}
                                readOnly={!isFocus}
                                rows={5}
                                className={[
                                    "w-full resize-none text-sm text-zinc-700 leading-relaxed rounded-md",
                                    "bg-transparent outline-none",
                                    "transition-all duration-150",
                                    isFocus
                                        ? "border border-zinc-300 p-3 focus:border-zinc-800"
                                        : "border-transparent p-0 cursor-default",
                                ].join(" ")}
                            />
                            {isFocus && (
                                <div className="flex gap-2 mt-2">
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-zinc-900 hover:bg-lightRed text-white
                                                   text-[11px] font-bold uppercase tracking-wider
                                                   transition-colors duration-150"
                                    >
                                        Guardar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsFocus(false)}
                                        className="px-4 py-2 bg-zinc-100 hover:bg-lightRed text-zinc-600
                                                   text-[11px] font-bold uppercase tracking-wider
                                                   transition-colors duration-150"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};