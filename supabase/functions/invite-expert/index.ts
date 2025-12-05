import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteExpertRequest {
  name: string;
  email: string;
  title: string;
  bio?: string;
  expertise?: string[];
  hourly_rate?: number;
}

function generatePassword(length = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
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
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      throw new Error("Only admins can invite experts");
    }

    const { name, email, title, bio, expertise, hourly_rate }: InviteExpertRequest = await req.json();
    
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
      throw new Error(`Failed to create user: ${createUserError.message}`);
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
        throw new Error(`Failed to update expert: ${updateError.message}`);
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
        throw new Error(`Failed to create expert: ${expertError.message}`);
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
      throw new Error(`Failed to assign role: ${roleError.message}`);
    }

    console.log("Expert role assigned");

    // Send invitation email
    const emailResponse = await resend.emails.send({
      from: "Career Guidance <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to Career Guidance - Expert Portal Access",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Welcome to Career Guidance Expert Portal!</h1>
          <p>Hello ${name},</p>
          <p>You have been invited to join our platform as a career guidance expert. We're excited to have you on board!</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your Login Credentials:</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> ${tempPassword}</p>
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
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
