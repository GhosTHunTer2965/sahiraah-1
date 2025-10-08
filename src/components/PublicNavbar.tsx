import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu"
import { AlignJustify } from "lucide-react"

const PublicNavbar = () => {
  return (
    <div className="bg-[#1a1a2e] py-4 border-b border-gray-700">
      <div className="container flex items-center justify-between">
        <Link to="/" className="font-bold text-2xl">
          <span className="text-blue-900">Sahi</span><span className="text-yellow-500">Raah</span>
        </Link>

        <NavigationMenu>
          <NavigationMenuList className="hidden md:flex items-center gap-6">
            <NavigationMenuItem>
              <Link to="/dashboard" className="text-white hover:text-gray-300">Dashboard</Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/about" className="text-white hover:text-gray-300">About</Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/contact" className="text-white hover:text-gray-300">Contact</Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/settings" className="text-white hover:text-gray-300">Settings</Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/login">
                <Button className="bg-white text-blue-900 hover:bg-gray-100">
                  Login
                </Button>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <Sheet>
          <SheetTrigger className="md:hidden text-white">
            <AlignJustify />
          </SheetTrigger>
          <SheetContent className="w-full sm:w-3/4 md:w-2/5">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>
                Navigate through the app
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 mt-4">
              <Link to="/dashboard" className="text-gray-700">Dashboard</Link>
              <Link to="/about" className="text-gray-700">About</Link>
              <Link to="/contact" className="text-gray-700">Contact</Link>
              <Link to="/settings" className="text-gray-700">Settings</Link>
              <Link to="/login">
                <Button variant="outline" className="w-full border-blue-900 text-blue-900">
                  Login
                </Button>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}

export default PublicNavbar
