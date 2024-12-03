import { useEffect, useState } from "react";

import { InventaryList } from "../../components/InventaryList/InventaryList.jsx";
import { News } from "../../components/News/News.jsx";
import { ProductsContainer } from "../../components/ProductsContainer/ProductsContainer.jsx";
import { ProductsContainerNav } from "../../components/ProductsContainerNav/ProductsContainerNav.jsx";

export const ProductosPage = () => {
    const [searchValue, setSearchValue] = useState("");
    const [showNews, setShowNews] = useState(false);

    return(
        <>
            <ProductsContainerNav searchValue={searchValue} setSearchValue={setSearchValue} />
            <InventaryList stateNews={{showNews, setShowNews}} />
            {
                showNews ? <News /> : <ProductsContainer searchValue={searchValue} />
            }
        </>
    )
}