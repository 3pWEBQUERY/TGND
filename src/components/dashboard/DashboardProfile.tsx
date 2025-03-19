interface ProfileStats {
  posts: number;
  followers: number;
  following: number;
}

interface ProfileData {
  name: string;
  username: string;
  location: string;
  avatar: string;
  stats: ProfileStats;
  bio: string;
  tags: string[];
  activity: string;
  favoriteProfiles: Array<{
    id: string;
    avatar: string;
  }>;
}

interface DashboardProfileProps {
  profileData: ProfileData;
  isLoading?: boolean;
}

export function DashboardProfile({ profileData, isLoading = false }: DashboardProfileProps) {
  const { name, username, location, avatar, stats, bio, tags, activity, favoriteProfiles } = profileData;

  if (isLoading) {
    return (
      <div className="h-full flex flex-col p-4 bg-white dark:bg-zinc-900 rounded-lg shadow-sm animate-pulse">
        <div className="flex flex-col items-center mb-6">
          <div className="w-32 h-32 rounded-full bg-gray-300 dark:bg-gray-700 mb-3" />
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-32 mb-2" />
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24" />
        </div>
        
        <div className="flex justify-between mb-6 text-center">
          <div className="flex-1">
            <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-10 mx-auto mb-1" />
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-12 mx-auto" />
          </div>
          <div className="flex-1">
            <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-10 mx-auto mb-1" />
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-12 mx-auto" />
          </div>
          <div className="flex-1">
            <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-10 mx-auto mb-1" />
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-12 mx-auto" />
          </div>
        </div>
        
        <div className="mb-6">
          <div className="h-16 bg-gray-300 dark:bg-gray-700 rounded w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 bg-white dark:bg-zinc-900 rounded-lg shadow-sm">
      {/* Profile Header */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 mb-3">
          <img 
            src={avatar} 
            alt={name} 
            className="w-full h-full object-cover"
          />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{name}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{location}</p>
      </div>
      
      {/* Stats */}
      <div className="flex justify-between mb-6 text-center">
        <div className="flex-1">
          <p className="font-bold text-gray-900 dark:text-white">{stats.posts}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">POSTS</p>
        </div>
        <div className="flex-1">
          <p className="font-bold text-gray-900 dark:text-white">{stats.followers}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">FOLLOWERS</p>
        </div>
        <div className="flex-1">
          <p className="font-bold text-gray-900 dark:text-white">{stats.following}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">FOLLOWING</p>
        </div>
      </div>
      
      {/* Bio */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{bio}</p>
      </div>
      
      {/* Favorite Tags */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Favorite Tags</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span 
              key={index} 
              className="text-xs text-gray-500 dark:text-gray-400"
            >
              {tag}{index < tags.length - 1 ? "," : ""}
            </span>
          ))}
        </div>
      </div>
      
      {/* Activity */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Activity</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">{activity}</p>
      </div>
      
      {/* Location */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">{location}</p>
      </div>
      
      {/* Favorite Profiles */}
      {favoriteProfiles.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Favorite Profiles</h3>
          <div className="flex space-x-2">
            {favoriteProfiles.map((profile) => (
              <div key={profile.id} className="w-8 h-8 rounded-md overflow-hidden">
                <img 
                  src={profile.avatar} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 