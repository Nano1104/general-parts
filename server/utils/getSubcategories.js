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

export const getSubcategoryIdsForGroup = (groupName) => {
    // Definimos los IDs para cada grupo
    const GROUP_IDS = {
        engranaje: [149, 147, 146, 151, 140, 139, 141, 142, 143, 144, 145, 150, 148],
        bulones: [101, 102, 103]
    };
    
    return GROUP_IDS[groupName] || null;
};
