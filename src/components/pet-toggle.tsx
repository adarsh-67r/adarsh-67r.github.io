"use client"

import { PawPrint } from "lucide-react"

import { usePet } from "@/hooks/use-pet"

import { Tooltip, TooltipContent, TooltipTrigger } from "./base/ui/tooltip"
import { Button } from "./ui/button"

export function PetToggle() {
  const { pet, togglePet } = usePet()
  const on = pet === "on"

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            className="relative touch-manipulation border-none"
            variant="ghost"
            size="icon-sm"
            aria-label="Toggle pet"
            aria-pressed={on}
            onClick={() => togglePet()}
          >
            <span
              className="absolute size-12 pointer-fine:hidden"
              aria-hidden
            />
            <PawPrint
              className={on ? undefined : "opacity-40"}
              aria-hidden
            />
          </Button>
        }
      />
      <TooltipContent className="pr-2 pl-3">
        <div className="flex items-center gap-3">
          {on ? "Hide pet" : "Show pet"}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
