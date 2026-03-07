
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { useTranslation } from "react-i18next";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  subject: z.string().max(200, "Subject must be less than 200 characters").optional(),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(5000, "Message must be less than 5000 characters")
});

const Contact = () => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    try {
      const validated = contactSchema.parse({
        name,
        email,
        subject: subject || undefined,
        message
      });
      
      const { error } = await supabase.from("contact_messages").insert({
        name: validated.name,
        email: validated.email,
        subject: validated.subject || null,
        message: validated.message,
        status: "unread"
      });
      
      if (error) throw error;
      
      toast({
        title: t('contact.messageSent'),
        description: t('contact.messageSentDesc'),
      });
      
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast({
          title: "Validation Error",
          description: firstError.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: t('contact.error'),
          description: t('contact.errorDesc'),
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-blue-900 mb-4">{t('contact.title')}</h1>
          <p className="text-lg text-blue-700">{t('contact.subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-blue-900">{t('contact.getInTouch')}</CardTitle>
              <CardDescription>{t('contact.formDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="font-medium text-gray-700">
                    {t('contact.fullName')} *
                  </label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('contact.fullName')}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="font-medium text-gray-700">
                    {t('contact.email')} *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="font-medium text-gray-700">
                    {t('contact.subject')}
                  </label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder={t('contact.subjectPlaceholder')}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="font-medium text-gray-700">
                    {t('contact.message')} *
                  </label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t('contact.messagePlaceholder')}
                    rows={5}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-700 hover:bg-blue-800"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t('contact.sending') : t('contact.send')}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-blue-900">{t('contact.contactInfo')}</CardTitle>
              <CardDescription>{t('contact.contactInfoDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium text-blue-800 mb-1">{t('contact.emailLabel')}</h3>
                <p className="text-gray-700">support@sahiraah.in</p>
              </div>
              
              <div>
                <h3 className="font-medium text-blue-800 mb-1">{t('contact.phoneLabel')}</h3>
                <p className="text-gray-700">+91 6361749943</p>
              </div>

              <div>
                <h3 className="font-medium text-blue-800 mb-1">{t('contact.addressLabel')}</h3>
                <address className="not-italic text-gray-700">
                  123 Career Avenue<br />
                  Bangalore, Karnataka 560001<br />
                  India
                </address>
              </div>

              <div>
                <h3 className="font-medium text-blue-800 mb-1">{t('contact.officeHours')}</h3>
                <p className="text-gray-700">{t('contact.officeHoursValue')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;
