import { ivyDb } from '@/lib/ivyDb';
import { SliderForm } from './_components/slider-form';
import { Card } from '@/components/ui/card';

interface Props {
    params: Promise<{ heroSliderId: string }>;
}

export default async function HeroSliderPage({ params }: Props) {
    const { heroSliderId } = await params;
    const heroSlider = await ivyDb.heroSlider.findUnique({
        where: {
            id: heroSliderId,
        },
    });

    return (
        <Card className="p-8">
            <SliderForm initialData={heroSlider} />
        </Card>
    );
}
