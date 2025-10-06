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
    <div className="bg-white py-4 border-b">
      <div className="container flex items-center justify-between">
        <Link to="/" className="font-bold text-2xl">
          Sahi<span className="text-yellow-500">Raah</span>
        </Link>

        <NavigationMenu>
          <NavigationMenuList className="hidden md:flex items-center gap-6">
            <NavigationMenuItem>
              <Link to="/" className="text-blue-900 hover:text-blue-700">Home</Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/about" className="text-blue-900 hover:text-blue-700">About</Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/login">
                <Button variant="outline" className="border-blue-900 text-blue-900 hover:bg-blue-50">
                  Login
                </Button>
              </Link>
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
            <div className="grid gap-4 mt-4">
              <Link to="/" className="text-blue-900">Home</Link>
              <Link to="/about" className="text-blue-900">About</Link>
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
