
const imgHover = "https://res.cloudinary.com/dq7dwhqhh/image/upload/f_auto,q_auto/v1754438575/swparts-icon_rkw0nq.png"

export const getImage = (imageUrl) => {
    if (imageUrl) {
        return imageUrl
    } else {
        return imgHover
    }
}