import { useState, useEffect } from "react";
import { brands } from "../../utils/brands"
import { IoIosArrowBack } from "react-icons/io"; //flecha izquierda
import { IoIosArrowDown } from "react-icons/io"; //flecha abajo
import { IoIosArrowUp } from "react-icons/io"; //flecha arriba

export const Filters = ({ filtered }) => {
    const { filterBrands, setFilterBrands, filterPrice, setFilterPrice, setShowFilter } = filtered;
    const [isMobile, setIsMobile] = useState(false);
    const [showElements, setShowElements] = useState(false);
    const [showPrice, setShowPrice] = useState(false);

    const handleShowElements = (e) => {
        const val = e.currentTarget.getAttribute("customVal")
        if(val == "elements") { setShowElements(showElements => !showElements) }
        else if(val == "price") { setShowPrice(showPrice => !showPrice) }
    }

    const handleBrand = (e) => {
        if(e.target.checked) {
            setFilterBrands([...filterBrands, e.target.value])
        } else {
            const index = filterBrands.indexOf(e.target.value);
            if (index !== -1) { // Asegúrate de que el valor existe en el array
                const newFilterBrands = [...filterBrands]; // Copia el array original
                newFilterBrands.splice(index, 1); // Elimina el elemento en la posición 'index'
                setFilterBrands(newFilterBrands); // Actualiza el estado con el nuevo array
            }
        }
    }

    const handlePrice = (e) => {

    }

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        handleResize(); // Ejecutar al cargar el componente
        window.addEventListener("resize", handleResize); // Escuchar cambios de tamaño

        return () => {
            window.removeEventListener("resize", handleResize); // Limpiar evento
        };
    }, [])

    return(
        <>
        {
        isMobile
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
                        brands.map((brand) => (
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
        :
        <div id="filter" className="bg-cBlack col-start-1 col-span-1 p-4 justify-self-center text-white w-[20vw] md:w-full md:ml-6 top-0 hidden md:block">
            <h4 className="text-2xl sm:text-xl font-medium font-montserrat">Filtrar</h4><hr className="w-[60%] my-3"/>
            <label htmlFor="price-sort" className="text-xl font-montserrat">Marca:</label>
            <div className="h-[300px] overflow-auto font-poppins">
                {
                    brands.map((brand) => (
                        <div key={brand} className="sm:text-xs">
                            <input type="checkbox" id={`checkbox-${brand}`} className="accent-orange" checked={filterBrands.includes(brand)} value={brand} onChange={handleBrand} />
                            <label className="ml-1">{brand}</label>
                        </div>
                    ))
                }
            </div>

            <div className="mt-4">
                <label htmlFor="price-sort" className="text-xl font-montserrat">Precio:</label>
            </div>
        </div>
        }
        </>
    )
}