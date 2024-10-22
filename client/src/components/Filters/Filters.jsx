import { brands } from "../../utils/brands"

export const Filters = ({ filtered }) => {
    const { filterBrands, setFilterBrands, filterPrice, setFilterPrice } = filtered;

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

    return(
        <>
        <div id="filter" className="bg-cBlack col-start-1 col-span-1 p-4 justify-self-center text-white w-[20vw] top-0">
            <h4 className="text-2xl font-medium font-montserrat">Filtrar</h4><hr className="w-[60%] my-3"/>
            <label htmlFor="price-sort" className="text-xl font-montserrat">Marca:</label>
            <div className="h-[300px] overflow-auto font-poppins">
                {
                    brands.map((brand) => (
                        <div key={brand}>
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
        </>
    )
}