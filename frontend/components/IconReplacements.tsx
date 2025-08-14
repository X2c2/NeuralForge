// Icon replacements for lucide-react using Heroicons
import { 
  TrendingUpIcon as Trending,
  FireIcon as Fire,
  ChartBarIcon,
  SparklesIcon,
  BoltIcon,
  StarIcon
} from '@heroicons/react/24/outline'

// Export icons with lucide-react compatible names
export {
  Trending,
  Fire,
  ChartBarIcon as BarChart,
  SparklesIcon as Sparkles,
  BoltIcon as Zap,
  StarIcon as Star
}

// Simple SVG alternatives if Heroicons don't work
export const TrendingSVG = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

export const FireSVG = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
  </svg>
)