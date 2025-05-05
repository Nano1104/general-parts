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

// Definición del índice de texto (ANTES de crear el modelo)
productSchema.index({
    codpro: "text",
    desc_stock: "text", 
    desc_rubro: "text",
    desc_marca: "text"
  }, {
    weights: {
      codpro: 10,       // Mayor peso para código de producto
      desc_stock: 5,    // Peso medio para descripción
      desc_marca: 3,    // Menor peso para marca
      desc_rubro: 2     // Peso mínimo para rubro
    },
    name: "product_text_search" // Nombre personalizado para el índice
});

const Product = mongoose.model("Product", productSchema);
export default Product;