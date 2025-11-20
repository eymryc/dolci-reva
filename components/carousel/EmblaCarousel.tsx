import React, { useEffect, useState } from 'react'
import Image from "next/image";
import { EmblaOptionsType } from 'embla-carousel'
import { DotButton, useDotButton } from './EmblaCarouselDotButton'
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

  // Ensure component only runs on client to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Réinitialiser Embla quand les slides changent
  useEffect(() => {
    if (emblaApi && slides) {
      emblaApi.reInit()
    }
  }, [emblaApi, slides])

  return (
    <section className="embla w-full">
      <div className="embla__viewport w-full" ref={emblaRef}>
        <div className="embla__container w-full">
          {children
            ? children
            : slides?.map((img, index) => (
                <div className="embla__slide w-full" key={index} style={{ position: 'relative', width: '100%', height: 'var(--slide-height)', flexShrink: 0 }}>
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="100vw"
                    priority={index === 0}
                  />
                </div>
              ))}
        </div>
        
        {mounted && (
          <div className="embla__controls">
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
      </div>
    </section>
  )
}

export default EmblaCarousel
