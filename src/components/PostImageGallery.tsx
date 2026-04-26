"use client";

import { useEffect, useState } from "react";

type PostImage = {
  id: string;
  image_url: string;
  position: number;
};

type PostImageGalleryProps = {
  images: PostImage[];
  title: string;
};

export default function PostImageGallery({
  images,
  title,
}: PostImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!images || images.length === 0) return null;

  const currentImage = images[currentIndex];

  function showPrevious() {
    setCurrentIndex((current) =>
      current === 0 ? images.length - 1 : current - 1,
    );
  }

  function showNext() {
    setCurrentIndex((current) =>
      current === images.length - 1 ? 0 : current + 1,
    );
  }

  return (
    <>
      <div className="mb-6">
        <div className="relative overflow-hidden rounded-xl border border-stone-800 bg-stone-950">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="block w-full"
          >
            <img
              src={currentImage.image_url}
              alt={`${title} image ${currentIndex + 1}`}
              className="max-h-[500px] w-full object-contain"
            />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={showPrevious}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-stone-950/80 px-3 py-2 text-xl font-bold text-amber-500 transition hover:bg-stone-900"
              >
                ‹
              </button>

              <button
                type="button"
                onClick={showNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-stone-950/80 px-3 py-2 text-xl font-bold text-amber-500 transition hover:bg-stone-900"
              >
                ›
              </button>

              <p className="absolute bottom-3 right-3 rounded-full bg-stone-950/80 px-3 py-1 text-xs font-semibold text-stone-300">
                {currentIndex + 1} / {images.length}
              </p>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border transition ${
                  index === currentIndex
                    ? "border-amber-500"
                    : "border-stone-800 opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={image.image_url}
                  alt={`${title} thumbnail ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <ImageModal
          images={images}
          title={title}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}

type ImageModalProps = {
  images: PostImage[];
  title: string;
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  onClose: () => void;
};

function ImageModal({
  images,
  title,
  currentIndex,
  setCurrentIndex,
  onClose,
}: ImageModalProps) {
  const currentImage = images[currentIndex];

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }

      if (e.key === "ArrowLeft") {
        setCurrentIndex((current) =>
          current === 0 ? images.length - 1 : current - 1,
        );
      }

      if (e.key === "ArrowRight") {
        setCurrentIndex((current) =>
          current === images.length - 1 ? 0 : current + 1,
        );
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images.length, onClose, setCurrentIndex]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] max-w-6xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute -right-2 -top-12 rounded-full bg-stone-900 px-4 py-2 text-lg font-bold text-amber-500 transition hover:bg-stone-800"
        >
          ×
        </button>

        <img
          src={currentImage.image_url}
          alt={`${title} full image ${currentIndex + 1}`}
          className="max-h-[90vh] max-w-full rounded-xl object-contain"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() =>
                setCurrentIndex((current) =>
                  current === 0 ? images.length - 1 : current - 1,
                )
              }
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-stone-950/80 px-4 py-3 text-3xl font-bold text-amber-500 transition hover:bg-stone-900"
            >
              ‹
            </button>

            <button
              type="button"
              onClick={() =>
                setCurrentIndex((current) =>
                  current === images.length - 1 ? 0 : current + 1,
                )
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-stone-950/80 px-4 py-3 text-3xl font-bold text-amber-500 transition hover:bg-stone-900"
            >
              ›
            </button>

            <p className="absolute bottom-3 right-3 rounded-full bg-stone-950/80 px-3 py-1 text-sm font-semibold text-stone-300">
              {currentIndex + 1} / {images.length}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
