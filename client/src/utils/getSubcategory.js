import { categoriesAndSubCategories } from "./categories&SubCategories.js"

export const getSubcategory = (category, subcategory) => {
    const categoryFound = categoriesAndSubCategories.find(cat => cat.description == category)

    if (!categoryFound.submenu) {
        return categoryFound.subCategories.find(sub => sub == subcategory)
    } else {
        return categoryFound.subCategories.find(sub => sub.description == subcategory)
    }
}