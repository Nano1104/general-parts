// ObjectId de Mongo como string de 24 hex. (mongoose.isValidObjectId también acepta
// cualquier string de 12 caracteres, que después falla al castear con un 500.)
export const isObjectIdString = (v) => typeof v === "string" && /^[0-9a-f]{24}$/i.test(v);

// Para router.param: responde 400 si el parámetro de ruta no es un ObjectId válido
export const validateObjectIdParam = (req, res, next, value, name) =>
    isObjectIdString(value) ? next() : res.status(400).json({ message: `Parámetro ${name} inválido` });
