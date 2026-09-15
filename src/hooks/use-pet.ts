"use client"

import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"

type Pet = "on" | "off"

const petAtom = atomWithStorage<Pet>("pet", "on")

export function usePet() {
  const [pet, setPet] = useAtom(petAtom)

  const togglePet = () => {
    setPet(pet === "off" ? "on" : "off")
  }

  return { pet, togglePet }
}
