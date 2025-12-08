import { Teacher } from "@prisma/client";
import { User2 } from "lucide-react";
import Image from "next/image";

export function TeacherCard({ teacher }: { teacher: Teacher }) {
  return (
    <div className="w-full aspect-[4/5] bg-foreground/10 rounded-xl md:rounded-2xl lg:rounded-[20px] overflow-hidden relative transition shadow-lg md:hover:-translate-y-1 md:transition-transform md:mt-1 group">
      {teacher.profile ? (
        <Image
          src={teacher.profile}
          alt={teacher.name}
          fill
          className="object-cover absolute size-full"
        />
      ) : (
        <div className="w-full h-full bg-slate-300 flex items-center justify-center">
          <User2 className="size-8 text-slate-600" />
        </div>
      )}
      <div className="bg-gradient-to-t from-black/60 to-black/0 z-[5] absolute bottom-0 left-0 w-full h-full"></div>
      <div className="absolute bottom-0 left-0 w-full p-6 space-y-1 z-10">
        <h3 className="text-white text-lg md:text-2xl font-semibold group-hover:text-primary transition-colors">
          {teacher.name}
        </h3>
        {teacher.info && (
          <p className="text-white text-sm md:text-base text-opacity-75">
            {getFirstHeading(teacher.info)}
          </p>
        )}
      </div>
    </div>
  );
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").trim();
}

function getFirstHeading(html: string) {
  const match = html.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/);
  return match ? stripHtml(match[1]) : stripHtml(html).split("\n")[0];
}
