import { createHash } from 'crypto';


export async function load({ locals }) {
    const user = locals.pb.authStore.baseModel
    let gravitarUrl = null;

    function generateAvatarUrl(emailAddress, options = {}) {
        const defaultImage = options.defaultImage || 'identicon';
        const emailHash = createHash('md5').update(emailAddress.toString().trim().toLowerCase()).digest('hex');
        return `https://www.gravatar.com/avatar/${emailHash}?d=${defaultImage}`;
    }


    if (user) {
        gravitarUrl = generateAvatarUrl(user.email);
    }

    console.log(gravitarUrl)

    return {
        user,
        gravitarUrl
    };
}