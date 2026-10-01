// scripts/resetPassword.js
// Uso: npm run reset-password -- <email> <nuevaContraseña>
import mongoose from "mongoose";
import User from "../models/user.model.js";
import { createHash } from "../utils/bcrypt.js";

import { NODE_ENV, DB_USER_NAME, DB_PORT, DB_HOST, DB_USER_PASSWORD } from "../config/envConfig.js";

const connectionOptions = {
    url: NODE_ENV === "production"
            ? `mongodb+srv://${DB_USER_NAME}:${DB_USER_PASSWORD}@cluster-repuestos.kloz1gg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster-Repuestos`
            : `mongodb://${DB_HOST}:${DB_PORT}/${DB_USER_NAME}`,
    options: {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        retryWrites: true,
        w: 'majority'
    }
};

const [email, newPassword] = process.argv.slice(2);

const run = async () => {
    if (!email || !newPassword) {
        console.error("Uso: npm run reset-password -- <email> <nuevaContraseña>");
        process.exit(1);
    }

    try {
        await mongoose.connect(connectionOptions.url, connectionOptions.options);
        console.log(`✅ Conectado a MongoDB (${NODE_ENV})`);

        // El login busca el email exacto, así que acá también
        const users = await User.find({ email: email }).select("email first_name last_name");

        if (users.length === 0) {
            console.error(`❌ No se encontró ningún usuario con el email ${email}`);
            return;
        }
        if (users.length > 1) {
            // email no es unique en el schema: no pisar contraseñas a ciegas
            console.error(`❌ Hay ${users.length} usuarios con el email ${email}, resolvelo a mano:`);
            users.forEach(u => console.error(`   ${u._id} - ${u.first_name} ${u.last_name}`));
            return;
        }

        const user = users[0];
        await User.updateOne({ _id: user._id }, { $set: { password: createHash(newPassword) } });

        console.log(`✅ Contraseña actualizada para ${user.email} (${user.first_name} ${user.last_name})`);
    } catch (error) {
        console.error("❌ Error al cambiar la contraseña:", error);
    } finally {
        mongoose.connection.close();
    }
};

run();
