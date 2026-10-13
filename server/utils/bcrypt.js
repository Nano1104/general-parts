import bcrypt from "bcrypt";

// Versiones async: las sync bloquean el event loop (~50-100ms por llamada) y frenan todas las requests
export const createHash = password => bcrypt.hash(password, 10);

export const isValidPassword = (password, user) => bcrypt.compare(password, user.password);
