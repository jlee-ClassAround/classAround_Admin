import { redirect } from 'next/navigation';

export default function AdminCourses() {
    return redirect('/ivy/courses/all');
}
