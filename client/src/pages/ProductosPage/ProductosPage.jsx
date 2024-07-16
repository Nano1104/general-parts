import { useEffect, useState } from "react";

import { InventaryList } from "../../components/InventaryList/InventaryList.jsx";
import { ProductsContainer } from "../../components/ProductsContainer/ProductsContainer.jsx";
import { ProductsContainerNav } from "../../components/ProductsContainerNav/ProductsContainerNav.jsx";

export const ProductosPage = () => {
    const [searchValue, setSearchValue] = useState("");

    return(
        <>
            <ProductsContainerNav searchValue={searchValue} setSearchValue={setSearchValue} />
            <InventaryList />
            <ProductsContainer searchValue={searchValue} />
            {/* <div id="products-container-grid">
                <ProductsContainer />
            </div> */}
        </>
    )
}