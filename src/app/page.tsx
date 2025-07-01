import { HeroSectionV2 } from '@/components/sections/HeroSectionV2'
import { FeaturesSection } from '@/components/sections/FeaturesSection'
import { CoursesPreview } from '@/components/sections/CoursesPreview'
import { TestimonialsSection } from '@/components/sections/TestimonialsSection'
import { CTASection } from '@/components/sections/CTASection'

export default function Home() {
  return (
    <>
      <HeroSectionV2 />
      <TestimonialsSection />
      <FeaturesSection />
      <CoursesPreview />
      <CTASection />
    </>
  )
}