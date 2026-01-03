let currentUser = $state();


export function getCurrentUser() {
    return currentUser
}

export const setCurrentUser = (user) => {
    currentUser = user
    return currentUser
}