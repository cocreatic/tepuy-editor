export class AuthMoodle {
    authenticate() {

        return new Promise((resolve, reject) => {

            if (typeof(TepuyAPI) != 'undefined') {
                resolve({
                    id: TepuyAPI.currentuser.id,
                    userName: TepuyAPI.currentuser.username,
                    name: TepuyAPI.currentuser.fullname,
                    profile_image: TepuyAPI.currentuser.imageurl
                });
            } else {
                reject();
            }
        });
    }
}
