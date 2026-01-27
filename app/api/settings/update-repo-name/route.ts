import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { owner, repo, displayName } = body;

    // Validate input
    if (!owner || !repo || !displayName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (displayName.trim().length === 0) {
      return NextResponse.json(
        { error: "Display name cannot be empty" },
        { status: 400 }
      );
    }

    if (displayName.length > 30) {
      return NextResponse.json(
        { error: "Display name must be 30 characters or less" },
        { status: 400 }
      );
    }

    // Update display_name in database
    const { data, error } = await supabase
      .from("connected_repositories")
      .update({ display_name: displayName.trim() })
      .eq("user_id", user.id)
      .eq("repo_owner", owner)
      .eq("repo_name", repo)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to update project name" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Repository not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      displayName: data.display_name,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
