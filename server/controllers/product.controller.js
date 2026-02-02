import { postProductsInDB } from "../utils/post-products-db.js";

import xlsx from 'xlsx';
import _ from "lodash";
import Product from "../models/product.model.js";
import agendaModule from '../agenda.js'

const MOTOR_GROUPS = {
    engranaje: [149, 147, 146, 151, 140, 139, 141, 142, 143, 144, 145, 150, 148],
    bulones: [101, 102, 103]
};

// ---------------------------
// BUSCADOR DE PRODUCTOS
// ---------------------------
export const getProducts = async (req, res) => {
    try {
        const { search, limit = 10, lastId, ...filters } = req.query;

        const baseFilter = buildBaseFilter(filters);

        let products = [];
        if (search) {
            const decodedSearch = decodeURIComponent(search).trim();
            products = await smartSearch(baseFilter, decodedSearch, limit, lastId);
        } else {
            products = await executeProductQuery(baseFilter, limit, lastId);
        }

        const hasMore = products.length > parseInt(limit);
        const response = {
            success: true,
            products: hasMore ? products.slice(0, -1) : products,
            hasMore,
            total: await Product.countDocuments(baseFilter)
        };

        return res.json(response);

    } catch (err) {
        console.error('Error en getProducts:', err);
        res.status(500).json({
            success: false,
            message: "Error al obtener productos",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

function escapeRegex(s = "") {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function ensureNumbers(arr) {
    return arr.map((v) => {
        const n = Number(v);
        return Number.isNaN(n) ? v : n;
    });
}

// buildBaseFilter limpio y determinista
function buildBaseFilter(params = {}) {
    const filter = {};

    if (params.category) {
        filter.desc_rubro = params.category.toString().toUpperCase();
    }

    if (params.brand) {
        filter.desc_marca = params.brand.toString().toUpperCase();
    }

    // --- SUBCATEGORY logic (centralizada acá, y sin asignar desc_subrub previamente) ---
    if (params.subcategory) {
        const raw = params.subcategory.toString().trim();
        const key = raw.toLowerCase();

        if (MOTOR_GROUPS[key]) {
            // Si es uno de los grupos especiales, filtramos por 'rubro' usando los códigos
            // Convertimos a Number porque muy probablemente 'rubro' en la BD sea numérico.
            // Si tu BD tiene rubro como string, cambialo a .map(String) en su lugar.
            filter.rubro = { $in: ensureNumbers(MOTOR_GROUPS[key]) };
        } else {
            // Caso normal: buscamos por desc_subrub (case-insensitive, coincidencia exacta)
            filter.desc_subrub = { $regex: `^${escapeRegex(raw)}$`, $options: "i" };
        }
    }

    // precios
    if (!isNaN(params.minPrice) || !isNaN(params.maxPrice)) {
        filter.precioimpre = {};
        if (!isNaN(params.minPrice)) filter.precioimpre.$gte = parseFloat(params.minPrice);
        if (!isNaN(params.maxPrice)) filter.precioimpre.$lte = parseFloat(params.maxPrice);
    }

    return filter;
}

// Nueva función de búsqueda inteligente
async function smartSearch(baseFilter, searchTerm, limit, lastId) {
    const rawTerms = searchTerm.toLowerCase().split(/\s+/).filter(t => t.length > 0);
    const terms = normalizeTerms(rawTerms);

    // Construir múltiples queries con diferentes niveles de especificidad
    const queries = buildSearchQueries(baseFilter, terms, searchTerm);

    let allResults = [];
    const seenIds = new Set();

    // Ejecutar queries en orden de prioridad
    for (const query of queries) {
        const results = await executeProductQuery(query, 50, lastId); // Buscar más para luego filtrar

        // Agregar solo productos no vistos
        for (const product of results) {
            if (!seenIds.has(product._id.toString())) {
                seenIds.add(product._id.toString());

                // Calcular score de relevancia
                const score = calculateRelevanceScore(product, terms, searchTerm);
                product._score = score;

                allResults.push(product);
            }
        }

        // Si ya tenemos suficientes resultados relevantes, parar
        if (allResults.length >= parseInt(limit) * 3) break;
    }

    // Ordenar por relevancia y limitar
    return allResults
        .sort((a, b) => b._score - a._score)
        .slice(0, parseInt(limit) + 1);
}

// Función para normalizar términos (manejar plurales, géneros, etc.)
function normalizeTerms(terms) {
    const normalized = [];

    terms.forEach(term => {
        const variants = getWordVariants(term);
        normalized.push(...variants);
    });

    // Remover duplicados manteniendo el orden
    return [...new Set(normalized)];
}

// Generar variantes de una palabra
function getWordVariants(word) {
    const variants = [word]; // Siempre incluir la palabra original

    // Diccionario específico de plurales/singulares comunes en autopartes
    const autopartsDict = {
        // Plurales -> Singular
        'sondas': 'sonda',
        'sensores': 'sensor',
        'bombas': 'bomba',
        'filtros': 'filtro',
        'discos': 'disco',
        'pastillas': 'pastilla',
        'bujias': 'bujia',
        'correas': 'correa',
        'amortiguadores': 'amortiguador',
        'rotulas': 'rotula',
        'terminales': 'terminal',
        'cazoletas': 'cazoleta',
        'retenes': 'reten',
        'juntas': 'junta',
        'tornillos': 'tornillo',
        'tuercas': 'tuerca',
        'arandelas': 'arandela',
        'pernos': 'perno',
        'bulones': 'bulon',
        'espirales': 'espiral',
        'resortes': 'resorte',
        'brazos': 'brazo',
        'bielas': 'biela',
        'pistones': 'piston',
        'anillos': 'anillo',
        'valvulas': 'valvula',
        'inyectores': 'inyector',
        'bobinas': 'bobina',
        'cables': 'cable',
        'mangueras': 'manguera',
        'radiadores': 'radiador',
        'ventiladores': 'ventilador',
        'alternadores': 'alternador',
        'arranques': 'arranque',
        'escobillas': 'escobilla',
        'carbones': 'carbon',
        'rodamientos': 'rodamiento',
        'rulemanes': 'ruleman',
        'cojinetes': 'cojinete',
        'crucetas': 'cruceta',
        'guardapolvos': 'guardapolvo',
        'fuelles': 'fuelle',
        'silentblocks': 'silentblock',
        'bujes': 'buje',
        'casquillos': 'casquillo',
        'sellos': 'sello',
        'estoperas': 'estopera',
        'empaques': 'empaque',
        'lijas': 'lija',
        'masillas': 'masilla',
        'pinturas': 'pintura',
        'aceites': 'aceite',
        'liquidos': 'liquido',
        'refrigerantes': 'refrigerante',
        'lubricantes': 'lubricante',
        'grasas': 'grasa',
        'aditivos': 'aditivo',
        'limpiadores': 'limpiador',
        'desengrasantes': 'desengrasante',
        'selladores': 'sellador',
        'adhesivos': 'adhesivo',

        // Singular -> Plural (agregar el inverso)
        'sonda': 'sondas',
        'sensor': 'sensores',
        'bomba': 'bombas',
        'filtro': 'filtros',
        'disco': 'discos',
        'pastilla': 'pastillas',
        'bujia': 'bujias',
        'correa': 'correas',
        'amortiguador': 'amortiguadores',
        'rotula': 'rotulas',
        'terminal': 'terminales',
        'cazoleta': 'cazoletas',
        'reten': 'retenes',
        'junta': 'juntas',
        'tornillo': 'tornillos',
        'tuerca': 'tuercas',
        'arandela': 'arandelas',
        'perno': 'pernos',
        'bulon': 'bulones',
        'espiral': 'espirales',
        'resorte': 'resortes',
        'brazo': 'brazos',
        'biela': 'bielas',
        'piston': 'pistones',
        'anillo': 'anillos',
        'valvula': 'valvulas',
        'inyector': 'inyectores',
        'bobina': 'bobinas',
        'cable': 'cables',
        'manguera': 'mangueras',
        'radiador': 'radiadores',
        'ventilador': 'ventiladores',
        'alternador': 'alternadores',
        'arranque': 'arranques',
        'escobilla': 'escobillas',
        'carbon': 'carbones',
        'rodamiento': 'rodamientos',
        'ruleman': 'rulemanes',
        'cojinete': 'cojinetes',
        'cruceta': 'crucetas',
        'guardapolvo': 'guardapolvos',
        'fuelle': 'fuelles',
        'silentblock': 'silentblocks',
        'buje': 'bujes',
        'casquillo': 'casquillos',
        'sello': 'sellos',
        'estopera': 'estoperas',
        'empaque': 'empaques'
    };

    // Buscar en diccionario específico
    if (autopartsDict[word]) {
        variants.push(autopartsDict[word]);
    }

    // Reglas generales para español (como fallback)
    if (word.length >= 4) {
        // Manejar plurales terminados en -s
        if (word.endsWith('s') && !word.endsWith('ss')) {
            variants.push(word.slice(0, -1)); // quitar 's'
        } else {
            variants.push(word + 's'); // agregar 's'
        }

        // Manejar plurales terminados en -es
        if (word.endsWith('es') && word.length > 3) {
            variants.push(word.slice(0, -2)); // quitar 'es'
        } else if (!word.endsWith('s')) {
            variants.push(word + 'es'); // agregar 'es'
        }

        // Variaciones comunes
        if (word.endsWith('or')) {
            variants.push(word + 'es'); // sensor -> sensores
        }
        if (word.endsWith('ores')) {
            variants.push(word.slice(0, -2)); // sensores -> sensor
        }
    }

    return [...new Set(variants)]; // Remover duplicados
}

// Construir queries con diferentes niveles de especificidad
function buildSearchQueries(baseFilter, terms, originalTerm) {
    const queries = [];

    // 1. PRIORIDAD MÁXIMA: Código exacto completo
    if (/^[a-zA-Z0-9]+$/i.test(originalTerm.replace(/\s/g, ''))) {
        queries.push({
            ...baseFilter,
            codpro: { $regex: `^${originalTerm.replace(/\s/g, '')}`, $options: 'i' }
        });
    }

    // 2. ALTA PRIORIDAD: Códigos que empiecen con números o letras del término
    const codeTerms = terms.filter(t => /[0-9a-zA-Z]{3,}/.test(t));
    if (codeTerms.length > 0) {
        queries.push({
            ...baseFilter,
            $or: codeTerms.map(term => ({
                codpro: { $regex: `^${term}`, $options: 'i' }
            }))
        });
    }

    // 3. ALTA PRIORIDAD: Frase exacta en descripción
    if (terms.length > 1) {
        const exactPhrase = terms.join(' ');
        queries.push({
            ...baseFilter,
            $or: [
                { desc_stock: { $regex: exactPhrase, $options: 'i' } },
                { desc_marca: { $regex: exactPhrase, $options: 'i' } },
                { desc_subrub: { $regex: exactPhrase, $options: 'i' } }
            ]
        });
    }

    // 4. MEDIA-ALTA PRIORIDAD: Todos los términos presentes (más flexible)
    if (terms.length > 1) {
        const allTermsConditions = terms.map(term => ({
            $or: [
                { desc_stock: { $regex: term, $options: 'i' } },
                { desc_marca: { $regex: term, $options: 'i' } },
                { desc_rubro: { $regex: term, $options: 'i' } },
                { desc_subrub: { $regex: term, $options: 'i' } },
                { codpro: { $regex: term, $options: 'i' } }
            ]
        }));

        queries.push({
            ...baseFilter,
            $and: allTermsConditions
        });
    }

    // 5. MEDIA PRIORIDAD: Al menos algunos términos importantes
    const importantTerms = terms.filter(t => t.length >= 4); // Palabras más largas
    if (importantTerms.length > 0) {
        queries.push({
            ...baseFilter,
            $or: importantTerms.map(term => ({
                $or: [
                    { desc_stock: { $regex: term, $options: 'i' } },
                    { desc_marca: { $regex: term, $options: 'i' } },
                    { desc_subrub: { $regex: term, $options: 'i' } }
                ]
            }))
        });
    }

    // 6. BAJA PRIORIDAD: Cualquier término
    queries.push({
        ...baseFilter,
        $or: terms.map(term => ({
            $or: [
                { desc_stock: { $regex: term, $options: 'i' } },
                { desc_marca: { $regex: term, $options: 'i' } },
                { desc_rubro: { $regex: term, $options: 'i' } },
                { desc_subrub: { $regex: term, $options: 'i' } },
                { codpro: { $regex: term, $options: 'i' } }
            ]
        }))
    });

    return queries;
}

// Cálculo de relevancia mejorado
function calculateRelevanceScore(product, terms, originalTerm) {
    let score = 0;

    const productText = {
        code: (product.codpro || '').toLowerCase(),
        description: (product.desc_stock || '').toLowerCase(),
        brand: (product.desc_marca || '').toLowerCase(),
        category: (product.desc_rubro || '').toLowerCase(),
        subcategory: (product.desc_subrub || '').toLowerCase()
    };

    const searchLower = originalTerm.toLowerCase();
    const allText = Object.values(productText).join(' ');

    // También normalizar los términos originales para el scoring
    const originalTermsNormalized = normalizeTerms(searchLower.split(/\s+/));

    // 1. Código exacto = máximo score
    if (productText.code.startsWith(searchLower.replace(/\s/g, ''))) {
        score += 1000;
    }

    // 2. Frase exacta en descripción (original y normalizada)
    if (productText.description.includes(searchLower)) {
        score += 500;
    }

    // 3. Frase exacta en marca
    if (productText.brand.includes(searchLower)) {
        score += 400;
    }

    // 4. Frase exacta en subcategoría
    if (productText.subcategory.includes(searchLower)) {
        score += 300;
    }

    // 5. Score por cada término encontrado (incluyendo variantes)
    terms.forEach(term => {
        const termLower = term.toLowerCase();

        // Código
        if (productText.code.includes(termLower)) {
            score += productText.code.startsWith(termLower) ? 200 : 100;
        }

        // Descripción
        if (productText.description.includes(termLower)) {
            // Bonus si es palabra completa
            const wordBoundary = new RegExp(`\\b${termLower}\\b`);
            score += wordBoundary.test(productText.description) ? 80 : 40;
        }

        // Marca
        if (productText.brand.includes(termLower)) {
            score += 60;
        }

        // Subcategoría
        if (productText.subcategory.includes(termLower)) {
            score += 40;
        }

        // Categoría
        if (productText.category.includes(termLower)) {
            score += 20;
        }
    });

    // 6. Penalty por términos faltantes en búsquedas específicas (más suave)
    const originalWords = originalTerm.toLowerCase().split(/\s+/);
    const missingTerms = originalWords.filter(originalWord => {
        const variants = getWordVariants(originalWord);
        return !variants.some(variant => allText.includes(variant));
    });
    score -= missingTerms.length * 30; // Reducido de 50 a 30

    // 7. Bonus por longitud de término vs longitud de descripción (más específico = mejor)
    if (originalWords.length >= 3 && productText.description.length < 100) {
        score += 50;
    }

    return Math.max(0, score);
}

// Ejecutar query (sin cambios)
async function executeProductQuery(filter, limit, lastId) {
    let query = Product.find(filter).sort({ _id: 1 }).limit(parseInt(limit) + 1);
    if (lastId) query = query.where('_id').gt(lastId);
    return await query.exec();
}












export const getAllProducts = async (req, res) => {
    const { rubro } = req.params

    if (!rubro) {
        return res.status(400).json({ message: "El parámetro 'desc_rubro' es requerido" });
    }

    try {
        const products = await Product.find({ desc_rubro: rubro })
        res.status(200).json({ message: "Success getting all products from db", productsQuantity: products.length });
    } catch (err) {
        res.status(400).json({ message: "Error getting all products from db", err });
    }
}

export const getCategoriesAndSubcategories = async (req, res) => {
    try {
        const result = await Product.aggregate([
            // 1. Agrupar por combinación única de rubro + subrubro intermedio + subrubro
            {
                $group: {
                    _id: {
                        rubro: "$desc_rubro",
                        subrubroIntermedio: "$desc_subrubro_intermedio", // ✨ NUEVO
                        subrubro: "$desc_subrub",
                        codigoSubrubro: "$subrub"
                    }
                }
            },
            // 2. Agrupar por rubro + subrubro intermedio
            {
                $group: {
                    _id: {
                        rubro: "$_id.rubro",
                        subrubroIntermedio: "$_id.subrubroIntermedio"
                    },
                    subrubros: {
                        $push: {
                            nombre: "$_id.subrubro",
                            codigo: "$_id.codigoSubrubro"
                        }
                    }
                }
            },
            // 3. Eliminar duplicados de subrubros
            {
                $addFields: {
                    subrubros: {
                        $reduce: {
                            input: "$subrubros",
                            initialValue: [],
                            in: {
                                $cond: [
                                    {
                                        $in: [
                                            "$$this.codigo",
                                            { $map: { input: "$$value", as: "v", in: "$$v.codigo" } }
                                        ]
                                    },
                                    "$$value",
                                    { $concatArrays: ["$$value", ["$$this"]] }
                                ]
                            }
                        }
                    }
                }
            },
            // 4. Formatear subrubros como array [nombre, codigo]
            {
                $addFields: {
                    subrubros: {
                        $map: {
                            input: "$subrubros",
                            as: "sub",
                            in: ["$$sub.nombre", "$$sub.codigo"]
                        }
                    }
                }
            },
            // 5. Agrupar por rubro para juntar todos sus subrubros intermedios
            {
                $group: {
                    _id: "$_id.rubro",
                    grupos: {
                        $push: {
                            subrubroIntermedio: "$_id.subrubroIntermedio",
                            subrubros: "$subrubros"
                        }
                    }
                }
            },
            // 6. Separar productos CON y SIN subrubro intermedio
            {
                $addFields: {
                    tieneSubrubrosIntermedios: {
                        $anyElementTrue: {
                            $map: {
                                input: "$grupos",
                                as: "g",
                                in: { $ne: ["$$g.subrubroIntermedio", null] }
                            }
                        }
                    }
                }
            },
            // 7. Formatear salida final
            {
                $project: {
                    _id: 0,
                    rubro: "$_id",
                    // Si tiene subrubros intermedios, agruparlos; si no, mostrar subrubros directamente
                    subrubrosIntermedios: {
                        $cond: [
                            "$tieneSubrubrosIntermedios",
                            {
                                $filter: {
                                    input: {
                                        $map: {
                                            input: "$grupos",
                                            as: "g",
                                            in: {
                                                $cond: [
                                                    { $ne: ["$$g.subrubroIntermedio", null] },
                                                    {
                                                        nombre: "$$g.subrubroIntermedio",
                                                        subrubros: "$$g.subrubros"
                                                    },
                                                    null
                                                ]
                                            }
                                        }
                                    },
                                    as: "item",
                                    cond: { $ne: ["$$item", null] }
                                }
                            },
                            null
                        ]
                    },
                    // Subrubros directos (solo si NO tiene intermedios)
                    subrubros: {
                        $cond: [
                            "$tieneSubrubrosIntermedios",
                            null,
                            {
                                $reduce: {
                                    input: "$grupos",
                                    initialValue: [],
                                    in: {
                                        $concatArrays: ["$$value", "$$this.subrubros"]
                                    }
                                }
                            }
                        ]
                    }
                }
            },
            // 8. Ordenar alfabéticamente
            {
                $sort: { rubro: 1 }
            }
        ]);

        res.status(200).json({
            success: true,
            message: "Success getting categories with optional intermediate subcategories",
            categories: result
        });
    } catch (err) {
        console.error("Error in getCategoriesAndSubcategories:", err);
        res.status(500).json({
            success: false,
            message: "Error getting categories",
            error: err.message
        });
    }
};

export const getProductById = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findOne({ codpro: id });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: `Producto con ID ${id} no encontrado`,
            });
        }

        res.status(200).json({
            success: true,
            message: `Success getting product by id: ${id}`,
            product,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error al obtener producto",
            error: err.message,
        });
    }
};

export const getHighlightedProducts = async (req, res) => {
    try {
        const products = await Product.find({ destacado: true })
        res.status(200).json({ success: true, message: `Success getting highlighted products`, products });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error getting highlighted products",
        });
    }
}

export const uploadExcelProducts = async (req, res) => {
    const timers = {
        total: 'TiempoTotalCarga',
        lectura: 'LecturaExcel',
        consulta: 'ConsultaExistente',
        procesamiento: 'ProcesamientoDatos',
        operaciones: 'OperacionesDB'
    };

    try {
        console.time(timers.total);

        // 1. Validar archivo
        if (!req.file) {
            return res.status(400).json({ message: "No se subió ningún archivo" });
        }

        // 2. Obtener datos del formulario
        const rubroPrincipal = req.body.rubro?.trim();
        const subrubroIntermedio = req.body.subrubroIntermedio?.trim() || null; // 👈 NUEVO

        if (!rubroPrincipal) {
            return res.status(400).json({ message: "El rubro principal es requerido" });
        }

        console.time(timers.lectura);
        const workbook = xlsx.read(req.file.buffer, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const excelItems = xlsx.utils.sheet_to_json(worksheet, {
            defval: undefined,
            raw: false,
            dateNF: 'yyyy-mm-dd'
        });
        console.timeEnd(timers.lectura);

        // 3. Configuración
        const REQUIRED_FIELDS = [
            'codpro', 'desc_stock', 'rubro',
            'subrub', 'proveed', 'desc_subrub',
            'desc_marca', 'porcen1', 'precioimpre'
        ];

        // 4. Obtener productos existentes
        console.time(timers.consulta);
        const allCodpros = excelItems.map(item => item.codpro?.toString().trim()).filter(Boolean);
        const existingProducts = await Product.find({
            codpro: { $in: allCodpros }
        }).lean();
        const existingProductsMap = new Map(existingProducts.map(p => [p.codpro, p]));
        console.timeEnd(timers.consulta);

        // 5. Procesamiento
        const BATCH_SIZE = 1000;
        let productsToUpsert = [];
        let invalidProducts = [];

        console.time(timers.procesamiento);
        for (let i = 0; i < excelItems.length; i++) {
            const item = excelItems[i];
            const rowNumber = i + 2;

            const codpro = item.codpro?.toString().trim();
            if (!codpro) {
                invalidProducts.push(`Fila ${rowNumber}: codpro es requerido`);
                continue;
            }

            const existingProduct = existingProductsMap.get(codpro);

            // Mapeo con NUEVA jerarquía de 3 niveles
            const mappedItem = {
                codpro,
                desc_stock: item.desc_stock?.toString().trim(),

                // NIVEL 1: Rubro principal (del form)
                desc_rubro: rubroPrincipal,

                // NIVEL 2: Subrubro intermedio (del form, opcional) 👈 NUEVO
                desc_subrubro_intermedio: subrubroIntermedio || null,

                // NIVEL 3: Subrubro final (del Excel)
                subrub: item.rubro !== undefined ? parseInt(item.rubro) : undefined,
                desc_subrub: item.desc_rubro?.toString().trim(),

                // Resto de campos
                rubro: item.subrub !== undefined ? parseInt(item.subrub) : undefined,
                proveed: item.proveed !== undefined ? parseInt(item.proveed) : undefined,
                desc_marca: item.desc_marca?.toString().trim(),
                porcen1: item.porcen1 !== undefined ? parseInt(item.porcen1) : undefined,
                precioimpre: item.precioimpre !== undefined ? item.precioimpre : undefined,
                stock: 10,
                imageUrl: existingProduct?.imageUrl || null,
                lastUpdated: new Date()
            };

            // Validación de campos requeridos
            const isComplete = REQUIRED_FIELDS.every(field => {
                const val = mappedItem[field];
                return val !== undefined && val !== null && val !== '';
            });

            if (!isComplete) {
                const missingFields = REQUIRED_FIELDS.filter(f =>
                    !mappedItem[f] && mappedItem[f] !== 0
                );
                invalidProducts.push(`Fila ${rowNumber}: Faltan campos (${missingFields.join(', ')})`);
                continue;
            }

            productsToUpsert.push(mappedItem);
        }
        console.timeEnd(timers.procesamiento);

        // 6. Operaciones DB
        console.time(timers.operaciones);
        const results = {
            insertedCount: 0,
            modifiedCount: 0,
            unchangedCount: 0
        };

        for (let i = 0; i < productsToUpsert.length; i += BATCH_SIZE) {
            const batch = productsToUpsert.slice(i, i + BATCH_SIZE);

            const bulkOps = batch.map(item => ({
                updateOne: {
                    filter: { codpro: item.codpro },
                    update: {
                        $set: _.omit(item, ['codpro']),
                        $setOnInsert: { createdAt: new Date() }
                    },
                    upsert: true
                }
            }));

            const batchResult = await Product.bulkWrite(bulkOps, {
                ordered: false,
                writeConcern: { w: 1 }
            });

            results.insertedCount += batchResult.upsertedCount;
            results.modifiedCount += batchResult.modifiedCount;
            results.unchangedCount += (batch.length - batchResult.modifiedCount - batchResult.upsertedCount);
        }
        console.timeEnd(timers.operaciones);
        console.timeEnd(timers.total);

        res.json({
            message: 'Carga completada',
            details: {
                totalRegistros: excelItems.length,
                registrosValidos: productsToUpsert.length,
                nuevosInsertados: results.insertedCount,
                actualizados: results.modifiedCount,
                sinCambios: results.unchangedCount,
                errores: invalidProducts.length,
            },
            ...(invalidProducts.length > 0 && { erroresDetallados: invalidProducts.slice(0, 50) })
        });

    } catch (err) {
        console.error("Error en upload-excel:", err);
        res.status(500).json({
            message: "Error en carga",
            ...(process.env.NODE_ENV === 'development' && {
                error: err.message,
                stack: err.stack
            })
        });
    }
};

export const downloadExcelProducts = async (req, res) => {
    try {
        console.log('=== INICIO downloadExcelProducts ===');
        const { rubro } = req.query;
        console.log('Rubro recibido:', rubro);

        // Validar que se envió el rubro
        if (!rubro || rubro.trim() === '') {
            console.log('ERROR: Rubro vacío');
            return res.status(400).json({
                message: "El parámetro 'rubro' es requerido"
            });
        }

        const rubroTrimmed = rubro.trim();
        console.log('Rubro limpio:', rubroTrimmed);

        // BÚSQUEDA EXACTA (case-insensitive)
        console.log('Buscando en DB con desc_rubro...');
        const products = await Product.find({
            desc_rubro: { $regex: new RegExp(`^${rubroTrimmed}$`, 'i') }
        })
            .select('codpro desc_stock desc_subrub precioimpre')
            .lean();

        console.log('Productos encontrados:', products.length);

        // Validar si hay productos
        if (!products || products.length === 0) {
            console.log('ERROR: No se encontraron productos');

            // Debug: Ver qué rubros existen en la DB
            const existingRubros = await Product.distinct('desc_rubro');
            console.log('Rubros disponibles en DB:', existingRubros);

            return res.status(404).json({
                message: `No se encontraron productos para el rubro: "${rubroTrimmed}"`,
                rubro: rubroTrimmed,
                encontrados: 0,
                rubrosDisponibles: existingRubros.slice(0, 10) // Primeros 10 para referencia
            });
        }

        console.log('Generando Excel con', products.length, 'productos');

        // Formatear datos para el Excel
        const excelData = products.map(product => ({
            codpro: product.codpro || '',
            desc_stock: product.desc_stock || '',
            desc_subrub: product.desc_subrub || '',
            precioimpre: product.precioimpre !== undefined ? product.precioimpre : '',
        }));

        console.log('Datos formateados:', excelData.length, 'filas');
        console.log('Primera fila:', excelData[0]);

        // Crear el worksheet
        const worksheet = xlsx.utils.json_to_sheet(excelData);

        // Crear el workbook
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Productos');

        // Ajustar anchos de columna
        worksheet['!cols'] = [
            { wch: 15 }, // codpro
            { wch: 40 }, // desc_stock
            { wch: 20 }, // desc_subrub
            { wch: 15 }, // precioimpre
        ];

        console.log('Generando buffer del archivo...');

        // Generar el buffer
        const excelBuffer = xlsx.write(workbook, {
            type: 'buffer',
            bookType: 'xlsx'
        });

        console.log('Buffer generado, tamaño:', excelBuffer.length, 'bytes');

        // Crear nombre de archivo seguro
        const safeRubro = rubroTrimmed.replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `productos_${safeRubro}_${new Date().toISOString().split('T')[0]}.xlsx`;

        console.log('Nombre del archivo:', filename);

        // Configurar headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', excelBuffer.length);
        res.setHeader('Cache-Control', 'no-cache');

        console.log('Enviando archivo...');
        console.log('=== FIN downloadExcelProducts ===');

        // Enviar buffer
        return res.end(excelBuffer);

    } catch (err) {
        console.error("❌ ERROR en download-excel:", err);
        console.error("Stack:", err.stack);

        return res.status(500).json({
            message: "Error al generar el archivo Excel",
            error: err.message,
            ...(process.env.NODE_ENV === 'development' && {
                stack: err.stack
            })
        });
    }
};

export const highlightProduct = async (req, res) => {
    const { id } = req.params; // Cambia "id" por "codigo"
    const { days } = req.body
    const { agenda } = agendaModule;

    try {
        const product = await Product.findOne({ codpro: id });
        if (!product) return res.status(404).json({ success: false, message: `Producto con código ${id} no encontrado` });

        // Si ya está destacado y no ha expirado
        if (product.destacado && product.fechaFinDestacado > new Date()) {
            return res.status(409).json({
                success: false,
                message: `El producto ya está destacado hasta ${product.fechaFinDestacado.toLocaleDateString()}`,
                product,
                isAlreadyHighlighted: true
            });
        }

        // Cancelar job anterior si existe
        if (product.highlightJobId) {
            await agenda.cancel({ _id: product.highlightJobId });
        }

        // Calcular fechas
        const ahora = new Date();
        const fechaFin = new Date();
        fechaFin.setDate(ahora.getDate() + days);

        // Crear job en Agenda
        const job = await agenda.schedule(
            fechaFin,
            'unhighlight-product',
            { productId: id }
        );

        // Actualizar producto
        const productUpdated = await Product.findOneAndUpdate(
            { codpro: id },
            {
                destacado: true,
                fechaDestacado: ahora,
                fechaFinDestacado: fechaFin,
                highlightJobId: job.attrs._id // Guardar referencia al job
            },
            { new: true }
        );

        // Programar desactivación automática (solo para demostración)
        /* setTimeout(async () => {
            await Product.updateOne(
                { codpro: id },
                { destacado: false }
            );
        }, days * 24 * 60 * 60 * 1000); */

        res.status(200).json({
            success: true,
            message: `Producto destacado hasta ${fechaFin.toLocaleDateString()}`,
            product: productUpdated
        });
    } catch (err) {
        console.error("Error al destacar producto:", err);
        res.status(500).json({
            message: "Error al destacar producto",
            error: err.message
        });
    }
}

export const unhighlightProduct = async (req, res) => {
    const { id } = req.params
    const { agenda } = agendaModule;

    try {
        // Verificar si el producto existe
        const product = await Product.findOne({ codpro: id });
        if (!product) return res.status(404).json({ success: false, message: `Producto con código ${id} no encontrado` });

        // Cancelar el job programado si existe
        if (product.highlightJobId) {
            await agenda.cancel({ _id: product.highlightJobId });
        }

        // Actualizar producto
        const productUpdated = await Product.findOneAndUpdate(
            { codpro: id },
            {
                $set: { destacado: false },
                $unset: { fechaFinDestacado: 1, highlightJobId: 1 }
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: `Producto dejó de estar destacado manualmente`,
            product: productUpdated
        });
    } catch (err) {
        console.error("Error al quitar destacado:", err);
        res.status(500).json({
            success: false,
            message: "Error interno al quitar destacado",
            error: err.message
        })
    }
}

export const postProducts = async (req, res) => {
    try {
        const dataToPost = await postProductsInDB("./utils/json/inyeccion-sondas.json");
        const result = await Product.insertMany(dataToPost);

        console.log("Productos insertados correctamente");
        res.status(201).json({  // 201 Created es más apropiado para POST
            message: "Success posting products in MongoDB",
            insertedCount: result.length,
            data: result
        });
    } catch (err) {
        console.error("Error posting products:", err);
        res.status(500).json({  // 500 para errores del servidor
            message: "Error posting products in MongoDB",
            error: err.message
        });
    }
}

export const addFieldToProducts = async (req, res) => {
    try {
        const { field, value } = req.body
        if (!field) throw new Error("Campos 'field' y 'newField' son requeridos en el cuerpo de la solicitud.");

        const update = {};
        update[field] = value;

        //agrega el campo a todos los prods de la collection
        const updatedProducts = await Product.updateMany(
            {},  // Selecciona TODOS los productos
            { $set: update }  // Añade/modifica el campo
        );

        if (updatedProducts.acknowledged && updatedProducts.modifiedCount > 0) {
            res.status(200).json({ message: "Success adding field to all products in DB", updatedProducts });
        } else {
            res.status(200).json({ message: "No products were updated", updatedProducts });
        }
    } catch (err) {
        res.status(400).json({ message: "Error adding field to products in DB", err });
    }
}

export const changeProductFieldVal = async (req, res) => {
    try {
        const { prodId } = req.params
        const { field, value } = req.body
        if (!field || !value) throw new Error("Field does not exists")

        const prodFound = await Product.findById(prodId);      //busca si existe el producto en la db
        if (!prodFound) return res.status(404).json({ message: "Product not found in db" });

        const fieldExists = await Product.findOne({ _id: prodId, [field]: { $exists: true } });    //busca si existe el campo del producto en la db
        if (!fieldExists) return res.status(400).json({ message: `Field '${field}' does not exist in the document` });

        const updateData = { [field]: value };

        const updatedProduct = await Product.findByIdAndUpdate(
            prodId,
            updateData,
            { new: true }
        );

        if (!updatedProduct) return res.status(500).json({ message: "Error renaming field in DB" });

        res.status(200).json({ message: "Success changing product field", updatedProduct });
    } catch (err) {
        res.status(400).json({ message: "Error changing field to product in DB", err });
    }
}

export const changeFieldValueToProducts = async (req, res) => {
    try {
        const { field, value } = req.body
        if (!field || !value) throw new Error("Field does not exists")

        const missingFieldCount = await Product.countDocuments({ [field]: { $exists: false } });
        if (missingFieldCount > 0) throw new Error(`The field "${field}" is missing in ${missingFieldCount} documents`);

        const updateObject = { [field]: value };

        const updatedProducts = await Product.updateMany({}, { $set: updateObject });

        res.status(200).json({ message: "Success changing field name and its value", updatedProducts });
    } catch (err) {
        res.status(400).json({ message: "Error changing field name and its value", err });
    }
}

export const changeFieldToProducts = async (req, res) => {
    try {
        const { field, newField } = req.body
        if (!field) throw new Error("Field does not exists")

        const renameObject = {};
        renameObject[field] = newField;

        const updatedProducts = await Product.updateMany({}, { $rename: renameObject });

        res.status(200).json({ message: "Success changing field to products in DB", updatedProducts });
    } catch (err) {
        res.status(400).json({ message: "Error changing field to products in DB", err });
    }
}

export const deleteMongoDBCollection = async (req, res) => {
    try {
        await Product.deleteMany({})
        res.status(200).json({ message: "Success deleting mongo DB collection" });
    } catch (err) {
        res.status(400).json({ message: "Error deleting mongo DB collection", err });
    }
}

export const updateStock = async (req, res) => {
    try {
        const { productId } = req.params
        const { newStock } = req.body

        const prodFound = await Product.findById(productId);
        if (!prodFound) return res.status(404).json({ message: "Product not found in db" });

        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { stock: prodFound.stock + Number(newStock) },
            { new: true } // Esto devuelve el documento actualizado
        );

        res.status(200).json({ message: "Success updating stock from product", updatedProduct });
    } catch (err) {
        res.status(400).json({ message: "Error deleting mongo DB collection", err });
    }
}

export const deleteProdsWithSubrub = async (req, res) => {
    const { subrub } = req.body;

    try {
        if (!subrub) {
            throw new Error("Subrub parameter is required");
        }

        const result = await Product.deleteMany({ desc_subrub: subrub });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: `No products found with subrub: ${subrub}`
            });
        }

        res.status(200).json({
            message: `Successfully deleted ${result.deletedCount} products with subrub: ${subrub}`
        });

    } catch (err) {
        res.status(400).json({
            message: `Error deleting products with subrub: ${subrub}`,
            error: err.message
        });
    }
}

export const deleteFieldFromProducts = async (req, res) => {
    try {
        const { field } = req.body
        if (!field) throw new Error("Field does not exists")

        const update = {};
        update[field] = "";

        const updatedProducts = await Product.updateMany({}, { $unset: update })

        res.status(200).json({ message: "Success deleting field from products", updatedProducts });
    } catch (err) {
        res.status(400).json({ message: "Error deleting field from products", err });
    }
}

export const deleteProdsByRubro = async (req, res) => {
    try {
        const { rubro } = req.params;
        if (!rubro) throw new Error("Field rubro is required");

        const result = await Product.deleteMany({ desc_rubro: rubro.toUpperCase() });

        res.status(200).json({
            message: `Deleted ${result.deletedCount} products with rubro ${rubro}`,
            deletedCount: result.deletedCount
        });
    } catch (err) {
        res.status(400).json({
            message: `Error deleting products`,
            error: err.message
        });
    }
};



//funcion para agregar la imagen de tornillos a todos los productos tornillos (bulones)
export const addImageToTornillos = async (req, res) => {
    try {
        const result = await Product.updateMany(
            { rubro: { $gte: 101, $lte: 103 } }, // filtro por rango
            { $set: { imageUrl: "https://res.cloudinary.com/dq7dwhqhh/image/upload/f_auto,q_auto,c_scale/v1755061135/bulones_by0zgv.png" } } // nuevo valor
        );

        res.status(200).json({
            message: "Imagen agregada a los productos con rubro entre 101 y 103",
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount
        });

    } catch (err) {
        res.status(400).json({ message: "Error trying to add image", error: err.message });
    }
};

export const changeImageurlProd = async (req, res) => {
    try {
        const { prodId } = req.params; // ID del producto desde la URL
        const { url } = req.body

        if (!prodId || !url) return res.status(400).json({ message: "Some paremeters may be empty" });

        const updatedProduct = await Product.findByIdAndUpdate(
            prodId, // filtro por _id
            { $set: { imageUrl: url } }, // cambio de valor
            { new: true } // devuelve el documento actualizado
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.status(200).json({
            message: "Imagen actualizada correctamente",
            product: updatedProduct
        });

    } catch (err) {
        res.status(400).json({ message: "Error to change image field", error: err.message });
    }
};

export const addImageUrlToSubrub = async (req, res) => {
    const { subrub, url } = req.body; // También necesitas recibir la URL

    try {
        if (!subrub || !url) return res.status(400).json({ message: "Some paremeters may be empty" });

        // Actualizar múltiples productos que coincidan con el subrubro
        const result = await Product.updateMany(
            { desc_subrub: subrub }, // Criterio de búsqueda
            { $set: { imageUrl: url } } // Campo a actualizar
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: `No products found with subrub: ${subrub}`
            });
        }

        res.status(200).json({
            message: `Successfully added image URL to ${result.modifiedCount} products with subrub: ${subrub}`,
            details: result
        });
    } catch (err) {
        res.status(500).json({
            message: `Error adding image url to subrub: ${subrub}`,
            error: err.message
        });
    }
}
