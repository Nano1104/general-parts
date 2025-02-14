import { useState, useEffect } from "react";
import { productsBrands } from "../../utils/brands"
import { IoIosArrowBack } from "react-icons/io"; //flecha izquierda
import { IoIosArrowDown } from "react-icons/io"; //flecha abajo
import { IoIosArrowUp } from "react-icons/io"; //flecha arriba

import { isMobileFunction } from "../../utils/isMobile.js"

export const Filters = ({ filtered }) => {
    const { setBrand, price, setPrice, setShowFilter } = filtered;

    const [isMobile, setIsMobile] = useState(false);            //indica si la resolucion se encuentra en mobile o no
    const [showElements, setShowElements] = useState(false);    //(funciona para la resolucion de mobile) - Muestra o desaparece las marcas o precios
    const [showPrice, setShowPrice] = useState(false);          //(funciona para la resolucion de mobile)

    const [selectedBrand, setSelectedBrand] = useState(null);      //typeof --> string
    const [selectedPrice, setSelectedPrice] = useState(null);

    //(funciona para la resolucion de mobile) --> muestro las marcas o precios dependiendo el estado de "showElements"
    const handleShowElements = (e) => { 
        const val = e.currentTarget.getAttribute("customVal")
        if(val == "elements") { setShowElements(showElements => !showElements) }
        else if(val == "price") { setShowPrice(showPrice => !showPrice) }
    }

    //filtra por marca
    const handleBrand = (e) => {
        if(e.target.checked) {
            setBrand(e.target.value)
            setSelectedBrand(e.target.value)
        } else {
            setBrand(null)
            setSelectedBrand(null)
        }
    }

    //filtra por precio
    const handlePrice = (e, array) => {
        if(e.target.checked) {
            setSelectedPrice(array)
            setPrice(array)
        } else {
            setSelectedPrice([])
            setPrice([])
        }
    }

    useEffect(() => {
        //funcion --> verifica si el sitio se encuentra en resolucion para mobile
        isMobileFunction(768, isMobile, setIsMobile)
    }, [])

    return(
        <>
        {
        isMobile
        // RESOLUCION PARA MOBILE
        ?               
        <div className="bg-white absolute z-50 top-0 w-full">
            <IoIosArrowBack className="text-[1.5em] m-6" onClick={() => setShowFilter(false)} />
            <h4 className="text-xl font-medium font-montserrat ml-6 mt-6">Filtrar</h4>
            <div className={`border-t-2 ${ showElements ? "border-b-2" : "" } border-gray flex justify-between mt-6 items-center p-3`}>
                <label htmlFor="price-sort" className="text-sm font-poppins ml-3">Marca</label>
                { !showElements ? <IoIosArrowDown customVal="elements" onClick={handleShowElements} className="text-xl" /> : <IoIosArrowUp customVal="elements"  onClick={handleShowElements} className="text-xl" /> }
            </div>
                {
                    showElements 
                    ?
                    <div className="h-[400px] overflow-auto"> 
                    {
                        productsBrands.map((brand) => (
                            <div key={brand} className="my-2 mx-6 text-xs">
                                <input type="checkbox" id={`checkbox-${brand}`} className="accent-orange" checked={filterBrands.includes(brand)} value={brand} onChange={handleBrand} />
                                <label className="ml-1">{brand}</label>
                            </div>
                        ))
                    }
                    </div>
                    : <></>
                }
            <div className="border-t-2 border-gray flex justify-between items-center p-3">
                <label htmlFor="price-sort" className="text-sm font-poppins ml-3">Precio</label>
                { !showPrice ? <IoIosArrowDown customVal="price" onClick={handleShowElements} className="text-xl" /> : <IoIosArrowUp customVal="price"  onClick={handleShowElements} className="text-xl" /> }
            </div>
        </div>
        // RESOLUCION PARA DESKTOP
        :               
        <div id="filter" className="bg-cBlack col-start-1 col-span-1 p-4 justify-self-center text-white w-[20vw] md:w-full md:ml-6 top-0 hidden md:block">
            <h4 className="text-2xl sm:text-xl font-medium font-montserrat">Filtrar</h4><hr className="w-[60%] my-3"/>
            <label htmlFor="price-sort" className="text-xl font-montserrat">Marca:</label>
            <div className="h-[300px] overflow-auto font-poppins">
                {
                    productsBrands.map((brand) => (
                        <div key={brand} className="sm:text-xs my-1">
                            <input type="checkbox" id={`checkbox-${brand}`} className="accent-orange" checked={selectedBrand === brand} value={brand} onChange={handleBrand} />
                            <label className="ml-1">{brand}</label>
                        </div>
                    ))
                }
            </div>

            <div className="mt-4">
                <label htmlFor="price-sort" className="text-xl font-montserrat">Precio:</label>
                <div className="sm:text-xs my-1">
                    <input type="checkbox" className="accent-orange" checked={JSON.stringify(selectedPrice) === JSON.stringify([0, 10000])} onChange={(e) => handlePrice(e, [0, 10000])} />
                    <label className="ml-1">Hasta - $10000</label>
                </div>
                <div className="sm:text-xs my-1">
                    <input type="checkbox" className="accent-orange" checked={JSON.stringify(selectedPrice) === JSON.stringify([10000, 85000])} onChange={(e) => handlePrice(e, [10000, 85000])}  />
                    <label className="ml-1">$10000 - $85000</label>
                </div>

                <div className="sm:text-xs my-1">
                    <input type="checkbox" className="accent-orange" checked={JSON.stringify(selectedPrice) === JSON.stringify([85000])} onChange={(e) => handlePrice(e, [85000])}  />
                    <label className="ml-1">Más de - $85000</label>
                </div>
            </div>
        </div>
        }
        </>
    )
}