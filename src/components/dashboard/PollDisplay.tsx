"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

interface PollOption {
  id: string;
  text: string;
  percentage: number;
  hasVoted: boolean;
  _count: {
    votes: number;
  };
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  hasVoted: boolean;
}

interface PollDisplayProps {
  pollId: string;
  postId: string;
  initialPoll?: Poll;
}

export function PollDisplay({ pollId, postId, initialPoll }: PollDisplayProps) {
  const { data: session } = useSession();
  const [poll, setPoll] = useState<Poll | null>(initialPoll || null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialPoll);
  const [isVoting, setIsVoting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Lade die Umfrage, wenn keine initialPoll übergeben wurde
  useEffect(() => {
    if (!initialPoll) {
      fetchPoll();
    } else {
      setPoll(initialPoll);
    }
  }, [initialPoll, pollId]);

  // Setze die ausgewählte Option, wenn der Benutzer bereits abgestimmt hat
  useEffect(() => {
    if (poll?.hasVoted) {
      const votedOption = poll.options.find((option) => option.hasVoted);
      if (votedOption) {
        setSelectedOption(votedOption.id);
      }
    }
  }, [poll]);

  const fetchPoll = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/polls/${pollId}`);
      
      if (!response.ok) {
        throw new Error("Fehler beim Laden der Umfrage");
      }
      
      const data = await response.json();
      setPoll(data);
      
    } catch (error) {
      console.error("Fehler beim Laden der Umfrage:", error);
      setError("Umfrage konnte nicht geladen werden");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedOption || !session?.user) return;
    
    setIsVoting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          optionId: selectedOption,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Fehler beim Abstimmen");
      }
      
      // Aktualisiere die Umfrage
      await fetchPoll();
      
    } catch (error) {
      console.error("Fehler beim Abstimmen:", error);
      setError("Abstimmung fehlgeschlagen");
    } finally {
      setIsVoting(false);
    }
  };

  const handleRemoveVote = async () => {
    if (!session?.user) return;
    
    setIsVoting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/polls/${pollId}/vote`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Fehler beim Entfernen der Stimme");
      }
      
      // Aktualisiere die Umfrage
      await fetchPoll();
      setSelectedOption(null);
      
    } catch (error) {
      console.error("Fehler beim Entfernen der Stimme:", error);
      setError("Entfernen der Stimme fehlgeschlagen");
    } finally {
      setIsVoting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="space-y-2">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
        <p>{error || "Umfrage konnte nicht geladen werden"}</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchPoll} 
          className="mt-2"
        >
          Erneut versuchen
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h3 className="font-medium text-lg mb-3">{poll.question}</h3>
      
      <div className="space-y-2 mb-4">
        {poll.options.map((option) => (
          <div key={option.id} className="relative">
            <div 
              className={`
                p-3 rounded-lg border transition-all
                ${poll.hasVoted 
                  ? 'cursor-default' 
                  : 'cursor-pointer hover:border-[hsl(345.3,82.7%,40.8%)]'
                }
                ${selectedOption === option.id 
                  ? 'border-[hsl(345.3,82.7%,40.8%)] bg-[hsl(345.3,82.7%,40.8%)]/5' 
                  : 'border-gray-200 dark:border-gray-700'
                }
                ${option.hasVoted 
                  ? 'border-[hsl(345.3,82.7%,40.8%)] bg-[hsl(345.3,82.7%,40.8%)]/5' 
                  : ''
                }
              `}
              onClick={() => {
                if (!poll.hasVoted) {
                  setSelectedOption(option.id);
                }
              }}
            >
              <div className="flex items-center">
                {!poll.hasVoted && (
                  <div 
                    className={`
                      w-5 h-5 rounded-full border mr-3 flex items-center justify-center
                      ${selectedOption === option.id 
                        ? 'border-[hsl(345.3,82.7%,40.8%)]' 
                        : 'border-gray-400'
                      }
                    `}
                  >
                    {selectedOption === option.id && (
                      <div className="w-3 h-3 rounded-full bg-[hsl(345.3,82.7%,40.8%)]"></div>
                    )}
                  </div>
                )}
                <span className="flex-1">{option.text}</span>
                {poll.hasVoted && (
                  <span className="ml-2 font-medium">
                    {option.percentage}%
                  </span>
                )}
              </div>
              
              {poll.hasVoted && (
                <div className="mt-2 relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-[hsl(345.3,82.7%,40.8%)] rounded-full"
                    style={{ width: `${option.percentage}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div>{poll.totalVotes} {poll.totalVotes === 1 ? 'Stimme' : 'Stimmen'}</div>
        
        <div className="flex space-x-2">
          {!poll.hasVoted ? (
            <Button
              variant="default"
              size="sm"
              disabled={!selectedOption || isVoting}
              onClick={handleVote}
              className="bg-[hsl(345.3,82.7%,40.8%)] hover:bg-[hsl(345.3,82.7%,35%)] text-white"
            >
              {isVoting ? "Wird abgestimmt..." : "Abstimmen"}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled={isVoting}
              onClick={handleRemoveVote}
              className="text-gray-500"
            >
              {isVoting ? "Wird entfernt..." : "Stimme entfernen"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
