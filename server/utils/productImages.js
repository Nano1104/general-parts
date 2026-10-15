// Imágenes asignadas por regla a productos sin foto propia.
// Las imágenes viven en el frontend (client/public/products/, optimizadas: <name>.jpg ~80 KB para
// verla en grande y <name>-thumb.jpg ~6 KB para la miniatura del catálogo).
// Si un producto ya tiene imageUrl (ej. una foto en Cloudinary) nunca se pisa.

const IMAGE_RULES = [
    { rubro: "MOTOR", codproPrefixes: ["102"], imageUrl: "/products/lienzo.jpg" },
    { rubro: "MOTOR", codproPrefixes: ["101", "103"], imageUrl: "/products/bulones-caja-chica.jpg" },
];

// imageUrl que le corresponde a un producto según las reglas, o null si ninguna aplica
export function ruleImageFor({ codpro, desc_rubro }) {
    const code = String(codpro ?? "").trim();
    const rubro = String(desc_rubro ?? "").trim().toUpperCase();
    const rule = IMAGE_RULES.find(r => r.rubro === rubro && r.codproPrefixes.some(p => code.startsWith(p)));
    return rule?.imageUrl ?? null;
}

// Filtro de Mongo: productos alcanzados por alguna regla que todavía no tienen imagen
export const productsMissingRuleImage = () => ({
    $and: [
        { $or: [{ imageUrl: null }, { imageUrl: "" }, { imageUrl: { $exists: false } }] },
        {
            $or: IMAGE_RULES.map(r => ({
                desc_rubro: r.rubro,
                codpro: { $regex: `^(${r.codproPrefixes.join("|")})` },
            })),
        },
    ],
});
