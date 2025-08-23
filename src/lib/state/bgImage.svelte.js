import { PersistedState } from "runed";

let bgImage = $state(null)

export const getBgImage = () => {
    return bgImage
}

export function setBgImage(imageUrl) {
    bgImage = imageUrl
}

export function removeBgImage() {
    bgImage = null
}