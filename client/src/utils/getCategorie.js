

export const getCategorie = (val) => {
    if (val === 100) {
        return "Motor";
    } else if (val === 200 || val === 201 || val === 202) {
        return "Encendido";
    } else {
        return ""
    }
}