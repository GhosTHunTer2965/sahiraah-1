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
import { useTranslation } from "react-i18next";

const PublicNavbar = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-[#1a1a2e] py-4 border-b border-gray-700">
      <div className="container flex items-center justify-between">
        <Link to="/" className="font-bold text-2xl">
          <span className="text-blue-900">Sahi</span><span className="text-yellow-500">Raah</span>
        </Link>

        <NavigationMenu>
          <NavigationMenuList className="hidden md:flex items-center gap-6">
            <NavigationMenuItem>
              <Link to="/dashboard" className="text-white hover:text-gray-300">{t('nav.dashboard')}</Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/about" className="text-white hover:text-gray-300">{t('nav.about')}</Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/contact" className="text-white hover:text-gray-300">{t('nav.contact')}</Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/settings" className="text-white hover:text-gray-300">{t('nav.settings')}</Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/login">
                <Button className="bg-white text-blue-900 hover:bg-gray-100">
                  {t('nav.login')}
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
              <SheetTitle>{t('nav.menu')}</SheetTitle>
              <SheetDescription>{t('nav.navigateApp')}</SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 mt-4">
              <Link to="/dashboard" className="text-gray-700">{t('nav.dashboard')}</Link>
              <Link to="/about" className="text-gray-700">{t('nav.about')}</Link>
              <Link to="/contact" className="text-gray-700">{t('nav.contact')}</Link>
              <Link to="/settings" className="text-gray-700">{t('nav.settings')}</Link>
              <Link to="/login">
                <Button variant="outline" className="w-full border-blue-900 text-blue-900">
                  {t('nav.login')}
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
