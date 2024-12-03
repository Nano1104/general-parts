import { Product } from "../Product/Product"

export const News = () => {
    const prod = { codpro: "217VH", desc_stock: "Nuevo producto", price: 77294.25 }
    const category = "param1"; const subcategory = "param2";

    return(
        <>
        <div className="mt-6">
            {/* <h1 className="text-lightGray font-medium text-2xl font-montserrat text-center">- Destacado del día -</h1> */}

            <div className="grid justify-items-center gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 mt-8">
                <Product key={"prueba"} data={prod} params={[category, subcategory]} featured={true} />
                <Product key={"prueba"} data={prod} params={[category, subcategory]} featured={true} />
                <Product key={"prueba"} data={prod} params={[category, subcategory]} featured={true} />
                <Product key={"prueba"} data={prod} params={[category, subcategory]} featured={true} />
            </div>
        </div>
        </>
    )
}