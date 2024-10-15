// stocks/components/ui/navigation.tsx

"use client"
import { ThemeToggle } from "./theme-toggle"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import CommandMenu from "./command-menu"
import { Button } from "./button"
import { QuestionMarkCircleIcon, HomeIcon } from "@heroicons/react/24/outline" // Import Heroicons
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { useEffect, useState } from "react"

const NAVIGATION = [
  { title: "Stocks", href: "/" },
  // { title: "Screener", href: "/screener" },
]

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()

  const [showHomeButton, setShowHomeButton] = useState(false)

  // Initialize the button state based on the current pathname
  useEffect(() => {
    if (pathname === "/tutorial") {
      setShowHomeButton(true)
    } else {
      setShowHomeButton(false)
    }
  }, [pathname])

  const handleButtonClick = () => {
    if (showHomeButton) {
      // Navigate to Home
      router.push("/")
      setShowHomeButton(false)
    } else {
      // Navigate to Tutorial
      router.push("/tutorial")
      setShowHomeButton(true)
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Container with Consistent Padding */}
      <div className="container">
        <div className="flex flex-row justify-between py-2">
          {/* Left Side: Tutorial/Home Toggle Button */}
          <div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label={showHomeButton ? "Home" : "Tutorial"}
                  onClick={handleButtonClick}
                >
                  {showHomeButton ? (
                    <HomeIcon className="h-5 w-5" />
                  ) : (
                    <QuestionMarkCircleIcon className="h-5 w-5" />
                  )}
                  <span className="sr-only">
                    {showHomeButton ? "Home" : "Tutorial"}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {showHomeButton ? "Go to Home" : "Learn about Stocks"}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Right Side: Existing Navigation Items */}
          <div className="flex flex-row items-center gap-2">
            <NavigationMenu>
              <NavigationMenuList>
                {NAVIGATION.map((item) => (
                  <NavigationMenuItem key={item.title}>
                    <Link href={item.href} legacyBehavior passHref>
                      <NavigationMenuLink
                        className={navigationMenuTriggerStyle()}
                      >
                        {item.title}
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
            <CommandMenu />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
