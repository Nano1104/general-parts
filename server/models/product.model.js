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
                "ROVER", "SUBARU", "SUZUKI", "VOLVO", "LADA", "UNIVERSAL", "AGRALE", "DEUTZ FAHR", "ZANELLO"],
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
})

const Product = mongoose.model("Product", productSchema);
export default Product;