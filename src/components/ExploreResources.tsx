
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, BookOpen, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useSarvamI18n } from "@/hooks/useSarvamI18n";

const ExploreResources = () => {
  const { st: t } = useSarvamI18n();

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-foreground mb-2">{t('explore.title')}</h2>
      <p className="text-muted-foreground mb-6">{t('explore.subtitle')}</p>
      
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-card rounded-xl shadow-md hover:shadow-lg transition-all">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <CardTitle>{t('explore.skillCourses')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>{t('explore.skillCoursesDesc')}</CardDescription>
          </CardContent>
          <CardFooter>
            <Button 
              asChild
              variant="outline" 
              className="w-full flex justify-between"
            >
              <Link to="/courses">
                {t('explore.browseCourses')}
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-card rounded-xl shadow-md hover:shadow-lg transition-all">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              <CardTitle>{t('explore.expertConnect')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">{t('explore.expertConnectDesc')}</CardDescription>
            <div className="text-sm space-y-2">
              <p>✓ {t('explore.sessionDuration')}</p>
              <p>✓ {t('explore.expertGuidance')}</p>
              <p>✓ {t('explore.industryInsights')}</p>
              <p className="font-semibold text-primary">{t('explore.platformFee')}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              asChild
              className="w-full flex justify-between"
            >
              <Link to="/book-expert">
                {t('explore.bookExpert')}
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ExploreResources;
