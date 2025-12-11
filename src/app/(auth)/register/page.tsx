import { getUserById, updateUserRegisterAction } from './actions';
import { redirect } from 'next/navigation';

export default async function RegisterPage({ searchParams }: any) {
    const id = searchParams.id;

    if (!id) {
        return (
            <div className="p-6 text-center">
                잘못된 접근입니다. <br /> ID 값이 없습니다.
            </div>
        );
    }

    const user = await getUserById(id);

    if (!user) {
        return <div className="p-6 text-center">해당 유저를 찾을 수 없습니다.</div>;
    }

    return (
        <div className="w-full max-w-md bg-white p-8 shadow-lg rounded-xl">
            <h1 className="text-2xl font-bold mb-6 text-center">최초 등록 정보 입력</h1>

            <form action={updateUserRegisterAction} className="space-y-4">
                <input type="hidden" name="id" value={user.id} />

                <div>
                    <label className="block mb-1 font-medium">이름</label>
                    <input
                        type="text"
                        name="username"
                        defaultValue={user.username ?? ''}
                        className="w-full border p-2 rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block mb-1 font-medium">전화번호</label>
                    <input
                        type="text"
                        name="phone"
                        defaultValue={user.phone ?? ''}
                        className="w-full border p-2 rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block mb-1 font-medium">아이디</label>
                    <input
                        type="text"
                        name="userId"
                        placeholder="아이디를 입력하세요"
                        className="w-full border p-2 rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block mb-1 font-medium">비밀번호</label>
                    <input
                        type="password"
                        name="password"
                        placeholder="비밀번호를 입력하세요"
                        className="w-full border p-2 rounded"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    등록 완료
                </button>
            </form>
        </div>
    );
}
