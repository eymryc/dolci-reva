import React, { useEffect, useState } from 'react'
import Image from "next/image";
import { EmblaOptionsType } from 'embla-carousel'
import { DotButton, useDotButton } from './EmblaCarouselDotButton'
import {
  PrevButton,
  NextButton,
  usePrevNextButtons
} from './EmblaCarouselArrowButtons'
import useEmblaCarousel from 'embla-carousel-react'

type ImageType = { src: string; alt: string;}
type PropType = {
  slides?: ImageType[]
  options?: EmblaOptionsType
  children?: React.ReactNode
}

const EmblaCarousel: React.FC<PropType> = (props) => {
  const { slides, options, children } = props
  const [mounted, setMounted] = useState(false)
  const [emblaRef, emblaApi] = useEmblaCarousel(options)

  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi)

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick
  } = usePrevNextButtons(emblaApi)

  // Ensure component only runs on client to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="embla">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {children
            ? children
            : slides?.map((img, index) => (
                <div className="embla__slide" key={index} style={{ position: 'relative', width: '100%', height: '300px' }}>
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    style={{ objectFit: 'cover',  }}
                  />
                </div>
              ))}
        </div>
      </div>

      {mounted && (
        <div className="embla__controls">
          <div className="embla__buttons">
            <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
            <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
          </div>

          <div className="embla__dots">
            {scrollSnaps.map((_, index) => (
              <DotButton
                key={index}
                onClick={() => onDotButtonClick(index)}
                className={'embla__dot'.concat(
                  index === selectedIndex ? ' embla__dot--selected' : ''
                )}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export default EmblaCarousel
