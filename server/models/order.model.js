import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    products: {
        type: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product"
                },
                quantity: Number
            }
        ]
    },
    totalOrder: {
        type: Number,
        required: true
    },
    status: {
        type: Boolean,
        default: false
    }
})

const Order = mongoose.model("Order", orderSchema);
export default Order;