import { categoriesAndSubCategories } from "./categoriesAndSubcategories.js"


export const getSubcategory = (category, subcategory) => {
    const categoryFound = categoriesAndSubCategories.find(cat => cat.description === category);

    if (!categoryFound) {
        console.warn("Categoría no encontrada:", category);
        return null;
    }

    const subcategoryFound = categoryFound.subCategories.find(sub => sub.description == subcategory)

    if (!subcategoryFound) {
        console.warn("Subcategoría no encontrada:", subcategory);
        return null;
    }

    // Toma en cuenta que puede llamarse idSubcategory o ids
    return subcategoryFound.idSubcategory || null;
};
