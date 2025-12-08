"use client";

import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/autoplay";

import { IGetBestCourses } from "@/actions/courses/get-best-courses";
import { IFreeCourse } from "@/actions/free-courses/get-free-courses";
import { CourseCard } from "@/components/loop-items/course-card";
import { CoursesSwiperSkeleton } from "@/components/skeletons/courses-swiper-skeleton";
import { useEffect, useState } from "react";
import { FreeCourseCard } from "../loop-items/free-course-card";
import { ResultOfCourseWithFreeCourse } from "@/actions/courses/get-all-courses-with-free-courses";

function isCourse(
  course: IGetBestCourses | IFreeCourse
): course is IGetBestCourses {
  return "originalPrice" in course;
}

interface Props {
  courses: ResultOfCourseWithFreeCourse[];
  slidesPerView?: number;
}

export function CoursesSwiper({ courses, slidesPerView = 4 }: Props) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  if (!isClient) {
    return <CoursesSwiperSkeleton />;
  }

  return (
    <Swiper
      modules={[Autoplay]}
      slidesPerView={1.5}
      spaceBetween={12}
      autoplay={{
        delay: 5000,
      }}
      loop
      breakpoints={{
        768: {
          slidesPerView: Math.max(2, slidesPerView - 2),
          spaceBetween: 16,
        },
        1024: {
          slidesPerView: Math.max(2, slidesPerView - 1),
          spaceBetween: 20,
        },
        1280: {
          slidesPerView,
          spaceBetween: 30,
        },
      }}
      className="w-full"
    >
      {courses.map((course) => {
        return (
          <SwiperSlide key={course.id} className="first:ml-5 md:first:ml-0">
            {course.courseType === "PAID" ? (
              <CourseCard course={course} />
            ) : (
              <FreeCourseCard course={course} />
            )}
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}
