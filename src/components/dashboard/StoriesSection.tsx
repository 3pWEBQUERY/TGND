interface StoryItem {
  id: string;
  title: string;
  image: string;
}

interface StoriesSectionProps {
  stories: StoryItem[];
  activeFilter?: string;
}

export function StoriesSection({ stories, activeFilter = "All Time" }: StoriesSectionProps) {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Featured Stories</h2>
        <div className="flex items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">{activeFilter}</span>
          <button className="text-gray-500 dark:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stories.map((story) => (
          <div key={story.id} className="relative group cursor-pointer">
            <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden">
              <img 
                src={story.image} 
                alt={story.title} 
                className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300"></div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-2 text-center">
              <span className="text-xs font-medium text-white shadow-sm">{story.title}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
} 