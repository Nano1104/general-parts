import { useState } from "react";
//utils: trae todas las marcas disponibles
import { productsBrands } from "../../utils/brands"
//icons
import { IoIosArrowBack } from "react-icons/io"; //flecha izquierda
import { FaChevronDown } from "react-icons/fa6";
//hook
import { useIsMobile } from "../../hooks/isMobile.js";

export const Filters = ({ filtered }) => {
    const { setBrand, price, setPrice, setShowFilter } = filtered;
    const isMobile = useIsMobile(768);

    // Estados para controlar secciones expandibles
    const [showBrands, setShowBrands] = useState(true);
    const [showPrices, setShowPrices] = useState(true);

    // Estados para valores seleccionados
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [selectedPrice, setSelectedPrice] = useState(null);

    // Toggle para secciones
    const handleToggleSection = (section) => {
        if (section === "brands") {
            setShowBrands(!showBrands);
        } else if (section === "prices") {
            setShowPrices(!showPrices);
        }
    };

    // Filtra por marca
    const handleBrand = (e) => {
        if (e.target.checked) {
            setBrand(e.target.value);
            setSelectedBrand(e.target.value);
        } else {
            setBrand(null);
            setSelectedBrand(null);
        }
    };

    // Filtra por precio
    const handlePrice = (e, array) => {
        if (e.target.checked) {
            setSelectedPrice(array);
            setPrice(array);
        } else {
            setSelectedPrice([]);
            setPrice([]);
        }
    };

    // Limpiar todos los filtros
    const clearAllFilters = () => {
        setBrand(null);
        setSelectedBrand(null);
        setPrice([]);
        setSelectedPrice([]);
    };


    //VERSION MOBILE
    if (isMobile) {
        return (
            <div className="fixed inset-0 bg-white z-[100] overflow-y-auto">
                {/* Header móvil */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowFilter(false)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                            aria-label="Cerrar filtros"
                        >
                            <IoIosArrowBack className="text-xl text-gray-700" />
                        </button>
                        <h2 className="text-xl font-semibold font-montserrat text-gray-800">
                            Filtros
                        </h2>
                    </div>

                    <button
                        onClick={clearAllFilters}
                        className="text-sm text-lightRed font-medium hover:text-red-700 transition-colors duration-200"
                    >
                        Limpiar todo
                    </button>
                </div>

                <div className="px-4 py-6 space-y-6">
                    {/* Sección de Marcas */}
                    <div className="space-y-4">
                        <button
                            onClick={() => handleToggleSection("brands")}
                            className="w-full flex items-center justify-between py-3 px-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                            aria-expanded={showBrands}
                        >
                            <h3 className="font-medium font-poppins text-gray-800">
                                Marca
                                {selectedBrand && (
                                    <span className="ml-2 text-xs bg-lightRed text-white px-2 py-1 rounded-full">
                                        1
                                    </span>
                                )}
                            </h3>
                            <FaChevronDown className={`text-sm text-gray-600 transform transition-transform duration-200 ${showBrands ? 'rotate-180' : ''}`} />
                        </button>

                        {showBrands && (
                            <div className="bg-white border border-gray-200 rounded-lg max-h-80 overflow-y-auto">
                                <div className="p-4 space-y-3">
                                    {productsBrands.map((brand) => (
                                        <label
                                            key={brand}
                                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                className="accent-lightRed w-4 h-4"
                                                checked={selectedBrand === brand}
                                                value={brand}
                                                onChange={handleBrand}
                                            />
                                            <span className="text-sm text-gray-700 font-poppins">
                                                {brand}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sección de Precios */}
                    <div className="space-y-4">
                        <button
                            onClick={() => handleToggleSection("prices")}
                            className="w-full flex items-center justify-between py-3 px-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                            aria-expanded={showPrices}
                        >
                            <h3 className="font-medium font-poppins text-gray-800">
                                Precio
                                {selectedPrice && selectedPrice.length > 0 && (
                                    <span className="ml-2 text-xs bg-lightRed text-white px-2 py-1 rounded-full">
                                        1
                                    </span>
                                )}
                            </h3>
                            <FaChevronDown className={`text-sm text-gray-600 transform transition-transform duration-200 ${showPrices ? 'rotate-180' : ''}`} />
                        </button>

                        {showPrices && (
                            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                                <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="accent-lightRed w-4 h-4"
                                        checked={JSON.stringify(selectedPrice) === JSON.stringify([0, 10000])}
                                        onChange={(e) => handlePrice(e, [0, 10000])}
                                    />
                                    <span className="text-sm text-gray-700 font-poppins">
                                        Hasta $10,000
                                    </span>
                                </label>

                                <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="accent-lightRed w-4 h-4"
                                        checked={JSON.stringify(selectedPrice) === JSON.stringify([10000, 85000])}
                                        onChange={(e) => handlePrice(e, [10000, 85000])}
                                    />
                                    <span className="text-sm text-gray-700 font-poppins">
                                        $10,000 - $85,000
                                    </span>
                                </label>

                                <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="accent-lightRed w-4 h-4"
                                        checked={JSON.stringify(selectedPrice) === JSON.stringify([85000])}
                                        onChange={(e) => handlePrice(e, [85000])}
                                    />
                                    <span className="text-sm text-gray-700 font-poppins">
                                        Más de $85,000
                                    </span>
                                </label>
                            </div>
                        )}
                    </div>
                </div>

                {/* Botón flotante para aplicar (opcional) */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
                    <button
                        onClick={() => setShowFilter(false)}
                        className="w-full bg-lightRed hover:bg-red-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 font-montserrat"
                    >
                        Aplicar Filtros
                    </button>
                </div>
            </div>
        );
    }

    // VERSION DESKTOP
    return (
        <div className="rounded-lg p-6 h-fit sticky top-6 ml-4">
            {/* Header con botón limpiar */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl 2xl:text-2xl font-bold font-poppins text-gray-800">
                    Filtros
                </h2>
                {(selectedBrand || (selectedPrice && selectedPrice.length > 0)) && (
                    <button
                        onClick={clearAllFilters}
                        className="text-sm text-lightRed hover:text-deepRed font-medium transition-colors duration-200"
                    >
                        Limpiar
                    </button>
                )}
            </div>

            <div className="space-y-6">
                {/* Sección de Marcas Desktop */}
                <div>
                    <button
                        onClick={() => handleToggleSection("brands")}
                        className="flex items-center justify-between w-full mb-4 hover:text-lightRed transition-colors duration-200"
                        aria-expanded={showBrands}
                    >
                        <h3 className="text-lg font-semibold font-poppins text-gray-800">
                            Marca
                            {selectedBrand && (
                                <span className="ml-2 text-xs bg-lightRed text-white px-2 py-1 rounded-full">
                                    1
                                </span>
                            )}
                        </h3>
                        <FaChevronDown className={`text-sm text-gray-500 transform transition-transform duration-200 ${showBrands ? 'rotate-180' : ''}`} />
                    </button>

                    {showBrands && (
                        <>
                            <hr className="mb-4 border-gray-200" />
                            <div className="max-h-64 overflow-y-auto pr-2 space-y-2">
                                {productsBrands.map((brand) => (
                                    <label
                                        key={brand}
                                        className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer transition-colors duration-200"
                                    >
                                        <input
                                            type="checkbox"
                                            className="accent-lightRed w-4 h-4"
                                            checked={selectedBrand === brand}
                                            value={brand}
                                            onChange={handleBrand}
                                        />
                                        <span className="text-sm text-gray-700 font-poppins">
                                            {brand}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Sección de Precios Desktop */}
                <div>
                    <button
                        onClick={() => handleToggleSection("prices")}
                        className="flex items-center justify-between w-full mb-4 hover:text-lightRed transition-colors duration-200"
                        aria-expanded={showPrices}
                    >
                        <h3 className="text-lg font-semibold font-poppins text-gray-800">
                            Precio
                            {selectedPrice && selectedPrice.length > 0 && (
                                <span className="ml-2 text-xs bg-lightRed text-white px-2 py-1 rounded-full">
                                    1
                                </span>
                            )}
                        </h3>
                        <FaChevronDown className={`text-sm text-gray-500 transform transition-transform duration-200 ${showPrices ? 'rotate-180' : ''}`} />
                    </button>

                    {showPrices && (
                        <>
                            <hr className="mb-4 border-gray-200" />
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer transition-colors duration-200">
                                    <input
                                        type="checkbox"
                                        className="accent-lightRed w-4 h-4"
                                        checked={JSON.stringify(selectedPrice) === JSON.stringify([0, 10000])}
                                        onChange={(e) => handlePrice(e, [0, 10000])}
                                    />
                                    <span className="text-sm text-gray-700 font-poppins">
                                        Hasta $10,000
                                    </span>
                                </label>

                                <label className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer transition-colors duration-200">
                                    <input
                                        type="checkbox"
                                        className="accent-lightRed w-4 h-4"
                                        checked={JSON.stringify(selectedPrice) === JSON.stringify([10000, 85000])}
                                        onChange={(e) => handlePrice(e, [10000, 85000])}
                                    />
                                    <span className="text-sm text-gray-700 font-poppins">
                                        $10,000 - $85,000
                                    </span>
                                </label>

                                <label className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer transition-colors duration-200">
                                    <input
                                        type="checkbox"
                                        className="accent-lightRed w-4 h-4"
                                        checked={JSON.stringify(selectedPrice) === JSON.stringify([85000])}
                                        onChange={(e) => handlePrice(e, [85000])}
                                    />
                                    <span className="text-sm text-gray-700 font-poppins">
                                        Más de $85,000
                                    </span>
                                </label>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};