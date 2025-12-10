import { getSession } from '@/lib/session';

export default async function Home() {
    const session = await getSession();

    return (
        <section className="relative w-full h-[90vh] overflow-hidden flex items-center justify-center">
            {/* Background Video */}
            <video
                className="absolute inset-0 w-full h-full object-cover"
                src="https://image.ninehire.com/homepage/6576ce40-c0e6-11ee-ba3a-8750bc4cda1d/9a307600-c16c-11ee-b3e7-9be3aa2841e9.mp4"
                autoPlay
                loop
                muted
                playsInline
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/10" />

            {/* Content */}
            <div className="relative z-10 max-w-5xl mx-auto text-center px-6">
                <h1 className="text-[48px] md:text-[56px] font-bold text-[#282A31] leading-tight">
                    환영합니다! <br /> {session.username}님
                </h1>
            </div>
        </section>
    );
}
