import Image from 'next/image';
import Link from 'next/link';

interface BannerProps {
  title: string;
  category?: string;
  imageUrl?: string;
  slug?: string;
  subtitle?: string;
  showBitcoin?: boolean;
  showRocket?: boolean;
}

export default function Banner({ 
  title, 
  category = 'THE CRYPTO BASIC',
  imageUrl,
  slug,
  subtitle,
  showBitcoin = true,
  showRocket = true
}: BannerProps) {
  const content = (
    <article className={`relative w-full h-full bg-gray-900 rounded-xl overflow-hidden ${slug ? 'cursor-pointer group' : ''}`}>
      <div className="relative h-[400px] sm:h-[450px] md:h-[500px] lg:h-[550px] xl:h-[600px] flex items-center justify-center overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10" />
        
        {/* Background image */}
        <div className="absolute inset-0">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />
          ) : (
            <div className="relative w-full h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='stars' x='0' y='0' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='5' cy='5' r='1' fill='white' opacity='0.5'/%3E%3Ccircle cx='20' cy='12' r='1.5' fill='orange' opacity='0.7'/%3E%3Ccircle cx='35' cy='8' r='0.8' fill='white' opacity='0.6'/%3E%3Ccircle cx='45' cy='25' r='1' fill='yellow' opacity='0.8'/%3E%3Ccircle cx='10' cy='40' r='0.7' fill='white' opacity='0.4'/%3E%3Ccircle cx='50' cy='45' r='1.2' fill='orange' opacity='0.6'/%3E%3Ccircle cx='25' cy='55' r='0.9' fill='white' opacity='0.7'/%3E%3Ccircle cx='55' cy='15' r='0.6' fill='yellow' opacity='0.5'/%3E%3Ccircle cx='15' cy='20' r='0.8' fill='white' opacity='0.6'/%3E%3Ccircle cx='40' cy='35' r='1.1' fill='orange' opacity='0.7'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='60' height='60' fill='%23111827' /%3E%3Crect width='60' height='60' fill='url(%23stars)' /%3E%3C/svg%3E")`
              }} />
              
              {/* Bitcoin coin - Responsive scaling */}
              {showBitcoin && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-56 xl:h-56 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 shadow-2xl flex items-center justify-center animate-pulse-slow">
                    <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-yellow-900">₿</span>
                  </div>
                </div>
              )}
              
              {/* Rocket - Responsive positioning and scaling */}
              {showRocket && (
                <div className="absolute bottom-[15%] sm:bottom-[20%] left-[5%] sm:left-[10%] transform rotate-45 animate-float">
                  <div className="w-12 h-18 sm:w-16 sm:h-24 md:w-20 md:h-30 lg:w-24 lg:h-36 bg-gradient-to-br from-red-500 to-orange-600 rounded-t-full relative">
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-b-full" />
                    {/* Flame effect */}
                    <div className="absolute -bottom-4 sm:-bottom-6 md:-bottom-8 left-1/2 transform -translate-x-1/2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-gradient-to-t from-orange-500 via-yellow-400 to-red-400 rounded-full animate-flicker opacity-90" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Content - Centralized vertically */}
        <div className="relative z-20 w-full h-full flex flex-col justify-end p-6 sm:p-8 md:p-10 lg:p-12">
          <div className="absolute top-4 sm:top-6 right-4 sm:right-6 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-1 sm:py-2 rounded-full">
            <span className="text-white text-xs sm:text-sm font-medium">{category}</span>
          </div>
          
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight shadow-glow">
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-200 text-sm sm:text-base md:text-lg lg:text-xl max-w-3xl">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </article>
  );

  return slug ? (
    <Link href={`/post/${slug}`}>
      {content}
    </Link>
  ) : (
    content
  );
}