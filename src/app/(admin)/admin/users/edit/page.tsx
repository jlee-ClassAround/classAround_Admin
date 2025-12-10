import { getMyProfile } from './actions';
import EditProfileForm from './components/eidt-profile-form';

export default async function EditPage() {
    const user = await getMyProfile();

    if (!user) {
        return <div className="p-10">세션 정보가 없습니다. 다시 로그인해주세요.</div>;
    }

    return (
        <div className="p-10 max-w-xl mx-auto">
            <EditProfileForm user={user} />
        </div>
    );
}
