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
    desc_marca: {
        type: String,
        enum: ["FIAT", "PEUGEOT", "FORD", "RENAULT", "VOLKSWAGEN", "MASSEY FERGUSON", "JHON DEERE", "SCANIA", "TOYOTA",
                "MERCEDES BENZ", "JEEP", "IVECO", "SEAT", "CITROEN", "CHEVROLET", "CUMMINS", "DEUTZ", "MAXION", "ACURA", "AUDI",
                "BMW", "CHRYSLER", "DAEWOO", "HONDA", "IKA", "ISUZU", "KIA", "LAND ROVER", "MAZDA", "MITSUBISHI", "MVM", "NISSAN",
                "ROVER", "SUBARU", "SUZUKI", "VOLVO", "LADA", "UNIVERSAL", "AGRALE", "DEUTZ FAHR", "ZANELLO", "PERKINS", "HYUNDAI", "DODGE"],
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
    destacado: {
        type: Boolean,
        default: false
    },
    fechaDestacado: {
        type: Date,
        default: null
    },
    fechaFinDestacado: {  // ✨ Nuevo campo necesario
        type: Date,
        default: null
    },
    highlightJobId: {
        type: mongoose.Schema.Types.ObjectId, // Tipo compatible con Agenda
        default: null
    }
}, { strict: false })


// --------------------------------------------------
// ÍNDICES PARA BÚSQUEDA INTELIGENTE (ANTES del modelo)
// --------------------------------------------------

// 1. Índice de texto principal (ya lo tenías)
productSchema.index({
    codpro: "text",
    desc_stock: "text", 
    desc_rubro: "text",
    desc_marca: "text",
    desc_subrub: "text"  // Añadido para búsqueda en subrubros
}, {
    weights: {
        codpro: 10,
        desc_stock: 5,
        desc_marca: 3,
        desc_rubro: 2,
        desc_subrub: 4  // Peso intermedio para subrubros
    },
    name: "product_text_search"
});

// 2. Índices individuales para búsquedas exactas
productSchema.index({ codpro: 1 });          // Búsqueda rápida por código
productSchema.index({ desc_marca: 1 });      // Filtrado por marca exacta
productSchema.index({ desc_rubro: 1 });      // Filtrado por rubro exacto
productSchema.index({ desc_subrub: 1 });     // Búsqueda por subrubro exacto
productSchema.index({ precioimpre: 1 });     // Para filtrado por precio
productSchema.index({ destacado: 1 });       // Para productos destacados
productSchema.index({ stock: 1 });           // Para filtrado por disponibilidad

// 3. Índice compuesto para búsquedas frecuentes
productSchema.index({ 
    desc_marca: 1,
    desc_rubro: 1,
    precioimpre: 1 
});

// 4. Índice para búsqueda por prefijo de código
productSchema.index({ 
    codpro: 1,
    desc_stock: 1 
}, { 
    collation: { locale: 'es', strength: 2 }  // Para búsqueda case-insensitive
});

const Product = mongoose.model("Product", productSchema);
export default Product;