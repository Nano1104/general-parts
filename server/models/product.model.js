import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    codpro: {
        type: String,
        required: true,
        unique: true
    },
    desc_stock: {
        type: String,
        required: true,
    },
    rubro: {
        type: Number,
        required: true
    },
    subrub: {
        type: Number,
        required: true
    },
    proveed: {
        type: Number,
        required: true
    },
    desc_rubro: {
        type: String,
        required: true
    },
    desc_subrubro_intermedio: {  // ✨ NUEVO CAMPO
        type: String,
        required: false,  // Opcional para compatibilidad con datos existentes
        default: null
    },
    desc_subrub: {  // ✨ AÑADIDO (este campo ya lo usabas pero no estaba declarado)
        type: String,
        required: true
    },
    desc_marca: {
        type: String,
        enum: ["FIAT", "PEUGEOT", "FORD", "RENAULT", "VOLKSWAGEN", "MASSEY FERGUSON", "JHON DEERE", "SCANIA", "TOYOTA",
            "MERCEDES BENZ", "JEEP", "IVECO", "SEAT", "CITROEN", "CHEVROLET", "CUMMINS", "DEUTZ", "MAXION", "ACURA", "AUDI",
            "BMW", "CHRYSLER", "DAEWOO", "HONDA", "IKA", "ISUZU", "KIA", "LAND ROVER", "MAZDA", "MITSUBISHI", "MVM", "NISSAN",
            "ROVER", "SUBARU", "SUZUKI", "VOLVO", "LADA", "UNIVERSAL", "AGRALE", "DEUTZ FAHR", "ZANELLO", "PERKINS", "HYUNDAI", "DODGE", "RANDOM"],
        required: true
    },
    porcen1: {
        type: Number,
        required: true
    },
    precioimpre: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    imageUrl: {
        type: String,
        default: null
    },
    destacado: {
        type: Boolean,
        default: false
    },
    fechaDestacado: {
        type: Date,
        default: null
    },
    fechaFinDestacado: {
        type: Date,
        default: null
    },
    highlightJobId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    prod_details: {
        type: String,
        default: ""
    }
}, { strict: false })


// --------------------------------------------------
// ÍNDICES PARA BÚSQUEDA INTELIGENTE
// --------------------------------------------------

// 1. Índice de texto principal
productSchema.index({
    codpro: "text",
    desc_stock: "text",
    desc_rubro: "text",
    desc_marca: "text",
    desc_subrub: "text",
    desc_subrubro_intermedio: "text"  // ✨ AÑADIDO para búsqueda en subrubro intermedio
}, {
    weights: {
        codpro: 10,
        desc_stock: 5,
        desc_marca: 3,
        desc_subrubro_intermedio: 3,  // ✨ AÑADIDO
        desc_subrub: 4,
        desc_rubro: 2
    },
    name: "product_text_search"
});

// 2. Índices individuales para búsquedas exactas
productSchema.index({ codpro: 1 });
productSchema.index({ desc_marca: 1 });
productSchema.index({ desc_rubro: 1 });
productSchema.index({ desc_subrubro_intermedio: 1 });  // ✨ AÑADIDO
productSchema.index({ desc_subrub: 1 });
productSchema.index({ precioimpre: 1 });
productSchema.index({ destacado: 1 });
productSchema.index({ stock: 1 });

// 3. Índice compuesto para búsquedas frecuentes
productSchema.index({
    desc_marca: 1,
    desc_rubro: 1,
    precioimpre: 1
});

// 4. Índice compuesto para jerarquía de rubros (✨ NUEVO)
productSchema.index({
    desc_rubro: 1,
    desc_subrubro_intermedio: 1,
    desc_subrub: 1
});

// 5. Índice para búsqueda por prefijo de código
productSchema.index({
    codpro: 1,
    desc_stock: 1
}, {
    collation: { locale: 'es', strength: 2 }
});

const Product = mongoose.model("Product", productSchema);
export default Product;