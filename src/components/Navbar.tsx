
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { AlignJustify } from "lucide-react"
import LogoutButton from "@/components/LogoutButton";
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/dashboard') {
      navigate('/dashboard', { replace: true, state: { reset: true } });
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="bg-background py-4 border-b">
      <div className="container flex items-center justify-between">
        <Link to="/" className="font-bold text-2xl">
          <span className="text-blue-900">Sahi</span><span className="text-yellow-500">Raah</span>
        </Link>

        <NavigationMenu>
          <NavigationMenuList className="hidden md:flex items-center gap-4">
            <NavigationMenuItem>
              <a href="/dashboard" onClick={handleDashboardClick} className="cursor-pointer">{t('nav.dashboard')}</a>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/about">{t('nav.about')}</Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/contact">{t('nav.contact')}</Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/settings">{t('nav.settings')}</Link>
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
              <SheetTitle>{t('nav.menu')}</SheetTitle>
              <SheetDescription>
                {t('nav.navigateApp')}
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4">
              <a href="/dashboard" onClick={handleDashboardClick} className="cursor-pointer">{t('nav.dashboard')}</a>
              <Link to="/about">{t('nav.about')}</Link>
              <Link to="/contact">{t('nav.contact')}</Link>
              <Link to="/settings">{t('nav.settings')}</Link>
              <LogoutButton />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}

export default Navbar