"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";

interface PollCreatorProps {
  onSubmit: (question: string, options: string[]) => void;
  onCancel: () => void;
}

export function PollCreator({ onSubmit, onCancel }: PollCreatorProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    } else {
      toast.error("Maximal 10 Optionen erlaubt");
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
    if (!question.trim()) {
      toast.error("Bitte gib eine Frage ein");
      return;
    }

    const validOptions = options.filter(option => option.trim() !== "");
    if (validOptions.length < 2) {
      toast.error("Bitte gib mindestens zwei Optionen ein");
      return;
    }

    onSubmit(question.trim(), validOptions);
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="poll-question">Frage</Label>
          <Input
            id="poll-question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Stelle eine Frage..."
          />
        </div>

        <div className="space-y-2">
          <Label>Optionen</Label>
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
              />
              {options.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOption(index)}
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
            className="w-full"
            onClick={addOption}
          >
            <Plus className="h-4 w-4 mr-2" />
            Option hinzufügen
          </Button>
        )}

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
          >
            Abbrechen
          </Button>
          <Button onClick={handleSubmit}>
            Umfrage erstellen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
