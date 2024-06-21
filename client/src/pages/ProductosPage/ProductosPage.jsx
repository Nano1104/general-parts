import { useEffect, useState } from "react";

import { InventaryList } from "../../components/InventaryList/InventaryList.jsx";
import { ProductsContainer } from "../../components/ProductsContainer/ProductsContainer.jsx";

export const ProductosPage = () => {
    return(
        <>
            <div id="products-container-grid">
                <InventaryList />
                <ProductsContainer />
            </div>
        </>
    )
}