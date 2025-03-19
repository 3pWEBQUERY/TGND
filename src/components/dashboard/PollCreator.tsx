"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";

interface PollCreatorProps {
  onPollCreated: (poll: { question: string; options: string[] }) => void;
  onCancel: () => void;
}

export function PollCreator({ onPollCreated, onCancel }: PollCreatorProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [error, setError] = useState<string | null>(null);

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      setOptions(newOptions);
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = () => {
    // Validierung
    if (!question.trim()) {
      setError("Bitte gib eine Frage ein.");
      return;
    }

    const validOptions = options.filter((option) => option.trim() !== "");
    if (validOptions.length < 2) {
      setError("Bitte gib mindestens zwei Optionen ein.");
      return;
    }

    onPollCreated({
      question: question.trim(),
      options: validOptions,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="poll-question"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Frage
        </label>
        <input
          id="poll-question"
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Stelle eine Frage..."
          className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(345.3,82.7%,40.8%)]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Optionen
        </label>
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-1 border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(345.3,82.7%,40.8%)]"
              />
              {options.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOption(index)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {options.length < 10 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addOption}
            className="mt-2 text-gray-500 hover:bg-[hsl(345.3,82.7%,40.8%)] hover:text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Option hinzufügen
          </Button>
        )}
      </div>

      {error && (
        <div className="text-red-500 text-sm font-medium">{error}</div>
      )}

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="text-gray-500"
        >
          Abbrechen
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          className="bg-[hsl(345.3,82.7%,40.8%)] hover:bg-[hsl(345.3,82.7%,35%)] text-white"
        >
          Umfrage erstellen
        </Button>
      </div>
    </div>
  );
}
