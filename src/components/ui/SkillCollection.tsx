'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SkillCollectionProps {
  onSkillsChange?: (skills: string[]) => void
  placeholder?: string
  className?: string
}

const PREDEFINED_SKILLS = [
  // Blockchain & Web3
  'Solidity', 'Smart Contracts', 'DeFi', 'NFTs', 'Web3.js', 'Ethers.js', 'Hardhat', 'Truffle',
  'MetaMask Integration', 'Wallet Connect', 'IPFS', 'The Graph', 'Chainlink', 'OpenZeppelin',
  
  // Programming Languages
  'JavaScript', 'TypeScript', 'Python', 'Rust', 'Go', 'Java', 'C++', 'C#', 'PHP', 'Ruby',
  
  // Frontend
  'React', 'Vue.js', 'Angular', 'Next.js', 'Nuxt.js', 'HTML', 'CSS', 'Tailwind CSS', 'SASS',
  'Bootstrap', 'Material-UI', 'Chakra UI',
  
  // Backend
  'Node.js', 'Express.js', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'ASP.NET', 'Ruby on Rails',
  'GraphQL', 'REST APIs', 'Microservices',
  
  // Databases
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Supabase', 'Firebase',
  
  // DevOps & Tools
  'Docker', 'Kubernetes', 'AWS', 'Google Cloud', 'Azure', 'Git', 'GitHub Actions', 'CI/CD',
  'Terraform', 'Jenkins',
  
  // Blockchain Networks
  'Ethereum', 'Polygon', 'Arbitrum', 'Optimism', 'Base', 'Avalanche', 'Solana', 'Cardano',
  'Polkadot', 'Cosmos'
]

export default function SkillCollection({ 
  onSkillsChange, 
  placeholder = "What skills do you have?",
  className 
}: SkillCollectionProps) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [filteredSkills, setFilteredSkills] = useState(PREDEFINED_SKILLS)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filter skills based on input
  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = PREDEFINED_SKILLS.filter(skill =>
        skill.toLowerCase().includes(inputValue.toLowerCase()) &&
        !selectedSkills.includes(skill)
      )
      setFilteredSkills(filtered)
    } else {
      setFilteredSkills(PREDEFINED_SKILLS.filter(skill => !selectedSkills.includes(skill)))
    }
  }, [inputValue, selectedSkills])

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const addSkill = (skill: string) => {
    if (!selectedSkills.includes(skill)) {
      const newSkills = [...selectedSkills, skill]
      setSelectedSkills(newSkills)
      onSkillsChange?.(newSkills)
      setInputValue('')
      setIsDropdownOpen(false)
    }
  }

  const removeSkill = (skillToRemove: string) => {
    const newSkills = selectedSkills.filter(skill => skill !== skillToRemove)
    setSelectedSkills(newSkills)
    onSkillsChange?.(newSkills)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      // Add custom skill if it doesn't exist in predefined list
      const trimmedValue = inputValue.trim()
      if (!PREDEFINED_SKILLS.includes(trimmedValue) && !selectedSkills.includes(trimmedValue)) {
        addSkill(trimmedValue)
      } else if (filteredSkills.length > 0) {
        addSkill(filteredSkills[0])
      }
    } else if (e.key === 'Backspace' && !inputValue && selectedSkills.length > 0) {
      removeSkill(selectedSkills[selectedSkills.length - 1])
    }
  }

  const handleInputFocus = () => {
    setIsDropdownOpen(true)
  }

  return (
    <div className={cn('relative w-full max-w-2xl mx-auto', className)} ref={dropdownRef}>
      {/* Input Container */}
      <div className="relative">
        <div className="min-h-[3.5rem] w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-colors">
          {/* Selected Skills */}
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          
          {/* Input Field */}
          <div className="flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              onFocus={handleInputFocus}
              placeholder={selectedSkills.length === 0 ? placeholder : "Add more skills..."}
              className="flex-1 outline-none bg-transparent text-gray-900 placeholder-gray-500"
            />
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronDown className={cn(
                'h-4 w-4 text-gray-400 transition-transform',
                isDropdownOpen && 'rotate-180'
              )} />
            </button>
          </div>
        </div>

        {/* Dropdown */}
        {isDropdownOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredSkills.length > 0 ? (
              <div className="py-1">
                {filteredSkills.slice(0, 50).map((skill) => (
                  <button
                    key={skill}
                    onClick={() => addSkill(skill)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-gray-900"
                  >
                    {skill}
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-3 text-gray-500 text-sm">
                {inputValue.trim() ? (
                  <div>
                    No matching skills found. Press Enter to add "{inputValue.trim()}" as a custom skill.
                  </div>
                ) : (
                  'Start typing to search for skills...'
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Helper Text */}
      {selectedSkills.length === 0 && (
        <p className="mt-2 text-sm text-gray-500 text-center">
          Click the field above or start typing to add your skills
        </p>
      )}
    </div>
  )
}
