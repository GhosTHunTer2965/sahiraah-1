import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "npm:resend@2.0.0";
import { z } from "https://esm.sh/zod@3.22.4";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const inviteSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name too long"),
  email: z.string().email("Invalid email address").max(255),
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  bio: z.string().max(2000, "Bio too long").optional(),
  expertise: z.array(z.string().max(100)).max(20, "Too many expertise items").optional(),
  hourly_rate: z.number().positive().max(100000, "Rate too high").optional()
});

function generatePassword(length = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Sanitize string for safe email output
function sanitizeForEmail(text: string): string {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Invite expert function called");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verify the caller is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if user is admin
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: "Only admins can invite experts" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate input
    const rawBody = await req.json();
    const validationResult = inviteSchema.safeParse(rawBody);
    
    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error.errors);
      return new Response(
        JSON.stringify({ error: "Invalid input data" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { name, email, title, bio, expertise, hourly_rate } = validationResult.data;
    
    console.log("Inviting expert:", { name, email, title });

    // Generate a temporary password
    const tempPassword = generatePassword();

    // Create auth user
    const { data: authData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { name, role: "expert" }
    });

    if (createUserError) {
      console.error("Error creating auth user:", createUserError);
      return new Response(
        JSON.stringify({ error: "Failed to create user account" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userId = authData.user.id;
    console.log("Created auth user:", userId);

    // Update the existing expert record or create new one
    const { data: existingExpert } = await supabaseAdmin
      .from("experts")
      .select("id")
      .eq("email", email)
      .single();

    let expertId: string;

    if (existingExpert) {
      // Update existing expert with user_id
      const { error: updateError } = await supabaseAdmin
        .from("experts")
        .update({ user_id: userId })
        .eq("id", existingExpert.id);

      if (updateError) {
        console.error("Error updating expert:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to update expert record" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      expertId = existingExpert.id;
    } else {
      // Create new expert record
      const { data: expertData, error: expertError } = await supabaseAdmin
        .from("experts")
        .insert({
          name,
          email,
          title,
          bio: bio || "",
          expertise: expertise || [],
          hourly_rate: hourly_rate || 199,
          user_id: userId,
          is_available: true
        })
        .select("id")
        .single();

      if (expertError) {
        console.error("Error creating expert:", expertError);
        return new Response(
          JSON.stringify({ error: "Failed to create expert record" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      expertId = expertData.id;
    }

    console.log("Expert record ID:", expertId);

    // Assign expert role
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: userId,
        role: "expert"
      });

    if (roleError) {
      console.error("Error assigning role:", roleError);
      return new Response(
        JSON.stringify({ error: "Failed to assign expert role" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Expert role assigned");

    // Send invitation email with sanitized content
    const emailResponse = await resend.emails.send({
      from: "Career Guidance <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to Career Guidance - Expert Portal Access",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Welcome to Career Guidance Expert Portal!</h1>
          <p>Hello ${sanitizeForEmail(name)},</p>
          <p>You have been invited to join our platform as a career guidance expert. We're excited to have you on board!</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your Login Credentials:</h3>
            <p><strong>Email:</strong> ${sanitizeForEmail(email)}</p>
            <p><strong>Temporary Password:</strong> ${sanitizeForEmail(tempPassword)}</p>
          </div>
          
          <p><strong>Important:</strong> Please change your password after your first login.</p>
          
          <h3>Next Steps:</h3>
          <ol>
            <li>Visit the Expert Login page</li>
            <li>Log in with the credentials above</li>
            <li>Set up your availability schedule</li>
            <li>Complete your profile</li>
          </ol>
          
          <p>If you have any questions, please don't hesitate to reach out to our support team.</p>
          
          <p>Best regards,<br>The Career Guidance Team</p>
        </div>
      `,
    });

    console.log("Invitation email sent:", emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Expert invited successfully",
        expertId,
        userId
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in invite-expert function:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
