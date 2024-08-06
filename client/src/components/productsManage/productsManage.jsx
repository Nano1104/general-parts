
export const ProductsManage = () => {
    return(
        <>
        <h2 className="text-2xl font-poppins font-bold mb-4">PRODUCTOS</h2>
        <div>
            <h3>VER PRODUCTOS</h3>
            <button className="bg-orange w-[15%] rounded-md py-1 text-gray font-medium font-poppins" type="submit">AGREGAR PRODUCTO</button>
        </div>
        <hr className="my-4 w-[20%]" />
        <div className="flex flex-col">
            <h3>MODIFICAR PRODUCTO</h3>
            <input type="text" placeholder="Ingresar ID del producto" className="w-[15%] py-1 px-2 my-2" />
            <button className="bg-orange w-[15%] rounded-md py-1 text-gray font-medium font-poppins" type="submit">MODIFICAR PRODUCTO</button>
        </div>
        </>
    )
}