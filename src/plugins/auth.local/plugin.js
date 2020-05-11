export class AuthLocal {
    authenticate() {
        const delay = 0;
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve({
                id:'1',
                userName:'guest',
                password:'123456',
                name:'Invitado',
                profile_image:'https://picsum.photos/50/50?t=4'
            }), delay);
        });
    }
}
