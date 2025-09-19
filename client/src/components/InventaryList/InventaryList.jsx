import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { API_URL } from "../../utils/api_url.js"
import { useAuthContext } from "../../context/AuthContext.jsx";
//components
import { Category } from "../Category/Category.jsx";
import { Link } from "react-router-dom";

export const InventaryList = ({ stateNews }) => {
    const { setShowNews } = stateNews;
    const [categories, setCategories] = useState([]);
    const { isAdmin } = useAuthContext();
    const menuRef = useRef(null);
    
    // Estados separados
    const [isRubrosOpen, setIsRubrosOpen] = useState(false); // Para el menú principal
    const [activeSubCategory, setActiveSubCategory] = useState(null); // Para subcategorías

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/products/rubro/get-categories-and-subcategories`);
                setCategories(response.data.categories);
            } catch (err) {
                console.error("Error fetching categories:", err);
            }
        };
        fetchCategories();

        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsRubrosOpen(false);
                setActiveSubCategory(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleRubrosClick = () => {
        setShowNews(false);
        setIsRubrosOpen(!isRubrosOpen);
        if (!isRubrosOpen) setActiveSubCategory(null); // Reset al abrir
    };

    const handleDestacadoClick = () => {
        setShowNews(true);
        setIsRubrosOpen(false);
        setActiveSubCategory(null);
    };

    return (
        <nav className="bg-deepGray flex h-8 relative px-7 text-xs lg:text-sm"> 
            <div ref={menuRef} className="flex">
                <span
                    className="flex items-center italic px-4 h-full bg-cWhite text-black uppercase font-montserrat font-bold tracking-tight cursor-pointer"
                    onClick={handleRubrosClick}
                >
                    RUBROS
                </span>
                
                <span
                    className="flex items-center italic ml-4 px-4 h-full bg-lightRed text-white uppercase font-montserrat font-bold tracking-tight cursor-pointer"
                    onClick={handleDestacadoClick}
                >
                    DESTACADO
                </span>

                {
                    isAdmin && (
                        <Link 
                            to="/"
                            className="flex items-center italic ml-4 px-4 h-full bg-cWhite text-black uppercase font-montserrat font-bold tracking-tight cursor-pointer"
                        >
                            VOLVER A INICIO
                        </Link>
                    )
                }
                
                {isRubrosOpen && (
                    <ul className="flex flex-col mt-8 absolute top-0 left-0 gap-2 bg-gray px-10 py-2 z-50">
                        {categories.map((category, index) => (
                            <Category
                                key={`category-${category.rubro}-${index}`}
                                category={category.rubro}
                                isActive={activeSubCategory === category.rubro}
                                onClick={() => setActiveSubCategory(
                                    activeSubCategory === category.rubro ? null : category.rubro
                                )}
                                categoryData={category}
                            />
                        ))}
                    </ul>
                )}
            </div>
        </nav>
    );
};









/* export const InventaryList = ({ stateNews }) => {
    const { setShowNews } = stateNews
    const [categories, setCategories] = useState([])
    const [showCategories, setShowCategories] = useState(false)

    const [openMenu, setOpenMenu] = useState(null);
    const menuRef = useRef(null);

    const [activeCategory, setActiveCategory] = useState(null);
    const [activeSubCategory, setActiveSubCategory] = useState(null)

    useEffect(() => {
        const fetCategories = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/products/rubro/get-categories-and-subcategories`)
                const data = response.data
                console.log("🚀 ~ fetCategories ~ response:", data)
                
                setCategories(data.categories)
            } catch (err) {
                
            }
        }
        fetCategories()

        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [])

    return(
        <>
            <nav className="bg-gray flex h-8 relative px-7 text-xs lg:text-sm"> 
                <span
                    ref={menuRef}
                    className="flex items-center italic px-4
                    h-full bg-black text-lightGray uppercase font-montserrat font-bold tracking-tight cursor-pointer"
                    onClick={() => {
                        setShowCategories(showCategories => !showCategories)
                        setShowNews(false)
                        setOpenMenu(openMenu === 'main' ? null : 'main')
                    }}
                >
                RUBROS
                </span>
                <span
                    className="flex items-center italic ml-4 px-4
                    h-full bg-orange text-black uppercase font-montserrat font-bold tracking-tight cursor-pointer"
                    onClick={() => {
                        setShowCategories(false)
                        setShowNews(true)
                    }}
                >
                DESTACADO
                </span>
                {
                    showCategories
                    ?
                    <ul className="flex flex-col mt-8 absolute top-0 left-0 gap-2 bg-gray px-10 py-2">
                    {
                        categories.map((category, index) => <Category
                                                                key={`category-${category.rubro}-${index}`}
                                                                category={category.rubro}
                                                                activeCategory={activeCategory}
                                                                setActiveCategory={setActiveCategory}
                                                                activeSubCategory={activeSubCategory}
                                                                setActiveSubCategory={setActiveSubCategory}
                                                                categoryData={category}
                                                            /> )
                    }
                    </ul>
                    : <></>
                }
            </nav>
        </>
    )
} */