import { onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function useScrollReveal() {
  let ctx

  onMounted(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const reveals = document.querySelectorAll('.reveal')

    if (prefersReduced || !reveals.length) {
      reveals.forEach(el => el.classList.add('visible'))
      return
    }

    gsap.registerPlugin(ScrollTrigger)

    ctx = gsap.context(() => {
      // Group reveals by their stagger-parent for cascade effects
      const groups = new Map()
      reveals.forEach(el => {
        if (el.dataset.parallax) return
        const parent = el.closest('[data-reveal-stagger]') || el
        if (!groups.has(parent)) groups.set(parent, [])
        groups.get(parent).push(el)
      })

      groups.forEach((group, parent) => {
        if (group.length === 1 || parent !== group[0].closest('[data-reveal-stagger]')) {
          const el = group[0]
          const delay = (parseInt(el.dataset.delay) || 0) / 1000
          const type = el.dataset.reveal || 'fade-up'
          const from = { opacity: 0 }
          if (type === 'fade-left') from.x = -28
          else if (type === 'fade-right') from.x = 28
          else if (type === 'scale-in') from.scale = 0.93
          else from.y = 24

          ScrollTrigger.create({
            trigger: el,
            start: 'top 85%',
            once: true,
            onEnter: () => gsap.fromTo(el, from, {
              opacity: 1, x: 0, y: 0, scale: 1,
              duration: 0.55, ease: 'power3.out', delay
            })
          })
        } else {
          const staggerAmt = parseFloat(parent.dataset.revealStagger) || 0.08
          const groupDelay = parseInt(parent.dataset.delay) || 0
          const type = parent.dataset.reveal || 'fade-up'

          ScrollTrigger.create({
            trigger: parent,
            start: 'top 85%',
            once: true,
            onEnter: () => {
              const tl = gsap.timeline()
              group.forEach((el, i) => {
                const from = { opacity: 0 }
                if (type === 'fade-left') from.x = -28
                else if (type === 'fade-right') from.x = 28
                else if (type === 'scale-in') from.scale = 0.93
                else from.y = 24

                tl.fromTo(el, from, {
                  opacity: 1, x: 0, y: 0, scale: 1,
                  duration: 0.5, ease: 'power3.out'
                }, groupDelay / 1000 + i * staggerAmt)
              })
            }
          })
        }
      })

      // Parallax elements
      document.querySelectorAll('[data-parallax-speed]').forEach(el => {
        const speed = parseFloat(el.dataset.parallaxSpeed) || 0.2
        const section = el.closest('section') || el.parentElement
        ScrollTrigger.create({
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
          animation: gsap.fromTo(el, { y: 0 }, { y: speed * -200, ease: 'none' })
        })
      })
    })
  })

  onUnmounted(() => {
    if (ctx) ctx.revert()
  })
}
