import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { EmblaOptionsType } from 'embla-carousel';

interface GenericCarouselProps<T> {
  items: T[];
  renderItem: (item: T, idx: number) => React.ReactNode;
  options?: EmblaOptionsType;
  slideStyle?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
  className?: string;
  controlsClassName?: string;
  slideClassName?: string; // Ajout
}

function GenericCarousel<T>({
  items,
  renderItem,
  options,
  slideStyle = {},
  containerStyle = {},
  className = '',
  controlsClassName = '',
  slideClassName = '', // Ajout
}: GenericCarouselProps<T>) {
  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  return (
    <div className={`embla ${className}`}>
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container" style={containerStyle}>
          {items.map((item, idx) => (
            <div
              className={`embla__slide ${slideClassName}`}
              key={idx}
              style={slideStyle}
            >
              {renderItem(item, idx)}
            </div>
          ))}
        </div>
      </div>
      <div className={`embla__controls ${controlsClassName}`}>
        <div className="embla__buttons">
          <button
            className="embla__button embla__button--prev"
            onClick={() => emblaApi && emblaApi.scrollPrev()}
            disabled={emblaApi ? !emblaApi.canScrollPrev() : true}
          >
            &#8592;
          </button>
          <button
            className="embla__button embla__button--next"
            onClick={() => emblaApi && emblaApi.scrollNext()}
            disabled={emblaApi ? !emblaApi.canScrollNext() : true}
          >
            &#8594;
          </button>
        </div>
      </div>
    </div>
  );
}

export default GenericCarousel;