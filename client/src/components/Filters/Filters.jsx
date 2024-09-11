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
        <div id="filter" className="bg-cBlack text-white w-[20vw] top-0 h-[90vh]">
            <h4>Filtrar</h4>
            <label htmlFor="price-sort">Marca:</label>
            <div className="h-[300px] overflow-auto">
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
                <label htmlFor="price-sort">Precio:</label>
            </div>

        </div>
        </>
    )
}