import { Card } from '@/components/ui/card';
import { columns } from './columns';
import { getTrackingData } from './_actions/get-tracking-data';
import { TrackingDataTable } from './_components';
import { YoutubeModal } from './_components/youtube-modal';

interface Props {
    params: Promise<{
        freeCourseId: string;
    }>;
}

export default async function TrackingPage({ params }: Props) {
    const { freeCourseId } = await params;

    const trackings = await getTrackingData(freeCourseId);

    return (
        <>
            <Card className="p-8 space-y-4">
                <TrackingDataTable columns={columns} data={trackings} />
            </Card>

            <YoutubeModal />
        </>
    );
}
