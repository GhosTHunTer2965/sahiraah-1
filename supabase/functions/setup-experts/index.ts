import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EXPERTS_DATA = [
  {
    email: "rajeshkumar@gmail.com",
    password: "drkssa-15+",
    name: "Dr. Rajesh Kumar",
    title: "Career Counselor & Education Expert",
  },
  {
    email: "priyasharma@gmail.com",
    password: "psdsl-10+",
    name: "Priya Sharma",
    title: "HR Professional & Career Coach",
  },
  {
    email: "amitpatel@gmail.com",
    password: "appm-00+",
    name: "Amit Patel",
    title: "Industry Mentor & Business Advisor",
  },
  {
    email: "snehadesai@gmail.com",
    password: "sdhrd-00+",
    name: "Sneha Desai",
    title: "Skill Development Specialist",
  },
];

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting expert accounts setup...");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const results = [];

    for (const expert of EXPERTS_DATA) {
      console.log(`Processing expert: ${expert.name} (${expert.email})`);

      // Check if user already exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === expert.email);

      let userId: string;

      if (existingUser) {
        console.log(`User ${expert.email} already exists, updating password...`);
        userId = existingUser.id;
        
        // Update the password
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          password: expert.password,
          email_confirm: true,
        });
        
        if (updateError) {
          console.error(`Error updating user ${expert.email}:`, updateError);
          results.push({ email: expert.email, status: "error", error: updateError.message });
          continue;
        }
      } else {
        console.log(`Creating new user: ${expert.email}`);
        
        // Create the auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: expert.email,
          password: expert.password,
          email_confirm: true,
        });

        if (authError) {
          console.error(`Error creating user ${expert.email}:`, authError);
          results.push({ email: expert.email, status: "error", error: authError.message });
          continue;
        }

        userId = authData.user.id;
      }

      console.log(`User ID for ${expert.email}: ${userId}`);

      // Check if expert entry exists
      const { data: existingExpert } = await supabaseAdmin
        .from("experts")
        .select("id")
        .eq("email", expert.email)
        .maybeSingle();

      let expertId: string;

      if (existingExpert) {
        console.log(`Expert entry exists for ${expert.email}, updating user_id...`);
        expertId = existingExpert.id;
        
        // Update expert with user_id
        await supabaseAdmin
          .from("experts")
          .update({ user_id: userId })
          .eq("id", expertId);
      } else {
        console.log(`Creating expert entry for ${expert.email}`);
        
        // Create expert entry
        const { data: newExpert, error: expertError } = await supabaseAdmin
          .from("experts")
          .insert({
            name: expert.name,
            title: expert.title,
            email: expert.email,
            user_id: userId,
            is_available: true,
            hourly_rate: 199,
          })
          .select()
          .single();

        if (expertError) {
          console.error(`Error creating expert entry for ${expert.email}:`, expertError);
          results.push({ email: expert.email, status: "error", error: expertError.message });
          continue;
        }

        expertId = newExpert.id;
      }

      // Check if role already exists
      const { data: existingRole } = await supabaseAdmin
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .eq("role", "expert")
        .maybeSingle();

      if (!existingRole) {
        console.log(`Assigning expert role to ${expert.email}`);
        
        // Create user_roles entry
        const { error: roleError } = await supabaseAdmin
          .from("user_roles")
          .insert({
            user_id: userId,
            role: "expert",
          });

        if (roleError) {
          console.error(`Error assigning role to ${expert.email}:`, roleError);
          results.push({ email: expert.email, status: "partial", error: roleError.message });
          continue;
        }
      } else {
        console.log(`Expert role already exists for ${expert.email}`);
      }

      results.push({ email: expert.email, status: "success", userId, expertId });
      console.log(`Successfully set up expert: ${expert.email}`);
    }

    console.log("Expert setup complete:", results);

    return new Response(
      JSON.stringify({ success: true, results }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in setup-experts function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
