
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu"
import { Link } from "react-router-dom"
import { AlignJustify } from "lucide-react"
import LogoutButton from "@/components/LogoutButton";

const Navbar = () => {
  return (
    <div className="bg-background py-4 border-b">
      <div className="container flex items-center justify-between">
        <Link to="/" className="font-bold text-2xl">
          SahiRaah
        </Link>

        <NavigationMenu>
          <NavigationMenuList className="hidden md:flex items-center gap-4">
            <NavigationMenuItem>
              <Link to="/dashboard">Dashboard</Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/about">About</Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/contact">Contact</Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/settings">Settings</Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <LogoutButton />
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <Sheet>
          <SheetTrigger className="md:hidden">
            <AlignJustify />
          </SheetTrigger>
          <SheetContent className="w-full sm:w-3/4 md:w-2/5">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>
                Navigate through the app
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4">
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/about">About</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/settings">Settings</Link>
              <LogoutButton />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}

export default Navbar
