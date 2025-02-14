export const categoriesAndSubCategories = [
    {
        idCategory: [100, 199],
        description: "motor",
        submenu: true,
        subCategories: [
            {
                idSubcategory: [140, 150],
                description: "engranaje",
                categories: ["CADENAS DE DISTRIBUCION", "CONJUNTO DISTRI CAD SILENCIOSA", "CONJUNTO DISTRIBUC CAD RODILLO",
                            "CORRECTORES DE LEVA", "ENGRANAJE ARBOL DE LEVAS", "ENGRANAJE BOMBA ACEITE /CADENA", "ENGRANAJE BOMBA DE ACEITE",
                            "ENGRANAJE BOMBA INYECTORA", "ENGRANAJE CIGUEÑAL", "ENGRANAJE INTERMEDIO", "JUEGO ENGRANAJE DISTRIBUCION", "KIT DISTRIBU CAD/TEN/RET/JUNTA", "KIT DISTRIBUCION CADENA/TENSOR"]
            },
            {
                idSubcategory: [100, 105],
                description: "bulones",
                categories: ["TORNILLOS DE BANCADA", "TORNILLOS DE BIELA", "TORNILLOS P/ TAPA DE CILINDRO"]
            }
        ]
    },
    {
        idCategory: [200, 220],
        description: "encendido",
        submenu: false,
        subCategories: ["CONTACTORES DE ARRANQUE", "JUNTA SENSOR NIVEL COMBUSTIBLE", "LLAVES CONMUTADORAS DE LUCES", "LLAVES DE CONTACTO Y ARRANQUE", "LLAVES TECLAS", "SENSORES NIVEL DE COMBUSTIBLE"]
    },
    {
        idCategory: [361, 361],
        description: "inyeccion",
        submenu: false,
        subCategories: ["SONDA LAMBDAS"]
    }
];




/* export const categoriesAndSubCategories = [
    {
        idCategory: 100,
        category: "motor",
        subCategories: [
            "tornillos de bancada",
            "tornillos de biela",
            "tornillos p/ tapa de cilindro"
        ]
    },
    {
        idCategory: 200,
        category: "encendido",
        subCategories: [
            "contactores de arranque",
            "llaves conmutadoras de luces",
            "llaves teclas",
            "sensores nivel de combustible"
        ]
    }
]; */