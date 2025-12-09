import { Card } from '@/components/ui/card';
import { ivyDb } from '@/lib/ivyDb';
import { EventForm } from './_components/event-form';

interface Props {
    params: Promise<{ eventId: string }>;
}

export default async function EventIdPage({ params }: Props) {
    const { eventId } = await params;
    const id = Number(eventId);

    const event = isNaN(id)
        ? null
        : await ivyDb.event.findUnique({
              where: {
                  id,
              },
          });

    return (
        <Card className="p-8">
            <EventForm initialData={event} />
        </Card>
    );
}
