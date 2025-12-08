"use client";

import ReactPlayer from "react-player";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  videoType?: string;
  videoUrl?: string;
}

export function PreviewPlayer({ videoUrl, videoType = "vimeo" }: Props) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(false);
  }, [videoUrl]);

  return (
    <div className="relative aspect-video bg-slate-100 rounded-lg overflow-hidden shadow-md">
      {videoUrl ? (
        <>
          {!isReady && (
            <div className="absolute top-0 left-0 w-full h-full flex flex-col gap-y-2 items-center justify-center bg-black bg-opacity-70 z-10">
              <Loader2 className="size-10 text-gray-300 animate-spin" />
              <span className="text-sm text-gray-100 font-medium">
                로딩 중 입니다. 잠시만 기다려주세요.
              </span>
            </div>
          )}
          <ReactPlayer
            {...(videoType === "vimeo"
              ? { url: "https://player.vimeo.com/video" }
              : videoType === "youtube"
              ? {
                  url: videoUrl,
                }
              : { url: videoUrl })}
            playing
            muted
            width="100%"
            height="100%"
            controls
            {...(videoType === "vimeo"
              ? {
                  config: {
                    vimeo: {
                      playerOptions: {
                        url: videoUrl,
                      },
                    },
                  },
                }
              : {})}
            onReady={() => {
              setIsReady(true);
            }}
            progressInterval={100000}
          />
        </>
      ) : (
        <div className="w-full h-full bg-slate-100 rounded-lg overflow-hidden shadow-md">
          <div className="w-full h-full bg-slate-200 rounded-lg flex items-center justify-center">
            <span className="text-sm text-gray-500 font-medium">
              비디오를 업로드 해주세요.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
