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
        idCategory: [200, 355],
        description: "encendido",
        submenu: false,
        subCategories: [
            {
                idSubcategory: [200, 355],
                description: "encendido",
                categories: [ "CONTACTORES DE ARRANQUE", "JUNTA SENSOR NIVEL COMBUSTIBLE", "LLAVES CONMUTADORAS DE LUCES", "LLAVES DE CONTACTO Y ARRANQUE", "LLAVES TECLAS",
                        "SENSORES NIVEL DE COMBUSTIBLE", "BOMBA NAFTA ELECTRICA COMPLETA", "TAPAS DE BOMBAS DE NAFTA", "TAPAS ROSCA DE BOMBA DE NAFTA", ""]
            }
        ]
    },
    {
        idCategory: [361, 361],
        description: "inyeccion",
        submenu: false,
        subCategories: [
            {
                idSubcategory: [361, 361],
                description: "sonda lambda",
                categories: ["SONDA LAMBDAS"]
            }
        ]
    }
];