
export function createCounter() {
    let count = $state(0);

    return {
        get count() { return count },
        increment: () => count += 1
    };
}


export const userState = $state({
    name: 'name',
});


