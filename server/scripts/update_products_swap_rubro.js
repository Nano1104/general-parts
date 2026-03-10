// file: scripts/migrations/swapRubroSubrub.js

import mongoose from "mongoose";
import { connectToDB } from "../db/dbConnection.js"
import Product from "../models/product.model.js";

const runMigration = async () => {
    try {
        await connectToDB();

        const result = await Product.updateMany(
            {},
            [
                {
                    $set: {
                        desc_subrubro_intermedio: null,
                        rubro: "$subrub",
                        subrub: "$rubro",
                        lastUpdated: new Date()
                    }
                }
            ]
        );

        console.log("Migration OK:", result.modifiedCount);
    } catch (error) {
        console.error("Migration FAILED:", error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

runMigration();
