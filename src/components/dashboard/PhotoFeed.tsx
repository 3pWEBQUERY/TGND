interface Photo {
  id: string;
  image: string;
  width?: number;
  height?: number;
}

interface PhotoFeedProps {
  photos: Photo[];
  activeYear?: string;
}

export function PhotoFeed({ photos, activeYear = "For 2018" }: PhotoFeedProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Photo Feed</h2>
        <div className="flex items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">{activeYear}</span>
          <button className="text-gray-500 dark:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((photo) => {
          const aspectRatio = photo.width && photo.height
            ? `aspect-[${photo.width}/${photo.height}]`
            : "aspect-square";
            
          return (
            <div 
              key={photo.id} 
              className={`${aspectRatio} rounded-lg overflow-hidden shadow-sm hover:shadow-md transition duration-300 group cursor-pointer`}
            >
              <img 
                src={photo.image} 
                alt="Photo" 
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 flex justify-center">
        <button className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition">
          Mehr laden
        </button>
      </div>
    </section>
  );
} 